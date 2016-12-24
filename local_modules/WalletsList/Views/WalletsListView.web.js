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
		//
		self.layer.style.width = "calc(100% - 20px)"
		// self.layer.style.height = "100%" // we're actually going to wait til viewWillAppear is called by the nav controller to set height
		//
		self.layer.style.color = "#c0c0c0" // temporary
		//
		self.layer.style.overflowY = "scroll"
		self.layer.style.padding = "40px 10px"
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
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Wallets"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = new View({ tag: "a" }, self.context)
		const layer = view.layer
		{ // setup/style
			layer.href = "#" // to make it clickable
			layer.innerHTML = "+" // TODO
		}
		{
			layer.style.display = "block"
			layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
			layer.style.marginTop = "10px"
			layer.style.width = "26px"
			layer.style.height = "24px"
			layer.style.cornerRadius = "2px"
			layer.style.backgroundColor = "#18bbec"
			layer.style.textDecoration = "none"
			layer.style.fontSize = "22px"
			layer.style.lineHeight = "115%" // % extra to get + aligned properly
			layer.style.color = "#ffffff"
			layer.style.fontWeight = "bold"
			layer.style.textAlign = "center"
		}
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
		// TODO: diff these wallets with existing wallets?
		if (self.walletCellViews.length != 0) {
			// for now, just flash list:
			self.walletCellViews.forEach(
				function(view, i)
				{
					view.removeFromSuperview()
				}
			)
			self.walletCellViews = []
		}
		// now add subviews
		const context = self.context
		wallets.forEach(
			function(wallet, i)
			{
				const options = {}
				const view = new WalletsListCellView(options, context)
				self.walletCellViews.push(view)
				view.ConfigureWith_wallet(wallet)
				self.addSubview(view)
			}
		)
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
		//
		if (typeof self.navigationController === 'undefined' || self.navigationController === null) {
			throw "missing self.navigationController in viewWillAppear()"
		}
		self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
	}
}
module.exports = WalletsListView
