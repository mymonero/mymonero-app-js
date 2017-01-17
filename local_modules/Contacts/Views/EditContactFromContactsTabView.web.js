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
//
class EditContactFromContactsTabView extends ContactFormView
{
	setup()
	{
		super.setup()
		//
		const self = this
		{ // options
			self.contact = self.options.contact
			if (!self.contact) {
				throw self.constructor.name + " requires an options.contact"
			}
		}
		{ // initial view config
			self.fullnameInputLayer.value = self.contact.fullname || ""
			self.emojiInputLayer.value = self.contact.emoji || "" // TODO: when picker built
			self.addressInputLayer.value = self.contact.address || ""
			self.paymentIDInputLayer.value = self.contact.payment_id || "" // to avoid 'undefined'
		}
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
	// Runtime - Imperatives - Contact operation
	//
	_tryToSaveContact()
	{
		const self = this
		//
		const fullname = self.fullnameInputLayer.value
		const emoji = self.emojiInputLayer.value // TODO: when picker built
		const address = self.addressInputLayer.value
		const paymentID = self.paymentIDInputLayer.value
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
		self.contact.Set_valuesByKey(
			{
				fullname: fullname,
				emoji: emoji,
				address: address,
				payment_id: paymentID,
			},
			function(err)
			{
				if (err) {
					console.error("Error while saving contact", err)
					self.validationMessageLayer.SetValidationError(err.message)
					return
				}
				self.validationMessageLayer.ClearAndHideMessage()
				//
				self._didSaveContact()
			}
		)
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
		self._tryToSaveContact()
	}
	//
	//
	// Runtime - Delegation - Yield
	//
	_didSaveContact()
	{
		const self = this
		//
		const modalParentView = self.navigationController.modalParentView
		setTimeout(function()
		{ // just to make sure the PushView finished
			modalParentView.DismissTopModalView(true)
		})
	}
}
module.exports = EditContactFromContactsTabView