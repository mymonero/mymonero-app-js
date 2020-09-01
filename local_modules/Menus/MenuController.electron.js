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
const {Menu, shell, ipcMain} = require('electron')
const isMacOS = process.platform === 'darwin'
//
const MenuController_Abstract = require('./MenuController_Abstract')
//
class MenuController extends MenuController_Abstract
{
	constructor(options, context)
	{
		super(options, context) // must call before accessing `this`
	}
	setup()
	{
		const self = this
		super.setup()
		self.setup_menu()
		self.startObserving_ipc()
	}
	setup_menu()
	{
		const self = this
		const menuSpecs = self._new_menuSpecs()
		const menu = Menu.buildFromTemplate(menuSpecs)
		self.menu = menu
		{
			const app = self.context.app
			function _setMenu()
			{
				Menu.setApplicationMenu(menu)
			}
			if (app.isReady()) {
				_setMenu()
			} else {
				app.on('ready', _setMenu)
			}
		}
	}
	startObserving_ipc()
	{
		const self = this
		ipcMain.on(
			self.IPCMethod__MenuController_SetItemNamedEnabled(), 
			function(event, params)
			{
				self.SetItemNamedEnabled(
					params.itemName, 
					params.isEnabled
				)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - IPC Method names
	
	IPCMethod__MenuController_SetItemNamedEnabled()
	{
		return "IPCMethod__MenuController_SetItemNamedEnabled"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Menu item names
	
	MenuItemName_ChangePassword()
	{
		return "Change Password"
	}
	MenuItemName_Preferences()
	{
		return "Preferences"
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Factories
	
	_new_menuSpecs()
	{
		const self = this
		const appName = self.context.app.getName()
		//
		const menuSpecs = []
		{ // MyMonero menu
			const submenu = 
			[
				{
					label: 'About MyMonero',
					click: function(menuItem, browserWindow, event)
					{
						self.context.aboutWindowController.MakeKeyAndVisible()
					}
				},
				{
					type: 'separator'
				},
				{
					label: self.MenuItemName_Preferences(),
					accelerator: 'CmdOrCtrl+,',
					click: function(menuItem, browserWindow, event)
					{
						self.emit(self.EventName_menuItemSelected_Preferences())
					}
				},
				{
					label: self.MenuItemName_ChangePassword(),
					enabled: false, // wait for first PW entry to enable
					click: function(menuItem, browserWindow, event)
					{
						self.emit(self.EventName_menuItemSelected_ChangePassword())
					}
				},
				{
					label: 'Check for Updates',
					click: function(menuItem, browserWindow, event)
					{
						const isLinux = /linux/.test(process.platform)
						if (isLinux) { // linux has no support for updates in the app afaik so this is redirected to the downloads page - the user is advised to update via their pkg mgmt system - can that be integrated?
							const shell = require('electron').shell
							shell.openExternal( // maybe share this constant with AppUpdatesController.electron.main and anything else that may need it in the future but file it under 'releases' and not 'release notes' despite its usage in AppUpdatesC
								"https://github.com/mymonero/mymonero-app-js/releases"
							)
							return;
						}
						// Figure it's overcomplicating things to toggle the menu item interactivity
						//
						self.context.appUpdatesController.manually_checkForUpdates();

					}
				},
				{
					type: 'separator'
				}
			]
			if (isMacOS) {
				submenu.push({
					role: 'services',
					submenu: []
				})
				submenu.push({
					type: 'separator'
				})
				submenu.push({
					role: 'hide'
				})
				submenu.push({
					role: 'hideothers'
				})
				submenu.push({
					role: 'unhide'
				})
				submenu.push({
					type: 'separator'
				})
			}
			// and finally, for all platforms…
			submenu.push({
				role: 'quit'
			})
			menuSpecs.push({
				label: appName,
				submenu: submenu
			})
		}		
		{ // Edit
			const submenu = 
			[
				{
					role: 'undo'
				},
				{
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					role: 'cut'
				},
				{
					role: 'copy'
				},
				{
					role: 'paste'
				},
				{
					role: 'pasteandmatchstyle'
				},
				{
					role: 'delete'
				},
				{
					role: 'selectall'
				}
			]
			if (isMacOS === true) {
				submenu.push(
					{
						type: 'separator'
					},
					{
						label: 'Speech',
						submenu: [
							{
								role: 'startspeaking'
							},
							{
								role: 'stopspeaking'
							}
						]
					}
				)
			}			
			//
			const menuSpec = 
			{
				label: 'Edit',
				submenu: submenu
			}
			menuSpecs.push(menuSpec)
		}
		// menuSpecs.push({
		// 	label: 'View',
		// 	submenu: [
		// 		{
		// 			role: 'reload'
		// 		},
		// 		{
		// 			type: 'separator'
		// 		},
		// 	]
		// })
			
		{ // Window menu
			const menuSpec =
			{
				role: 'window'
			}
			if (isMacOS === true) {
				menuSpec.submenu =
				[
					{
						label: 'Close',
						accelerator: 'CmdOrCtrl+W',
						role: 'close'
					},
					{
						label: 'Minimize',
						accelerator: 'CmdOrCtrl+M',
						role: 'minimize'
					},
					{
						label: 'Zoom',
						role: 'zoom'
					},
					{
						type: 'separator'
					},
					{
						label: 'Bring All to Front',
						role: 'front'
					}
				]
			} else {
				menuSpec.submenu =
				[
					{
						role: 'minimize'
					},
					{
						role: 'close'
					}
				]
			}
			menuSpecs.push(menuSpec)
		}
		{ // Help
			const submenu = 
			[
				{
					label: 'MyMonero.com',
					click: function(menuItem, browserWindow, event)
					{
						shell.openExternal('https://mymonero.com/')
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Help Center',
					click: function(menuItem, browserWindow, event)
					{
						shell.openExternal('https://intercom.help/mymonero')
					}
				},
				{
					label: 'Support',
					click: function(menuItem, browserWindow, event)
					{
						shell.openExternal('https://mymonero.com/?open_support=1')
					}
				},
				{
					type: "separator"
				},
				{
					label: "Open User Data Folder…",
					click: function(menuItem, browserWindow, event)
					{
						shell.openItem(self.context.app.getPath('userData'));
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Privacy Policy',
					click: function(menuItem, browserWindow, event)
					{
						shell.openExternal('https://mymonero.com/privacy')
					}
				},
				{
					label: 'Terms of Use',
					click: function(menuItem, browserWindow, event)
					{
						shell.openExternal('https://mymonero.com/terms')
					}
				}
			]
			menuSpecs.push({
				role: 'help',
				submenu: submenu
			})
		}
		//
		return menuSpecs
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Searches
	
	_firstMenuItemNamed(itemName)
	{
		const self = this
		const menuItems = self.menu.items
		for (let menuItem of menuItems) {
			const menuItemItems = menuItem.submenu.items
			for (let menuItemItem of menuItemItems) {
				const role = menuItemItem.role
				if (typeof role !== 'undefined') {
					if (itemName.toLowerCase == role) {
						return menuItemItem
					}
				}
				//
				const label = menuItemItem.label
				if (label === itemName) {
					return menuItemItem
				}
			}
		}
		//
		return null
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Override/implementations
	
	override_setItemNamedEnabled(itemName, isEnabled)
	{
		const self = this
		const menuItem = self._firstMenuItemNamed(itemName)
		if (menuItem === null) {
			throw "Menu item not found"
		}
		menuItem.enabled = isEnabled
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation
}
module.exports = MenuController
