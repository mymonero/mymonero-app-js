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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
const commonComponents_actionButtons = require('../../WalletAppCommonComponents/actionButtons.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
//
class ContactDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		const self = this 
		{
			self.contact = self.options.contact
			if (typeof self.contact === 'undefined' || !self.contact) {
				throw self.constructor.name + " requires a self.options.contact"
				return
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.startObserving_contact()
	}
	setup_views()
	{
		const self = this
		const margin_h = 10
		{
			self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
			//
			self.layer.style.position = "relative" // to make sure children with position:fixed are laid out relative to parent
			self.layer.style.width = `calc(100% - ${2 * margin_h}px)`
			self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
			//
			self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
			//
			self.layer.style.color = "#c0c0c0" // temporary
			//
			self.layer.style.overflowY = "scroll"
			self.layer.style.padding = `0 ${margin_h}px 40px ${margin_h}px` // actually going to change paddingTop in self.viewWillAppear() if navigation controller
			//
			self.layer.style.wordBreak = "break-all" // to get the text to wrap
		}
		{
			const containerLayer = document.createElement("div")
			{
				containerLayer.style.border = "1px solid #888"
				containerLayer.style.borderRadius = "5px"
			}
			self.tableSection_containerLayer = containerLayer
			{
				self._setup_field_address()
				self._setup_field__cached_OAResolved_XMR_address()
				{
					containerLayer.appendChild(commonComponents_tables.New_separatorLayer())
				}
				self._setup_field_paymentID()
			}
			self.layer.appendChild(containerLayer)
		}
		{ // action buttons toolbar
			const margin_fromWindowLeft = self.context.themeController.TabBarView_thickness() + margin_h // we need this for a position:fixed, width:100% container
			const margin_fromWindowRight = margin_h
			const view = commonComponents_actionButtons.New_ActionButtonsContainerView(margin_fromWindowLeft, margin_fromWindowRight, self.context)
			self.actionButtonsContainerView = view
			{
				self._setup_actionButton_send()
				self._setup_actionButton_request()
			}
			self.addSubview(view)
		}
	}
	_setup_field_address()
	{
		const self = this
		const fieldLabelTitle = "Address"
		const value = self.contact.address
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			fieldLabelTitle, 
			value,
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.address__valueField_component = div
		self.tableSection_containerLayer.appendChild(div)
	}
	_setup_field__cached_OAResolved_XMR_address()
	{
		const self = this
		const fieldLabelTitle = "Resolved Address (XMR)"
		const value = self.contact.cached_OAResolved_XMR_address
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			fieldLabelTitle, 
			value,
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.cached_OAResolved_XMR_address__valueField_component = div
		if (typeof value === 'undefined' || !value) {
			div.style.display = "none"
		}
		self.tableSection_containerLayer.appendChild(div)
	}
	_setup_field_paymentID()
	{
		const self = this
		const fieldLabelTitle = "Payment ID"
		const value = self.contact.payment_id
		const valueToDisplayIfValueNil = "N/A"
		const div = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			fieldLabelTitle, 
			value,
			self.context.pasteboard, 
			valueToDisplayIfValueNil
		)
		self.payment_id__valueField_component = div
		self.tableSection_containerLayer.appendChild(div)
	}
	_setup_actionButton_send()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Send", 
			"send_actionButton_iconImage", 
			false,
			function(layer, e)
			{
				self.context.walletAppCoordinator.Trigger_sendFundsToContact(self.contact)
			},
			self.context
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_request()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Request", 
			"request_actionButton_iconImage", 
			true,
			function(layer, e)
			{
				self.context.walletAppCoordinator.Trigger_requestFundsFromContact(self.contact)
			},
			self.context
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	//
	startObserving_contact()
	{
		const self = this
		// info update
		self._contact_EventName_contactInfoUpdated_fn = function()
		{
			self.navigationController.SetNavigationBarTitleNeedsUpdate() // because it's derived from the contact values
			self._configureUIWith_contact(self.contact)
		}
		self.contact.on(
			self.contact.EventName_contactInfoUpdated(),
			self._contact_EventName_contactInfoUpdated_fn
		)
		// deletion
		self._contact_EventName_willBeDeleted_fn = function()
		{ // ^-- we observe /will/ instead of /did/ because if we didn't, self.navigationController races to get freed
			const current_topStackView = self.navigationController.topStackView
			const isOnTop = current_topStackView.IsEqualTo(self) == true
			if (isOnTop) {
				self.navigationController.PopView(true) // animated
			} else { // or, we're not on top, so let's just remove self from the list of views
				throw "A contact details view expected to be on top of navigatino stack when its contact was deleted."
				// which means the following line should be uncommented and the method ImmediatelyExtractStackView needs to be implemented (which will w/o animation snatch self out of the stack)
				// self.navigationController.ImmediatelyExtractStackView(self)
			}
		}
		self.contact.on(
			self.contact.EventName_willBeDeleted(),
			self._contact_EventName_willBeDeleted_fn
		)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		super.TearDown()
		const self = this
		self.stopObserving_contact()
		{
			if (typeof self.current_EditContactFromContactsTabView !== 'undefined' && self.current_EditContactFromContactsTabView) {
				self.current_EditContactFromContactsTabView.TearDown()
				self.current_EditContactFromContactsTabView = null
			}
		}
	}
	stopObserving_contact()
	{
		const self = this
		self.contact.removeListener(
			self.contact.EventName_contactInfoUpdated(),
			self._contact_EventName_contactInfoUpdated_fn
		)
		self.contact.removeListener(
			self.contact.EventName_willBeDeleted(),
			self._contact_EventName_willBeDeleted_fn
		)
	}
	
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		var title = ""
		const emoji = self.contact.emoji
		if (typeof emoji !== 'undefined' && emoji) {
			title += emoji + "&nbsp;&nbsp;&nbsp;&nbsp;" // extra spaces for emoji
		}
		title += self.contact.fullname
		//
		return title
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_EditButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{ // v--- self.navigationController because self is presented packaged in a StackNavigationView				
						const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
						const EditContactFromContactsTabView = require('./EditContactFromContactsTabView.web')
						//
						const options = 
						{
							contact: self.contact
						}
						const view = new EditContactFromContactsTabView(options, self.context)
						self.current_EditContactFromContactsTabView = view
						const navigationView = new StackAndModalNavigationView({}, self.context)
						navigationView.SetStackViews([ view ])
						self.navigationController.PresentView(navigationView, true)
					}
					return false
				}
			)
		}
		return view
	}
	
	//
	//
	// Runtime - Imperatives - Configuration
	//
	_configureUIWith_contact()
	{
		const self = this
		// TODO: diffing might be nice here
		{
			const value = self.contact.address
			const layer = self.address__valueField_component
			layer.Component_SetValue(value)
		}
		{
			const value = self.contact.cached_OAResolved_XMR_address
			const layer = self.cached_OAResolved_XMR_address__valueField_component
			if (!value || typeof value === 'undefined') {
				layer.style.display = "none"
			} else {
				layer.Component_SetValue(value)
				layer.style.display = "block"
			}
		}
		{
			const value = self.contact.payment_id
			const layer = self.payment_id__valueField_component
			layer.Component_SetValue(value)
		}
	}	
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		// teardown any child/referenced stack navigation views if necessary…
		if (typeof self.current_EditContactFromContactsTabView !== 'undefined' && self.current_EditContactFromContactsTabView) {
			self.current_EditContactFromContactsTabView.TearDown()
			self.current_EditContactFromContactsTabView = null
		}
	}
}
module.exports = ContactDetailsView