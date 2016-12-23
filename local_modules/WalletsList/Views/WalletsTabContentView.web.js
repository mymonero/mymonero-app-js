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
const uuidV1 = require('uuid/v1')
//
const StackNavigationView = require('../../StackNavigation/Views/StackNavigationView.web')
//
class WalletsTabContentView extends StackNavigationView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		super.setup() // we must call on super
		const self = this
		{ // walletsListView
			const options = {}
			const WalletsListView = require('./WalletsListView.web')
			const view = new WalletsListView(options, self.context)
			self.walletsListView = view
		}
		{
			self.SetStackViews(
				[
					self.walletsListView
				]
			)
		}
	}

	// This is for the nav bar right
	setup_DEVELOPMENTMOCK_addWalletButton()
	{
		// mocking an 'add wallet' button view here to test having to enter a pw for the first time on creating password protected data
		const self = this
			const layer = document.createElement("a")
		{ // setup
			layer.href = "#"
			layer.innerHTML = "+" // TODO
		}
		{ // run
			self.layer.appendChild(layer)
		} // observe
		{
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
						self.context.walletsListController.WhenBooted_CreateAndAddNewlyGeneratedWallet(
							informingAndVerifyingMnemonic_cb,
							fn
						)					
					}
					return false
				}
			)
		}
	}
}
module.exports = WalletsTabContentView






