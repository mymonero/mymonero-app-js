'use strict'

const View = require('../../Views/View.web')

const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_amounts = require('../../MMAppUICommonComponents/amounts.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tooltips = require('../../MMAppUICommonComponents/tooltips.web')

const WalletsSelectView = require('../../WalletsList/Views/WalletsSelectView.web')

const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')

const JustSentTransactionDetailsView = require('./JustSentTransactionDetailsView.web')

const monero_sendingFunds_utils = require('@mymonero/mymonero-sendfunds-utils')
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_config = require('@mymonero/mymonero-monero-config')
const monero_amount_format_utils = require('@mymonero/mymonero-money-format')

const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')

const Currencies = require('../../CcyConversionRates/Currencies')
const JSBigInt = require('@mymonero/mymonero-bigint').BigInteger // important: grab defined export

const rateServiceDomainText = 'cryptocompare.com'
// Yat import
const YatMoneroLookup = require('@mymonero/mymonero-yat-lookup')

const yatMoneroLookup = new YatMoneroLookup({})

class SendFundsView extends View {
  constructor (options, context) {
    super(options, context) // call super before `this`
    //
    const self = this
    {
      self.fromContact = options.fromContact || null
    }
    self.setup()
  }

  setup () {
    const self = this
    self.isSubmitButtonDisabled = false
    self.isYat = false
    self.setup_views()
    self.startObserving()
    //
    setTimeout(function () {
      self.set_isSubmittable_needsUpdate() // start off disabled
    }, 10) // this is really lame but to fix it requires a good method to be notified of the moment self gets put into the nav bar…… I'll also place in VDA for good measure
  }

  setup_views () {
    const self = this
    { // zeroing / initialization
      self.current_transactionDetailsView = null
    }
    { // metrics / caches
      self.margin_h = 0
    }
    self._setup_self_layer()
    self._setup_validationMessageLayer()
    self._setup_form_containerLayer()
    { // action buttons toolbar
      const view = new View({}, self.context)
      const layer = view.layer
      layer.style.position = 'fixed'
      layer.style.top = 'calc(100% - 32px - 8px)'
      layer.style.width = 'calc(100% - 95px - 16px)'
      layer.style.height = 32 + 'px'
      layer.style.zIndex = 1000
      layer.style.paddingLeft = '16px'
      self.actionButtonsContainerView = view
      {
        self._setup_actionButton_chooseFile()
      }
      self.addSubview(view)
    }
    self._setup_qrCodeInputs_containerView()
    // self.DEBUG_BorderChildLayers()
  }

  _setup_self_layer () {
    const self = this
    const layer = self.layer
    layer.style.webkitUserSelect = 'none' // disable selection here but enable selectively
    layer.style.MozUserSelect = 'none' // disable selection here but enable selectively
    layer.style.msUserSelect = 'none' // disable selection here but enable selectively
    layer.style.userSelect = 'none' // disable selection here but enable selectively
    layer.style.position = 'relative'
    layer.style.boxSizing = 'border-box'
    layer.style.width = '100%'
    layer.style.height = '100%'
    layer.style.padding = '0' // actually going to change paddingTop in self.viewWillAppear() if navigation controller
    layer.style.overflowY = 'auto'
    layer.classList.add('ClassNameForScrollingAncestorOfScrollToAbleElement')
    layer.style.backgroundColor = '#272527' // so we don't get a strange effect when pushing self on a stack nav view
    layer.style.color = '#c0c0c0' // temporary
    layer.style.wordBreak = 'break-all' // to get the text to wrap
  }

  _setup_validationMessageLayer () { // validation message
    const self = this
    const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, '')
    layer.style.width = 'calc(100% - 48px)'
    layer.style.marginLeft = '24px'
    layer.ClearAndHideMessage()
    self.validationMessageLayer = layer
    self.layer.appendChild(layer)
  }

  _setup_form_containerLayer () {
    const self = this
    const containerLayer = document.createElement('div')
    containerLayer.style.paddingBottom = '50px'
    self.form_containerLayer = containerLayer
    {
      self._setup_form_walletSelectLayer()
      {
        const table = document.createElement('table')
        table.style.width = '100%'
        const tr_1 = document.createElement('tr')
        self._setup_form_amountInputLayer(tr_1)
        table.appendChild(tr_1)
        self.form_containerLayer.appendChild(table)
      }
      self._setup_form_contactOrAddressPickerLayer() // this will set up the 'resolving' activity indicator
      self._setup_form_addPaymentIDButtonView()
      self._setup_form_manualPaymentIDInputLayer()
      self._setup_form_field_priority()
      //
      // initial config
      self.context.settingsController.executeWhenBooted( // wait for boot for this
        function () {
          self._givenBootedSettingsController_setCcySelectLayer_initialValue() // to get display ccy
        }
      )
      // (now that references to both the networkFeeEstimateLayer and the prioritySelectLayer have been assigned…)
      self.refresh_networkFeeEstimateLayer()
      self.configure_amountInputTextGivenMaxToggledState()
      self.set_effectiveAmountLabelLayer_needsUpdate() // this will call set_effectiveAmountLabelLayer_needsUpdate
    }
    self.layer.appendChild(containerLayer)
  }

  _setup_form_walletSelectLayer () {
    const self = this
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    {
      const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('FROM', self.context)
      {
        const tooltipText = 'Monero makes transactions<br/>with your "available outputs",<br/>so part of your balance will<br/>be briefly locked and then<br/>returned as change.'
        const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
        const layer = view.layer
        labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
      }
      div.appendChild(labelLayer)
      //
      const view = new WalletsSelectView({}, self.context)
      view.didUpdateSelection_fn = function () {
        self.configure_amountInputTextGivenMaxToggledState()
      }
      self.walletSelectView = view
      const valueLayer = view.layer
      div.appendChild(valueLayer)
    }
    self.form_containerLayer.appendChild(div)
  }

  _setup_form_amountInputLayer (tr) {
    const self = this
    const pkg = commonComponents_amounts.New_AmountInputFieldPKG(
      self.context,
      false, // isOptional
      true, // wants MAX btn
      function () { // enter btn pressed
        self._tryToGenerateSend()
      }
    )
    const div = pkg.containerLayer
    div.style.paddingTop = '2px'
    const labelLayer = pkg.labelLayer
    labelLayer.style.marginTop = '0'
    labelLayer.classList.add('isNumericInputElement')
    self.amountInputLayer = pkg.valueLayer
    //self.amountInputlayer.classList.add('isNumericInputElement')
    self.amountInputLayer.addEventListener(
      'input', // to cover copy/paste ops, etc
      function (event) {
        self.set_isSubmittable_needsUpdate()
        self.set_effectiveAmountLabelLayer_needsUpdate()
      }
    )
    // TODO? do we need to observe "propertychange" too?
    self.amountInputLayer.addEventListener(
      'keyup',
      function (event) {
        self.set_isSubmittable_needsUpdate()
        self.set_effectiveAmountLabelLayer_needsUpdate()
      }
    )
    //
    self.ccySelectLayer = pkg.ccySelectLayer
    self.ccySelectLayer.addEventListener(
      'change',
      function () {
        self.set_isSubmittable_needsUpdate() // b/c whether submittable amount can be derived has changed
        self.set_effectiveAmountLabelLayer_needsUpdate()
      }
    )
    //
    self.effectiveAmountLabelLayer = pkg.effectiveAmountLabelLayer // for configuration
    {
      const tooltipText = `Currency selector for<br/>display purposes only.<br/>The app will send ${
				Currencies.ccySymbolsByCcy.XMR
			}.<br/><br/>Rate providers include<br/>${
				rateServiceDomainText
			}.`
      const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
      const layer = view.layer
      self.effectiveAmountLabel_tooltipLayer = layer // we can append this straight to effectiveAmountLabelLayer but must do so later, at the specific time we modify effectiveAmountLabelLayer' innerHTML
    }
    self.max_buttonView = pkg.max_buttonView
    self.max_buttonView.didUpdateMAXButtonToggleState_fn = function () {
      self.configure_amountInputTextGivenMaxToggledState()
    }
    //
    const breakingDiv = document.createElement('div')
    { // addtl element on this screen
      const layer = commonComponents_forms.New_fieldTitle_labelLayer('', self.context)
      layer.style.marginTop = '8px'
      layer.style.color = '#9E9C9E'
      layer.style.display = 'inline-block'
      layer.classList.add('isNumericInputElement')
      self.networkFeeEstimateLayer = layer
      breakingDiv.appendChild(layer)
    }
    {
      const tooltipText = 'Based on Monero network<br/>fee estimate (not final).<br/><br/>MyMonero does not charge<br/>a transfer service fee.'
      const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
      const layer = view.layer
      breakingDiv.appendChild(layer)
    }
    div.appendChild(breakingDiv)
    //
    const td = document.createElement('td')
    td.style.width = '100px'
    td.style.verticalAlign = 'top'
    td.appendChild(div)
    tr.appendChild(td)
  }

  _new_required_contactPickerLayer () {
    throw 'You must override and implement this method. Return value does not have to be an actual contactPicker but must support the same interface'
  }

  _setup_form_contactOrAddressPickerLayer () { // Request funds from sender
    const self = this
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    //
    const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('TO', self.context)
    labelLayer.style.marginTop = '17px' // to square with MEMO field on Send Funds
    {
      const tooltipText = 'Drag &amp; drop QR codes<br/>to auto-fill.<br/><br/>Please double-check<br/>your recipient info as<br/>Monero transfers are<br/>not yet&nbsp;reversible.'
      const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
      const layer = view.layer
      labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
    }
    div.appendChild(labelLayer)
    //
    const layer = self._new_required_contactPickerLayer()
    layer.ContactPicker_inputLayer.autocorrect = 'off'
    layer.ContactPicker_inputLayer.autocomplete = 'off'
    layer.ContactPicker_inputLayer.autocapitalize = 'none'
    layer.ContactPicker_inputLayer.spellcheck = 'false'
    self.contactOrAddressPickerLayer = layer
    div.appendChild(layer)
    { // initial config
      if (self.fromContact !== null) {
        setTimeout( // must do this on the next tick so that we are already set on the navigation controller
          function () {
            self.contactOrAddressPickerLayer.ContactPicker_pickContact(self.fromContact) // simulate user picking the contact
          },
          1
        )
      }
    }
    { // 'resolving' act ind
      const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
      layer.style.display = 'none' // initial state
      layer.style.paddingLeft = '7px'
      self.resolving_activityIndicatorLayer = layer
      div.appendChild(layer)
    }
    { // resolved monero address field
      const fieldContainerLayer = document.createElement('div')
      self.resolvedAddress_containerLayer = fieldContainerLayer
      div.appendChild(fieldContainerLayer)
      fieldContainerLayer.style.display = 'none' // initial state
      {
        const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('MONERO ADDRESS', self.context)
        labelLayer.style.marginTop = '12px' // instead of 15
        fieldContainerLayer.appendChild(labelLayer)
        //
        const valueLayer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar('', self.context) // zero val for now
        self.resolvedAddress_valueLayer = valueLayer
        fieldContainerLayer.appendChild(valueLayer)
      }
    }
    { // resolved monero payment id
      const fieldContainerLayer = document.createElement('div')
      self.resolvedPaymentID_containerLayer = fieldContainerLayer
      div.appendChild(fieldContainerLayer)
      fieldContainerLayer.style.display = 'none' // initial state
      {
        const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('PAYMENT ID', self.context)
        labelLayer.style.marginTop = '6px' // instead of 15
        fieldContainerLayer.appendChild(labelLayer)
        //
        const valueLayer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar('', self.context) // zero val for now
        self.resolvedPaymentID_valueLayer = valueLayer
        fieldContainerLayer.appendChild(valueLayer)
        //
        const detectedMessage = commonComponents_forms.New_Detected_IconAndMessageLayer(self.context)
        fieldContainerLayer.appendChild(detectedMessage)
      }
    }
    self.form_containerLayer.appendChild(div)
  }

  _setup_form_addPaymentIDButtonView () {
    const self = this
    const view = commonComponents_tables.New_clickableLinkButtonView(
      '+ ADD PAYMENT ID',
      self.context,
      function () {
        if (self.isFormDisabled !== true) {
          self.manualPaymentIDInputLayer_containerLayer.style.display = 'block'
          self.addPaymentIDButtonView.layer.style.display = 'none'
          //
          self.manualPaymentIDInputLayer.focus()
        }
      }
    )
    view.layer.style.marginTop = '-8px'
    view.layer.style.marginLeft = '32px'
    view.layer.style.marginBottom = '24px' // additional padding beyond 20 for following form elements
    self.addPaymentIDButtonView = view
    self.form_containerLayer.appendChild(view.layer)
  }

  _setup_form_manualPaymentIDInputLayer () {
    const self = this
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    div.style.display = 'none' // initial
    {
      const labelRowContainer = document.createElement('div')
      labelRowContainer.style.margin = '0 0 8px 0'
      {
        const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('ENTER PAYMENT ID OR&nbsp;', self.context)
        labelLayer.style.marginTop = '0'
        labelLayer.style.marginBottom = '0'
        labelLayer.style.width = 'auto'
        labelLayer.style.display = 'inline'
        labelLayer.style.float = 'none'
        labelRowContainer.appendChild(labelLayer)
        //
        const generateButtonView = commonComponents_tables.New_clickableLinkButtonView(
          'GENERATE ONE',
          self.context,
          function () {
            self.manualPaymentIDInputLayer.value = self.context.monero_utils.new_payment_id()
          }
        )
        self.generateButtonView = generateButtonView
        const generateButtonView_layer = generateButtonView.layer
        generateButtonView_layer.style.margin = '0'
        generateButtonView_layer.style.display = 'inline'
        generateButtonView_layer.style.float = 'none'
        generateButtonView_layer.style.clear = 'none'
        labelRowContainer.appendChild(generateButtonView_layer)
      }
      div.appendChild(labelRowContainer)
      //
      const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
        placeholderText: 'A specific payment ID'
      })
      self.manualPaymentIDInputLayer = valueLayer
      valueLayer.addEventListener(
        'keyup',
        function (event) {
          if (event.keyCode === 13) { // return key
            self._tryToGenerateSend()
          }
        }
      )
      valueLayer.autocorrect = 'off'
      valueLayer.autocomplete = 'off'
      valueLayer.autocapitalize = 'none'
      valueLayer.spellcheck = 'false'
      div.appendChild(valueLayer)
    }
    self.manualPaymentIDInputLayer_containerLayer = div
    //
    self.form_containerLayer.appendChild(div)
  }

  _setup_form_field_priority () {
    const self = this
    const selectLayer_w = 122
    const selectLayer_h = 32
    //
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    {
      const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('PRIORITY', self.context)
      labelLayer.style.marginTop = '4px'
      {
        const tooltipText = 'You can pay the Monero<br/>network a higher fee to<br/>have your transfers<br/>confirmed faster.'
        const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
        const layer = view.layer
        labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
      }
      div.appendChild(labelLayer)
      //
      const selectContainerLayer = document.createElement('div')
      selectContainerLayer.style.position = 'relative' // to container pos absolute
      selectContainerLayer.style.left = '0'
      selectContainerLayer.style.top = '0'
      selectContainerLayer.style.width = selectLayer_w + 'px'
      selectContainerLayer.style.height = selectLayer_h + 'px'
      //
      const selectLayer = document.createElement('select')
      {
        const defaultValue = monero_sendingFunds_utils.default_priority()
        const values =
				[
				  1,
				  2,
				  3,
				  4
				]
        const descriptions = ['Low', 'Medium', 'High', 'Very High']
        const numberOf_values = values.length
        for (let i = 0; i < numberOf_values; i++) {
          const value = values[i]
          const optionLayer = document.createElement('option')
          if (defaultValue === value) {
            optionLayer.selected = 'selected'
          }
          optionLayer.style.textAlign = 'center'
          optionLayer.value = value
          optionLayer.innerText = `${descriptions[i]}`// (${value})`
          selectLayer.appendChild(optionLayer)
        }
      }
      self.prioritySelectLayer = selectLayer
      {
        // selectLayer.style.textAlign = "center"
        // selectLayer.style.textAlignLast = "center"
        selectLayer.style.outline = 'none'
        selectLayer.style.color = '#FCFBFC'
        selectLayer.style.backgroundColor = '#383638'
        selectLayer.style.width = selectLayer_w + 'px'
        selectLayer.style.height = selectLayer_h + 'px'
        selectLayer.style.border = '0'
        selectLayer.style.padding = '0'
        selectLayer.style.borderRadius = '3px'
        selectLayer.style.boxShadow = '0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749'
        selectLayer.style.webkitAppearance = 'none' // apparently necessary in order to activate the following style.border…Radius
        selectLayer.style.MozAppearance = 'none'
        selectLayer.style.msAppearance = 'none'
        selectLayer.style.appearance = 'none'
        selectLayer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
        selectLayer.style.webkitFontSmoothing = 'subpixel-antialiased'
        selectLayer.style.fontSize = '12px' // appears slightly too small but 13 is far to big
        selectLayer.style.letterSpacing = '0.5px'
        selectLayer.style.fontWeight = '400'
        if (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
          selectLayer.style.textIndent = '4px'
        } else {
          selectLayer.style.textIndent = '11px'
        }
        { // hover effects/classes
          selectLayer.classList.add('hoverable-cell')
          selectLayer.classList.add('utility')
        }
        //
        // observation
        selectLayer.addEventListener(
          'change',
          function () {
            self._priority_selectLayer_did_change()
          }
        )
      }
      selectContainerLayer.appendChild(selectLayer)
      {
        const layer = document.createElement('div')
        self.disclosureArrowLayer = layer
        layer.style.pointerEvents = 'none' // mustn't intercept pointer events
        layer.style.border = 'none'
        layer.style.position = 'absolute'
        const w = 10
        const h = 8
        const top = Math.ceil((selectLayer_h - h) / 2)
        layer.style.width = w + 'px'
        layer.style.height = h + 'px'
        layer.style.right = '13px'
        layer.style.top = top + 'px'
        layer.style.zIndex = '100' // above options_containerView
        layer.style.backgroundImage = 'url(../../../assets/img/dropdown-arrow-down@3x.png)' // borrowing this
        layer.style.backgroundRepeat = 'no-repeat'
        layer.style.backgroundPosition = 'center'
        layer.style.backgroundSize = w + 'px ' + h + 'px'
        selectContainerLayer.appendChild(layer)
      }
      div.appendChild(selectContainerLayer)
    }
    self.form_containerLayer.appendChild(div)
  }

  //
  _setup_actionButton_useCamera () {
    const self = this
    const buttonView = commonComponents_actionButtons.New_ActionButtonView(
      'Use Camera',
      '../../../assets/img/actionButton_iconImage__useCamera@3x.png',
      false,
      function (layer, e) {
        self.__didSelect_actionButton_useCamera()
      },
      self.context,
      9, // px from top of btn - due to shorter icon
      undefined,
      '14px 14px'
    )
    self.useCamera_buttonView = buttonView
    self.actionButtonsContainerView.addSubview(buttonView)
  }

  _setup_actionButton_chooseFile () {
    const self = this
    const buttonView = commonComponents_actionButtons.New_ActionButtonView(
      'Choose File',
      '../../../assets/img/actionButton_iconImage__chooseFile@3x.png',
      true,
      function (layer, e) {
        self.__didSelect_actionButton_chooseFile()
      },
      self.context,
      undefined,
      undefined,
      '16px 16px'
    )
    self.chooseFile_buttonView = buttonView
    self.actionButtonsContainerView.addSubview(buttonView)
  }

  //
  _setup_qrCodeInputs_containerView () {
    const self = this
    const view = new View({}, self.context)
    self.qrCodeInputs_containerView = view
    {
      const layer = view.layer
      view.Hide = function () {
        layer.style.display = 'none'
      }
      view.Show = function () {
        layer.style.display = 'block'
      }
      layer.style.position = 'absolute'
      layer.style.zIndex = '999999'
      layer.style.left = '0'
      layer.style.right = '0'
      layer.style.top = '0'
      layer.style.bottom = '0'
      layer.style.backgroundColor = '#272527'
      view.Hide()
    }
    {
      const contentView = new View({}, self.context)
      self.qrCodeInputs_contentView = contentView
      const layer = contentView.layer
      layer.style.position = 'absolute'
      layer.style.backgroundColor = '#1D1B1D'
      layer.style.margin = '15px'
      layer.style.width = `calc(100% - ${15 * 2 + 2}px)` // + 2 is for border
      layer.style.border = '1px dashed #494749'
      layer.style.borderRadius = '6px'
      view.addSubview(contentView)
    }
    { // QR code graphic in contentView
      const div = document.createElement('div')
      const side = 48
      div.style.width = '100%' // cause centering in css is……
      div.style.height = side + 'px'
      div.style.backgroundSize = side + 'px ' + side + 'px'
      div.style.backgroundImage = 'url(../../../assets/img/qrDropzoneIcon@3x.png)'
      div.style.backgroundPosition = 'center'
      div.style.backgroundRepeat = 'no-repeat'
      div.style.backgroundSize = '48px 48px'
      div.style.marginTop = '108px'
      self.qrCodeInputs_contentView.layer.appendChild(div)
    }
    { // label in contentView
      const div = document.createElement('div')
      div.style.width = '100%' // cause centering in css is……
      div.style.height = 'auto'
      div.style.textAlign = 'center'
      div.style.marginTop = '24px'
      //
      div.style.fontSize = '13px'
      div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      div.style.color = '#9E9C9E'
      div.style.fontWeight = '300'
      div.style.webkitFontSmoothing = 'subpixel-antialiased'
      //
      div.innerHTML = 'Drag and drop a<br/>Monero Request Code '
      self.qrCodeInputs_contentView.layer.appendChild(div)
    }
    self.addSubview(view)
  }

  //
  startObserving () {
    const self = this
    self.registrantForDeleteEverything_token = self.context.passwordController.AddRegistrantForDeleteEverything(self)
    { // walletAppCoordinator
      const emitter = self.context.walletAppCoordinator
      self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = function (contact) {
        self.navigationController.DismissModalViewsToView( // whether we should force-dismiss these (create new contact) is debatable…
          null, // null -> to top stack view
          true,
          function () { // must wait til done or 'currently transitioning' will race
            self.navigationController.PopToRootView( // now pop pushed stack views - essential for the case they're viewing a transaction
              true, // animated
              function (err) {
                if (self.isSubmitButtonDisabled == true) {
                  console.warn('Triggered send funds from contact while submit btn disabled. Beep.')
                  // TODO: create system service for playing beep, an electron (shell.beep) implementation, and call it to beep
                  // TODO: mayyybe alert tx in progress
                  return
                }
                { // figure that since this method is called when user is trying to initiate a new request we should clear the form
                  self._clearForm()
                }
                {
                  self.fromContact = contact
                  self.contactOrAddressPickerLayer.ContactPicker_pickContact(contact) // simulate user picking the contact
                }
              }
            )
          }
        )
      }
      emitter.on(
        emitter.EventName_didTrigger_sendFundsToContact(), // observe 'did' so we're guaranteed to already be on right tab
        self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
      )
      //
      self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsFromWallet = function (wallet) {
        self.navigationController.DismissModalViewsToView( // whether we should force-dismiss these (create new contact) is debatable…
          null, // null -> to top stack view
          true,
          function () { // must wait til done or 'currently transitioning' will race
            self.navigationController.PopToRootView( // now pop pushed stack views - essential for the case they're viewing a transaction
              true, // animated
              function (err) {
                if (self.isSubmitButtonDisabled == true) {
                  console.warn('Triggered send funds from wallet while submit btn disabled. Beep.')
                  // TODO: create system service for playing beep, an electron (shell.beep) implementation, and call it to beep
                  // TODO: mayyybe alert tx in progress
                  return
                }
                { // figure that since this method is called when user is trying to initiate a new request we should clear the form
                  self._clearForm()
                }
                {
                  self.walletSelectView.pick(wallet) // simulate user picking the contact
                }
              }
            )
          }
        )
      }
      emitter.on(
        emitter.EventName_didTrigger_sendFundsFromWallet(), // observe 'did' so we're guaranteed to already be on right tab
        self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsFromWallet
      )
    }
    {
      const emitter = self.context.CcyConversionRates_Controller_shared
      self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = function () {
        self.set_isSubmittable_needsUpdate() // this is updated (called) here rather than not bc the amount fieldset does not observe the rate as it does in the iOS app codebase
        self.set_effectiveAmountLabelLayer_needsUpdate()
        self.refresh_networkFeeEstimateLayer()
        self.configure_amountInputTextGivenMaxToggledState()
      }
      emitter.on(
        emitter.eventName_didUpdateAvailabilityOfRates(),
        self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
      )
    }
    {
      const emitter = self.context.settingsController
      self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = function () {
        self.set_effectiveAmountLabelLayer_needsUpdate()
        self.refresh_networkFeeEstimateLayer()
        self.configure_amountInputTextGivenMaxToggledState()
      }
      emitter.on(
        emitter.EventName_settingsChanged_displayCcySymbol(),
        self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
      )
    }
    { // EventName_willDeconstructBootedStateAndClearPassword
      const emitter = self.context.passwordController
      if (self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn !== null && typeof self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn !== 'undefined') {
        throw 'self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn not nil in ' + self.constructor.name
      }
      self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn = function () {
        self._passwordController_EventName_willDeconstructBootedStateAndClearPassword()
      }
      emitter.on(
        emitter.EventName_willDeconstructBootedStateAndClearPassword(),
        self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn
      )
    }
  }

  //
  //
  // Lifecycle - Teardown - Overrides
  //
  TearDown () {
    const self = this
    { // cancel any requests
      self.cancelAny_requestHandle_for_oaResolution()
    }
    { // Tear down components that require us to call their TearDown
      // // important! so they stop observing…
      self.walletSelectView.TearDown()
      self.contactOrAddressPickerLayer.Component_TearDown()
    }
    self.tearDownAnySpawnedReferencedPresentedViews()
    {
      self.stopObserving()
    }
    super.TearDown()
  }

  tearDownAnySpawnedReferencedPresentedViews () {
    const self = this
    if (self.current_transactionDetailsView !== null) {
      self.current_transactionDetailsView.TearDown()
      self.current_transactionDetailsView = null
    }
  }

  cancelAny_requestHandle_for_oaResolution () {
    const self = this
    //
    const req = self.requestHandle_for_oaResolution
    if (typeof req !== 'undefined' && req !== null) {
      console.log('💬  Aborting requestHandle_for_oaResolution')
      req.abort()
    }
    self.requestHandle_for_oaResolution = null
    if (typeof self.resolving_activityIndicatorLayer !== 'undefined' && self.resolving_activityIndicatorLayer != null) {
      self.resolving_activityIndicatorLayer.style.display = 'none'
    }
  }

  stopObserving () {
    const self = this
    {
      self.context.passwordController.RemoveRegistrantForDeleteEverything(self.registrantForDeleteEverything_token)
      self.registrantForDeleteEverything_token = null
    }
    {
      const emitter = self.context.walletAppCoordinator
      emitter.removeListener(
        emitter.EventName_didTrigger_sendFundsToContact(),
        self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
      )
      self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = null
      //
      emitter.removeListener(
        emitter.EventName_didTrigger_sendFundsFromWallet(),
        self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsFromWallet
      )
      self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsFromWallet = null
    }
    {
      const emitter = self.context.CcyConversionRates_Controller_shared
      emitter.removeListener(
        emitter.eventName_didUpdateAvailabilityOfRates(),
        self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
      )
      self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = null
    }
    {
      const emitter = self.context.settingsController
      emitter.removeListener(
        emitter.EventName_settingsChanged_displayCcySymbol(),
        self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
      )
      self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = null
    }
    { // EventName_willDeconstructBootedStateAndClearPassword
      const emitter = self.context.passwordController
      emitter.removeListener(
        emitter.EventName_willDeconstructBootedStateAndClearPassword(),
        self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn
      )
      self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn = null
    }
  }

  //
  //
  // Runtime - Accessors - Navigation
  //
  Navigation_Title () {
    return 'Send Monero'
  }

  Navigation_New_RightBarButtonView () {
    const self = this
    const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
    self.rightBarButtonView = view
    const layer = view.layer
    layer.innerHTML = 'Send'
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        {
          if (self.isSubmitButtonDisabled !== true) { // button is enabled
            console.log("We've tried to send.")
            self._tryToGenerateSend()
          }
        }
        return false
      }
    )
    return view
  }

  //
  // Accessors - Factories - Values
  new_xmr_estFeeAmount () {
    const self = this
    const estimatedNetworkFee_JSBigInt = new JSBigInt(self.context.monero_utils.estimated_tx_network_fee(
      null, // deprecated - will be removed soon
      self._selected_simplePriority(),
      '24658' // TODO: grab this from wallet via API request
    ))
    const estimatedTotalFee_JSBigInt = estimatedNetworkFee_JSBigInt // no tx hosting service fee
    //
    return estimatedTotalFee_JSBigInt
  }

  new_xmr_estMaxAmount () // may return null
  { // may return nil if a wallet isn't present yet
    const self = this
    const wallet = self.walletSelectView.CurrentlySelectedRowItem
    if (typeof wallet === 'undefined' || !wallet) {
      return null // no wallet yet
    }
    const availableWalletBalance = wallet.Balance_JSBigInt().subtract(wallet.LockedBalance_JSBigInt()) // TODO: is it correct to incorporate locked balance into this?
    const estNetworkFee_moneroAmount = self.new_xmr_estFeeAmount()
    const possibleMax_moneroAmount = availableWalletBalance.subtract(estNetworkFee_moneroAmount)
    if (possibleMax_moneroAmount > 0) { // if the Max amount is greater than 0
      return possibleMax_moneroAmount
    }
    return new JSBigInt('0') // can't actually send any of the balance - or maybe there are some dusty outputs that will come up in the actual sweep?99
  }

  new_displayCcyFormatted_estMaxAmountString () { // this is going to return nil if the rate is not ready for the selected display currency - user will probably just have to keep hitting 'max'
    const self = this
    const xmr_estMaxAmount = self.new_xmr_estMaxAmount()
    if (xmr_estMaxAmount == null || typeof xmr_estMaxAmount === 'undefined') {
      return null
    }
    const xmr_estMaxAmount_str = monero_amount_format_utils.formatMoney(xmr_estMaxAmount)
    //
    const displayCcySymbol = self.ccySelectLayer.Component_selected_ccySymbol()
    if (displayCcySymbol != Currencies.ccySymbolsByCcy.XMR) {
      const xmr_estMaxAmountDouble = parseFloat(xmr_estMaxAmount_str)
      const displayCurrencyAmountDouble_orNull = Currencies.displayUnitsRounded_amountInCurrency(
        self.context.CcyConversionRates_Controller_shared,
        displayCcySymbol,
        xmr_estMaxAmountDouble
      )
      if (displayCurrencyAmountDouble_orNull == null) {
        return null // rate not ready yet
      }
      const displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
      return Currencies.nonAtomicCurrency_formattedString(
        displayCurrencyAmountDouble,
        displayCcySymbol
      )
    }
    return xmr_estMaxAmount_str // then it's an xmr amount
  }

  new_displayCcyFormatted_estMaxAmount_fullInputText () {
    const self = this
    const string = self.new_displayCcyFormatted_estMaxAmountString()
    if (string == null || typeof string === 'undefined' || string == ''/* not that it would be */) {
      return 'MAX' // such as while rate not available
    }
    return `~ ${string}` // TODO: is this localized enough - consider writing direction
    // ^ luckily we can do this for long numbers because the field will right truncate it and then left align the text
  }

  _new_estimatedNetworkFee_displayString () {
    const self = this
    const estimatedTotalFee_JSBigInt = self.new_xmr_estFeeAmount()
    const estimatedTotalFee_str = monero_amount_format_utils.formatMoney(estimatedTotalFee_JSBigInt)
    const estimatedTotalFee_moneroAmountDouble = parseFloat(estimatedTotalFee_str)

    // const estimatedTotalFee_moneroAmountDouble = 0.028
    // Just hard-coding this to a reasonable estimate for now as the fee estimator algo uses the median blocksize which results in an estimate about twice what it should be
    const displayCcySymbol = self.context.settingsController.displayCcySymbol
    let finalizable_ccySymbol = displayCcySymbol
    let finalizable_formattedAmountString = estimatedTotalFee_str// `${estimatedTotalFee_moneroAmountDouble}`
    {
      if (displayCcySymbol != Currencies.ccySymbolsByCcy.XMR) {
        const displayCurrencyAmountDouble_orNull = Currencies.displayUnitsRounded_amountInCurrency(
          self.context.CcyConversionRates_Controller_shared,
          displayCcySymbol,
          estimatedTotalFee_moneroAmountDouble
        )
        if (displayCurrencyAmountDouble_orNull != null) {
          const displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
          finalizable_formattedAmountString = Currencies.nonAtomicCurrency_formattedString(
            displayCurrencyAmountDouble,
            finalizable_ccySymbol
          )
        } else {
          finalizable_ccySymbol = Currencies.ccySymbolsByCcy.XMR // and - special case - revert currency to .xmr while waiting on ccyConversion rate
        }
      }
    }
    const final_formattedAmountString = finalizable_formattedAmountString
    const final_ccySymbol = finalizable_ccySymbol
    const displayString = `+ ${final_formattedAmountString} ${final_ccySymbol} EST. FEE`
    //
    return displayString
  }

  //
  // Accessors - Reading form state
  _selected_simplePriority () {
    const self = this
    const intValue = parseInt('' + self.prioritySelectLayer.value)

    return intValue
  }

  //
  //
  // Internal - Imperatives - UI - Config
  //
  // Submittable
  set_isSubmittable_needsUpdate () {
    const self = this
    //
    // compute new state value:
    let isSubmittable = self.isFormDisabled != true && self.isResolvingSendTarget != true
    const raw_amount_String = self.amountInputLayer.value
    {
      if (typeof raw_amount_String !== 'undefined' && raw_amount_String) {
        const selected_ccySymbol = self.ccySelectLayer.Component_selected_ccySymbol()
        const rawInput_amount_Number = +raw_amount_String // turns string into JS Number
        if (!isNaN(rawInput_amount_Number)) {
          const submittableMoneroAmountDouble_orNull = Currencies.submittableMoneroAmountDouble_orNull(
            self.context.CcyConversionRates_Controller_shared,
            selected_ccySymbol,
            rawInput_amount_Number
          )
          if (submittableMoneroAmountDouble_orNull == null) { // amt input exists but no converted amt found
            if (selected_ccySymbol == Currencies.ccySymbolsByCcy.XMR) {
              throw 'null submittableMoneroAmountDouble_orNull while selected_ccySymbol=.XMR'
            }
            isSubmittable = false // because we must be still loading the rate - so we want to explicitly /disable/ submission
          }
        }
      }
    }
    // for now, not going to check if contact has been chosen b/c we have a validation err for that
    //
    // update state:
    const final_isSubmittable = isSubmittable
    self.isSubmitButtonDisabled = !final_isSubmittable
    //
    // update UI to match…
    // TODO: for now, not diffing… potential optimization
    if (self.isSubmitButtonDisabled) {
      self._disable_submitButton()
    } else {
      self._enable_submitButton()
    }
  }

  set_max_buttonView_visibility_needsUpdate () {
    const self = this
    self.max_buttonView.visibilityAndSelectedState_setNeedsUpdate()
  }

  configure_amountInputTextGivenMaxToggledState () {
    const self = this
    const isMaxToggledOn = self.max_buttonView.isMAXToggledOn
    const toToggledOnText_orNullIfNotToggled = isMaxToggledOn
      ? self.new_displayCcyFormatted_estMaxAmount_fullInputText() // if non xmr ccy but rate nil (amount nil), will display "MAX" til it's ready
      : null
    self.amountInputLayer.Component_configureWithMAXToggled(
      isMaxToggledOn,
      toToggledOnText_orNullIfNotToggled
    )
  }

  set_effectiveAmountLabelLayer_needsUpdate () {
    const self = this
    function __hideEffectiveAmountUI () {
      self.effectiveAmountLabelLayer.style.display = 'none'
    }
    function __setTextOnAmountUI (
      title,
      shouldHide_tooltipButton
    ) {
      self.effectiveAmountLabelLayer.innerHTML = title
      if (shouldHide_tooltipButton != true) {
        // NOTE: shouldn't need to remove self.effectiveAmountLabel_tooltipLayer from its parentNode b/c we're rewriting innerHTML each time - DOM will handle
        self.effectiveAmountLabelLayer.appendChild(self.effectiveAmountLabel_tooltipLayer) // NOTE: adding this /after/ updating title text
      }
      //
      self.effectiveAmountLabelLayer.style.display = 'inline-block' // NOTE: not block!!
    }
    function __convenience_setLoadingTextAndHideTooltip () {
      __setTextOnAmountUI('LOADING…', true /* shouldHide_tooltipButton */)
    }
    // regardless of the result of the following, update max btn visibility
    self.set_max_buttonView_visibility_needsUpdate()
    //
    const raw_amount_String = self.amountInputLayer.value
    if (typeof raw_amount_String === 'undefined' || !raw_amount_String) {
      __hideEffectiveAmountUI()
      return
    }
    // NOTE: in this function we must make sure to always call self.max_buttonView.setHidden so initial config happens
    const rawInput_amount_Number = +raw_amount_String // String -> Number
    if (isNaN(rawInput_amount_Number)) {
      __hideEffectiveAmountUI()
      return
    }
    //
    // now we know amount is not empty and is valid number
    const selected_ccySymbol = self.ccySelectLayer.Component_selected_ccySymbol()
    const displayCcySymbol = self.context.settingsController.displayCcySymbol
    if (displayCcySymbol == null) {
      throw 'unexpectedly null displayCcySymbol'
    }
    const XMR = Currencies.ccySymbolsByCcy.XMR
    if (selected_ccySymbol == XMR && displayCcySymbol == XMR) { // special case - no label necessary
      __hideEffectiveAmountUI()
      return
    }
    //
    const xmrAmountDouble_orNull = Currencies.submittableMoneroAmountDouble_orNull(
      self.context.CcyConversionRates_Controller_shared,
      selected_ccySymbol,
      rawInput_amount_Number
    )
    if (xmrAmountDouble_orNull == null) {
      // but not empty … should have an amount… must be a non-XMR currency
      if (selected_ccySymbol == XMR) {
        throw 'Unexpected selected_ccySymbol=.XMR'
      }
      __convenience_setLoadingTextAndHideTooltip()
      return
    }
    const xmrAmountDouble = xmrAmountDouble_orNull
    let finalizable_text
    if (selected_ccySymbol == XMR) {
      if (displayCcySymbol == XMR) {
        throw 'Unexpected displayCurrency=.XMR'
      }
      const displayCurrencyAmountDouble_orNull = Currencies.displayUnitsRounded_amountInCurrency(
        self.context.CcyConversionRates_Controller_shared,
        displayCcySymbol,
        xmrAmountDouble
      )
      if (displayCurrencyAmountDouble_orNull == null) {
        __convenience_setLoadingTextAndHideTooltip()
        return
      }
      const displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
      const displayFormattedAmount = Currencies.nonAtomicCurrency_formattedString(
        displayCurrencyAmountDouble,
        displayCcySymbol
      )
      finalizable_text = `~ ${displayFormattedAmount} ${displayCcySymbol}`
    } else {
      const moneroAmountDouble_atomicPlaces = xmrAmountDouble * Math.pow(10, monero_config.coinUnitPlaces)
      const moneroAmount = new JSBigInt(moneroAmountDouble_atomicPlaces)
      const formatted_moneroAmount = monero_amount_format_utils.formatMoney(moneroAmount)
      finalizable_text = `= ${formatted_moneroAmount} ${Currencies.ccySymbolsByCcy.XMR}`
    }
    const final_text = finalizable_text
    __setTextOnAmountUI(
      final_text,
      false // shouldHide_tooltipButton
    )
  }

  //
  refresh_networkFeeEstimateLayer () {
    const self = this
    self.networkFeeEstimateLayer.innerHTML = self._new_estimatedNetworkFee_displayString()
  }

  _givenBootedSettingsController_setCcySelectLayer_initialValue () {
    const self = this
    if (self.context.settingsController.hasBooted != true) {
      throw '_givenBootedSettingsController_setCcySelectLayer_initialValue called but !self.context.settingsController.hasBooted'
    }
    const amountCcy = self.context.settingsController.displayCcySymbol || 'XMR'
    self.ccySelectLayer.value = amountCcy
  }

  _clearForm () {
    const self = this
    self._dismissValidationMessageLayer()
    {
      self.amountInputLayer.value = ''
      self._givenBootedSettingsController_setCcySelectLayer_initialValue()
      self.max_buttonView.setToggledOn(false) // must specifically un-set if set
      self.set_effectiveAmountLabelLayer_needsUpdate() // just in case - as well as we must update or clear the MAX button toggle state and visibility
    }
    {
      if (self.pickedContact && typeof self.pickedContact !== 'undefined') {
        self.contactOrAddressPickerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput(
          true // true, do not focus input
        )
        self.pickedContact = null // jic
      }
      self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = ''
    }
    {
      self._hideResolvedAddress()
      self._hideResolvedPaymentID()
    }
    {
      self.manualPaymentIDInputLayer.value = ''
      self.manualPaymentIDInputLayer_containerLayer.style.display = 'none'
      //
      self.addPaymentIDButtonView.layer.style.display = 'block'
    }
    {
      const sel = self.prioritySelectLayer
      const defaultVal = monero_sendingFunds_utils.default_priority()
      const opts = sel.options
      for (let j = 0; j < opts.length; j++) {
        const opt = opts[j]
        if (opt.value == defaultVal) {
          sel.selectedIndex = j
          opt.selected = 'selected'
        } else {
          opt.selected = undefined
        }
      }
      self._priority_selectLayer_did_change() // recalculate est fee
    }
  }

  //
  //
  // Runtime - Imperatives - Submit button enabled state
  //
  _disable_submitButton () {
    const self = this
    if (typeof self.rightBarButtonView !== 'undefined' && self.rightBarButtonView) {
      self.isSubmitButtonDisabled = true
      self.rightBarButtonView.SetEnabled(false)
    } else {
      self.isSubmitButtonDisabled = undefined
    }
  }

  _enable_submitButton () {
    const self = this
    if (typeof self.rightBarButtonView !== 'undefined' && self.rightBarButtonView) {
      self.isSubmitButtonDisabled = false
      self.rightBarButtonView.SetEnabled(true)
    } else {
      self.isSubmitButtonDisabled = undefined
    }
  }

  //
  //
  // Runtime - Imperatives - Element visibility
  //
  _displayResolvedAddress (address) {
    const self = this
    if (!address) {
      throw 'nil address passed to _displayResolvedAddress'
    }
    if (typeof self.resolvedAddress_containerLayer === 'undefined' || !self.resolvedAddress_containerLayer) {
      throw '_displayResolvedAddress expects a non-nil self.resolvedAddress_containerLayer'
    }
    self.resolvedAddress_valueLayer.innerHTML = address
    self.resolvedAddress_containerLayer.style.display = 'block'
  }

  _hideResolvedAddress () {
    const self = this
    if (typeof self.resolvedAddress_containerLayer !== 'undefined' && self.resolvedAddress_containerLayer) {
      self.resolvedAddress_containerLayer.style.display = 'none'
    }
  }

  _displayResolvedPaymentID (payment_id) {
    const self = this
    if (!payment_id) {
      throw 'nil payment_id passed to _displayResolvedPaymentID'
    }
    if (typeof self.resolvedPaymentID_containerLayer === 'undefined' || !self.resolvedPaymentID_containerLayer) {
      throw '_displayResolvedPaymentID expects a non-nil self.resolvedPaymentID_containerLayer'
    }
    self.resolvedPaymentID_valueLayer.innerHTML = payment_id
    self.resolvedPaymentID_containerLayer.style.display = 'block'
  }

  _hideResolvedPaymentID () {
    const self = this
    if (typeof self.resolvedPaymentID_containerLayer !== 'undefined' && self.resolvedPaymentID_containerLayer) {
      self.resolvedPaymentID_containerLayer.style.display = 'none'
    }
  }

  //
  _dismissValidationMessageLayer () {
    const self = this
    self.validationMessageLayer.ClearAndHideMessage()
  }

  //
  //
  // Runtime - Imperatives - Send-transaction generation
  //
  async _tryToGenerateSend () {
    const self = this
    if (self.isSubmitButtonDisabled) {
      console.warn('⚠️  Submit button currently disabled. Bailing.')
      return
    }
    function _reEnableFormElements () {
      self.isFormDisabled = false
      self.set_isSubmittable_needsUpdate() // since we've updated form enabled
      //
      self.context.userIdleInWindowController.ReEnable_userIdle()
      //
      self.walletSelectView.SetEnabled(true)
      //
      self.amountInputLayer.disabled = false
      self.ccySelectLayer.disabled = false
      self.prioritySelectLayer.disabled = false
      //
      self.manualPaymentIDInputLayer.disabled = false
      self.generateButtonView.SetEnabled(true)
      self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = false // making sure to re-enable
      //
      if (self.useCamera_buttonView) {
        self.useCamera_buttonView.Enable()
      }
      if (self.chooseFile_buttonView) {
        self.chooseFile_buttonView.Enable()
      }
    }
    { // disable form elements
      self.isFormDisabled = true
      self.set_isSubmittable_needsUpdate() // since we've updated form enabled
      self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
      //
      if (self.useCamera_buttonView) {
        self.useCamera_buttonView.Disable()
      }
      if (self.chooseFile_buttonView) {
        self.chooseFile_buttonView.Disable()
      }
      //
      self.walletSelectView.SetEnabled(false)
      //
      self.amountInputLayer.disabled = true
      self.ccySelectLayer.disabled = true
      self.prioritySelectLayer.disabled = true
      //
      self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = true
      self.manualPaymentIDInputLayer.disabled = true
      self.generateButtonView.SetEnabled(false)
    }
    {
      self._dismissValidationMessageLayer()
    }
    function _trampolineToReturnWithValidationErrorString (errStr) { // call this anytime you want to exit this method before complete success (or otherwise also call _reEnableFormElements)
      self.validationMessageLayer.SetValidationError(errStr)
      _reEnableFormElements()
    }
    //
    const wallet = self.walletSelectView.CurrentlySelectedRowItem
    {
      if (typeof wallet === 'undefined' || !wallet) {
        _trampolineToReturnWithValidationErrorString('Please create a wallet to send Monero.')
        return
      }
    }
    const sweeping = self.max_buttonView.isMAXToggledOn
    const raw_amount_String = self.amountInputLayer.value
    if (!sweeping) {
      if (typeof raw_amount_String === 'undefined' || !raw_amount_String) {
        _trampolineToReturnWithValidationErrorString('Please enter the amount to send.')
        return
      }
    }
    const selected_ccySymbol = self.ccySelectLayer.Component_selected_ccySymbol()
    let final_XMR_amount_Number = null
    if (!sweeping) {
      const rawInput_amount_Number = +raw_amount_String // turns into Number, apparently
      if (isNaN(rawInput_amount_Number)) {
        _trampolineToReturnWithValidationErrorString('Please enter a valid amount to send.')
        return
      }
      const submittableMoneroAmountDouble_orNull = Currencies.submittableMoneroAmountDouble_orNull(
        self.context.CcyConversionRates_Controller_shared,
        selected_ccySymbol,
        rawInput_amount_Number
      )
      if (submittableMoneroAmountDouble_orNull == null) {
        throw 'submittableMoneroAmountDouble unexpectedly null while sending - button should be disabled'
      }
      const submittableMoneroAmountDouble = submittableMoneroAmountDouble_orNull
      if (submittableMoneroAmountDouble <= 0) { // check this /after/ conversion to also check ->0 converted values
        _trampolineToReturnWithValidationErrorString('The amount to send must be greater than zero.')
        return
      }
      final_XMR_amount_Number = submittableMoneroAmountDouble
    }
    //
    const hasPickedAContact = !!(typeof self.pickedContact !== 'undefined' && self.pickedContact)
    let enteredAddressValue = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value || ''
    const enteredAddressValue_exists = enteredAddressValue !== ''
    const resolvedAddress = self.resolvedAddress_valueLayer.innerHTML || ''
    const resolvedAddress_exists = resolvedAddress !== '' // NOTE: it might be hidden, though!
    const resolvedAddress_fieldIsVisible = self.resolvedAddress_containerLayer.style.display === 'block'
    // Check if Yat
    if (self.isYat) {
        enteredAddressValue = resolvedAddress;
    }

    const manuallyEnteredPaymentID = self.manualPaymentIDInputLayer.value || ''
    const manuallyEnteredPaymentID_exists = manuallyEnteredPaymentID !== ''
    const manuallyEnteredPaymentID_fieldIsVisible = self.manualPaymentIDInputLayer_containerLayer.style.display === 'block' // kind of indirect, would be better to encapsulate show/hide & state, maybe
    const resolvedPaymentID = self.resolvedPaymentID_valueLayer.innerHTML || ''
    const resolvedPaymentID_exists = resolvedPaymentID !== '' // NOTE: it might be hidden, though!
    const resolvedPaymentID_fieldIsVisible = self.resolvedPaymentID_containerLayer.style.display === 'block'
    //
    const canUseManualPaymentID =
			manuallyEnteredPaymentID_exists &&
			manuallyEnteredPaymentID_fieldIsVisible &&
			!resolvedPaymentID_fieldIsVisible // but not if we have a resolved one!
    if (canUseManualPaymentID && hasPickedAContact) {
      throw "canUseManualPaymentID shouldn't be true at same time as hasPickedAContact"
      // NOTE: This will also be true even if we are using the payment ID from a
      // Funds Request QR code / URI because we set the request URI as a 'resolved' /
      // "detected" payment id. So the `hasPickedAContact` usage above yields slightly
      // ambiguity in code and could be improved to encompass request uri pid "forcing"
    }
    
    // OA address
    // we need to handle oa adresses, we can't purely rely on enteredAddressValue being correct
    if (enteredAddressValue.includes('.')) {
      enteredAddressValue = resolvedAddress
    }

    const destinations = [
        {
        to_address: typeof(enteredAddressValue) !== 'undefined' ? enteredAddressValue : resolvedAddress,
              send_amount: '' + final_XMR_amount_Number
      }
    ];
    console.log(destinations);
    
    //
    // now if using alternate display currency, be sure to ask for terms agreement before doing send
    if (!sweeping && selected_ccySymbol != Currencies.ccySymbolsByCcy.XMR) {
      const hasAgreedToUsageGateTerms = self.context.settingsController.invisible_hasAgreedToTermsOfCalculatedEffectiveMoneroAmount || false
      if (hasAgreedToUsageGateTerms == false) {
        // show alert… iff user agrees, write user has agreed to terms and proceed to branch, else bail
        const title = 'Important'
        let message = `Though ${selected_ccySymbol} is selected, the app will send ${Currencies.ccySymbolsByCcy.XMR}. (This is not an exchange.)`
        message += '\n\n'
        message += `Rate providers include ${rateServiceDomainText}. Neither accuracy or favorability are guaranteed. Use at your own risk.`
        const ok_buttonTitle = `Agree and Send ${final_XMR_amount_Number} ${Currencies.ccySymbolsByCcy.XMR}`
        const cancel_buttonTitle = 'Cancel'
        self.context.windowDialogs.PresentQuestionAlertDialogWith(
          title,
          message,
          ok_buttonTitle,
          cancel_buttonTitle,
          function (err, didChooseYes) {
            if (err) {
              throw err
            }
            if (didChooseYes != true) {
              // user canceled!
              _reEnableFormElements()
              return
            }
            // must be sure to save state so alert is now not required until a DeleteEverything
            self.context.settingsController.Set_settings_valuesByKey(
              {
                invisible_hasAgreedToTermsOfCalculatedEffectiveMoneroAmount: true
              },
              function (err) {
                if (err) {
                  throw err
                }
              }
            )
            // and of course proceed

            __proceedTo_generateSendTransaction()
          }
        )
        //
        return // early return pending alert result
      } else {
        // show alert… iff user agrees, write user has agreed to terms and proceed to branch, else bail
        const title = 'Confirm Amount'
        const message = `Send ${final_XMR_amount_Number} ${Currencies.ccySymbolsByCcy.XMR}?`
        const ok_buttonTitle = 'Send'
        const cancel_buttonTitle = 'Cancel'
        self.context.windowDialogs.PresentQuestionAlertDialogWith(
          title,
          message,
          ok_buttonTitle,
          cancel_buttonTitle,
          function (err, didChooseYes) {
            if (err) {
              throw err
            }
            if (didChooseYes != true) {
              // user canceled!
              _reEnableFormElements()
              return
            }
            __proceedTo_generateSendTransaction()
          }
        )
        //
        return // early return pending alert result
      }
    }
    // fall through
    __proceedTo_generateSendTransaction()
    //
    function __proceedTo_generateSendTransaction () {
      wallet.SendFunds(
        destinations,
        resolvedAddress,
        manuallyEnteredPaymentID,
        resolvedPaymentID,
        hasPickedAContact,
        resolvedAddress_fieldIsVisible,
        manuallyEnteredPaymentID_fieldIsVisible,
        resolvedPaymentID_fieldIsVisible,
        //
        hasPickedAContact ? self.pickedContact.payment_id : undefined,
        hasPickedAContact ? self.pickedContact.cached_OAResolved_XMR_address : undefined,
        hasPickedAContact ? self.pickedContact.HasOpenAliasAddress() : undefined,
        hasPickedAContact ? self.pickedContact.address : undefined,
        //
        sweeping, // when true, amount will be ignored
        self._selected_simplePriority(),
        preSuccess_nonTerminal_statusUpdate_fn,
        cancelled_fn,
        handleResponse_fn
      )
    }

    // What this is, is essentially a hack to provide feedback on the transaction based on messages returned from wallet.SendFunds
    function preSuccess_nonTerminal_statusUpdate_fn (str) {
      self.validationMessageLayer.SetValidationError(str, true/* wantsXButtonHidden */)
    }

    // This is for when a send is cancelled. This gets invoked on non-recoverable error
    function cancelled_fn () { // canceled_fn
      self._dismissValidationMessageLayer()
      _reEnableFormElements()
    }

    // mocked transaction gets set in wallet.js
    function handleResponse_fn (err, mockedTransaction) {
      if (err) {
        _trampolineToReturnWithValidationErrorString(typeof err === 'string' ? err : err.message)
        return
      }
      { // now present a mocked transaction details view, and see if we need to present an "Add Contact From Sent" screen based on whether they sent w/o using a contact
        const stateCachedTransaction = wallet.New_StateCachedTransaction(mockedTransaction) // for display
        self.pushDetailsViewFor_transaction(wallet, stateCachedTransaction)
      }
      // TODO: Once we have properly developed Yat support for Contacts, remove this isYat check to allow a user to save the Yat contact
      // if (self.isYat == false) {
      //   {
      //     const this_pickedContact = hasPickedAContact == true ? self.pickedContact : null
      //     self.__didSendWithPickedContact(
      //       this_pickedContact,
      //       enteredAddressValue_exists ? enteredAddressValue : null,
      //       resolvedAddress_exists ? resolvedAddress : null,
      //       mockedTransaction
      //     )
      //   }
      // }
      { // finally, clean up form
        setTimeout(
          function () {
            self._clearForm()
            // and lastly, importantly, re-enable everything
            _reEnableFormElements()
          },
          500 // after the navigation transition just above has taken place
        )
      }
      { // and fire off a request to have the wallet get the latest (real) tx records
        setTimeout(
          function () {
            wallet.hostPollingController._fetch_transactionHistory() // TODO: maybe fix up the API for this
          }
        )
      }
    }
  }

  //
  //
  // Runtime - Imperatives - Navigation
  //
  pushDetailsViewFor_transaction (
    sentFrom_wallet,
    transaction
  ) {
    const self = this
    const _cmd = 'pushDetailsViewFor_transaction'
    if (self.current_transactionDetailsView !== null) {
      // commenting this throw so we can use this as the official way to block double-clicks, etc
      // throw "Asked to " + _cmd + " while self.current_transactionDetailsView !== null"
      return
    }
    { // validate wallet and tx
      if (typeof sentFrom_wallet === 'undefined' || sentFrom_wallet === null) {
        throw self.constructor.name + ' requires self.wallet to ' + _cmd
      }
      if (typeof transaction === 'undefined' || transaction === null) {
        throw self.constructor.name + ' requires transaction to ' + _cmd
      }
    }
    const navigationController = self.navigationController
    if (typeof navigationController === 'undefined' || navigationController === null) {
      throw self.constructor.name + ' requires navigationController to ' + _cmd
    }
    {
      const options =
			{
			  wallet: sentFrom_wallet,
			  transaction: transaction
			}
      const view = new JustSentTransactionDetailsView(options, self.context) // note JustSentTransactionDetailsView
      navigationController.PushView(
        view,
        true // animated
      )
      // Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
      // we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
      // by tearing it down on tearDownAnySpawnedReferencedPresentedViews()
      self.current_transactionDetailsView = view
    }
  }

  //
  //
  // Runtime - Delegation - Navigation/View lifecycle
  //
  viewWillAppear () {
    const self = this
    super.viewWillAppear()
    {
      if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
        self.layer.style.paddingTop = '41px'
        //
        self.qrCodeInputs_contentView.layer.style.height = `calc(100% - ${15 * 2 + 41 + 2}px)` // +2 for border
        self.qrCodeInputs_contentView.layer.style.marginTop = `${15 + 41}px`
      }
    }
    self.set_isSubmittable_needsUpdate() // start off disabled
  }

  viewDidAppear () {
    const self = this
    super.viewDidAppear()
    self.set_isSubmittable_needsUpdate() // start off disabled
  }

  // Runtime - Protocol / Delegation - Stack & modal navigation
  // We don't want to naively do this on VDA as else tab switching may trigger it - which is bad
  navigationView_didDismissModalToRevealView () {
    const self = this
    if (super.navigationView_didDismissModalToRevealView) {
      super.navigationView_didDismissModalToRevealView() // in case it exists
    }
    self.tearDownAnySpawnedReferencedPresentedViews()
  }

  navigationView_didPopToRevealView () {
    const self = this
    if (super.navigationView_didPopToRevealView) {
      super.navigationView_didPopToRevealView() // in case it exists
    }
    self.tearDownAnySpawnedReferencedPresentedViews()
  }

  //
  //
  // Runtime/Setup - Delegation - Contact selection
  //
  _didPickContact (contact) {
    const self = this
    self.pickedContact = contact
    { // UI config regardless of input values
      self.addPaymentIDButtonView.layer.style.display = 'none'
      self.manualPaymentIDInputLayer_containerLayer.style.display = 'none'
      self.manualPaymentIDInputLayer.value = ''
      self._hideResolvedAddress()
    }
    { // payment id - if we already have one
      if (self.pickedContact.HasOpenAliasAddress() === false) {
        const payment_id = contact.payment_id
        if (payment_id && typeof payment_id !== 'undefined') {
          self._displayResolvedPaymentID(payment_id)
        } else {
          self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
        }
        self.isResolvingSendTarget = false
        self.set_isSubmittable_needsUpdate()
        //
        // and exit early
        return // no need to re-resolve what is not an OA addr
        //
      } else { // they're using an OA addr, so we still need to check if they still have one
        self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
      }
    }
    {
      self.cancelAny_requestHandle_for_oaResolution()
    }
    // look up the payment ID again
    { // (and show the "resolving UI")
      self.resolving_activityIndicatorLayer.style.display = 'block'
      self.isResolvingSendTarget = true
      self.set_isSubmittable_needsUpdate()
      //
      self._dismissValidationMessageLayer() // assuming it's okay to do this here - and need to since the coming callback can set the validation msg
    }
    self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
      contact.address,
      function (
        err,
        addressWhichWasPassedIn,
        moneroReady_address,
        payment_id, // may be undefined
        tx_description,
        openAlias_domain,
        oaRecords_0_name,
        oaRecords_0_description,
        dnssec_used_and_secured
      ) {
        self.resolving_activityIndicatorLayer.style.display = 'none'
        //
        if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
          console.warn('⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.')
          return
        }
        self.requestHandle_for_oaResolution = null
        //
        if (typeof self.pickedContact === 'undefined' || !self.pickedContact) {
          console.warn('⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.pickedContact. Bailing')
          return
        }
        if (self.pickedContact.address !== addressWhichWasPassedIn) {
          console.warn('⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected self.pickedContact.address. Bailing')
          return
        }
        if (err) {
          self.validationMessageLayer.SetValidationError(err.toString())
          return
        }
        self.isResolvingSendTarget = false // only enable if no err
        self.set_isSubmittable_needsUpdate()
        {
          if (typeof moneroReady_address !== 'undefined' && moneroReady_address) { // not that it would be
            self._displayResolvedAddress(moneroReady_address)
          } else {
            // we already hid it above - not that this will ever be entered
          }
        }
        { // there is no need to tell the contact to update its address and payment ID here as it will be observing the emitted event from this very request to .Resolve
          // we don't want to show the resolved addr here
          if (typeof payment_id !== 'undefined' && payment_id) {
            self._displayResolvedPaymentID(payment_id)
          } else {
            // we already hid it above
          }
        }
      }
    )
  }

  _didFinishTypingInContactPickerInput (optl_event) {
    console.log('Invoked didFinishTypingInContactPickerInput')
    // console.log("Checking if addy has  handle");
    // Check for
    const self = this
    //
    const enteredPossibleAddress = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value
    const hasEnteredNoAddressContent = !enteredPossibleAddress || typeof enteredPossibleAddress === 'undefined'
    //
    const wasEnterKey = optl_event ? optl_event.keyCode == 13 : false/* 'input' event which lacks 'e' arg in cb seems not to be called on 'enter' key */
    if (wasEnterKey) {
      const requestExists = typeof self.requestHandle_for_oaResolution !== 'undefined' && self.requestHandle_for_oaResolution !== null
      if (requestExists) { // means we are currently requesting still and they just hit the enter btn - just "ignore"
        console.warn('User hit return on contact picker input while still resolving a contact. Bailing.')
        return
      }
    }
    
    // checking for emojis for Yat addresses
    const hasEmojiCharacters = /\p{Extended_Pictographic}/u.test(enteredPossibleAddress)
    if (hasEmojiCharacters) {
      const isYat = yatMoneroLookup.isValidYatHandle(enteredPossibleAddress)
      self.isYat = isYat
      if (isYat) {
        const lookup = yatMoneroLookup.lookupMoneroAddresses(enteredPossibleAddress).then((responseMap) => {
          // Our library returns a map with between 0 and 2 keys
          if (responseMap.size == 0) {
            // no monero address
            const errorString = `There is no Monero address associated with "${enteredPossibleAddress}"`
            self.validationMessageLayer.SetValidationError(errorString)
          } else if (responseMap.size == 1) {
            // Either a Monero address or a Monero subaddress was found.
            const iterator = responseMap.values()
            const record = iterator.next()
            self._displayResolvedAddress(record.value)
          } else if (responseMap.size == 2) {
            const moneroAddress = responseMap.get('0x1001')
            self._displayResolvedAddress(moneroAddress)
          }
        }).catch((error) => {
          // If the error status is defined, handle this error according to the HTTP error status code
          if (typeof (error.response) !== 'undefined' && typeof (error.response.status) !== 'undefined') {
            if (error.response.status == 404) {
              // Yat not found
              const errorString = `The Yat "${enteredPossibleAddress}" does not exist`
              self.validationMessageLayer.SetValidationError(errorString)
            } else if (error.response.status >= 500) {
              // Yat server / remote network device error encountered
              const errorString = `The Yat server is responding with an error. Please try again later. Error: ${error.message}`
              self.validationMessageLayer.SetValidationError(errorString)
            } else {
              // Response code that isn't 404 or a server error (>= 500) on their side
              const errorString = `An unexpected error occurred when looking up the Yat Handle: ${error.message}`
              self.validationMessageLayer.SetValidationError(errorString)
            }
          } else {
            // Network connectivity issues -- could be offline / Yat server not responding
            const errorString = `Unable to communicate with the Yat server. It may be down, or you may be experiencing internet connectivity issues. Error: ${error.message}`
            self.validationMessageLayer.SetValidationError(errorString)
            // If we don't have an error.response, our request failed because of a network error
          }
        })
      } else {
        // This conditional will run when a mixture of emoji and non-emoji characters are present in the address
        const errorString = `"${enteredPossibleAddress}" is not a valid Yat handle. You may have input an emoji that is not part of the Yat emoji set, or a non-emoji character.`
        self.validationMessageLayer.SetValidationError(errorString)
        return
      }
    }
    //
    self.cancelAny_requestHandle_for_oaResolution()
    //
    self._hideResolvedAddress()
    self._hideResolvedPaymentID()
    self._dismissValidationMessageLayer()
    //
    if (hasEnteredNoAddressContent == true) {
      if (self.manualPaymentIDInputLayer_containerLayer.style.display === 'none') {
        self.addPaymentIDButtonView.layer.style.display = 'block' // show if hidden as we may have hidden it
      }
      return
    }
    //
    self.isResolvingSendTarget = true
    self.set_isSubmittable_needsUpdate()

    //
    const isOAAddress = monero_openalias_utils.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(enteredPossibleAddress)
    if (isOAAddress !== true) {
      let address__decode_result
      try {
        address__decode_result = self.context.monero_utils.decode_address(enteredPossibleAddress, self.context.nettype)
      } catch (e) {
        console.warn("Couldn't decode as a Monero address.", e)
        self.isResolvingSendTarget = false
        self.set_isSubmittable_needsUpdate()
        return // just return silently
      }
      if (address__decode_result.intPaymentId) {
        self._displayResolvedPaymentID(address__decode_result.intPaymentId)
        self.addPaymentIDButtonView.layer.style.display = 'none'
        self.manualPaymentIDInputLayer_containerLayer.style.display = 'none'
        self.manualPaymentIDInputLayer.value = ''
      } else {
        self._hideResolvedPaymentID() // it might be showing from an integrated address that got typed over by a regular address
        if (self.manualPaymentIDInputLayer_containerLayer.style.display == 'none') {
          if (self.addPaymentIDButtonView.layer.style.display != 'block') {
            self.addPaymentIDButtonView.layer.style.display = 'block' // then must ensure that this gets reshown
          }
        }
      }
      self.isResolvingSendTarget = false
      self.set_isSubmittable_needsUpdate()
      return
    }
    // then this could be an OA address…
    { // (and show the "resolving UI")
      self.resolving_activityIndicatorLayer.style.display = 'block'
      self.manualPaymentIDInputLayer_containerLayer.style.display = 'none'
      self.manualPaymentIDInputLayer.value = ''
      self.addPaymentIDButtonView.layer.style.display = 'none'
      //
      self._dismissValidationMessageLayer() // assuming it's okay to do this here - and need to since the coming callback can set the validation msg
    }
    if (wasEnterKey) {
      // TODO: it appeared at cursory glance to get a little complicated, which is why it's not done here,
      // but is there a good way to implement detecting and not redundantly resolving if the user is hitting
      // enter after just having resolved?
      // To fill the UX gap, for now, on success of the below resolve, we call _tryToGenerateSend
    }
    self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
      enteredPossibleAddress,
      function (
        err,
        addressWhichWasPassedIn,
        moneroReady_address,
        payment_id, // may be undefined
        tx_description,
        openAlias_domain,
        oaRecords_0_name,
        oaRecords_0_description,
        dnssec_used_and_secured
      ) {
        self.resolving_activityIndicatorLayer.style.display = 'none'
        self.isResolvingSendTarget = false
        self.set_isSubmittable_needsUpdate()
        //
        if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
          console.warn('⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.')
          return
        }
        self.requestHandle_for_oaResolution = null
        //
        if (enteredPossibleAddress !== addressWhichWasPassedIn) {
          console.warn('⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the enteredPossibleAddress. Bailing')
          return
        }
        if (err) {
          console.log('err.toString()', err.toString())
          self.validationMessageLayer.SetValidationError(err.toString())
          return
        }
        //
        if (typeof moneroReady_address !== 'undefined' && moneroReady_address) {
          self._displayResolvedAddress(moneroReady_address)
        } else {
          // we already hid it above
        }

        if (typeof payment_id !== 'undefined' && payment_id) {
          self.addPaymentIDButtonView.layer.style.display = 'none'
          self.manualPaymentIDInputLayer_containerLayer.style.display = 'none'
          self.manualPaymentIDInputLayer.value = ''
          self._displayResolvedPaymentID(payment_id)
        } else {
          // we already hid resolved payment it above
          if (self.manualPaymentIDInputLayer_containerLayer.style.display != 'block') { // if manual payment field not showing
            self.addPaymentIDButtonView.layer.style.display = 'block' // then make sure we are at least shwign the + payment ID btn
          } else { // then one or the other is already visible - respect existing state
            console.log('💬  It should be the case that either add pymt id btn or manual payment field is visible')
          }
        }
        //
        if (wasEnterKey) {
          self._tryToGenerateSend() // to fulfil what the user is expecting this to do
        }
      }
    )
  }

  //
  //
  // Runtime - Delegation - Request URI string picking - Parsing / consuming / yielding
  //
  _shared_didPickQRCodeWithImageSrcValue (imageSrcValue) {
    const self = this
    if (self.isFormDisabled === true) {
      console.warn('Disallowing QR code pick form disabled.')
      return
    }
    self.validationMessageLayer.ClearAndHideMessage() // in case there was a parsing err etc displaying
    //
    const width = 256
    const height = 256
    //
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    //
    const img = new Image()
    img.addEventListener(
      'load',
      function () {
        context.drawImage(img, 0, 0, width, height)
        const imageData = context.getImageData(0, 0, width, height)
        //
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (!code || !code.location) {
          self.validationMessageLayer.SetValidationError('MyMonero was unable to find a QR code in that image.')
          return
        }
        const stringData = code.data
        if (!stringData) {
          self.validationMessageLayer.SetValidationError('MyMonero was unable to decode a QR code from that image.')
          return
        }
        if (typeof stringData !== 'string') {
          self.validationMessageLayer.SetValidationError('MyMonero was able to decode QR code but got unrecognized result.')
          return
        }
        const possibleURIString = stringData
        self._shared_didPickPossibleRequestURIStringForAutofill(possibleURIString)
      }
    )
    img.src = imageSrcValue
  }

  _shared_didPickQRCodeAtPath (absoluteFilePath) {
    const self = this
    self._shared_didPickQRCodeWithImageSrcValue(absoluteFilePath) // we can load the image directly like this
  }

  _shared_didPickPossibleRequestURIStringForAutofill (possibleUriString) {
    const self = this
    //
    self.validationMessageLayer.ClearAndHideMessage() // in case there was a parsing err etc displaying
    //
    self.cancelAny_requestHandle_for_oaResolution()
    //
    let requestPayload
    try {
      requestPayload = monero_requestURI_utils.New_ParsedPayload_FromPossibleRequestURIString(possibleUriString, self.context.nettype, self.context.monero_utils)
    } catch (errStr) {
      if (errStr) {
        self.validationMessageLayer.SetValidationError('Unable to use the result of decoding that QR code: ' + errStr)
        return
      }
    }
    self._shared_havingClearedForm_didPickRequestPayloadForAutofill(requestPayload)
  }

  _shared_havingClearedForm_didPickRequestPayloadForAutofill (requestPayload) {
    const self = this
    {
      let didSetAmountFromRequest = false
      const amount = requestPayload.amount
      if (amount !== null && typeof amount !== 'undefined' && amount !== '') {
        didSetAmountFromRequest = true
        self.amountInputLayer.value = amount
      }
      //
      const amountCcy = requestPayload.amount_ccy // TODO: validate amountCcy
      if (amountCcy != null && typeof amountCcy !== 'undefined' && amountCcy !== '') {
        if ((self.amountInputLayer.value == null || self.amountInputLayer.value == '' || typeof self.amountInputLayer.value === 'undefined') ||
					didSetAmountFromRequest) { // so either the ccy and amount were on the request OR there was a ccy but the amount field was left empty by the user, i.e. we can assume it's ok to modify the ccy since there was one on the request
          self.ccySelectLayer.value = amountCcy
        }
      } else {
        // otherwise, just keep it as it is …… because if they set it to, e.g. CAD, and there's no ccy on the request, then they might accidentally send the same numerical value in XMR despite having wanted it to be in CAD
      }
      //
      self.set_isSubmittable_needsUpdate()
      self.set_effectiveAmountLabelLayer_needsUpdate()
    }
    const target_address = requestPayload.address
    const payment_id_orNull = requestPayload.payment_id && typeof requestPayload.payment_id !== 'undefined' ? requestPayload.payment_id : null
    if (typeof self.context.contactsListController !== 'undefined' && self.context.contactsListController != null && self.context.contactsListController.records) {
      if (target_address !== null && typeof target_address !== 'undefined' && target_address !== '') {
        let foundContact = null
        const contacts = self.context.contactsListController.records
        const numberOf_contacts = contacts.length
        for (let i = 0; i < numberOf_contacts; i++) {
          const contact = contacts[i]
          if (contact.address == target_address || contact.cached_OAResolved_XMR_address == target_address) {
            // so this request's address corresponds with this contact…
            // how does the payment id match up?
            /*
						 * Commented until we figure out this payment ID situation.
						 * The problem is that the person who uses this request to send
						 * funds (i.e. the user here) may have the target of the request
						 * in their Address Book (the req creator) but the request recipient
						 * would have in their address book a /different/ payment_id for the target
						 * than the payment_id in the contact used by the creator to generate
						 * this request.

						 * One proposed solution is to give contacts a "ReceiveFrom-With" and "SendTo-With"
						 * payment_id. Then when a receiver loads a request (which would have a payment_id of
						 * the creator's receiver contact's version of "ReceiveFrom-With"), we find the contact
						 * (by address/cachedaddr) and if it doesn't yet have a "SendTo-With" payment_id,
						 * we show it as 'detected', and set its value to that of ReceiveFrom-With from the request
						 * if they hit send. This way users won't have to send each other their pids.

						 * Currently, this is made to work below by not looking at the contact itself for payment
						 * ID match, but just using the payment ID on the request itself, if any.

						if (payment_id_orNull) { // request has pid
							if (contact.payment_id && typeof contact.payment_id !== 'undefined') { // contact has pid
								if (contact.payment_id !== payment_id_orNull) {
									console.log("contact has same address as request but different payment id!")
									continue // TODO (?) keep this continue? or allow and somehow use the pid from the request?
								} else {
									// contact has same pid as request pid
									console.log("contact has same pid as request pid")
								}
							} else { // contact has no pid
								console.log("request pid exists but contact has no request pid")
							}
						} else { // request has no pid
							if (contact.payment_id && typeof contact.payment_id !== 'undefined') { // contact has pid
								 console.log("contact has pid but request has no pid")
							} else { // contact has no pid
								console.log("neither request nor contact have pid")
								// this is fine - we can use this contact
							}
						}
						*/
            foundContact = contact
            break
          }
        }
        if (foundContact) {
          self.contactOrAddressPickerLayer.ContactPicker_pickContact(foundContact)
          // but we're not going to show the PID stored on the contact!
        } else { // we have an addr but no contact
          if (self.pickedContact && typeof self.pickedContact !== 'undefined') { // unset
            self.contactOrAddressPickerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput(
              true // true, do not focus input
            )
            self.pickedContact = null // jic
          }
          self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = target_address
        }
      }
    } else {
      self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = target_address
    }
    { // and no matter what , display payment id, if present
      if (payment_id_orNull !== null) { // but display it as a 'detected' pid
        self.addPaymentIDButtonView.layer.style.display = 'none' // hide if showing
        self.manualPaymentIDInputLayer_containerLayer.style.display = 'none' // hide if showing
        self.manualPaymentIDInputLayer.value = ''
        self._displayResolvedPaymentID(payment_id_orNull)
      } else {
        self._hideResolvedPaymentID() // jic
        if (typeof self.manualPaymentIDInputLayer.value === 'undefined' || !self.manualPaymentIDInputLayer.value) {
          // if no pid already in the manual pid field, just be sure to reset the form to its proper state
          self.addPaymentIDButtonView.layer.style.display = 'block' // show if hiding
          self.manualPaymentIDInputLayer_containerLayer.style.display = 'none' // hide if showing
          self.manualPaymentIDInputLayer.value = ''
        }
      }
    }
  }

  //
  //
  // Runtime - Delegation - Request URI string picking - Entrypoints
  //
  __didSelect_actionButton_chooseFile () {
    const self = this
    self.context.userIdleInWindowController.TemporarilyDisable_userIdle() // TODO: this is actually probably a bad idea - remove this and ensure that file picker canceled on app teardown
    if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
      self.context.Cordova_disallowLockDownOnAppPause += 1 // place lock so Android app doesn't tear down UI and mess up flow
    }
    // ^ so we don't get torn down while dialog open
    self.context.filesystemUI.PresentDialogToOpenOneImageFile(
      'Open Monero Request',
      function (err, absoluteFilePath) {
        self.context.userIdleInWindowController.ReEnable_userIdle()
        if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
          self.context.Cordova_disallowLockDownOnAppPause -= 1 // remove lock
        }
        //
        if (err) {
          self.validationMessageLayer.SetValidationError(err.toString() || 'Error while picking QR code from file.')
          return
        }
        if (absoluteFilePath === null || absoluteFilePath === '' || typeof absoluteFilePath === 'undefined') {
          self.validationMessageLayer.ClearAndHideMessage() // clear to resolve ambiguity in case existing error is displaying
          return // nothing picked / canceled
        }
        self._shared_didPickQRCodeAtPath(absoluteFilePath)
      }
    )
  }

  __didSelect_actionButton_useCamera () {
    const self = this
    // Cordova_disallowLockDownOnAppPause is handled within qrScanningUI
    self.context.qrScanningUI.PresentUIToScanOneQRCodeString(
      function (err, possibleUriString) {
        if (err) {
          self.validationMessageLayer.SetValidationError('' + err)
          return
        }
        if (possibleUriString == null) { // err and possibleUriString are null - treat as a cancellation
          self.validationMessageLayer.ClearAndHideMessage() // clear to resolve ambiguity in case existing error is displaying
          return
        }
        if (!possibleUriString) { // if not explicitly null but "" or undefined…
          self.validationMessageLayer.SetValidationError('No scanned QR code content found.')
          return
        }
        self._shared_didPickPossibleRequestURIStringForAutofill(possibleUriString)
      }
    )
  }

  //
  //
  // Runtime - Delegation - Request URI string picking - Entrypoints - Proxied drag & drop
  //
  __shared_isAllowedToPerformDropOrURLOpeningOps () {
    const self = this
    if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
      return false
    }
    if (self.context.passwordController.IsUserChangingPassword() === true) {
      return false
    }
    if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
      return false
    }
    if (self.isFormDisabled === true) {
      return false
    }
    if (!self.navigationController) {
      return false // probably will never happen
    }
    if (self.navigationController.modalViews.length > 0) {
      // not going to return false here - they will be auto-dismissed and probably are still transitioning
    }
    if (self.navigationController.stackViews.length != 1) { // we will never see this case, because we auto-pop to root (self)
      // not going to return false here - they will be auto-dismissed and probably are still transitioning
    }
    return true
  }

  _proxied_ondragenter (e) {
    const self = this
    if (self.__shared_isAllowedToPerformDropOrURLOpeningOps()) {
      self.qrCodeInputs_containerView.Show()
    }
  }

  _proxied_ondragleave () {
    const self = this
    self.qrCodeInputs_containerView.Hide()
  }

  _proxied_ondrop (e) {
    const self = this
    //
    self.qrCodeInputs_containerView.Hide()
    //
    if (self.__shared_isAllowedToPerformDropOrURLOpeningOps() == false) {
      // would be nice to NSBeep() here
      return
    }
    const files = e.dataTransfer.files
    if (!files || files.length == 0) {
      console.warn('No files')
      return
    }
    const file = files[0]
    const absoluteFilePath = file.path
    const file_size = file.size
    if (absoluteFilePath != null && absoluteFilePath != '' && typeof absoluteFilePath !== 'undefined') {
      self._shared_didPickQRCodeAtPath(absoluteFilePath)
    } else if (file_size) { // going to assume we're in a browser
      throw 'Expected this to be Lite app aka browser'
    } else {
      self.validationMessageLayer.SetValidationError("Couldn't get QR code content from that file.")
      // nothing picked / canceled
    }
  }

  //
  // Delegation - Internal - Overridable
  __didSendWithPickedContact (
    pickedContact_orNull,
    enteredAddressValue_orNull,
    resolvedAddress_orNull,
    mockedTransaction
  ) {
    // overridable
  }

  //
  // Delegation - Select etc controls
  _priority_selectLayer_did_change () {
    const self = this
    self.refresh_networkFeeEstimateLayer() // now that reference assigned…
    self.configure_amountInputTextGivenMaxToggledState()
  }

  //
  // Delegation - Delete everything
  passwordController_DeleteEverything (
    fn // this MUST be called
  ) {
    const self = this
    console.log(self.constructor.name + ' passwordController_DeleteEverything')
    self.cancelAny_requestHandle_for_oaResolution()
    self._clearForm()
    fn()
  }

  //
  // Delegation - Events - Password controller
  _passwordController_EventName_willDeconstructBootedStateAndClearPassword () {
    const self = this
    self.cancelAny_requestHandle_for_oaResolution()
    self._clearForm()
  }
}
module.exports = SendFundsView
