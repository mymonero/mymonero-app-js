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
const ContactDetailsView = require('./ContactDetailsView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web.js')
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
		{
			self.current_contactDetailsView = null // zeroing for comparison
		}
		self.layer.style.width = "100%"
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
		//
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
				self._ContactsListController_EventName_listUpdated()
			}
		)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		//
		if (self.current_contactDetailsView !== null) {
			self.current_contactDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_contactDetailsView = null // must zero again and should free
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Contacts"
	}
	Navigation_New_RightBarButtonView()
	{ // TODO: use single factory fn, probably in WalletAppCommonComponents, for this + button
		// same for other btns like the back btn etc. (how to extract back btn style from StackNavBarView domain?)
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
		{ // observe
			view.layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						// TODO: modally present view in tab (ModalView + TabModalView) instead of in stack
						// for now, just pushing
						
						const options = {}
						const CreateContactView = require('./CreateContactView.web')
						const view = new CreateContactView(options, self.context)
						self.navigationController.PresentView(
							view,
							true
						)
					}
					return false
				}
			)
		}
		return view
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
		{
			if (typeof self.cellsContainerView !== 'undefined' && self.cellsContainerView) {
				self.cellsContainerView.removeFromSuperview()
				self.cellsContainerView = null
			}
			if (self.contactCellViews.length !== 0) {
				// for now, just flash list:
				self.contactCellViews.forEach(
					function(view, i)
					{
						view.removeFromSuperview()
					}
				)
				self.contactCellViews = []
			}
		}
		{
			const view = new View({}, self.context)
			{
				view.layer.style.borderRadius = "5px"
				view.layer.style.backgroundColor = "#999"
				view.layer.style.border = "1px outset #ccc"
			}
			self.cellsContainerView = view
			self.addSubview(self.cellsContainerView)
		}
		{ // now add cells
			const context = self.context
			contacts.forEach(
				function(contact, i)
				{
					const options = 
					{
						cell_tapped_fn: function(cellView)
						{
							self.pushContactDetailsView(cellView.contact)
						}
					}
					const view = new ContactsListCellView(options, context)
					self.contactCellViews.push(view)
					view.ConfigureWith_contact(contact)
					self.cellsContainerView.addSubview(view)
				}
			)
		}
	}
	//
	//
	// Runtime - Internal - Imperatives - Navigation/presentation
	//
	pushContactDetailsView(contact)
	{
		const self = this
		if (self.current_contactDetailsView !== null) {
			// Commenting this throw as we are going to use this as the official way to lock this function,
			// e.g. if the user is double-clicking on a cell to push a details view
			// throw "Asked to pushFundsRequestDetailsView while self.current_contactDetailsView !== null"
			return
		}
		{ // check fundsRequest
			if (typeof contact === 'undefined' || contact === null) {
				throw self.constructor.name + " requires contact to pushFundsRequestDetailsView"
				return
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to pushFundsRequestDetailsView"
			return
		}
		{
			const options = 
			{
				contact: contact
			}
			const view = new ContactDetailsView(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown() (although since this is a root stackView
			// the latter ought not to happen)
			self.current_contactDetailsView = view
		}
	}
	//
	//
	// Runtime - Delegation - Data source
	//
	_ContactsListController_EventName_listUpdated()
	{
		const self = this
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
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		//
		if (self.current_contactDetailsView !== null) {
			self.current_contactDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_contactDetailsView = null // must zero again and should free
		}
	}
}
module.exports = ContactsListView
