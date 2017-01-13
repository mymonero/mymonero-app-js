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
const GeneratedRequestView = require('./GeneratedRequestView.web')
const FundsRequestsListCellView = require('./FundsRequestsListCellView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const RequestFundsView = require('./RequestFundsView.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
//
class FundsRequestsListView extends View
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
		self._setup_views()
		self._setup_startObserving()
		//
		// configure UI with initial state
		self.reloadData()
	}
	_setup_views()
	{
		const self = this
		{
			self.current_generatedRequestView = null // zeroing for comparison
			self.fundsRequestCellViews = [] // initialize container
		}
		{ // styles
			self.layer.style.webkitUserSelect = "none"
			//
			self.padding_top = 20
			self.padding_bottom = 40
			//
			self.layer.style.width = "calc(100% - 20px)" // 20px for h padding
			self.layer.style.height = `calc(100% - ${self.padding_top}px - ${self.padding_bottom}px)` // in viewWillAppear we query the nav controller bar height to re-set self height
			//
			self.layer.style.backgroundColor = "#282527"
			//
			self.layer.style.color = "#c0c0c0" // temporary
			//
			self.layer.style.overflowY = "scroll"
			self.layer.style.padding = `${self.padding_top}px 10px ${self.padding_bottom}px 10px`
			//
			self.layer.style.wordBreak = "break-all" // to get the text to wrap
		}
	}
	_setup_startObserving()
	{
		const self = this
		{
			const emitter = self.context.fundsRequestsListController
			emitter.on(
				emitter.EventName_listUpdated(),
				function()
				{
					self._FundsRequestsListController_EventName_listUpdated()
				}
			)
		}
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
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		//
		if (self.current_generatedRequestView !== null) {
			self.current_generatedRequestView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_generatedRequestView = null // must zero again and should free
		}
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
	// Runtime - Imperatives - View Configuration
	//
	reloadData()
	{
		const self = this
		if (self.isAlreadyWaitingForFundsRequests === true) { // because accessing fundsRequests is async
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForFundsRequests = true
		self.context.fundsRequestsListController.WhenBooted_FundsRequests(
			function(fundsRequests)
			{
				self.isAlreadyWaitingForFundsRequests = false // unlock
				{ // before proceeding, just sorting the records by date created
					fundsRequests = fundsRequests.sort(function(a, b)
					{
						return b.dateCreated - a.dateCreated
					})
				}
				self._configureWith_fundsRequests(fundsRequests)
			}
		)
	}
	_configureWith_fundsRequests(fundsRequests)
	{
		const self = this
		// TODO: diff these fundsRequests with existing fundsRequests?
		if (self.fundsRequestCellViews.length != 0) {
			// for now, just flash list:
			self.fundsRequestCellViews.forEach(
				function(view, i)
				{
					view.removeFromSuperview()
				}
			)
			self.fundsRequestCellViews = []
		}
		// now add subviews
		const context = self.context
		fundsRequests.forEach(
			function(fundsRequest, i)
			{
				const options = 
				{
					cell_tapped_fn: function(cellView)
					{
						self.pushFundsRequestDetailsView(cellView.fundsRequest)
					}
				}
				const view = new FundsRequestsListCellView(options, context)
				self.fundsRequestCellViews.push(view)
				view.ConfigureWith_fundsRequest(fundsRequest)
				self.addSubview(view)
			}
		)
	}
	//
	//
	// Runtime - Internal - Imperatives - Navigation/presentation
	//
	pushFundsRequestDetailsView(fundsRequest)
	{
		const self = this
		if (self.current_generatedRequestView !== null) {
			// Commenting this throw as we are going to use this as the official way to lock this function,
			// e.g. if the user is double-clicking on a cell to push a details view
			// throw "Asked to pushFundsRequestDetailsView while self.current_generatedRequestView !== null"
			return
		}
		{ // check fundsRequest
			if (typeof fundsRequest === 'undefined' || fundsRequest === null) {
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
				fundsRequest: fundsRequest
			}
			const view = new GeneratedRequestView(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown() (although since this is a root stackView
			// the latter ought not to happen)
			self.current_generatedRequestView = view
		}
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
		const view = new RequestFundsView(options, self.context)
		const navigationView = new StackAndModalNavigationView({}, self.context)
		navigationView.SetStackViews([ view ])
		self.navigationController.PresentView(navigationView, true)
	}
	//
	//
	// Runtime - Delegation - Data source
	//
	_FundsRequestsListController_EventName_listUpdated()
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
		self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight() + self.padding_top}px`
		self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight() + self.padding_top + self.padding_bottom}px)`
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		//
		if (self.current_generatedRequestView !== null) {
			self.current_generatedRequestView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_generatedRequestView = null // must zero again and should free
		}
	}
}
module.exports = FundsRequestsListView
