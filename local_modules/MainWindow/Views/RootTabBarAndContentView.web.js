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
const LeftSideTabBarAndContentView = require('../../TabBarView/LeftSideTabBarAndContentView.web')
//
class RootTabBarAndContentView extends LeftSideTabBarAndContentView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{ // ^ called automatically by super, so
		const self = this
		super.setup() // must call this
		self._setup_views()
		self._setup_startObserving()
	}
	_setup_views()
	{
		const self = this
		const context = self.context
		{
			const layer = self.layer
			layer.style.background = "red"
		}
		{
			const layer = self.tabBarView.layer
			layer.style.background = "#171416"
			layer.style.borderRight = "1px solid black"
			layer.style.paddingTop = "44px" // since we're setting a padding top, we have to offset it in the height or cause a root view scroll
			layer.style.height = "calc(100% - 44px)"
		}
		{
			const layer = self.contentAreaView.layer
			layer.style.background = "#282527"
		}
		{ // add tab bar content views
			{ // walletsListView
				const options = {}
				const WalletsTabContentView = require('../../WalletsList/Views/WalletsTabContentView.web')
				const view = new WalletsTabContentView(options, context)
				self.walletsTabContentView = view
			}
			{ // sendTabContentView
				const options = {}
				const SendTabContentView = require('../../SendFundsTab/Views/SendTabContentView.web')
				const view = new SendTabContentView(options, context)
				self.sendTabContentView = view
			}
			{ // requestTabContentView
				const options = {}
				const RequestTabContentView = require('../../FundsRequests/Views/RequestTabContentView.web')
				const view = new RequestTabContentView(options, context)
				self.requestTabContentView = view
			}
			{ // contactsListView
				const options = {}
				const ContactsTabContentView = require('../../Contacts/Views/ContactsTabContentView.web')
				const view = new ContactsTabContentView(options, context)
				self.contactsTabContentView = view
			}
			self.SetTabBarContentViews(
				[
					self.walletsTabContentView,
					self.sendTabContentView,
					self.requestTabContentView,
					self.contactsTabContentView
				]
			)
		}
		{ // add Settings button
			
		}
	}
	_setup_startObserving()
	{
		const self = this
		{ // passwordController
			const emitter = self.context.passwordController
			emitter.on(
				emitter.EventName_userBecameIdle_didDeconstructBootedStateAndClearPassword(),
				function()
				{ // stuff like popping stack nav views to root views
					self.ResetAllTabContentViewsToRootState(false) // not animated
				}
			)
		}
		{ // walletAppCoordinator
			const emitter = self.context.walletAppCoordinator
			emitter.on(
				emitter.EventName_willTrigger_sendFundsToContact(),
				function()
				{
					self.selectTab_sendFunds()
				}
			)
			emitter.on(
				emitter.EventName_willTrigger_requestFundsFromContact(),
				function()
				{
					self.selectTab_requestFunds()
				}
			)
		}
		{ // drag and drop - stuff like tab auto-selection
			self.layer.ondragenter = function(e)
			{
				const password = self.context.passwordController.password
				if (typeof password !== 'undefined' && password !== null) {
					self.selectTab_sendFunds()
					//
					self.sendTabContentView.PopToRootView(true) // in case they're not on root (debated making this not animated)
					self.sendTabContentView.DismissModalViewsToView(null, true) // null -> to top stack view
				} else { // 
				}
	            return true // let it bubble
			}
		}
	}
	//
	//
	// Accessors - UI - Metrics - Overridable
	//
	overridable_tabBarView_thickness()
	{
		const self = this
		//
		return self.context.themeController.TabBarView_thickness()
	}
	//
	//
	// Runtime - Imperatives - Tab selection
	//
	selectTab_sendFunds()
	{
		const self = this
		const tabBarContentView = self.sendTabContentView
		const index = self.IndexOfTabBarContentView(tabBarContentView)
		self.SelectTabBarItemAtIndex(index)
	}
	selectTab_requestFunds()
	{
		const self = this
		const tabBarContentView = self.requestTabContentView
		const index = self.IndexOfTabBarContentView(tabBarContentView)
		self.SelectTabBarItemAtIndex(index)
	}
}
module.exports = RootTabBarAndContentView
