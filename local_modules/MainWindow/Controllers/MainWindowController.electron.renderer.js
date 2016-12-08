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

"use strict"
//
const electron = require('electron')
//
class MainWindowController
{


	////////////////////////////////////////////////////////////////////////////////
	// Initialization
	
	constructor(options, context)
	{
		const self = this
		//
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_window()
		self.startObserving_app()
	}
	setup_window()
	{
		const self = this
		const app = self.context.app
		//
		self.window = null // zeroing and declaration
	}
	startObserving_app()
	{
		const self = this
		const app = self.context.app
		app.on('window-all-closed', function()
		{
			self._allWindowsDidClose()
		})
		app.on('activate', function()
		{
			if (self.window === null) {
				self._create_window_ifNecessary()
			}
		})
		// custom:
		app.on('launched-duplicatively', function()
		{ // bring window to forefront however necessary
			if (self.window !== null) {
			    if (self.window.isMinimized()) {
					self.window.restore()
				}
			    self.window.focus()
			}
		})
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Accessors - Window

	_new_browserWindowTitle()
	{
		return "MyMonero"
	}
	_new_window()
	{
		const self = this
		const window = new electron.BrowserWindow({
			width: 800,
			height: 600,
			title: self._new_browserWindowTitle(),
			webPreferences: { // these are all currently the default values but stating them here to be explicit…
				webSecurity: true, // sets allowDisplayingInsecureContent and allowRunningInsecureContent to true
				allowDisplayingInsecureContent: false, // https content only
				allowRunningInsecureContent: false // html/js/css from https only
			}
		})
		window.loadURL(`file://${__dirname}/../Views/index.electron.html`)
		//
		return window
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Window

	create_window_whenAppReady()
	{
		const self = this
		const app = self.context.app
		if (app.isReady() === true) { // this is probably not going to be true as the app is fairly zippy to set up
			self._create_window_ifNecessary()
		} else {
			app.on('ready', function()
			{
				self._create_window_ifNecessary()
			})
		}
	}
	_create_window_ifNecessary()
	{
		const self = this
		if (self.window !== null && typeof self.window !== 'undefined') {
			return
		}
		const window = self._new_window()
		self.window = window
		window.on('closed', function() // this is not within new_window because such accessors should never directly or indirectly modify state of anything but within its own fn scope
		{
			self.window = null // release
		})
		{ // hardening
			const allowDevTools = process.env.NODE_ENV === 'development'
			const openDevTools = allowDevTools === true && true
			if (allowDevTools !== true) { // this prevents the dev tools from staying open
				window.webContents.on( // but it would be nicer to completely preclude it opening
					"devtools-opened",
					function()
					{
						if (self.window) {
							self.window.webContents.closeDevTools()
						}
					}
				)
			}
			if (openDevTools === true) {
				self.window.webContents.openDevTools()
			}
		}
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Post-instantiation hook
	
	RuntimeContext_postWholeContextInit_setup()
	{
		const self = this
		// We have to wait until post-whole-context-init to guarantee all controllers exist
		//
		// We'll wait til here to create the window cause it's the thing that generally kicks off booting the application/UI-level controllers in the context.
		// However, we can't wait til those controllers are booted to create the window because they might need
		// to present things like the password entry fields in the UI
		self.create_window_whenAppReady()
	}

		
	////////////////////////////////////////////////////////////////////////////////
	// Delegation - Private - Windows

	_allWindowsDidClose()
	{
		const self = this
		const app = self.context.app
		if (process.platform === 'darwin') { // because macos apps stay active while main window closed
			app.quit()
		}
	}
}
module.exports = MainWindowController
