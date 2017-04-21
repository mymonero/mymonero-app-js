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
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
//
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_paymentID_utils = require('../../monero_utils/monero_paymentID_utils')
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
	_overridable_new_fieldInputLayer__address()
	{
		const self = this
		const value = self.enteredAddressValue // i /think/ this should always be the address we save as the Contact address
		const layer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar(
			value, 
			self.context
		)
		return layer
	}
	_overridable_new_fieldInputLayer__paymentID()
	{
		const self = this
		const value = self.paymentID_valueToUse
		const layer = commonComponents_forms.New_NonEditable_ValueDisplayLayer_BreakChar(
			value, 
			self.context
		) // will be hidden if necessary with _overridable_shouldNotDisplayPaymentIDFieldLayer
		return layer
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
	setup_self_layer()
	{
		super.setup_self_layer() // very important we call on super
		const self = this
		const layer = self.layer
		// now, since the contents of the AddContactFromSendTabView have that form_containerLayer with a border, we're going to add extra side padding here
		layer.style.paddingLeft = "8px"
		layer.style.paddingRight = "8px"
	}
	setup_views()
	{
		super.setup_views()
		const self = this
		{
			const layer = self.form_containerLayer
			layer.style.margin = "8px 6px"
			layer.style.boxSizing = "border-box"
			layer.style.padding = "8px 0px 16px 0px"
			layer.style.border = "0.5px solid #494749"
			layer.style.borderRadius = "5px"
			layer.style.minHeight = "84%"
		}
		{ // field title label
			const titleMessageString = "SAVE THIS ADDRESS AS A CONTACT?"
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer(titleMessageString, self.context)
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
				const detectedMessage = commonComponents_forms.New_Detected_IconAndMessageLayer(self.context)
				self.paymentIDField_containerLayer.appendChild(detectedMessage)
			}
		}
	}
	setup_validationMessageLayer()
	{
		const self = this
		super.setup_validationMessageLayer()
		const layer = self.validationMessageLayer
		if (!layer) {
			throw "!layer"
		}
		layer.style.width = "calc(100% - 12px)"
		layer.style.marginLeft = "6px"
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
	_overridable_initial_leftBarButtonTitleString_orUndefinedForDefaultCancel()
	{
		return "Don't Save" // contextual - instead of 'Cancel'
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const view = super.Navigation_New_LeftBarButtonView()
		view.layer.style.width = "85px"
		//
		return view
	}
	//
	//
	// Runtime - Delegation - Overrides
	//
	_willSaveContactWithDescription(contactDescription)
	{
		const self = this
		if (self.is_enteredAddressValue_OAAddress === true) {
			const resolvedAddress = self.mockedTransaction.resolvedAddress
			if (!resolvedAddress) {
				throw "resolvedAddress was nil despite is_enteredAddressValue_OAAddress"
			}
			contactDescription.cached_OAResolved_XMR_address = resolvedAddress
		} else { // not an integrated address
			if (self.isIntegratedAddress !== true) { // not an integrated addr - assuming a normal wallet addr
				const autogenerated__paymentID = monero_paymentID_utils.New_TransactionID() // generate new one for them
				contactDescription.payment_id = autogenerated__paymentID
				console.log("💬  Autogenerating payment id:", autogenerated__paymentID)
			}
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