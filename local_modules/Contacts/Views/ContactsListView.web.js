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
const ListView = require('../../Lists/Views/ListView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
//
const ContactsListCellView = require('./ContactsListCellView.web')
const ContactDetailsView = require('./ContactDetailsView.web')
//
const AddContactFromContactsTabView = require('./AddContactFromContactsTabView.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
//
class ContactsListView extends ListView
{
	constructor(options, context)
	{
		options.listController = context.contactsListController
		// ^- injecting dep so consumer of self doesn't have to
		super(options, context)
	}
	overridable_listCellViewClass()
	{ // override and return youir 
		return ContactsListCellView
	}
	overridable_pushesDetailsViewOnCellTap()
	{
		return true
	}
	overridable_recordDetailsViewClass()
	{
		return ContactDetailsView
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
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
		view.layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					const view = new AddContactFromContactsTabView({}, self.context)
					const navigationView = new StackAndModalNavigationView({}, self.context)
					navigationView.SetStackViews([ view ])
					self.navigationController.PresentView(navigationView, true)
				}
				return false
			}
		)
		return view
	}
}
module.exports = ContactsListView
