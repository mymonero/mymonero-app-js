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
const TabBarAndContentView = require('../../TabBarView/TabBarAndContentView.web')
//
class RootTabBarAndContentView extends TabBarAndContentView
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
			const layer = self.tabBarView.layer
			layer.style.background = "#171416"
		}
		{
			const layer = self.contentAreaView.layer
			layer.style.background = "#272527"
		}
		if (self.overridable_isHorizontalBar() === false) {
			// To support left-side layout:
			const tabBarView_thickness = self.overridable_tabBarView_thickness()
			{
				const layer = self.tabBarView.layer
				layer.style.position = "absolute"
				layer.style.borderRight = "1px solid black"
				layer.style.top = "0px"
				layer.style.left = "0px"
				layer.style.width = `${tabBarView_thickness}px`
				const padding_top = 56
				layer.style.paddingTop = padding_top + "px" // since we're setting a padding top, we have to offset it in the height or cause a root view scroll
				layer.style.height = "calc(100% - " + padding_top + "px)"
			}
			{
				const layer = self.contentAreaView.layer
				layer.style.position = "absolute"
				layer.style.top = "0px"
				layer.style.left = `${tabBarView_thickness}px`
				layer.style.width = `calc(100% - ${tabBarView_thickness}px)`
				layer.style.height = "100%"
			}
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
				const RequestTabContentView = require('../../RequestFunds/Views/RequestTabContentView.web')
				const view = new RequestTabContentView(options, context)
				self.requestTabContentView = view
			}
			{ // contactsListView
				const options = {}
				const ContactsTabContentView = require('../../Contacts/Views/ContactsTabContentView.web')
				const view = new ContactsTabContentView(options, context)
				self.contactsTabContentView = view
			}
			{ // SettingsView
				const SettingsTabContentView = require('../../Settings/Views/SettingsTabContentView.web')
				const view = new SettingsTabContentView({}, context)
				self.settingsTabContentView = view
			}
			self.SetTabBarContentViews(
				[
					self.walletsTabContentView,
					self.sendTabContentView,
					self.requestTabContentView,
					self.contactsTabContentView,
					self.settingsTabContentView
				]
			)
		}
		function __passwordController_didBoot()
		{
			self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders()
		}
		const passwordController = self.context.passwordController
		if (passwordController.hasBooted == true) {
			__passwordController_didBoot()
		} else {
			self.DisableTabBarItemButtons(true) // true: force-disable all while booting
			passwordController._executeWhenBooted(__passwordController_didBoot)
		}
	}
	_setup_startObserving()
	{
		const self = this
		{ // menuController
			const emitter = self.context.menuController
			emitter.on( // on the main process -- so this will be synchronous IPC
				emitter.EventName_menuItemSelected_Preferences(),
				function()
				{
					self.selectTab_settings()
				}
			)
		}
		{ // passwordController
			const emitter = self.context.passwordController
			emitter.on(
				emitter.EventName_didDeconstructBootedStateAndClearPassword(),
				function()
				{ // stuff like popping stack nav views to root views
					self.ResetAllTabContentViewsToRootState(false) // not animated
				}
			)
			emitter.on(
				emitter.EventName_havingDeletedEverything_didDeconstructBootedStateAndClearPassword(),
				function()
				{
					self.selectTab_wallets() // in case it was triggered by settings - if we didn't
					// select this tab it would look like nothing happened cause the 'enter pw' modal would not be popped as there would be nothing for the list controllers to decrypt
					self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders() // disable some until we have booted again
				}
			)
		}
		{ // walletsListController
			const emitter = self.context.walletsListController
			emitter.on(
				emitter.EventName_listUpdated(),
				function()
				{ // if there are 0 wallets we don't want certain buttons to be enabled
					self.SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders()
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
		{ // urlOpeningController
			const controller = self.context.urlOpeningController
			controller.on(
				controller.EventName_ReceivedURLToOpen_FundsRequest(),
				function(url)
				{
					if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
						console.log("User hasn't entered valid pw yet")
						return false
					}
					if (self.context.passwordController.IsUserChangingPassword() === true) {
						console.log("User is changing pw.")
						return false
					}
					if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
						console.log("No wallets.")
						return false
					}
					self.selectTab_sendFunds()
				}
			)
		}
		{ // drag and drop - stuff like tab auto-selection
			function _isAllowedToPerformDropOps()
			{
				if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
					console.log("User hasn't entered valid pw yet")
					return false
				}
				if (self.context.passwordController.IsUserChangingPassword() === true) {
					console.log("User is changing pw.")
					return false
				}
				if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
					console.log("No wallets.")
					return false
				}
				return true
			}
			self.layer.ondragover = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				return false
			}
			var numberOfDragsActive = 0 // we need to keep a counter because dragleave is called for children
			self.layer.ondragenter = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				numberOfDragsActive++
				//
				if (numberOfDragsActive == 1) { // first time since started drag that entered self.layer - becomes 0 on real dragleave
					if (_isAllowedToPerformDropOps()) {
						const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
						if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
							// NOTE: we are not currently able to call self.selectTab_sendFunds below, because it causes
							// some sort of issue where, I'm guessing, when the current tab view is removed, it doesn't
							// fire its corresponding dragleave event, which means we never end up being able to disable
							// the drag drop zone cause we never receive the final numberOfDragsActive=0 dragleave. For that
							// reason we're only allowing a drag op to start when we're already on the Send tab
							// We might be able to solve this somehow but it didn't seem important enough in early stages -PS on 1/27/17
							//
							setTimeout(
								function()
								{ // we must not manipulate the DOM in dragenter/start because that causes dragleave to fire immediately in Chrome.
									// self.selectTab_sendFunds()
									self.sendTabContentView._proxied_ondragenter(e)
								}
							)
						}
					} else { // 
					}
				}
			}
			self.layer.ondragleave = self.layer.ondragend = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				
				numberOfDragsActive--
				//
				if (numberOfDragsActive == 0) { // back to 0 - actually left self.layer
					const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
					if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
						self.sendTabContentView._proxied_ondragleave(e)
					}
				}
				return false
			}
			self.layer.ondrop = function(e)
			{
				e.preventDefault()
				e.stopPropagation()
				numberOfDragsActive = 0 // reset just in case ondragleave wasn't properly fired due to some DOM manipulation or on drop. can happen.
				const indexOf_sendTabContentView = self.IndexOfTabBarContentView(self.sendTabContentView)
				if (indexOf_sendTabContentView === self._currentlySelectedTabBarItemIndex) {
					self.sendTabContentView._proxied_ondrop(e)
				}
				return false
			}
		}
	}
	//
	//
	// Accessors - UI - Metrics - Overridable
	//
		//
	// Overrides
	overridable_isHorizontalBar()
	{
		const self = this
		//
		return self.context.themeController.TabBarView_isHorizontalBar()
	}
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
	_selectTab_withContentView(tabBarContentView)
	{
		const self = this
		const index = self.IndexOfTabBarContentView(tabBarContentView)
		self.SelectTabBarItemAtIndex(index)
	}
	selectTab_wallets()
	{
		const self = this
		self._selectTab_withContentView(self.walletsTabContentView)
	}
	selectTab_sendFunds()
	{
		const self = this
		self._selectTab_withContentView(self.sendTabContentView)
	}
	selectTab_requestFunds()
	{
		const self = this
		self._selectTab_withContentView(self.requestTabContentView)
	}
	//
	selectTab_settings()
	{
		const self = this
		self._selectTab_withContentView(self.settingsTabContentView)
	}
}
module.exports = RootTabBarAndContentView
