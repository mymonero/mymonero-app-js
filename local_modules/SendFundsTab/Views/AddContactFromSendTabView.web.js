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
		options.existingValue = self.mockedTransaction.target_address // TODO: we actually need to check if they used an OA addr here. if so, existingValue should not be the target address
		options.isNonEditable = true // lock
		//
		return options
	}
	_overridable_initialValue_paymentIDLayerOptions()
	{
		const self = this
		const options = super._overridable_initialValue_paymentIDLayerOptions()
		const existingValue = self.mockedTransaction.payment_id
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
		const existingValue = self.mockedTransaction.payment_id
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
	// Runtime - Delegation - Overrides
	//
	_didSaveNewContact(contact)
	{
		const self = this
		{ // all done
			const modalParentView = self.navigationController.modalParentView
			modalParentView.DismissTopModalView(true)			
		}
		super._didSaveNewContact(contact) // this will cause self to be dismissed!! so, last-ish
	}
}
module.exports = AddContactFromSendTabView