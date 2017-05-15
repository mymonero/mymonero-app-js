// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const View = require('../../Views/View.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tooltips = require('../../MMAppUICommonComponents/tooltips.web')
//
const WalletsSelectView = require('../../WalletsList/Views/WalletsSelectView.web')
//
const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
//
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const AddContactFromSendTabView = require('./AddContactFromSendTabView.web')
const JustSentTransactionDetailsView = require('./JustSentTransactionDetailsView.web')
//
const monero_sendingFunds_utils = require('../../monero_utils/monero_sendingFunds_utils')
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_paymentID_utils = require('../../monero_utils/monero_paymentID_utils')
const monero_config = require('../../monero_utils/monero_config')
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
//
const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../monero_utils/monero_requestURI_utils')
//
class SendFundsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		{
			self.fromContact = options.fromContact || null
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self.isSubmitButtonDisabled = false
		self.setup_views()
		self.startObserving()
	}
	_isUsingRelativeNotFixedActionButtonsContainer()
	{
		const self = this
		if (self.context.themeController.TabBarView_isHorizontalBar() === false) {
			return false
		}
		return true
	}
	setup_views()
	{
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
			const margin_h = 16
			var view;
			if (self._isUsingRelativeNotFixedActionButtonsContainer() == false) {
				const margin_fromWindowLeft = self.context.themeController.TabBarView_thickness() + margin_h // we need this for a position:fixed, width:100% container
				const margin_fromWindowRight = margin_h
				view = commonComponents_actionButtons.New_ActionButtonsContainerView(
					margin_fromWindowLeft, 
					margin_fromWindowRight, 
					self.context
				)
				view.layer.style.paddingLeft = "16px"
			} else {
				view = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
					margin_h, 
					margin_h, 
					15,
					self.context
				)
			}
			self.actionButtonsContainerView = view
			{
				// self._setup_actionButton_useCamera()
				self._setup_actionButton_chooseFile()
			}
			self.addSubview(view)
		}
		self._setup_qrCodeInputs_containerView()
		// self.DEBUG_BorderChildLayers()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%"
		layer.style.padding = "0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		if (self.context.Cordova_isMobile === true) {
			layer.style.paddingBottom = "300px" // very hacky, but keyboard UX takes dedication to get right, and would like to save that effort for native app
			// layer.style.webkitOverflowScrolling = "touch"
			// disabling this cause it conflicts with touchup/end of contacts picker
			// layer.addEventListener("touchmove", function()
			// { // blur currently text input field on user scroll
			// 	const activeElement = document.activeElement
			// 	if (activeElement) {
			// 		activeElement.blur()
			// 	}
			// }, false)
		}
		layer.style.overflowY = "auto"
		layer.classList.add( // so that we get autoscroll to form field inputs on mobile platforms
			commonComponents_forms.ClassNameForScrollingAncestorOfScrollToAbleElement()
		)
		// layer.style.webkitOverflowScrolling = "touch"
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "")
		layer.style.width = "calc(100% - 48px)"
		layer.style.marginLeft = "24px"
		layer.ClearAndHideMessage()
		self.validationMessageLayer = layer
		self.layer.appendChild(layer)				
	}
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		var paddingBottom;
		if (self._isUsingRelativeNotFixedActionButtonsContainer() == false) {
			paddingBottom = commonComponents_actionButtons.ActionButtonsContainerView_h 
								+ commonComponents_actionButtons.ActionButtonsContainerView_bottomMargin 
								+ 10
		} else {
			paddingBottom = 0
		}
		containerLayer.style.paddingBottom = `${paddingBottom}px`
		self.form_containerLayer = containerLayer
		{
			self._setup_form_walletSelectLayer()
			{
				const table = document.createElement("table")
				table.style.width = "100%"
				const tr_1 = document.createElement("tr")
				self._setup_form_amountInputLayer(tr_1)
				table.appendChild(tr_1)
				self.form_containerLayer.appendChild(table)
			}
			self._setup_form_contactOrAddressPickerLayer() // this will set up the 'resolving' activity indicator
			self._setup_form_addPaymentIDButtonView()
			self._setup_form_manualPaymentIDInputLayer()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_form_walletSelectLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("FROM", self.context)
			div.appendChild(labelLayer)
			//
			const view = new WalletsSelectView({}, self.context)
			self.walletSelectView = view
			const valueLayer = view.layer
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_amountInputLayer(tr)
	{ 
		const self = this
		const pkg = commonComponents_forms.New_AmountInputFieldPKG(
			self.context,
			"XMR", // TODO: grab, update from selected wallet
			function()
			{ // enter btn pressed
				self._tryToGenerateSend()
			}
		)		
		const div = pkg.containerLayer
		div.style.paddingTop = "2px"
		const labelLayer = pkg.labelLayer
		{
			const tooltipText = `Monero makes transactions with your<br/>"available outputs", so part of your<br/>balance will be briefly locked and<br/>then returned as change.<br/><br/>Monero ring size value set to ${self._mixin_int()}.`
			const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
			const layer = view.layer
			labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
		}
		labelLayer.style.marginTop = "0"
		self.amountInputLayer = pkg.valueLayer
		//
		const breakingDiv = document.createElement("div")
		{ // addtl element on this screen
			const layer = commonComponents_forms.New_fieldTitle_labelLayer("", self.context)
			layer.style.marginTop = "8px"
			layer.style.color = "#9E9C9E"
			layer.style.display = "inline-block"
			self.feeEstimateLayer = layer
			self.refresh_feeEstimateLayer() // now that reference assigned…
			breakingDiv.appendChild(layer)
		}
		// {
		// 	const tooltipText = "This figure is based on network<br/>fee estimate, and is not final."
		// 	const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
		// 	const layer = view.layer
		// 	breakingDiv.appendChild(layer)
		// }
		div.appendChild(breakingDiv)
		//
		const td = document.createElement("td")
		td.style.width = "100px"
		td.style.verticalAlign = "top"
		td.appendChild(div)
		tr.appendChild(td)
	}
	_setup_form_contactOrAddressPickerLayer()
	{ // Request funds from sender
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		//
		const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("TO", self.context)
		labelLayer.style.marginTop = "17px" // to square with MEMO field on Send Funds
		{
			const tooltipText = `Please double-check the accuracy of<br/>your recipient information as Monero<br/>transactions are irreversible.`
			const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
			const layer = view.layer
			labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
		}
		div.appendChild(labelLayer)
		//
		const layer = commonComponents_contactPicker.New_contactPickerLayer(
			self.context,
			"Contact name, or OpenAlias / integrated address",
			self.context.contactsListController,
			function(contact)
			{ // did pick
				self.addPaymentIDButtonView.layer.style.display = "none"
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
				self.manualPaymentIDInputLayer.value = ""
				//
				self._didPickContact(contact)
			},
			function(clearedContact)
			{
				self.cancelAny_requestHandle_for_oaResolution()
				//
				self._dismissValidationMessageLayer() // in case there was an OA addr resolve network err sitting on the screen
				self._hideResolvedPaymentID()
				self._hideResolvedAddress()
				//
				self.addPaymentIDButtonView.layer.style.display = "block" // can re-show this
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // just in case
				self.manualPaymentIDInputLayer.value = ""
				//
				self.pickedContact = null
			},
			function(event)
			{ // didFinishTypingInInput_fn
				self._didFinishTypingInContactPickerInput(event)
			}
		)
		layer.ContactPicker_inputLayer.autocorrect = "off"
		layer.ContactPicker_inputLayer.autocomplete = "off"
		layer.ContactPicker_inputLayer.autocapitalize = "none"
		layer.ContactPicker_inputLayer.spellcheck = "false"
		self.contactOrAddressPickerLayer = layer
		div.appendChild(layer)
		{ // initial config
			if (self.fromContact !== null) {
				setTimeout( // must do this on the next tick so that we are already set on the navigation controller 
					function()
					{
						self.contactOrAddressPickerLayer.ContactPicker_pickContact(self.fromContact) // simulate user picking the contact
					},
					1
				)
			}
		}
		{ // 'resolving' act ind
			const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
			layer.style.display = "none" // initial state
			layer.style.paddingLeft = "7px"
			self.resolving_activityIndicatorLayer = layer
			div.appendChild(layer)
		}
		{ // resolved monero address field - only really used when a manual OA addr yields an addr
			const fieldContainerLayer = document.createElement("div")
			self.resolvedAddress_containerLayer = fieldContainerLayer
			div.appendChild(fieldContainerLayer)
			fieldContainerLayer.style.display = "none" // initial state
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("MONERO ADDRESS", self.context)
				fieldContainerLayer.appendChild(labelLayer)
				//
				const valueLayer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar("", self.context) // zero val for now
				self.resolvedAddress_valueLayer = valueLayer
				fieldContainerLayer.appendChild(valueLayer)
			}
		}
		{ // resolved monero payment id
			const fieldContainerLayer = document.createElement("div")
			self.resolvedPaymentID_containerLayer = fieldContainerLayer
			div.appendChild(fieldContainerLayer)
			fieldContainerLayer.style.display = "none" // initial state
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID", self.context)
				fieldContainerLayer.appendChild(labelLayer)
				//
				const valueLayer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar("", self.context) // zero val for now
				self.resolvedPaymentID_valueLayer = valueLayer
				fieldContainerLayer.appendChild(valueLayer)
				//
				const detectedMessage = commonComponents_forms.New_Detected_IconAndMessageLayer(self.context)
				fieldContainerLayer.appendChild(detectedMessage)
			}
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_addPaymentIDButtonView()
	{
		const self = this		
		const view = commonComponents_tables.New_clickableLinkButtonView(
			"+ ADD PAYMENT ID", 
			self.context, 
			function()
			{
				if (self.isFormDisabled !== true) {
					self.manualPaymentIDInputLayer_containerLayer.style.display = "block"
					self.addPaymentIDButtonView.layer.style.display = "none"
				}
			}
		)
		view.layer.style.marginTop = "4px"
		view.layer.style.marginLeft = "32px"
		self.addPaymentIDButtonView = view
		self.form_containerLayer.appendChild(view.layer)
	}
	_setup_form_manualPaymentIDInputLayer()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.display = "none" // initial
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PAYMENT ID", self.context)
			labelLayer.style.marginTop = "4px"
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "A specific payment ID"
			})
			self.manualPaymentIDInputLayer = valueLayer
			valueLayer.addEventListener(
				"keyup",
				function(event)
				{
					if (event.keyCode === 13) { // return key
						self._tryToGenerateSend()
						return
					}
				}
			)
			valueLayer.autocorrect = "off"
			valueLayer.autocomplete = "off"
			valueLayer.autocapitalize = "none"
			valueLayer.spellcheck = "false"
			div.appendChild(valueLayer)
		}
		self.manualPaymentIDInputLayer_containerLayer = div
		//
		self.form_containerLayer.appendChild(div)
	}
	//
	_setup_actionButton_useCamera()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Use Camera", 
			self.context.crossPlatform_appBundledAssetsRootPath+"/SendFundsTab/Resources/actionButton_iconImage__useCamera@3x.png", 
			false,
			function(layer, e)
			{
				console.log("TODO: use camera to get QR code")
			},
			self.context,
			9, // px from top of btn - due to shorter icon
			undefined,
			"14px 14px"
		)
		self.useCamera_buttonView = buttonView
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_chooseFile()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Choose File", 
			self.context.crossPlatform_appBundledAssetsRootPath+"/SendFundsTab/Resources/actionButton_iconImage__chooseFile@3x.png", 
			true,
			function(layer, e)
			{
				self.__didSelect_actionButton_chooseFile()
			},
			self.context,
			undefined,
			undefined,
			"16px 16px"
		)
		self.chooseFile_buttonView = buttonView
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	//
	_setup_qrCodeInputs_containerView()
	{
		const self = this
		const view = new View({}, self.context)
		self.qrCodeInputs_containerView = view
		{
			const layer = view.layer
			view.Hide = function()
			{
				layer.style.display = "none"
			}
			view.Show = function()
			{
				layer.style.display = "block"
			}
			layer.style.position = "absolute"
			layer.style.zIndex = "999999"
			layer.style.left = "0"
			layer.style.right = "0"
			layer.style.top = "0"
			layer.style.bottom = "0"
			layer.style.backgroundColor = "#272527"
			view.Hide()
		}
		{
			const contentView = new View({}, self.context)
			self.qrCodeInputs_contentView = contentView
			const layer = contentView.layer
			layer.style.position = "absolute"
			layer.style.backgroundColor = "#1D1B1D"
			layer.style.margin = "15px"
			layer.style.width = `calc(100% - ${15 * 2 + 2}px)` // + 2 is for border
			layer.style.border = "1px dashed #494749"
			layer.style.borderRadius = "6px"
			view.addSubview(contentView)
		}
		{ // QR code graphic in contentView
			const div = document.createElement("div")
			const side = 48
			div.style.width = "100%" // cause centering in css is……
			div.style.height = side+"px"
			div.style.backgroundSize = side+"px " + side+"px"
			div.style.backgroundImage = "url("+self.context.crossPlatform_appBundledAssetsRootPath+"/SendFundsTab/Resources/qrDropzoneIcon@3x.png)"
			div.style.backgroundPosition = "center"
			div.style.backgroundRepeat = "no-repeat"
			div.style.backgroundSize = "48px 48px"
			div.style.marginTop = "108px"
			self.qrCodeInputs_contentView.layer.appendChild(div)
		}
		{ // label in contentView
			const div = document.createElement("div")
			div.style.width = "100%" // cause centering in css is……
			div.style.height = "auto"
			div.style.textAlign = "center"
			div.style.marginTop = "24px"
			//
			div.style.fontSize = "13px"
			div.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
			div.style.color = "#9E9C9E"
			div.style.fontWeight = "300"
			div.style.webkitFontSmoothing = "subpixel-antialiased"
			//
			div.innerHTML = "Drag and drop a<br/>Monero Request Code "
			self.qrCodeInputs_contentView.layer.appendChild(div)
		}
		self.addSubview(view)
	}
	//
	startObserving()
	{
		const self = this
		{ // walletAppCoordinator
			const emitter = self.context.walletAppCoordinator
			self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = function(contact)
			{
				self.navigationController.DismissModalViewsToView( // whether we should force-dismiss these (create new contact) is debatable… 
					null, 
					true, // null -> to top stack view
					function() 
					{ // must wait til done or 'currently transitioning' will race 
						self.navigationController.PopToRootView( // now pop pushed stack views - essential for the case they're viewing a transaction
							true, // animated
							function(err)
							{
								if (self.isSubmitButtonDisabled == true) {
									console.warn("Triggered send funds from contact while submit btn disabled. Beep.")
									// TODO: create system service for playing beep, an electron (shell.beep) implementation, and call it to beep
									// TODO: mayyybe alert tx in progress
									return
								}
								self.contactOrAddressPickerLayer.ContactPicker_pickContact(contact)
							}
						)
					}
				)
			}
			emitter.on(
				emitter.EventName_didTrigger_sendFundsToContact(), // observe 'did' so we're guaranteed to already be on right tab
				self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
			)
		}
		{ // urlOpeningController
			const controller = self.context.urlOpeningController
			controller.on(
				controller.EventName_ReceivedURLToOpen_FundsRequest(),
				function(url)
				{
					if (self.__shared_isAllowedToPerformDropOrURLOpeningOps() != true) {
						console.warn("Not allowed to perform URL opening ops yet.")
						return false
					}
					self._shared_didPickRequestURIStringForAutofill(url)
				}
			)
		}
	}
	//
	//
	// Lifecycle - Teardown - Overrides
	//
	TearDown()
	{
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
	tearDownAnySpawnedReferencedPresentedViews()
	{
		const self = this
		if (self.current_transactionDetailsView !== null) {
			self.current_transactionDetailsView.TearDown()
			self.current_transactionDetailsView = null
		}
	}
	cancelAny_requestHandle_for_oaResolution()
	{
		const self = this
		//
		let req = self.requestHandle_for_oaResolution
		if (typeof req !== 'undefined' && req !== null) {
			console.log("💬  Aborting requestHandle_for_oaResolution")
			req.abort()
		}
		self.requestHandle_for_oaResolution = null
	}
	stopObserving()
	{
		const self = this
		{
			const emitter = self.context.walletAppCoordinator
			emitter.removeListener(
				emitter.EventName_didTrigger_sendFundsToContact(),
				self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact
			)
			self._walletAppCoordinator_fn_EventName_didTrigger_sendFundsToContact = null
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Send Monero"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		self.rightBarButtonView = view
		const layer = view.layer
		layer.innerHTML = "Send"
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (self.isSubmitButtonDisabled !== true) { // button is enabled
						self._tryToGenerateSend()
					}
				}
				return false
			}
		)
		return view
	}
	//
	//
	// Accessors - Lookups - Mixin
	//
	_mixin_int()
	{
		return 9 // hard-coded, for now at least. in future, get from libmonero/wallet
	}
	//
	//
	// Accessors - Factories - Values
	//
	_new_estimatedTransactionFee_displayString()
	{
		const self = this
		/*
		var mixin_int = self._mixin_int()
		const estimatedNetworkFee_JSBigInt = monero_sendingFunds_utils.EstimatedTransaction_ringCT_networkFee(
			mixin_int
		)
		const hostingServiceFee_JSBigInt = self.context.hostedMoneroAPIClient.HostingServiceChargeFor_transactionWithNetworkFee(
			estimatedNetworkFee_JSBigInt
		)
		// NOTE: the hostingServiceFee has been disabled with RCT for now
		const estimatedTotalFee_JSBigInt = /*hostingServiceFee_JSBigInt.add(estimatedNetworkFee_JSBigInt)
		const estimatedTotalFee_str = monero_utils.formatMoney(estimatedTotalFee_JSBigInt)
		*/
		const estimatedTotalFee_str = "0.028" 
		// Just hard-coding this to a reasonable estimate for now as the fee estimator algo uses the median blocksize which results in an estimate about twice what it should be
		var displayString = `+ ${estimatedTotalFee_str} EST. FEE`
		//
		return displayString
	}
	//
	//
	// Imperatives - UI - Config
	//
	refresh_feeEstimateLayer()
	{
		const self = this
		self.feeEstimateLayer.innerHTML = self._new_estimatedTransactionFee_displayString()
	}
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
	disable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== true) {
			self.isSubmitButtonDisabled = true
			self.rightBarButtonView.SetEnabled(false)
		}
	}
	enable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== false) {
			self.isSubmitButtonDisabled = false
			self.rightBarButtonView.SetEnabled(true)
		}
	}
	//
	//
	// Runtime - Imperatives - Element visibility
	//
	_displayResolvedAddress(address)
	{
		const self = this
		if (!address) {
			throw "nil address passed to _displayResolvedAddress"
		}
		if (typeof self.resolvedAddress_containerLayer === 'undefined' || !self.resolvedAddress_containerLayer) {
			throw "_displayResolvedAddress expects a non-nil self.resolvedAddress_containerLayer"
		}
		self.resolvedAddress_valueLayer.innerHTML = address
		self.resolvedAddress_containerLayer.style.display = "block"
	}
	_hideResolvedAddress()
	{
		const self = this
		if (typeof self.resolvedAddress_containerLayer !== 'undefined' && self.resolvedAddress_containerLayer) {
			self.resolvedAddress_containerLayer.style.display = "none"
		}
	}
	_displayResolvedPaymentID(payment_id)
	{
		const self = this
		if (!payment_id) {
			throw "nil payment_id passed to _displayResolvedPaymentID"
		}
		if (typeof self.resolvedPaymentID_containerLayer === 'undefined' || !self.resolvedPaymentID_containerLayer) {
			throw "_displayResolvedPaymentID expects a non-nil self.resolvedPaymentID_containerLayer"
		}
		self.resolvedPaymentID_valueLayer.innerHTML = payment_id
		self.resolvedPaymentID_containerLayer.style.display = "block"
	}
	_hideResolvedPaymentID()
	{
		const self = this
		if (typeof self.resolvedPaymentID_containerLayer !== 'undefined' && self.resolvedPaymentID_containerLayer) {
			self.resolvedPaymentID_containerLayer.style.display = "none"
		}
	}
	//
	_dismissValidationMessageLayer()
	{
		const self = this
		self.validationMessageLayer.ClearAndHideMessage() 
	}
	//
	//
	// Runtime - Imperatives - Send-transaction generation
	//
	_tryToGenerateSend()
	{
		const self = this
		if (self.isSubmitButtonDisabled) {
			console.warn("⚠️  Submit button currently disabled. Bailing.")
			return
		}
		{ // disable form elements
			self.disable_submitButton()
			self.isFormDisabled = true
			self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.keepAwake() // disable screen dim/off
			}
			//
			if (self.useCamera_buttonView) {
				self.useCamera_buttonView.Disable()
			}
			self.chooseFile_buttonView.Disable()
			// 
			self.amountInputLayer.disabled = true
			self.manualPaymentIDInputLayer.disabled = true
			self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = true
			self.walletSelectView.SetEnabled(false)
		}
		{
			self._dismissValidationMessageLayer()
		}
		function _reEnableFormElements()
		{
			self.isFormDisabled = false
			self.context.userIdleInWindowController.ReEnable_userIdle()					
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.allowSleepAgain() // re-enable screen dim/off
			}
			//
			self.enable_submitButton() 
			self.amountInputLayer.disabled = false
			self.manualPaymentIDInputLayer.disabled = false
			self.contactOrAddressPickerLayer.ContactPicker_inputLayer.disabled = false // making sure to re-enable 
			self.walletSelectView.SetEnabled(true)
			//
			if (self.useCamera_buttonView) {
				self.useCamera_buttonView.Enable()
			}
			self.chooseFile_buttonView.Enable()
		}
		function _trampolineToReturnWithValidationErrorString(errStr)
		{ // call this anytime you want to exit this method before complete success (or otherwise also call _reEnableFormElements)
			self.validationMessageLayer.SetValidationError(errStr)
			_reEnableFormElements()
		}
		//
		const wallet = self.walletSelectView.CurrentlySelectedRowItem
		{
			if (typeof wallet === 'undefined' || !wallet) {
				_trampolineToReturnWithValidationErrorString("Please create a wallet to send Monero.")
				return
			}
		}
		const raw_amount_String = self.amountInputLayer.value
		var amount_Number = null;
		{
			if (typeof raw_amount_String === 'undefined' || !raw_amount_String) {
				_trampolineToReturnWithValidationErrorString("Please enter the amount to send.")
				return
			}
			amount_Number = +raw_amount_String // turns into Number, apparently
			if (isNaN(amount_Number)) {
				_trampolineToReturnWithValidationErrorString("Please enter a valid amount of Monero.")
				return
			}
			if (amount_Number <= 0) {
				_trampolineToReturnWithValidationErrorString("The amount to send must be greater than zero.")
				return
			}
		}
		//
		const hasPickedAContact = typeof self.pickedContact !== 'undefined' && self.pickedContact ? true : false
		const enteredAddressValue = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value || ""
		const enteredAddressValue_exists = enteredAddressValue !== ""
		const notPickedContactBut_enteredAddressValue = !hasPickedAContact && enteredAddressValue_exists ? true : false
		//
		var target_address = null // to derive…
		const resolvedAddress = self.resolvedAddress_valueLayer.innerHTML || ""
		const resolvedAddress_exists = resolvedAddress !== "" // NOTE: it might be hidden, though!
		const resolvedAddress_fieldIsVisible = self.resolvedAddress_containerLayer.style.display === "block"
		//
		var payment_id = null
		const manuallyEnteredPaymentID = self.manualPaymentIDInputLayer.value || ""
		const manuallyEnteredPaymentID_exists = manuallyEnteredPaymentID !== ""
		const manuallyEnteredPaymentID_fieldIsVisible = self.manualPaymentIDInputLayer_containerLayer.style.display === "block" // kind of indirect, would be better to encapsulate show/hide & state, maybe
		const resolvedPaymentID = self.resolvedPaymentID_valueLayer.innerHTML || ""
		const resolvedPaymentID_exists = resolvedPaymentID !== "" // NOTE: it might be hidden, though!
		const resolvedPaymentID_fieldIsVisible = self.resolvedPaymentID_containerLayer.style.display === "block"
		//
		const canUseManualPaymentID = 
			manuallyEnteredPaymentID_exists 
			&& manuallyEnteredPaymentID_fieldIsVisible
			&& !resolvedPaymentID_fieldIsVisible // but not if we have a resolved one!
		if (canUseManualPaymentID && hasPickedAContact) {
			throw "canUseManualPaymentID shouldn't be true at same time as hasPickedAContact"
			// NOTE: This will also be true even if we are using the payment ID from a
			// Funds Request QR code / URI because we set the request URI as a 'resolved' /
			// "detected" payment id. So the `hasPickedAContact` usage above yields slightly
			// ambiguity in code and could be improved to encompass request uri pid "forcing"
		}
		if (hasPickedAContact) { // we have already re-resolved the payment_id
			if (self.pickedContact.HasOpenAliasAddress() === true) {
				payment_id = self.pickedContact.payment_id
				if (!payment_id || typeof payment_id === 'undefined') {
					// not throwing - it's ok if this payment has no payment id
				}
				// we can just use the cached_OAResolved_XMR_address because in order to have picked this
				// contact and for the user to hit send, we'd need to have gone through an OA resolve (_didPickContact)
				target_address = self.pickedContact.cached_OAResolved_XMR_address
			} else if (self.pickedContact.HasIntegratedAddress() === true) {
				target_address = self.pickedContact.address // whatever it may be
				// ^ for integrated addrs, we don't want to extract the payment id and then use the integrated addr as well (TODO: unless we use fluffy's patch?)
			} else { // non-integrated addr
				target_address = self.pickedContact.address // whatever it may be
				// ^ for integrated addrs, we don't want to extract the payment id and then use the integrated addr as well (unless we use fluffy's patch?)
				payment_id = self.pickedContact.payment_id || null
			}
			if (!target_address || typeof target_address === 'undefined') {
				_trampolineToReturnWithValidationErrorString("Contact unexpectedly lacked XMR address. This may be a bug.")
				return
			}
		} else {
			if (enteredAddressValue_exists === false) {
				_trampolineToReturnWithValidationErrorString("Please specify the recipient of this transfer.")
				return
			}
			// address
			const is_enteredAddressValue_OAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(enteredAddressValue)
			var isIntegratedAddress;
			if (is_enteredAddressValue_OAAddress !== true) {
				// then it's an XMR addr
				var address__decode_result; 
				try {
					address__decode_result = monero_utils.decode_address(enteredAddressValue)
				} catch (e) {
					console.warn("Couldn't decode as a Monero address.", e)
					_trampolineToReturnWithValidationErrorString("Please enter a valid Monero address.")
					self.enable_submitButton()
					return // just return silently
				}
				// we don't care whether it's an integrated address or not here since we're not going to use its payment id
				target_address = enteredAddressValue // then this look like a valid XMR addr
				if (address__decode_result.intPaymentId) {
					isIntegratedAddress = true
				} else {
					isIntegratedAddress = false
				}
			} else { // then it /is/ an OA addr
				isIntegratedAddress = false // important to set
				if (!resolvedAddress_fieldIsVisible || !resolvedAddress_exists) {
					_trampolineToReturnWithValidationErrorString("Couldn't resolve this OpenAlias address.")
					return
				}
				target_address = resolvedAddress
			}
			// payment ID:
			if (isIntegratedAddress === true) {
				payment_id = null
			} else {
				if (canUseManualPaymentID) {
					if (resolvedPaymentID_fieldIsVisible) {
						throw "canUseManualPaymentID but resolvedPaymentID_fieldIsVisible"
					}
					payment_id = manuallyEnteredPaymentID
					if (monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(payment_id) === false) {
						// TODO: set validation err on payment ID field (clear that err when we clear the payment ID field)
						_trampolineToReturnWithValidationErrorString("Please enter a valid payment ID.")
						return
					}
				} else if (resolvedPaymentID_fieldIsVisible) {
					if (resolvedPaymentID_exists === false) {
						throw "resolvedPaymentID_fieldIsVisible but !resolvedPaymentID_exists"
					}
					payment_id = resolvedPaymentID
				}
			}
		}
		{ // final validation
			if (!target_address) {
				_trampolineToReturnWithValidationErrorString("Unable to derive a target address for this transfer. This may be a bug.")
				return
			}
		}
		{
			self.validationMessageLayer.SetValidationError(`Sending ${amount_Number} XMR…`)
		}
		__proceedTo_generateSendTransactionWith(
			wallet, // FROM wallet
			target_address, // TO address
			payment_id,
			amount_Number
		)
		function __proceedTo_generateSendTransactionWith(
			sendFrom_wallet,
			target_address,
			payment_id,
			amount_Number
		)
		{
			const sendFrom_address = sendFrom_wallet.public_address
			//
			const mixin_int = self._mixin_int()
			sendFrom_wallet.SendFunds(
				target_address,
				amount_Number,
				mixin_int,
				payment_id,
				function(
					err,
					currencyReady_targetDescription_address,
					sentAmount,
					final__payment_id,
					tx_hash,
					tx_fee
				)
				{
					if (err) {
						_trampolineToReturnWithValidationErrorString(typeof err === 'string' ? err : err.message)
						return
					}
					// console.log(
					// 	"SENT",
					// 	currencyReady_targetDescription_address,
					// 	sentAmount,
					// 	final__payment_id,
					// 	tx_hash,
					// 	tx_fee
					// )
					var mockedTransaction; // defined out here cause we use it below
					{ // now present a mocked transaction details view, and see if we need to present an "Add Contact From Sent" screen based on whether they sent w/o using a contact
						mockedTransaction =
						{
							hash: tx_hash,
							mixin: "" + mixin_int,
							coinbase: false,
							//
							isConfirmed: false, // important
							isJustSentTransaction: true, // this is only used here
							timestamp: "" + (new Date()), // faking
							//
							isUnlocked: true, // TODO: not sure if this is correct
							unlock_time: 0,
							lockedReason: "Transaction is unlocked",
							// height: 1228823,
							//
							total_sent: "" + (sentAmount * Math.pow(10, monero_config.coinUnitPlaces)), // TODO: is this correct? and do we need to mock this?
							total_received: "0",
							//
							approx_float_amount: -1 * sentAmount, // -1 cause it's outgoing
							// amount: new JSBigInt(sentAmount), // not really used (note if you uncomment, import JSBigInt)
							tx_fee: tx_fee,
							//
							payment_id: payment_id,
							//
							target_address: target_address, // only we here are saying it's the target
							//
							contact: hasPickedAContact ? self.pickedContact : null,
							//
							// values just in case they're needed; some are
							enteredAddressValue: enteredAddressValue_exists ? enteredAddressValue : null,
							resolvedAddress: resolvedAddress_exists ? resolvedAddress : null,
							resolvedPaymentID: resolvedPaymentID_exists ? resolvedPaymentID : null,
							manuallyEnteredPaymentID: manuallyEnteredPaymentID_exists ? manuallyEnteredPaymentID : null
						}
						self.pushDetailsViewFor_transaction(sendFrom_wallet, mockedTransaction)
					}
					{ // and after a delay, present AddContactFromSendTabView
						const this_pickedContact = hasPickedAContact == true ? self.pickedContact : null
						if (this_pickedContact === null) { // so they're going with a custom addr
							setTimeout(
								function()
								{
									const view = new AddContactFromSendTabView({
										mockedTransaction: mockedTransaction
									}, self.context)
									const navigationView = new StackAndModalNavigationView({}, self.context)
									navigationView.SetStackViews([ view ])
									self.navigationController.PresentView(navigationView, true)
								},
								750 + 300 // after the navigation transition just above has taken place, and given a little delay for user to get their bearings
							)
						}
					}
					{ // finally, clean up form
						setTimeout(
							function()
							{ // TODO: factor this ?
								self._dismissValidationMessageLayer()
								{
									self.amountInputLayer.value = ""
								}
								{
									if (self.pickedContact && typeof self.pickedContact !== 'undefined') {
										self.contactOrAddressPickerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput(
											true // true, do not focus input
										)
										self.pickedContact = null // jic
									}
									self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = ""
								}
								{
									self._hideResolvedAddress()
									self._hideResolvedPaymentID()
								}
								{
									self.manualPaymentIDInputLayer.value = ""
									self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
									//
									self.addPaymentIDButtonView.layer.style.display = "block"
								}
								// and lastly, importantly, re-enable everything
								_reEnableFormElements()
							},
							500 // after the navigation transition just above has taken place
						)
					}
					{ // and fire off a request to have the wallet get the latest (real) tx records
						setTimeout(
							function()
							{
								sendFrom_wallet.hostPollingController._fetch_transactionHistory() // TODO: maybe fix up the API for this
							}
						)
					}
				}
			)
		}
	}
	//
	//
	// Runtime - Imperatives - Public - Using a new fromContact when a self had already been presented
	//
	AtRuntime_reconfigureWith_fromContact(fromContact)
	{
		const self = this
		{ // figure that since this method is called when user is trying to initiate a new request we should clear the amount
			self.amountInputLayer.value = ""
		}
		{
			self.fromContact = fromContact
			self.contactOrAddressPickerLayer.ContactPicker_pickContact(fromContact) // simulate user picking the contact
		}
	}
	//
	//
	// Runtime - Imperatives - Navigation
	//
	pushDetailsViewFor_transaction(
		sentFrom_wallet, 
		transaction
	)
	{
		const self = this
		const _cmd = "pushDetailsViewFor_transaction"
		if (self.current_transactionDetailsView !== null) {
			// commenting this throw so we can use this as the official way to block double-clicks, etc
			// throw "Asked to " + _cmd + " while self.current_transactionDetailsView !== null"
			return
		}
		{ // validate wallet and tx
			if (typeof sentFrom_wallet === 'undefined' || sentFrom_wallet === null) {
				throw self.constructor.name + " requires self.wallet to " + _cmd
			}
			if (typeof transaction === 'undefined' || transaction === null) {
				throw self.constructor.name + " requires transaction to " + _cmd
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to " + _cmd
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
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				//
				self.qrCodeInputs_contentView.layer.style.height = `calc(100% - ${15 * 2 + self.navigationController.NavigationBarHeight() + 2}px)` // +2 for border
				self.qrCodeInputs_contentView.layer.style.marginTop = `${15 + self.navigationController.NavigationBarHeight()}px`
			}
		}
	}
	// Runtime - Protocol / Delegation - Stack & modal navigation 
	// We don't want to naively do this on VDA as else tab switching may trigger it - which is bad
	navigationView_didDismissModalToRevealView()
	{
		const self = this
		if (super.navigationView_didDismissModalToRevealView) {
			super.navigationView_didDismissModalToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	navigationView_didPopToRevealView()
	{
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
	_didPickContact(contact)
	{
		const self = this
		self.pickedContact = contact
		{ // payment id - if we already have one
			if (self.pickedContact.HasOpenAliasAddress() === false) {
				self._hideResolvedAddress() // no possible need to show this
				//
				const payment_id = contact.payment_id
				if (payment_id && typeof payment_id !== 'undefined') {
					self._displayResolvedPaymentID(payment_id)
				} else {
					self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
				}
				self.enable_submitButton()
				// and exit early
				return // no need to re-resolve what is not an OA addr
			} else { // they're using an OA addr, so we still need to check if they still have one
				self._hideResolvedAddress() // no possible need to show this
				self._hideResolvedPaymentID() // in case it's visible… although it wouldn't be
			}
		}
		// look up the payment ID again 
		{ // (and show the "resolving UI")
			self.resolving_activityIndicatorLayer.style.display = "block"
			self.disable_submitButton()
			//
			self._dismissValidationMessageLayer() // assuming it's okay to do this here - and need to since the coming callback can set the validation msg
		}
		{
			self.cancelAny_requestHandle_for_oaResolution()
		}
		self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
			contact.address,
			function(
				err,
				addressWhichWasPassedIn,
				moneroReady_address,
				payment_id, // may be undefined
				tx_description,
				openAlias_domain,
				oaRecords_0_name,
				oaRecords_0_description,
				dnssec_used_and_secured
			)
			{
				self.resolving_activityIndicatorLayer.style.display = "none"
				//
				if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
					console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.")
					return
				}
				self.requestHandle_for_oaResolution = null
				//
				if (typeof self.pickedContact === 'undefined' || !self.pickedContact) {
					console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.pickedContact. Bailing")
					return
				}
				if (self.pickedContact.address !== addressWhichWasPassedIn) {
					console.warn("⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected self.pickedContact.address. Bailing")
					return
				}
				if (err) {
					self.validationMessageLayer.SetValidationError(err.toString())
					return
				}
				self.enable_submitButton() // only enable if no err
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
	_didFinishTypingInContactPickerInput(event)
	{
		const self = this
		//
		const enteredPossibleAddress = self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value
		const hasEnteredNoAddressContent = !enteredPossibleAddress || typeof enteredPossibleAddress === 'undefined'
		//
		const wasEnterKey = event.keyCode == 13
		if (wasEnterKey) {
			let requestExists = typeof self.requestHandle_for_oaResolution !== 'undefined' && self.requestHandle_for_oaResolution !== null
			if (requestExists) { // means we are currently requesting still and they just hit the enter btn - just "ignore"
				console.warn("User hit return on contact picker input while still resolving a contact. Bailing.")
				return
			}
		}
		// 
		//
		self.cancelAny_requestHandle_for_oaResolution()
		self._hideResolvedAddress()
		self._hideResolvedPaymentID()
		self._dismissValidationMessageLayer()
		//
		if (hasEnteredNoAddressContent == true) {
			if (self.manualPaymentIDInputLayer_containerLayer.style.display === "none") {
				self.addPaymentIDButtonView.layer.style.display = "block" // show if hidden as we may have hidden it
			}
			return
		}
		//
		self.disable_submitButton()
		//
		const isOAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(enteredPossibleAddress)
		if (isOAAddress !== true) {
			var address__decode_result; 
			try {
				address__decode_result = monero_utils.decode_address(enteredPossibleAddress)
			} catch (e) {
				console.warn("Couldn't decode as a Monero address.", e)
				self.disable_submitButton()
				return // just return silently
			}
			if (address__decode_result.intPaymentId) {
				self._displayResolvedPaymentID(address__decode_result.intPaymentId)
				self.addPaymentIDButtonView.layer.style.display = "none"
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
				self.manualPaymentIDInputLayer.value = ""
			} else {
				self._hideResolvedPaymentID() // not that it would be showing
			}
			self.enable_submitButton()
			return
		}
		// then this could be an OA address…
		{ // (and show the "resolving UI")
			self.resolving_activityIndicatorLayer.style.display = "block"
			self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
			self.manualPaymentIDInputLayer.value = ""
			self.addPaymentIDButtonView.layer.style.display = "none"
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
			function(
				err,
				addressWhichWasPassedIn,
				moneroReady_address,
				payment_id, // may be undefined
				tx_description,
				openAlias_domain,
				oaRecords_0_name,
				oaRecords_0_description,
				dnssec_used_and_secured
			)
			{
				self.resolving_activityIndicatorLayer.style.display = "none"
				self.enable_submitButton()
				//
				if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
					console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.")
					return
				}
				self.requestHandle_for_oaResolution = null
				//
				if (enteredPossibleAddress !== addressWhichWasPassedIn) {
					console.warn("⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the enteredPossibleAddress. Bailing")
					return
				}
				if (err) {
					console.log("err.toString()" , err.toString())
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
					self.addPaymentIDButtonView.layer.style.display = "none"
					self.manualPaymentIDInputLayer_containerLayer.style.display = "none"
					self.manualPaymentIDInputLayer.value = ""
					self._displayResolvedPaymentID(payment_id)
				} else {
					// we already hid resolved payment it above
					if (self.manualPaymentIDInputLayer_containerLayer.style.display != "block") { // if manual payment field not showing
						self.addPaymentIDButtonView.layer.style.display = "block" // then make sure we are at least shwign the + payment ID btn
					} else { // then one or the other is already visible - respect existing state
						console.log("💬  It should be the case that either add pymt id btn or manual payment field is visible")
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
	_shared_didPickQRCodeAtPath(absoluteFilePath)
	{
		const self = this
		if (self.isFormDisabled === true) {
			console.warn("Disallowing QR code pick form disabled.")
			return
		}		
		const width = 256
		const height = 256 // TODO: can we / do we need to read these from the image itself?
		//
		const canvas = document.createElement("canvas")
		const context = canvas.getContext("2d")
		canvas.width = width
		canvas.height = height 
		//
		const img = document.createElement("img")
		img.addEventListener(
			"load",
			function()
			{
				context.drawImage(img, 0, 0, width, height)
				//
				const imageData = context.getImageData(0, 0, width, height)
				const decodeResults = jsQR.decodeQRFromImage(imageData.data, imageData.width, imageData.height)
				if (!decodeResults || typeof decodeResults === 'undefined') {
					console.log("No decodeResults from QR. Couldn't decode?")
					self.validationMessageLayer.SetValidationError("Unable to decode that QR code.")
					return
				}
				if (typeof decodeResults !== 'string') {
					self.validationMessageLayer.SetValidationError("Was able to decode that QR code but unrecognized result.")
					return
				}
				const requestURIString = decodeResults
				self._shared_didPickRequestURIStringForAutofill(requestURIString)
			}
		)
		img.src = absoluteFilePath
	}
	_shared_didPickRequestURIStringForAutofill(requestURIString)
	{
		const self = this
		//
		self.cancelAny_requestHandle_for_oaResolution()
		//
		var requestPayload;
		try {
			requestPayload = monero_requestURI_utils.New_ParsedPayload_FromRequestURIString(requestURIString)
		} catch (errStr) {
			if (errStr) {
				self.validationMessageLayer.SetValidationError("Unable to use the result of decoding that QR code: " + errStr)
				return
			}
		}
		{
			const amount = requestPayload.amount
			if (amount !== null && typeof amount !== 'undefined' && amount !== "") {
				self.amountInputLayer.value = amount
			}
		}
		{
			const target_address = requestPayload.address
			const payment_id_orNull = requestPayload.payment_id && typeof requestPayload.payment_id !== 'undefined' ? requestPayload.payment_id : null
			if (target_address !== null && typeof target_address !== 'undefined' && target_address !== "") {
				var foundContact = null
				const contacts = self.context.contactsListController.records
				const numberOf_contacts = contacts.length
				for (var i = 0 ; i < numberOf_contacts ; i++) {
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
					{
						if (self.pickedContact && typeof self.pickedContact !== 'undefined') { // unset
							self.contactOrAddressPickerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput(
								true // true, do not focus input
							)
							self.pickedContact = null // jic
						}
						self.contactOrAddressPickerLayer.ContactPicker_inputLayer.value = target_address
					}
				}
			}
			// and no matter what , display payment id, if present
			if (payment_id_orNull !== null) { // but display it as a 'detected' pid
				self.addPaymentIDButtonView.layer.style.display = "none" // hide if showing
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
				self.manualPaymentIDInputLayer.value = "" 
				self._displayResolvedPaymentID(payment_id_orNull)
			} else {
				self._hideResolvedPaymentID() // jic
				self.addPaymentIDButtonView.layer.style.display = "block" // hide if showing
				self.manualPaymentIDInputLayer_containerLayer.style.display = "none" // hide if showing
				self.manualPaymentIDInputLayer.value = "" 
			}
		}
	}
	//
	//
	// Runtime - Delegation - Request URI string picking - Entrypoints
	//	
	__didSelect_actionButton_chooseFile()
	{
		const self = this
		self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
		if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
			self.context.Cordova_disallowLockDownOnAppPause += 1 // place lock so Android app doesn't tear down UI and mess up flow
		}
		// ^ so we don't get torn down while dialog open
		self.context.filesystemUI.PresentDialogToOpenOneImageFile(
			"Open Monero Request",
			function(err, absoluteFilePath)
			{
				self.context.userIdleInWindowController.ReEnable_userIdle()					
				if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
					self.context.Cordova_disallowLockDownOnAppPause -= 1 // place lock so Android app doesn't tear down UI and mess up flow
				}
				if (err) {
					self.validationMessageLayer.SetValidationError(err.toString() || "Error while picking QR code from file.")
					return
				}
				if (absoluteFilePath === null || absoluteFilePath === "" || typeof absoluteFilePath === 'undefined') {
					return // nothing picked / canceled
				}
				self._shared_didPickQRCodeAtPath(absoluteFilePath)
			}
		)
	}
	//
	//
	// Runtime - Delegation - Request URI string picking - Entrypoints - Proxied drag & drop
	//
	__shared_isAllowedToPerformDropOrURLOpeningOps()
	{
		const self = this
		if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
			return false
		}
		if (self.context.passwordController.IsUserChangingPassword() === true) {
			return false
		}
		if (!self.context.walletsListController.records || self.context.walletsListController.records == 0) {
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
	_proxied_ondragenter(e)
	{
		const self = this
		if (self.__shared_isAllowedToPerformDropOrURLOpeningOps()) {
			setTimeout(
				function()
				{
					self.qrCodeInputs_containerView.Show()
				},
				10
			)
		}
	}
	_proxied_ondragleave()
	{
		const self = this
		setTimeout(
			function()
			{
				self.qrCodeInputs_containerView.Hide()
			},
			10
		)
	}
	_proxied_ondrop(e)
	{
		const self = this
		if (self.__shared_isAllowedToPerformDropOrURLOpeningOps() == false) {
			// would be nice to NSBeep() here
			return
		}
		const files = e.dataTransfer.files
		if (!files || files.length == 0) {
			console.warn("No files")
			return
		}
		const file = files[0]
		const absoluteFilePath = file.path // outside of timeout
		if (absoluteFilePath == null || absoluteFilePath == "" || typeof absoluteFilePath === 'undefined') {
			console.warn("No filepath in dropped. Bailing.")
			return
		}
		setTimeout(
			function()
			{
				self.qrCodeInputs_containerView.Hide()
				//
				if (absoluteFilePath === null || absoluteFilePath === "" || typeof absoluteFilePath === 'undefined') {
					self.validationMessageLayer.SetValidationError("Couldn't get the file path to that QR code.")
					return // nothing picked / canceled
				}
				self._shared_didPickQRCodeAtPath(absoluteFilePath)
			},
			10
		)
	}
}
module.exports = SendFundsView