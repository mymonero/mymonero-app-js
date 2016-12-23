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
const ContactsListCellView = require('./ContactsListCellView.web')
//
class ContactsListView extends View
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
		//
		self.layer.style.width = "100%"
		// self.layer.style.height = "100%" // we're actually going to wait til viewWillAppear is called by the nav controller to set height
		//
		self._setup_views()
		self._setup_startObserving()
		//
		// configure UI with initial state
		self.reloadData()
	}
	_setup_views()
	{
		const self = this
		self.contactCellViews = [] // initialize container
	}
	_setup_startObserving()
	{
		const self = this
		const contactsListController = self.context.contactsListController
		contactsListController.on(
			contactsListController.EventName_listUpdated(),
			function()
			{
				console.log("trampoline for _ContactsListController_EventName_listUpdated")
				self._ContactsListController_EventName_listUpdated()
			}
		)
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Contacts"
	}
	//
	//
	// Runtime - Imperatives - View Configuration
	//
	reloadData()
	{
		const self = this
		if (self.isAlreadyWaitingForContacts === true) { // because accessing contacts is async
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForContacts = true
		self.context.contactsListController.WhenBooted_Contacts(
			function(contacts)
			{
				self.isAlreadyWaitingForContacts = false // unlock
				self._configureWith_contacts(contacts)
			}
		)
	}
	_configureWith_contacts(contacts)
	{
		const self = this
		// TODO: diff these contacts with existing contacts?
		if (self.contactCellViews.length != 0) {
			// for now, just flash list:
			self.contactCellViews.forEach(
				function(view, i)
				{
					view.removeFromSuperview()
				}
			)
			self.contactCellViews = []
		}
		// now add subviews
		const context = self.context
		contacts.forEach(
			function(contact, i)
			{
				const options = {}
				const view = new ContactsListCellView(options, context)
				self.contactCellViews.push(view)
				view.ConfigureWith_contact(contact)
				self.addSubview(view)
			}
		)
	}
	//
	//
	// Runtime - Delegation - Data source
	//
	_ContactsListController_EventName_listUpdated()
	{
		const self = this
		console.log("contacts list view hears list updated")
		self.reloadData()
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		//
		if (typeof self.navigationController === 'undefined' || self.navigationController === null) {
			throw "missing self.navigationController in viewWillAppear()"
		}
		self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
	}
}
module.exports = ContactsListView
