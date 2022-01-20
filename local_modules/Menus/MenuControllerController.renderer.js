"use strict"

const {ipcRenderer} = require('electron')

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
				self.context.passwordController.Initiate_ChangePassword() // this will throw if no pw has been entered yet
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
