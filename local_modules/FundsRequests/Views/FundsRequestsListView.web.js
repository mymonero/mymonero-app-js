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
const FundsRequestsListCellView = require('./FundsRequestsListCellView.web')
const GeneratedRequestView = require('./GeneratedRequestView.web')
//
const RequestFundsView = require('./RequestFundsView.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
//
class FundsRequestsListView extends ListView
{
	constructor(options, context)
	{
		options.listController = context.fundsRequestsListController
		// ^- injecting dep so consumer of self doesn't have to
		super(options, context)
	}
	_setup_views()
	{
		super._setup_views()
		const self = this
		{ // zeroing for comparison
			self.currentlyPresented_RequestFundsView = null
		}
	}
	_setup_startObserving()
	{
		const self = this
		super._setup_startObserving()
		{ // walletAppCoordinator
			const emitter = self.context.walletAppCoordinator
			emitter.on(
				emitter.EventName_didTrigger_requestFundsFromContact(), // observe 'did' so we're guaranteed to already be on right tab
				function(contact)
				{
					self.presentRequestFundsView_withContact(contact)
				}
			)
		}
	}
	TearDown()
	{
		const self = this
		super.TearDown()
		self.teardown_currentlyPresented_RequestFundsView()
	}
	teardown_currentlyPresented_RequestFundsView()
	{
		const self = this
		if (self.currentlyPresented_RequestFundsView !== null) {
			self.currentlyPresented_RequestFundsView.TearDown() // might not be necessary but method guards itself
			self.currentlyPresented_RequestFundsView = null // must zero again and should free
		}
	}
	overridable_listCellViewClass()
	{ // override and return youir 
		return FundsRequestsListCellView
	}
	overridable_pushesDetailsViewOnCellTap()
	{
		return true
	}
	overridable_recordDetailsViewClass()
	{
		return GeneratedRequestView
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Monero Requests"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
		{ // observe
			view.layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					self.presentRequestFundsView_withoutValues()
					return false
				}
			)
		}
		return view
	}


	//
	//
	// Runtime - Imperatives - Modal view presentation
	//
	presentRequestFundsView_withoutValues()
	{
		const self = this
		self._presentRequestFundsView_withOptions()
	}
	presentRequestFundsView_withContact(contact)
	{
		const self = this
		self._presentRequestFundsView_withOptions({
			fromContact: contact
		})
	}
	_presentRequestFundsView_withOptions(options_orNilForDefault)
	{
		const self = this
		const options = options_orNilForDefault || {}
		if (typeof self.currentlyPresented_RequestFundsView === 'undefined' || !self.currentlyPresented_RequestFundsView) {
			self.navigationController.PopToRootView(false) // not animated (since we're coming from another tab)
			//
			const view = new RequestFundsView(options, self.context)
			self.currentlyPresented_RequestFundsView = view
			const navigationView = new StackAndModalNavigationView({}, self.context)
			navigationView.SetStackViews([ view ])
			self.navigationController.PresentView(navigationView, true)
			//
			return
		}
		const fromContact = options.fromContact
		if (fromContact && typeof fromContact !== 'undefined') {
			self.currentlyPresented_RequestFundsView.AtRuntime_reconfigureWith_fromContact(fromContact)
		}
	}
	//
	//
	// Runtime - Delegation - View lifecycle
	//
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		self.teardown_currentlyPresented_RequestFundsView() // we're assuming that on VDA if we have one of these it means we can tear it down
	}
}
module.exports = FundsRequestsListView