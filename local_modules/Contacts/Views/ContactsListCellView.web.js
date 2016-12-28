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
const View = require('../../Views/View.web')
//
class ContactsListCellView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.setup_layers()
	}
	setup_views()
	{
		const self = this
	}
	setup_layers()
	{
		const self = this
		//
		self.layer.style.border = "1px solid #eee"
		//
		self.setup_layers_contactInfo()
	}
	setup_layers_contactInfo()
	{
		const self = this
		//
		const layer = document.createElement("div")
		//
		self.layer_contactInfo = layer
		self.layer.appendChild(layer)
	}
	//
	//
	// Internal - Teardown/Recycling
	//
	prepareForReuse()
	{
		const self = this
		self.stopObserving_contact()
		self.contact = null
	}
	stopObserving_contact()
	{
		const self = this
		if (typeof self.contact === 'undefined' || !self.contact) {
			return
		}
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.contact_EventName_contactInfoUpdated_listenerFunction) === true) {
			self.contact.removeListener(
				self.contact.EventName_contactInfoUpdated(),
				self.contact_EventName_contactInfoUpdated_listenerFunction
			)
		}
	}
	//
	//
	// Internal - Runtime - Accessors - Child elements - Metrics
	//
	//
	_idPrefix()
	{
		const self = this
		//
		return "ContactsListCellView" + "_" + self.contact._id // to make it unique as this is a list-cell
	}
	//
	//
	// Internal - Runtime - Accessors - Child elements - Delete btn
	//
	//
	idForChild_deleteContactWithIDLayer()
	{
		const self = this
		if (typeof self.contact._id === 'undefined' || !self.contact._id) {
			throw "idForChild_deleteContactWithIDLayer called but nil self.contact._id"
		}
		//
		return self._idPrefix() + "_" + "idForChild_deleteContactWithIDLayer"
	}
	new_htmlStringForChild_deleteContactWithIDLayer()
	{
		const self = this
		const htmlString = `<a id="${self.idForChild_deleteContactWithIDLayer()}" href="#">Delete Contact</a>`
		//
		return htmlString
	}
	DOMSelected_deleteContactWithIDLayer()
	{
		const self = this
		const layer = self.layer.querySelector(`a#${ self.idForChild_deleteContactWithIDLayer() }`)
		//
		return layer
	}
	//
	//
	// Interface - Runtime - Imperatives - State/UI Configuration
	//
	ConfigureWith_contact(contact)
	{
		const self = this
		if (typeof self.contact !== 'undefined') {
			self.prepareForReuse()
		}
		self.contact = contact
		self._configureUIWithContact()
		self.startObserving_contact()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	_configureUIWithContact()
	{
		const self = this
		self._configureUIWithContact__contactInfo()
	}
	_configureUIWithContact__contactInfo()
	{
		const self = this
		const contact = self.contact
		var htmlString = ''
		{
			if (contact.didFailToInitialize_flag !== true && contact.didFailToBoot_flag !== true) { // unlikely, but possible
				htmlString += `<h3>${contact.fullname}</h3>`
				htmlString += `<p>Address (XMR): ${contact.address__XMR}</p>`
				{ // buttons
					htmlString += self.new_htmlStringForChild_deleteContactWithIDLayer()
				}
			} else { // failed to initialize
				{ // header
					htmlString += 
					`<h4>Error: Couldn't open this contact.</h4>`
					+ `<p>Please report this issue to us via Support.</p>`
				}
				{ // buttons
					htmlString += self.new_htmlStringForChild_deleteContactWithIDLayer()
				}
			}
		}
		self.layer_contactInfo.innerHTML = htmlString
		{ // setup and observations
			{ // buttons
				{ // delete button
					const layer = self.DOMSelected_deleteContactWithIDLayer()
					layer.addEventListener(
						"click",
						function(e)
						{
							e.preventDefault()
							self.deleteContact()
							//
							return false
						}
					)
				}				
			}
		}
	}
	//
	//
	// Internal - Runtime - Imperatives - Contact operations
	deleteContact()
	{
		const self = this
		self.context.contactsListController.WhenBooted_DeleteContactWithId(
			self.contact._id,
			function(err)
			{
				if (err) {
					console.error("Failed to delete contact with error", err)
					alert("Failed to delete contact.")
					return
				}
				console.log("Deleted contact.")
			}
		)
	}
	//
	//
	//
	// Internal - Runtime - Imperatives - Observation
	//
	startObserving_contact()
	{
		const self = this
		if (typeof self.contact === 'undefined' || self.contact === null) {
			throw "contact undefined in start observing"
			return
		}
		// here, we're going to store a bunch of functions as instance properties
		// because if we need to stopObserving we need to have access to the listener fns
		//
		// account info updated
		self.contact_EventName_contactInfoUpdated_listenerFunction = function()
		{
			self.contact_EventName_contactInfoUpdated()
		}
		self.contact.on(
			self.contact.EventName_contactInfoUpdated(),
			self.contact_EventName_contactInfoUpdated_listenerFunction
		)
	}
	//
	//
	// Internal - Runtime - Delegation - Event handlers - Contact
	//
	contact_EventName_contactInfoUpdated()
	{
		const self = this
		self._configureUIWithContact__contactInfo()
	}
}
module.exports = ContactsListCellView
