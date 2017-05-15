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
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
//
class SendTabContentView extends StackAndModalNavigationView
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
			const SendFundsView = require('./SendFundsView.web')
			const view = new SendFundsView(options, self.context)
			self.sendFundsView = view
		}
		{
			self.SetStackViews(
				[
					self.sendFundsView
				]
			)
		}
	}
	//
	//
	// Runtime - Accessors - Implementation of TabBarItem protocol - custom tab bar item styling
	//
	TabBarItem_layer_customStyle()
	{
		const self = this
		return {}
	}
	TabBarItem_icon_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url("+self.context.crossPlatform_appBundledAssetsRootPath+"/SendFundsTab/Resources/icon_tabBar_sendFunds@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "24px 25px"
		}
	}
	TabBarItem_icon_selected_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url("+self.context.crossPlatform_appBundledAssetsRootPath+"/SendFundsTab/Resources/icon_tabBar_sendFunds__active@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "24px 25px"
		}
	}
	// interactivity
	TabBarItem_shallDisable()
	{
		const self = this
		const passwordController = self.context.passwordController
		if (passwordController.hasUserSavedAPassword !== true) {
			return true // no existing data - do disable
		}
		if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app
			return true // because the app needs to be unlocked before they can use it
		}
		if (passwordController.IsUserChangingPassword() === true) {
			return true // changing pw - prevent jumping around
		}
		const wallets = self.context.walletsListController.records // figure it's ready by this point
		const numberOf_wallets = wallets.length
		const walletsExist = numberOf_wallets !== 0
		const shallDisable = walletsExist == false // no wallets? disable
		return shallDisable
	}
	//
	//
	// Runtime - Delegation - Request URI string picking - Entrypoints - Proxied drag & drop
	//
	_proxied_ondragenter(e)
	{
		const self = this
		if (self.modalViews.length > 0) {
			// prevent this?
		}
		self.DismissModalViewsToView( // whether we should force-dismiss these is debatable… see check for nonzero modals just above
			null, 
			true, // null -> to top stack view
			function() 
			{ // must wait til done or 'currently transitioning' will race 
				self.PopToRootView(true) // in case they're not on root (debated making this not animated)
			}
		) 
		self.sendFundsView._proxied_ondragenter(e)
	}
	_proxied_ondragleave(e)
	{
		const self = this
		self.sendFundsView._proxied_ondragleave(e)
	}
	_proxied_ondrop(e)
	{
		const self = this
		self.sendFundsView._proxied_ondrop(e)
	}
}
module.exports = SendTabContentView