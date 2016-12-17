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
		console.log("wallets list view hears list updated")
		self.reloadData()
	}
}
module.exports = WalletsListView
