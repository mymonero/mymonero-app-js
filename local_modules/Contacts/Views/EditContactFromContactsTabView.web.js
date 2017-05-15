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
const ContactFormView = require('../../Contacts/Views/ContactFormView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
//
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
const monero_paymentID_utils = require('../../monero_utils/monero_paymentID_utils')
//
class EditContactFromContactsTabView extends ContactFormView
{
	setup()
	{
		const self = this
		{ // before -setup
			self.contact = self.options.contact
			if (!self.contact) {
				throw self.constructor.name + " requires an options.contact"
			}
		}
		super.setup()
		{ // addtl UI elements
			self._setup_deleteRecordButtonLayer()
		}
		{ // initial view config
			self.fullnameInputLayer.value = self.contact.fullname || ""
			// this is commented because it is accomplished via _overridable_initial_emoji_value; may be deleted soon
			// self.emojiInputView.aLayer.value = self.emojiInputView.SetValue(self.contact.emoji || "") 
			self.addressInputLayer.value = self.contact.address || ""
			self.paymentIDInputLayer.value = self.contact.payment_id || "" // to avoid 'undefined'
		}
	}

	_overridable_initial_emoji_value()
	{
		const self = this
		const value = self.contact.emoji || ""
		return value
	}
	_setup_deleteRecordButtonLayer()
	{
		const self = this
		const view = commonComponents_tables.New_deleteRecordNamedButtonView("contact", self.context)
		const layer = view.layer
		layer.style.marginTop = "21px"
		function __proceedTo_deleteRecord()
		{
			const record_id = self.contact._id
			self.context.contactsListController.WhenBooted_DeleteRecordWithId(
				record_id,
				function(err)
				{
					if (err) {
						throw err
					}
					self._thisRecordWasDeleted()
				}
			)
		}
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (view.isEnabled === false) {
						console.warn("Delete btn not enabled")
						return false
					}
					self.context.windowDialogs.PresentQuestionAlertDialogWith(
						'Delete this contact?', 
						'Delete this contact?\n\nThis cannot be undone.',
						[ 'Delete', 'Cancel' ],
						function(err, selectedButtonIdx)
						{
							if (err) {
								throw err
							}
							const didChooseYes = selectedButtonIdx === 0
							if (didChooseYes) {
								__proceedTo_deleteRecord()
							}
						}
					)
				}
				return false
			}
		)
		self.layer.appendChild(layer)
	}
	_setup_field_address()
	{
		super._setup_field_address()
		// we're hooking into this function purely to get called just after the corresponding field layer's setup
		const self = this 
		self._setup_form_resolving_activityIndicatorLayer()
	}
	_setup_form_resolving_activityIndicatorLayer()
	{
		const self = this
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
		layer.style.display = "none" // initial state
		self.resolving_activityIndicatorLayer = layer
		self.form_containerLayer.appendChild(layer)
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Edit Contact"
	}
	//
	//
	// Runtime - Imperatives - UI
	//
	dismissView()
	{
		const self = this
		const modalParentView = self.navigationController.modalParentView
		setTimeout(function()
		{ // just to make sure the PushView is finished
			modalParentView.DismissTopModalView(true)
		})
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
		//
		const openAliasResolver = self.context.openAliasResolver
		if (openAliasResolver.IsAddressNotMoneroAddressAndThusProbablyOAAddress(address) === false) {
			var address__decode_result; 
			try {
				address__decode_result = monero_utils.decode_address(address)
			} catch (e) {
				__reEnableForm()
				self.validationMessageLayer.SetValidationError("Please enter a valid Monero address") // not using the error here cause it can be pretty unhelpful to the lay user
				return
			}
			const integratedAddress_paymentId = address__decode_result.intPaymentId
			const isIntegratedAddress = integratedAddress_paymentId ? true : false // would like this test to be a little more rigorous
			if (isIntegratedAddress !== true) { // not an integrated addr - normal wallet addr
				if (paymentID === "" || typeof paymentID === 'undefined') { // if no existing payment ID
					paymentID = monero_paymentID_utils.New_TransactionID() // generate new one for them
					self.paymentIDInputLayer.value = paymentID
				} else { // just use entered paymentID
				}
			} else { // is integrated address
				paymentID = integratedAddress_paymentId // use this one instead
				self.paymentIDInputLayer.value = paymentID
			}
			_proceedTo_saveContact_paymentID(paymentID, undefined)
		} else {
			self.resolving_activityIndicatorLayer.style.display = "block"
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
				)
				{
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
					// not going to re-enable the form yet
					//
					const payment_id__toSave = returned__payment_id || ""
					const cached_OAResolved_XMR_address = moneroReady_address
					_proceedTo_saveContact_paymentID(
						payment_id__toSave, // aka use no/zero/emptystr payment id rather than null as null will create a new
						cached_OAResolved_XMR_address // it's ok if this is undefined
					) 
				}
			)
		}
		//
		function _proceedTo_saveContact_paymentID(paymentID__toSave, cached_OAResolved_XMR_address__orUndefined)
		{
			const paymentID_exists = paymentID__toSave && typeof paymentID__toSave !== 'undefined'
			const paymentID_existsAndIsNotValid = paymentID_exists && monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(paymentID__toSave) === false
			if (paymentID_existsAndIsNotValid === true) {
				__reEnableForm()
				self.validationMessageLayer.SetValidationError("Please enter a valid payment ID.")
				return
			}
			self.contact.Set_valuesByKey(
				{
					fullname: fullname,
					emoji: emoji,
					address: address,
					cached_OAResolved_XMR_address: cached_OAResolved_XMR_address__orUndefined,
					payment_id: paymentID__toSave,
				},
				function(err)
				{
					if (err) {
						__reEnableForm()
						console.error("Error while saving contact", err)
						self.validationMessageLayer.SetValidationError(err.message)
						return
					}
					//
					// still not going to re-enable form because now that we've succeeded, we will just dismiss		
					//
					self._didSaveContact()
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
	// Runtime - Delegation - Deletion -> navigation handling
	//
	_thisRecordWasDeleted()
	{
		const self = this
		self.dismissView()
	}
	//
	//
	// Runtime - Delegation - Yield
	//
	_didSaveContact()
	{
		const self = this
		self.dismissView()
	}
}
module.exports = EditContactFromContactsTabView