'use strict'

const View = require('../../Views/View.web')
const ContactFormView = require('./ContactFormView.web')
const monero_paymentID_utils = require('@mymonero/mymonero-paymentid-utils')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')
// Yat import
const YatMoneroLookup = require('@mymonero/mymonero-yat-lookup')
const yatMoneroLookup = new YatMoneroLookup({})

class AddContactView extends ContactFormView {
  setup () {
    const self = this
    super.setup()
  }

  _did_setup_field_address () {
    super._did_setup_field_address()
    // we're hooking into this function purely to get called just after the corresponding field layer's setup
    const self = this
    self._setup_form_resolving_activityIndicatorLayer()
    if (self._overridable_defaultTrue_wantsQRPickingActionButtons()) {
      self._setup_form_qrPicking_actionButtons() // after 'resolving' indicator
    }
  }

  _setup_form_resolving_activityIndicatorLayer () {
    const self = this
    const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
    layer.style.display = 'none' // initial state
    self.resolving_activityIndicatorLayer = layer
    self.form_containerLayer.appendChild(layer)
  }

  _setup_form_qrPicking_actionButtons () {
    const self = this
    const view = new View({}, self.context)
    const layer = view.layer
    layer.style.position = 'relative'
    layer.style.width = 'calc(100% - 24px - 24px)'
    layer.style.marginLeft = '24px'
    layer.style.marginTop = '15px'
    layer.style.height = 32 + 8 + 'px'
    self.actionButtonsContainerView = view
    self._setup_actionButton_chooseFile()
    self.form_containerLayer.appendChild(view.layer)
  }

