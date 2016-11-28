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
class WalletsListView
{
	constructor(options, dependencies)
	{
		const self = this
		// parse & hang onto various initial properties…
		// options
		self.web = options.web || false // for MVP this will always be true
		self.superview = options.superview || undefined
		if (typeof self.superview === 'undefined') {
			throw "superview undefined"
		}
		self.document = options.document || undefined
		if (typeof self.document === 'undefined') {
			throw "document undefined"
		}
		// dependencies
		self.walletsListController = dependencies.walletsListController
		//
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
		self.view = document.createElement("div")
		self.view.id = self.Id()
		self.superview.insertBefore(self.view, self.superview.childNodes[0])
		//
		self.walletCellViews = [] // initialize container
	}
	_setup_startObserving()
	{
		const self = this
		self.walletsListController.on(
			self.walletsListController.WalletsListController_eventName_listUpdated(),
			function()
			{
				self._WalletsListController_eventName_listUpdated()
			}
		)
	}
	//
	//
	// Accessors - Factories
	//
	Id()
	{
		return "WalletsList"
	}
	//
	//
	// Imperatives - Configuration
	//
	reloadData()
	{
		const self = this
		if (self.isAlreadyWaitingForWallets === true) { // because accessing wallets is async
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForWallets = true
		self.walletsListController.WhenBooted_Wallets(
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
			// for now, just flash list
			self.walletCellViews.forEach(
				function(view, i)
				{
					view.removeFromSuperview()
				}
			)
			self.walletCellViews = []
		}
		console.log("_configure with ", wallets)
	}
	//
	//
	// Delegation - Data source
	//
	_WalletsListController_eventName_listUpdated()
	{
		const self = this
		console.log("wallets list view hears list updated")
		self.reloadData()
	}
}
module.exports = WalletsListView
