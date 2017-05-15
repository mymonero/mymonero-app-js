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
const {ipcRenderer} = require('electron')
//
class MenuControllerController
{	// Silly as it sounds, this class exists to integrate the main process menuController with event emissions from the renderer side so that integratees can remain able to operate independently
	

	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.menuController = self.context.menuController // on the main process -- so this will be synchronous IPC
		//
		self.setup()
	}
	setup()
	{
		const self = this
		//
		self.setupWith_passwordController()
		self.setupWith_menuController()
	}
	setupWith_passwordController()
	{
		const self = this
		const controller = self.context.passwordController
		if (controller.HasUserEnteredValidPasswordYet() === true) {
			self.enableMenuItem_ChangePassword()
		} else { // or wait til the pw is ready
			controller.on(
				controller.EventName_ObtainedNewPassword(),
				function() 
				{
					self.enableMenuItem_ChangePassword()
				}
			)
			controller.on(
				controller.EventName_ObtainedCorrectExistingPassword(),
				function() 
				{
					self.enableMenuItem_ChangePassword()
				}
			)
			controller.on(
				controller.EventName_didDeconstructBootedStateAndClearPassword(),
				function()
				{
					self.disableMenuItem_ChangePassword()
				}
			)
		}
	}
	setupWith_menuController()
	{
		const self = this
		const controller = self.menuController
		controller.on(
			controller.EventName_menuItemSelected_ChangePassword(),
			function()
			{
				self.context.passwordController.InitiateChangePassword() // this will throw if no pw has been entered yet
			}
		)
	}
	//
	//
	// Runtime - Imperatives
	//
	enableMenuItem_ChangePassword()
	{
		const self = this
		ipcRenderer.send(
			self.menuController.IPCMethod__MenuController_SetItemNamedEnabled(),
			{
				itemName: self.menuController.MenuItemName_ChangePassword(),
				isEnabled: true
			}
		)
	}
	disableMenuItem_ChangePassword()
	{
		const self = this
		ipcRenderer.send(
			self.menuController.IPCMethod__MenuController_SetItemNamedEnabled(),
			{
				itemName: self.menuController.MenuItemName_ChangePassword(),
				isEnabled: false
			}
		)
	}
}
module.exports = MenuControllerController
