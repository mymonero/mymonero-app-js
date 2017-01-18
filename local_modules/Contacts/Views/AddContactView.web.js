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
const ContactFormView = require('./ContactFormView.web')
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
const monero_requestingFunds_utils = require('../../monero_utils/monero_requestingFunds_utils')
const commonComponents_activityIndicators = require('../../WalletAppCommonComponents/activityIndicators.web')
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
		{
			self.numberOfRequestsToLockToDisable_submitButton = 0
		}
		super.setup()
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
		const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicator()
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
		return "New Contact"
	}
	//
	//
	// Runtime - Imperatives - Contact operation
	//
	_tryToCreateContact()
	{
		const self = this
		//
		const fullname = self.fullnameInputLayer.value
		const emoji = self.emojiInputLayer.value // TODO: when picker built
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
		//
		self.cancelAny_requestHandle_for_oaResolution() // jic
		//
		const openAliasResolver = self.context.openAliasResolver
		if (openAliasResolver.IsAddressNotMoneroAddressAndThusProbablyOAAddress(address) === false) {
		    var address__decode_result; 
			try {
				address__decode_result = monero_utils.decode_address(address)
			} catch (e) {
				self.validationMessageLayer.SetValidationError(typeof e === 'string' ? e : e.toString())
				return
			}
			const integratedAddress_paymentId = address__decode_result.intPaymentId
			const isIntegratedAddress = integratedAddress_paymentId ? true : false // would like this test to be a little more rigorous
			if (isIntegratedAddress !== true) { // not an integrated addr - normal wallet addr
				if (paymentID === "" || typeof paymentID === 'undefined') { // if no existing payment ID
					paymentID = monero_requestingFunds_utils.New_TransactionID() // generate new one for them
					self.paymentIDInputLayer.value = paymentID
				} else { // just use entered paymentID
				}
			} else { // is integrated address
				paymentID = integratedAddress_paymentId // use this one instead
				self.paymentIDInputLayer.value = paymentID
			}
			//
			_proceedTo_addContact_paymentID(paymentID)
		} else {
			{
				self.resolving_activityIndicatorLayer.style.display = "block"
				self.disable_submitButton()
			}
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
					self.enable_submitButton()
					//
					if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
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
						self.validationMessageLayer.SetValidationError(err.toString())
						return
					}
					console.log("resolved/obtained payment_id", returned__payment_id)
					self.paymentIDInputLayer.value = returned__payment_id || ""
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
			self.context.contactsListController.WhenBooted_AddContact(
				{
					fullname: fullname,
					emoji: emoji,
					address: address,
					payment_id: paymentID__toSave,
					cached_OAResolved_XMR_address: cached_OAResolved_XMR_address__orUndefined
				},
				function(err, contact)
				{
					if (err) {
						console.error("Error while creating contact", err)
						// TODO: show "validation" error here
						return
					}
					self.validationMessageLayer.ClearAndHideMessage()
					self.enable_submitButton()
					//
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
		self._tryToCreateContact()
	}
	//
	//
	// Runtime - Delegation - Yield
	//
	_didSaveNewContact(contact)
	{
		const self = this
		//
		const modalParentView = self.navigationController.modalParentView
		modalParentView.DismissTopModalView(true)
	}
}
module.exports = AddContactView