// Copyright (c) 2014-2018, MyMonero.com
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
const AddContactView = require('../../Contacts/Views/AddContactView.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
//
const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../mymonero_core_js/monero_utils/monero_requestURI_utils')
//
class AddContactFromOtherTabView extends AddContactView
{
	setup()
	{
		super.setup()
	}
	_did_setup_field_address()
	{
		super._did_setup_field_address()
		//
		// after 'resolving' indicator
		const self = this 
		self._setup_form_qrPicking_actionButtons()
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
	// Runtime - Delegation - Overrides
	//
	_didSaveNewContact(contact)
	{
		const self = this
		{
			const ContactDetailsView = require('./ContactDetailsView.web')
			const options = 
			{
				record: contact // note: options takes `record`, not `contact`
			}
			const view = new ContactDetailsView(options, self.context)
			const modalParentView = self.navigationController.modalParentView
			const underlying_navigationController = modalParentView
			underlying_navigationController.PushView(view, false) // not animated
		}
		super._didSaveNewContact(contact) // this will cause self to be dismissed!! so, last-ish
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
				const uriString = stringData
				self._shared_didPickRequestURIStringForAutofill(uriString)
			}
		)
		img.src = imageSrcValue
	}
	_shared_didPickQRCodeAtPath(absoluteFilePath)
	{
		const self = this
		self._shared_didPickQRCodeWithImageSrcValue(absoluteFilePath) // we can load the image directly like this
	}
	_shared_didPickRequestURIStringForAutofill(requestURIString)
	{
		const self = this
		//
		self.validationMessageLayer.ClearAndHideMessage()  // in case there was a parsing err etc displaying
		//
		var parsedPayload;
		try {
			parsedPayload = monero_requestURI_utils.New_ParsedPayload_FromRequestURIString(requestURIString)
		} catch (errStr) {
			if (errStr) {
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
		// {
		// 	self.set_isSubmittable_needsUpdate()
		// }
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
			function(err, uriString)
			{
				if (err) {
					self.validationMessageLayer.SetValidationError(""+err)
					return
				}
				if (uriString == null) { // err and uriString are null - treat as a cancellation
					self.validationMessageLayer.ClearAndHideMessage() // clear to resolve ambiguity in case existing error is displaying
					return
				}
				if (!uriString) { // if not explicitly null but "" or undefined…
					self.validationMessageLayer.SetValidationError("No scanned QR code content found.")
					return
				}
				self._shared_didPickRequestURIStringForAutofill(uriString)
			}
		)
	}
}
module.exports = AddContactFromOtherTabView