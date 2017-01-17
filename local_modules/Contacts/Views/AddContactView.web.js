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
//
class AddContactView extends ContactFormView
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
	}
	setup()
	{
		super.setup()
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
		var paymentID_orNullForNew;
		if (paymentID === "" || typeof paymentID === 'undefined') {
			paymentID_orNullForNew = null // so we conform to WhenBooted_AddContact interface to get a paymentID generated for us
		} else {
			paymentID_orNullForNew = paymentID
		}
		self.context.contactsListController.WhenBooted_AddContact(
			fullname,
			emoji,
			address,
			paymentID_orNullForNew,
			function(err, contact)
			{
				if (err) {
					console.error("Error while creating contact", err)
					// TODO: show "validation" error here
					return
				}
				self.validationMessageLayer.ClearAndHideMessage()
				//
				self._didSaveNewContact(contact)
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