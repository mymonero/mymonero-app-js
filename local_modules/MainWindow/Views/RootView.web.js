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
//
class RootView extends View
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
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		//
		{
			const layer = self.layer
			layer.style.background = "#272527"
			layer.style.position = "absolute"
			layer.style.width = "100%"
			layer.style.height = "100%"
			layer.style.left = "0px"
			layer.style.top = "0px"
			// layer.style.overflow = "hidden"
		}
		//
		self.setup_tabBarAndContentView()
		self.setup_passwordEntryViewController() // this is technically a controller, not a view
		{ // disable space bar to scroll in document
			window.onkeydown = function(e)
			{
				if (e.keyCode == 32 && e.target == document.body) {
					e.preventDefault()
				}
			}
		}
	}
	setup_tabBarAndContentView()
	{
		const self = this
		const context = self.context
		//
		const options = {}
		const LeftSideTabBarAndContentView = require('./RootTabBarAndContentView.web')
		const tabBarViewAndContentView = new LeftSideTabBarAndContentView(options, context)
		self.tabBarViewAndContentView = tabBarViewAndContentView
		{
			const passwordController = self.context.passwordController
			if (passwordController.HasUserEnteredValidPasswordYet() === false) {
				self.tabBarViewAndContentView.DisableTabBarItemButtons()
			}
		}
		self.addSubview(tabBarViewAndContentView)
	}
	setup_passwordEntryViewController()
	{
		const self = this
		const passwordController = self.context.passwordController
		const PasswordEntryViewController = require('../../Passwords/Controllers/PasswordEntryViewController.web')
		const passwordEntryViewController = new PasswordEntryViewController(self.tabBarViewAndContentView, passwordController)
		self.passwordEntryViewController = passwordEntryViewController
		{
			passwordEntryViewController.on(
				passwordEntryViewController.EventName_willDismissView(),
				function()
				{
					self.tabBarViewAndContentView.EnableTabBarItemButtons()
				}
			)
			passwordEntryViewController.on(
				passwordEntryViewController.EventName_willPresentInView(),
				function()
				{
					self.tabBarViewAndContentView.DisableTabBarItemButtons()
				}
			)
		}
	}
	
}
module.exports = RootView
