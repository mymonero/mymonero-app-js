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
const WalletsListCellView = require('./WalletsListCellView.web')
const WalletDetailsView = require('../../Wallets/Views/WalletDetailsView.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web.js')
//
class WalletsListView extends View
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
		{ // initialization / zeroing / declarations 
			self.current_walletDetailsView = null
		}
		self._setup_views()
		self._setup_startObserving()
		//
		// configure UI with initial state
		self.reloadData()
	}
	_setup_views()
	{
		const self = this
		// 
		self.layer.style.webkitUserSelect = "none"
		//
		self.layer.style.width = "calc(100% - 20px)" // 20px for h padding
		// self.layer.style.height = "100%" // we're actually going to wait til viewWillAppear is called by the nav controller to set height
		//
		self.layer.style.backgroundColor = "#282527"
		//
		self.layer.style.color = "#c0c0c0" // temporary
		//
		self.layer.style.overflowY = "scroll"
		self.layer.style.padding = "40px 10px"
		//
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
		//
		self.walletCellViews = [] // initialize container
	}
	_setup_startObserving()
	{
		const self = this
		const walletsListController = self.context.walletsListController
		walletsListController.on(
			walletsListController.EventName_listUpdated(),
			function()
			{
				self._WalletsListController_EventName_listUpdated()
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
		if (self.current_walletDetailsView !== null) {
			self.current_walletDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_walletDetailsView = null // must zero again and should free
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Wallets"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						const informingAndVerifyingMnemonic_cb = function(mnemonicString, confirmation_cb)
						{ // simulating user correctly entering mnemonic string they needed to have written down
							confirmation_cb(mnemonicString)
						}
						const fn = function(err, walletInstance) {}
						
						// TODO: wrap this in some kind of navigation flow?
						self.context.walletsListController.WhenBooted_CreateAndAddNewlyGeneratedWallet(
							informingAndVerifyingMnemonic_cb,
							fn
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
		if (self.isAlreadyWaitingForWallets === true) { // because accessing wallets is async
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForWallets = true
		self.context.walletsListController.WhenBooted_Wallets(
			function(wallets)
			{
				self.isAlreadyWaitingForWallets = false // unlock
				self._configureWith_wallets(wallets)
			}
		)
	}
	_configureWith_wallets(wallets)
	{
		const self = this
		const context = self.context
		// TODO: diff these wallets with existing wallets?
		if (self.walletCellViews.length != 0) {
			// for now, just flash list:
			self.walletCellViews.forEach(
				function(view, i)
				{
					view.TearDown() // important so the event listeners get deregistered
					//
					view.removeFromSuperview()
				}
			)
			self.walletCellViews = []
		}
		{ // add subviews
			wallets.forEach(
				function(wallet, i)
				{
					const options = 
					{
						cell_tapped_fn: function(cellView)
						{
							self.pushWalletDetailsView(cellView.wallet)
						}
					}
					const view = new WalletsListCellView(options, context)
					self.walletCellViews.push(view)
					view.ConfigureWith_wallet(wallet)
					self.addSubview(view)
				}
			)
		}
	}
	//
	//
	// Runtime - Internal - Imperatives - Navigation/presentation
	//
	pushWalletDetailsView(wallet)
	{
		const self = this
		if (self.current_walletDetailsView !== null) {
			// Commenting this throw as we are going to use this as the official way to lock this function,
			// e.g. if the user is double-clicking on a cell to push a details view
			// throw "Asked to pushWalletDetailsView while self.current_walletDetailsView !== null"
			return
		}
		{ // check wallet
			if (typeof wallet === 'undefined' || wallet === null) {
				throw "WalletsListView requires self.wallet to pushWalletDetailsView"
				return
			}
			if (wallet.didFailToInitialize_flag === true || wallet.didFailToBoot_flag === true) { // unlikely, but possible
				console.log("Not pushing as wallet failed to init or boot.")
				return // just don't push - no need to error 
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw "WalletsListView requires navigationController to pushWalletDetailsView"
			return
		}
		{
			const options = 
			{
				wallet: wallet
			}
			const view = new WalletDetailsView(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown() (although since this is a root stackView
			// the latter ought not to happen)
			self.current_walletDetailsView = view
		}
	}
	//
	//
	// Runtime - Delegation - Data source
	//
	_WalletsListController_EventName_listUpdated()
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
		//
		if (self.current_walletDetailsView !== null) {
			self.current_walletDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
			self.current_walletDetailsView = null // must zero again and should free
		}
	}
}
module.exports = WalletsListView
