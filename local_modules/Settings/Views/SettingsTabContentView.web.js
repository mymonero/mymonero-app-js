// Copyright (c) 2014-2019, MyMonero.com
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
class SettingsTabContentView extends StackAndModalNavigationView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		super.setup() // we must call on super
		const self = this
		{
			const SettingsView = require('./SettingsView.web')
			const view = new SettingsView({}, self.context)
			self.settingsView = view
		}
		{
			self.SetStackViews(
				[
					self.settingsView
				]
			)
		}
	}
	//
	//
	// Runtime - Accessors - Implementation of TabBarItem protocol
	// custom tab bar item styling
	TabBarItem_layer_customStyle(isHorizontalBar)
	{
		const self = this
		if (isHorizontalBar) {
			return undefined
		} else {
			return {
				position: "absolute", // we can get away with doing this because the tab bar won't move
				left: "0",
				bottom: "5px", // for desktop, anyway
			}
		}
	}
	TabBarItem_icon_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Settings/Resources/icon_tabBar_settings@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "16px 16px"
		}
	}
	TabBarItem_icon_selected_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Settings/Resources/icon_tabBar_settings__active@3x.png)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "16px 16px"
		}
	}
	// interactivity
	TabBarItem_shallDisable()
	{
		const self = this
		const passwordController = self.context.passwordController
		if (passwordController.hasUserSavedAPassword !== true) {
			return false // no existing data - do not disable
		}
		if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app
			return true // because the app needs to be unlocked before they can use it
		}
		if (passwordController.IsUserChangingPassword() === true) {
			return true // changing pw - prevent jumping around
		}
		return false
	}
}
module.exports = SettingsTabContentView