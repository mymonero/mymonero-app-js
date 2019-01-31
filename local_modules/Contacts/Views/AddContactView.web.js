// Copyright (c) 2014-2019, MyMonero.com
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
const ContactFormView = require('./ContactFormView.web')
const monero_paymentID_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_paymentID_utils')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
//
const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')
//
//
class AddContactView extends ContactFormView
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
	}
	setup()
	{
		const self = this
		super.setup()
	}
	_did_setup_field_address()
	{
		super._did_setup_field_address()
		// we're hooking into this function purely to get called just after the corresponding field layer's setup
		const self = this 
		self._setup_form_resolving_activityIndicatorLayer()
		if (self._overridable_defaultTrue_wantsQRPickingActionButtons()) {
			self._setup_form_qrPicking_actionButtons() // after 'resolving' indicator
		}
	}
	_setup_form_resolving_activityIndicatorLayer()
	{
		const self = this
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
		layer.style.display = "none" // initial state
		self.resolving_activityIndicatorLayer = layer
		self.form_containerLayer.appendChild(layer)
	}

	_setup_form_qrPicking_actionButtons()
	{
		const self = this
		const margin_h = 24
		var view = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
			margin_h, 
			margin_h, 
			15,
			self.context
		)
		self.actionButtonsContainerView = view
		{
			if (self.context.Cordova_isMobile === true /* but not context.isMobile */) { // til we have Electron support
				self._setup_actionButton_useCamera()
			}
			self._setup_actionButton_chooseFile()
		}
		self.form_containerLayer.appendChild(view.layer)
	}
	_setup_actionButton_useCamera()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Use Camera", 
			// borrowing this asset til these are factored
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"SendFundsTab/Resources/actionButton_iconImage__useCamera@3x.png", 
			false,
			function(layer, e)
			{
				self.__didSelect_actionButton_useCamera()
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
			// borrowing this asset til these are factored
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"SendFundsTab/Resources/actionButton_iconImage__chooseFile@3x.png", 
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
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "New Contact"
	}
	//
	//
	// Runtime - Accessors - Overridable
	//
	_overridable_defaultFalse_canSkipEntireOAResolveAndDirectlyUseInputValues()
	{
		return false
	}
	_overridable_defaultTrue_wantsQRPickingActionButtons()
	{
		return true
	}
	//
	//
	// Runtime - Imperatives - Contact operation
	//
	_tryToCreateOrSaveContact()
	{
		const self = this
		//
		const fullname = self.fullnameInputLayer.value
		const emoji = self.emojiInputView.Value()
		const address = self.addressInputLayer.value
		var paymentID = self.paymentIDInputLayer.value
		//
		if (typeof fullname === 'undefined' || !fullname) {
			self.validationMessageLayer.SetValidationError("Please enter a name for this contact.")
			return
		}
		if (typeof emoji === 'undefined' || !emoji) {
			self.validationMessageLayer.SetValidationError("Please select an emoji for this contact.")
			return
		}
		if (typeof address === 'undefined' || !address) {
			self.validationMessageLayer.SetValidationError("Please enter an address for this contact.")
			return
		}
		if (typeof paymentID !== 'undefined' && paymentID) {
			if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
				self.validationMessageLayer.SetValidationError("Payment IDs cannot be used with subaddresses.")
				return
			}
		}
		//		
		const canSkipEntireOAResolveAndDirectlyUseInputValues = self._overridable_defaultFalse_canSkipEntireOAResolveAndDirectlyUseInputValues()
		if (canSkipEntireOAResolveAndDirectlyUseInputValues === true) { // not the typical case
			console.log("💬  Skipping OA resolve on AddContact.")
			_proceedTo_addContact_paymentID(
				paymentID, // can apparently use the exact field value
				undefined // NOTE: This, cached_OAResolved_XMR_address, can be supplied by subclass._willSaveContactWithDescription
			) 
			return
		}
		//
		function __disableForm()
		{
			// TODO: disable / re-enable form elements plus cancel button as well (for Cordova slowness)
			self.disable_submitButton()
		}
		function __reEnableForm()
		{
			self.enable_submitButton()
		}
		self.validationMessageLayer.ClearAndHideMessage()
		__disableForm()
		//
		self.cancelAny_requestHandle_for_oaResolution() // jic
		const openAliasResolver = self.context.openAliasResolver
		if (openAliasResolver.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address) === false) {
			var address__decode_result; 
			try {
				address__decode_result = self.context.monero_utils.decode_address(address, self.context.nettype)
			} catch (e) {
				__reEnableForm()
				self.validationMessageLayer.SetValidationError("Please enter a valid Monero address") // not using the error here cause it can be pretty unhelpful to the lay user
				return
			}
			const integratedAddress_paymentId = address__decode_result.intPaymentId
			const isIntegratedAddress = integratedAddress_paymentId ? true : false // would like this test to be a little more rigorous
			if (isIntegratedAddress) { // is integrated address
				paymentID = integratedAddress_paymentId // use this one instead
				self.paymentIDInputLayer.value = paymentID
			} else { // not an integrated addr - normal wallet addr or subaddress
				if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
					paymentID = undefined
					self.paymentIDInputLayer.value = ""
				} else { // normal wallet address
					if (paymentID === "" || typeof paymentID === 'undefined') { // if no existing payment ID
						paymentID = self.context.monero_utils.new_payment_id() // generate new one for them
						self.paymentIDInputLayer.value = paymentID
					} else { // just use/allow entered paymentID
					}
				}
			}
			//
			_proceedTo_addContact_paymentID(paymentID)
		} else {
			self.resolving_activityIndicatorLayer.style.display = "block" // AFTER any cancelAny_requestHandle…
			//
			self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
				address,
				function(
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
					self.resolving_activityIndicatorLayer.style.display = "none"
					//
					if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
						__reEnableForm()
						console.warn("⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.")
						return
					}
					self.requestHandle_for_oaResolution = null
					//
					if (address !== addressWhichWasPassedIn) {
						console.warn("⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected address. Bailing")
						return
					}
					if (err) {
						__reEnableForm()
						self.validationMessageLayer.SetValidationError(err.toString())
						return
					}
					self.paymentIDInputLayer.value = returned__payment_id || ""
					//
					// still not going to re-enable the button (although on non-Cordova it wouldn't matter)
					//
					const payment_id__toSave = returned__payment_id || ""
					const cached_OAResolved_XMR_address = moneroReady_address
					_proceedTo_addContact_paymentID(
						payment_id__toSave, // aka use no/zero/emptystr payment id rather than null as null will create a new
						cached_OAResolved_XMR_address // it's ok if this is undefined
					) 
				}
			)
		}
		//
		function _proceedTo_addContact_paymentID(paymentID__toSave, cached_OAResolved_XMR_address__orUndefined)
		{
			const paymentID_exists = paymentID__toSave && typeof paymentID__toSave !== 'undefined'
			const paymentID_existsAndIsNotValid = paymentID_exists && monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(paymentID__toSave) === false
			if (paymentID_existsAndIsNotValid === true) {
				__reEnableForm()
				self.validationMessageLayer.SetValidationError("Please enter a valid payment ID.")
				return
			}
			const contactDescription = 
			{
				fullname: fullname,
				emoji: emoji,
				address: address,
				payment_id: paymentID__toSave,
				cached_OAResolved_XMR_address: cached_OAResolved_XMR_address__orUndefined
			}
			self._willSaveContactWithDescription(contactDescription)
			self.context.contactsListController.WhenBooted_AddContact(
				contactDescription,
				function(err, contact)
				{
					if (err) {
						__reEnableForm()
						console.error("Error while creating contact", err)
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
	_saveButtonView_pressed()
	{
		super._saveButtonView_pressed()
		//
		const self = this
		self._tryToCreateOrSaveContact()
	}
	//
	//
	// Runtime - Delegation - Yield
	//
	_willSaveContactWithDescription(contactDescription)
	{
		const self = this
		// so you can modify it		
	}
	_didSaveNewContact(contact)
	{
		const self = this
		//
		const modalParentView = self.navigationController.modalParentView
		modalParentView.DismissTopModalView(true)
	}
	//
	//
	// Runtime - Delegation - Request URI string picking - Parsing / consuming / yielding
	//	
	_shared_didPickQRCodeWithImageSrcValue(imageSrcValue)
	{
		const self = this
		if (self.isFormDisabled === true) {
			console.warn("Disallowing QR code pick form disabled.")
			return
		}
		self.validationMessageLayer.ClearAndHideMessage()  // in case there was a parsing err etc displaying
		//
		const width = 256
		const height = 256
		//
		const canvas = document.createElement("canvas")
		const context = canvas.getContext("2d")
		canvas.width = width
		canvas.height = height
		//
		const img = new Image()
		img.addEventListener(
			"load",
			function()
			{
				context.drawImage(img, 0, 0, width, height)
				const imageData = context.getImageData(0, 0, width, height)
				//
				const code = jsQR(imageData.data, imageData.width, imageData.height)
				if (!code || !code.location) {
					self.validationMessageLayer.SetValidationError("MyMonero was unable to find a QR code in that image.")
					return
				}
				const stringData = code.data
				if (!stringData) {
					self.validationMessageLayer.SetValidationError("MyMonero was unable to decode a QR code from that image.")
					return
				}
				if (typeof stringData !== 'string') {
					self.validationMessageLayer.SetValidationError("MyMonero was able to decode QR code but got unrecognized result.")
					return
				}
				const possibleUriString = stringData
				self._shared_didPickPossibleRequestURIStringForAutofill(possibleUriString)
			}
		)
		img.src = imageSrcValue
	}
	_shared_didPickQRCodeAtPath(absoluteFilePath)
	{
		const self = this
		self._shared_didPickQRCodeWithImageSrcValue(absoluteFilePath) // we can load the image directly like this
	}
	_shared_didPickPossibleRequestURIStringForAutofill(possibleUriString)
	{
		const self = this
		//
		self.validationMessageLayer.ClearAndHideMessage()  // in case there was a parsing err etc displaying
		//
		var parsedPayload;
		try {
			parsedPayload = monero_requestURI_utils.New_ParsedPayload_FromPossibleRequestURIString(possibleUriString, self.context.nettype, self.context.monero_utils)
		} catch (errStr) {
			if (errStr) {
				self.addressInputLayer.value = "" // decided to clear the address field to avoid confusion
				//
				self.validationMessageLayer.SetValidationError("Unable to use the result of decoding that QR code: " + errStr)
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
	__didSelect_actionButton_chooseFile()
	{
		const self = this
		self.context.userIdleInWindowController.TemporarilyDisable_userIdle() // TODO: this is actually probably a bad idea - remove this and ensure that file picker canceled on app teardown
		if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
			self.context.Cordova_disallowLockDownOnAppPause += 1 // place lock so Android app doesn't tear down UI and mess up flow
		}
		// ^ so we don't get torn down while dialog open
		self.context.filesystemUI.PresentDialogToOpenOneImageFile(
			"Open QR Code",
			function(err, absoluteFilePath)
			{
				self.context.userIdleInWindowController.ReEnable_userIdle()					
				if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
					self.context.Cordova_disallowLockDownOnAppPause -= 1 // remove lock
				}
				//
				if (err) {
					self.validationMessageLayer.SetValidationError(err.toString() || "Error while picking QR code from file.")
					return
				}
				if (absoluteFilePath === null || absoluteFilePath === "" || typeof absoluteFilePath === 'undefined') {
					self.validationMessageLayer.ClearAndHideMessage() // clear to resolve ambiguity in case existing error is displaying
					return // nothing picked / canceled
				}
				self._shared_didPickQRCodeAtPath(absoluteFilePath)
			}
		)
	}
	__didSelect_actionButton_useCamera()
	{
		const self = this
		// Cordova_disallowLockDownOnAppPause is handled within qrScanningUI
		self.context.qrScanningUI.PresentUIToScanOneQRCodeString(
			function(err, possibleUriString)
			{
				if (err) {
					self.validationMessageLayer.SetValidationError(""+err)
					return
				}
				if (possibleUriString == null) { // err and possibleUriString are null - treat as a cancellation
					self.validationMessageLayer.ClearAndHideMessage() // clear to resolve ambiguity in case existing error is displaying
					return
				}
				if (!possibleUriString) { // if not explicitly null but "" or undefined…
					self.validationMessageLayer.SetValidationError("No scanned QR code content found.")
					return
				}
				self._shared_didPickPossibleRequestURIStringForAutofill(possibleUriString)
			}
		)
	}
}
module.exports = AddContactView