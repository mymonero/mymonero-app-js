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
const AddContactFromOtherTabView = require('../../Contacts/Views/AddContactFromOtherTabView.web')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web')
//
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
//
class AddContactFromSendTabView extends AddContactFromOtherTabView
{
	setup()
	{
		const self = this
		{
			self.mockedTransaction = self.options.mockedTransaction
			if (!self.mockedTransaction || typeof self.mockedTransaction === 'undefined') {
				throw self.constructor.name + " requires a self.mockedTransaction" 
			}
		}
		{
			self.enteredAddressValue = self.mockedTransaction.enteredAddressValue
			self.is_enteredAddressValue_OAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(self.enteredAddressValue)
			if (self.is_enteredAddressValue_OAAddress === false) {
				try {
					self.address__decode_result = monero_utils.decode_address(self.enteredAddressValue)
				} catch (e) {
					console.warn("Couldn't decode as a Monero address.", e)
					return // just return silently
				}
				// we don't care whether it's an integrated address or not here since we're not going to use its payment id
				self.integratedAddressPaymentId = self.address__decode_result.intPaymentId || null
				if (self.integratedAddressPaymentId) {
					self.isIntegratedAddress = true
				} else {
					self.isIntegratedAddress = false
				}
			} else {
				self.isIntegratedAddress = false
			}
			self.paymentID_valueToUse = self.isIntegratedAddress ? self.integratedAddressPaymentId : self.mockedTransaction.payment_id
		}
		super.setup()
	}
	_overridable_initial_inlineMessageString()
	{
		return "Your Monero is on its way."
	}
	_overridable_initialValue_addressLayerOptions()
	{
		const self = this
		const options = super._overridable_initialValue_addressLayerOptions()
		const enteredAddressValue = self.enteredAddressValue // i /think/ this should always be the address we save as the Contact address
		options.existingValue = enteredAddressValue
		options.isNonEditable = true // lock
		//
		return options
	}
	_overridable_initialValue_paymentIDLayerOptions()
	{
		const self = this
		const options = super._overridable_initialValue_paymentIDLayerOptions()
		const existingValue = self.paymentID_valueToUse
		options.existingValue = existingValue
		options.isNonEditable = true // lock
		if (!existingValue || typeof existingValue === 'undefined') {
			options.hidden = true // TODO
		}
		//
		return options
	}
	_overridable_shouldNotDisplayPaymentIDFieldLayer()
	{
		const self = this
		const existingValue = self.paymentID_valueToUse
		return !existingValue || typeof existingValue === 'undefined' // show (false) if we have one
	}
	_overridable_shouldNotDisplayPaymentIDNoteLayer()
	{
		// TODO: (?) check if we really /are/ going to generate a payment id for them and show ?
		return true // do not show this layer 
	}
	setup_views()
	{
		super.setup_views()
		//
		const self = this
		{
			const layer = self.form_containerLayer
			layer.style.border = "1px solid #ccc"
			layer.style.borderRadius = "4px"
			layer.style.paddingTop = "10px"
			layer.style.paddingBottom = "10px"
		}
		{ // field title label
			const titleMessageString = "SAVE THIS ADDRESS AS A CONTACT?"
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer(titleMessageString)
			labelLayer.style.color = "#9A989A"
			const toBe_siblingLayer = self.form_containerLayer
			toBe_siblingLayer.parentNode.insertBefore(labelLayer, toBe_siblingLayer)
		}
		{ // "Detected" label?
			const needsDetectedLabel = 
				self.isIntegratedAddress == true // is either an integrated addr
				|| (self.is_enteredAddressValue_OAAddress == true // or is OA addr and are going to show the field
					&& self._overridable_shouldNotDisplayPaymentIDNoteLayer() === false)
			if (needsDetectedLabel) {
				const detectedMessage = document.createElement("div")
				detectedMessage.innerHTML = '<img src="detectedCheckmark.png" />&nbsp;<span>Detected</span>'
				// ^- TODO: factor into component
				self.paymentIDField_containerLayer.appendChild(detectedMessage)
			}
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Save Contact" // user knows it as Save, here
	}
	//
	//
	// Runtime - Accessors - Overridable
	//
	_overridable_defaultFalse_canSkipEntireOAResolveAndDirectlyUseInputValues()
	{
		return true // very special case - cause we just / already resolved this info
	}
	//
	//
	// Runtime - Delegation - Overrides
	//
	_willSaveContactWithDescription(contactDescription)
	{
		const self = this
		const enteredAddressValue = self.mockedTransaction.enteredAddressValue
		const is_enteredAddressValue_OAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(enteredAddressValue)
		if (is_enteredAddressValue_OAAddress === true) {
			const resolvedAddress = self.mockedTransaction.resolvedAddress
			if (!resolvedAddress) {
				throw "resolvedAddress was nil despite is_enteredAddressValue_OAAddress"
			}
			contactDescription.cached_OAResolved_XMR_address = resolvedAddress
		}
	}
	_didSaveNewContact(contact)
	{
		const self = this
		// don't need to dismiss here cause super will do it for us
		super._didSaveNewContact(contact) // this will cause self to be dismissed!! so, last-ish
	}
}
module.exports = AddContactFromSendTabView