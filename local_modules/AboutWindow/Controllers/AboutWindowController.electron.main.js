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
class AboutWindowController
{
	// Lifecycle - Init
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
		self.window = null // zeroing and declaration
		// window created on demand
	}
	// Accessors - Window
	_new_window()
	{
		const options = 
		{
			fullscreenable: false,
			maximizable: false,
			resizable: false,
			minimizable: true,
			//
			show: false, // do not show by default
			//
			width: 200,
			height: 200,
			minWidth: 200,
			minHeight: 200,
			backgroundColor: "#272527",
			titleBarStyle: "hidden-inset",
			webPreferences: { // these are all currently the default values but stating them here to be explicit…
				webSecurity: true, // sets allowDisplayingInsecureContent and allowRunningInsecureContent to true
				allowDisplayingInsecureContent: false, // https content only
				allowRunningInsecureContent: false // html/js/css from https only
			}
		}
		const isWin = /^win/.test(process.platform)
		const isLinux = /linux/.test(process.platform)
		if (isLinux) {
			const pathTo_iconImage_png = __dirname + "../../local_modules/electron_main/resources/icons/icon.png"
			options.icon = pathTo_iconImage_png
		}
		if (isWin || isLinux) { // for window decoration
			options.height += 27
			options.maxHeight += 27
		}
		const window = new electron.BrowserWindow(options)
		window.loadURL(`file://${__dirname}/../Views/index.electron.html`)
		window.setMenu(null) // because on Windows and Linux we do not want to have a menubar on top of this about menu
		//
		return window
	}
	// Runtime - Imperatives - Window
	create_window_whenAppReady(andShowImmediately)
	{
		const self = this
		const app = self.context.app
		if (app.isReady() === true) { // this is probably not going to be true as the app is fairly zippy to set up
			self._create_window_ifNecessary(andShowImmediately)
		} else {
			app.on('ready', function()
			{
				self._create_window_ifNecessary(andShowImmediately)
			})
		}
	}
	_create_window_ifNecessary(andShowImmediately)
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
		if (andShowImmediately) {
			window.once('ready-to-show', function()
			{
				window.show()
			})
		}
		{ // hardening
			window.webContents.on("will-navigate", function(e)
			{
				e.preventDefault() // do not allow navigation when users drop links
			})
			window.webContents.on( // but it would be nicer to completely preclude it opening
				'devtools-opened',
				function()
				{
					if (self.window) {
						self.window.webContents.closeDevTools()
					}
				}
			)
		}
	}
	MakeKeyAndVisible()
	{
		const self = this
		if (self.window) {
			self.window.show()
		} else {
			self.create_window_whenAppReady(true)
		}
	}
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
}
module.exports = AboutWindowController