  _setup_actionButton_chooseFile () {
    const self = this
    const buttonView = commonComponents_actionButtons.New_ActionButtonView(
      'Choose File',
      // borrowing this asset til these are factored
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

  Navigation_Title () {
    return 'New Contact'
  }

  _overridable_defaultFalse_canSkipEntireOAResolveAndDirectlyUseInputValues () {
    return false
  }

  _overridable_defaultTrue_wantsQRPickingActionButtons () {
    return true
  }

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

  _tryToCreateOrSaveContact () {
    const self = this
    //
    const fullname = self.fullnameInputLayer.value
    //const emoji = self.emojiInputView.Value()
    const address = self.addressInputLayer.value
    let paymentID = self.paymentIDInputLayer.value
    //
    if (typeof fullname === 'undefined' || !fullname) {
      self.validationMessageLayer.SetValidationError('Please enter a name for this contact.')
      return
    }
    if (typeof address === 'undefined' || !address) {
      self.validationMessageLayer.SetValidationError('Please enter an address for this contact.')
      return
    }
    if (typeof paymentID !== 'undefined' && paymentID) {
      if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
        self.validationMessageLayer.SetValidationError('Payment IDs cannot be used with subaddresses.')
        return
      }
    }
    //
    const canSkipEntireOAResolveAndDirectlyUseInputValues = self._overridable_defaultFalse_canSkipEntireOAResolveAndDirectlyUseInputValues()
    if (canSkipEntireOAResolveAndDirectlyUseInputValues === true) { // not the typical case
      // console.log('💬  Skipping OA resolve on AddContact.')
      _proceedTo_addContact_paymentID(
        paymentID, // can apparently use the exact field value
        undefined // NOTE: This, cached_OAResolved_XMR_address, can be supplied by subclass._willSaveContactWithDescription
      )
      return
    }
    //
    function __disableForm () {
      // TODO: disable / re-enable form elements plus cancel button as well (for Cordova slowness)
      self.disable_submitButton()
    }
    function __reEnableForm () {
      self.enable_submitButton()
    }
    self.validationMessageLayer.ClearAndHideMessage()
    __disableForm()
    //

    // Yat
    // checking for emojis for Yat addresses
    const hasEmojiCharacters = /\p{Extended_Pictographic}/u.test(address)
    if (hasEmojiCharacters) {
      // const isYat = yatMoneroLookup.isValidYatHandle(address)
      const isYat = true
      if (isYat) {
        self.yat = address;
        const lookup = yatMoneroLookup.lookupMoneroAddresses(address).then((responseMap) => {
          self.isYat = true
          // Our library returns a map with between 0 and 2 keys
          if (responseMap.size == 0) {
            // no monero address
            // When zero keys, we're not going to let a user save a contact. There's the off chance they try to add an incorrect Yat
            const errorString = `There is no Monero address associated with "${address}"`
            self.validationMessageLayer.SetValidationError(errorString)
            return
          } else if (responseMap.size == 1) {
            // Either a Monero address or a Monero subaddress was found.
            const iterator = responseMap.values()
            const record = iterator.next()
            self._displayResolvedAddress(record.value)
          } else if (responseMap.size == 2) {
            const moneroAddress = responseMap.get('0x1001')
            self._displayResolvedAddress(moneroAddress)
          }
          const contactDescription = {
            fullname: fullname,           
            isYat: true, 
            address: address,
            payment_id: null,
            cached_OAResolved_XMR_address: null
          }
          self._willSaveContactWithDescription(contactDescription)
          self.context.contactsListController.WhenBooted_AddContact(
            contactDescription,
            function (err, contact) {
              if (err) {
                __reEnableForm()
                console.error('Error while creating contact', err)
                self.validationMessageLayer.SetValidationError(err)
                return
              }
              // there's no need to re-enable the form because we're about to dismiss
              self._didSaveNewContact(contact)
            }
          )

        }).catch((error) => {
          __reEnableForm()
          // If the error status is defined, handle this error according to the HTTP error status code
          if (typeof (error.response) !== 'undefined' && typeof (error.response.status) !== 'undefined') {
            if (error.response.status == 404) {
              // Yat not found
              const errorString = `The Yat "${address}" does not exist`
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
        const errorString = `"${address}" is not a valid Yat handle. You may have input an emoji that is not part of the Yat emoji set, or a non-emoji character.`
        self.validationMessageLayer.SetValidationError(errorString)
        const hasEmojiCharacters = true;
        return
      }
    }

    if (hasEmojiCharacters == true) {
      return
    }

    // If we don't have emojis in the address string, continue to evaluate normally

    self.cancelAny_requestHandle_for_oaResolution() // jic
    const openAliasResolver = self.context.openAliasResolver
    if (openAliasResolver.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address) === false) {
      let address__decode_result
      try {
        address__decode_result = self.context.monero_utils.decode_address(address, self.context.nettype)
      } catch (e) {
        __reEnableForm()
        self.validationMessageLayer.SetValidationError('Please enter a valid Monero address') // not using the error here cause it can be pretty unhelpful to the lay user
        return
      }
      const integratedAddress_paymentId = address__decode_result.intPaymentId
      const isIntegratedAddress = !!integratedAddress_paymentId // would like this test to be a little more rigorous
      if (isIntegratedAddress) { // is integrated address
        paymentID = integratedAddress_paymentId // use this one instead
        self.paymentIDInputLayer.value = paymentID
      } else { // not an integrated addr - normal wallet addr or subaddress
        if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
          paymentID = undefined
          self.paymentIDInputLayer.value = ''
        } else { // normal wallet address
          if (paymentID === '' || typeof paymentID === 'undefined') { // if no existing payment ID
            paymentID = self.context.monero_utils.new_payment_id() // generate new one for them
            self.paymentIDInputLayer.value = paymentID
          } else { // just use/allow entered paymentID
          }
        }
      }
      //
      _proceedTo_addContact_paymentID(paymentID)
    } else {
      self.resolving_activityIndicatorLayer.style.display = 'block' // AFTER any cancelAny_requestHandle…
      //
      self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
        address,
        function (
          err,
          addressWhichWasPassedIn,
          moneroReady_address,
          returned__payment_id, // may be undefined
          tx_description,
          openAlias_domain,
          oaRecords_0_name,
          oaRecords_0_description,
          dnssec_used_and_secured
        ) {
          self.resolving_activityIndicatorLayer.style.display = 'none'
          //
          if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
            __reEnableForm()
            console.warn('⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.')
            return
          }
          self.requestHandle_for_oaResolution = null
          //
          if (address !== addressWhichWasPassedIn) {
            console.warn('⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected address. Bailing')
            return
          }
          if (err) {
            __reEnableForm()
            self.validationMessageLayer.SetValidationError(err.toString())
            return
          }
          self.paymentIDInputLayer.value = returned__payment_id || ''
          //
          // still not going to re-enable the button (although on non-Cordova it wouldn't matter)
          //
          const payment_id__toSave = returned__payment_id || ''
          const cached_OAResolved_XMR_address = moneroReady_address
          _proceedTo_addContact_paymentID(
            payment_id__toSave, // aka use no/zero/emptystr payment id rather than null as null will create a new
            cached_OAResolved_XMR_address // it's ok if this is undefined
          )
        }
      )
    }
    
    function _proceedTo_addContact_paymentID (paymentID__toSave, cached_OAResolved_XMR_address__orUndefined) {
      const paymentID_exists = paymentID__toSave && typeof paymentID__toSave !== 'undefined'
      const paymentID_existsAndIsNotValid = paymentID_exists && monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(paymentID__toSave) === false
      if (paymentID_existsAndIsNotValid === true) {
        __reEnableForm()
        self.validationMessageLayer.SetValidationError('Please enter a valid payment ID.')
        return
      }
      const contactDescription =
			{
			  fullname: fullname,
        // emoji: emoji,
        isYat: self.isYat, 
			  address: address,
			  payment_id: paymentID__toSave,
			  cached_OAResolved_XMR_address: cached_OAResolved_XMR_address__orUndefined
			}
      self._willSaveContactWithDescription(contactDescription)
      console.log(contactDescription);
      self.context.contactsListController.WhenBooted_AddContact(
        contactDescription,
        function (err, contact) {
          if (err) {
            __reEnableForm()
            console.error('Error while creating contact', err)
            self.validationMessageLayer.SetValidationError(err)
            return
          }
          // there's no need to re-enable the form because we're about to dismiss
          self._didSaveNewContact(contact)
        }
      )
    }
  }

  //
  //
  // Runtime - Delegation - Nav bar btn events
  //
  _saveButtonView_pressed () {
    super._saveButtonView_pressed()
    //
    const self = this
    self._tryToCreateOrSaveContact()
  }

  //
  //
  // Runtime - Delegation - Yield
  //
  _willSaveContactWithDescription (contactDescription) {
    const self = this
    // so you can modify it
  }

  _didSaveNewContact (contact) {
    const self = this
    //
    const modalParentView = self.navigationController.modalParentView
    modalParentView.DismissTopModalView(true)
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
        const possibleUriString = stringData
        self._shared_didPickPossibleRequestURIStringForAutofill(possibleUriString)
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
    let parsedPayload
    try {
      parsedPayload = monero_requestURI_utils.New_ParsedPayload_FromPossibleRequestURIString(possibleUriString, self.context.nettype, self.context.monero_utils)
    } catch (errStr) {
      if (errStr) {
        self.addressInputLayer.value = '' // decided to clear the address field to avoid confusion
        //
        self.validationMessageLayer.SetValidationError('Unable to use the result of decoding that QR code: ' + errStr)
        return
      }
    }
    const target_address = parsedPayload.address
    const payment_id_orNull = parsedPayload.payment_id && typeof parsedPayload.payment_id !== 'undefined' ? parsedPayload.payment_id : null
    self.addressInputLayer.value = target_address
    if (payment_id_orNull !== null) {
      self.paymentIDInputLayer.value = payment_id_orNull
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
      'Open QR Code',
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
}
module.exports = AddContactView
