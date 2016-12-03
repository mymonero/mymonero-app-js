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
const WindowController = require('../../electron_utils/WindowController')
//
class MainWindowController extends WindowController
{


	////////////////////////////////////////////////////////////////////////////////
	// Initialization

	setup()
	{
		const self = this
		super.setup()
		//
		self.setup_window()
		self.startObserving_app()
	}
	setup_window()
	{
		const self = this
		const app = self.context.app
		//
		self.window = null // zeroing and declaration
		if (app.isReady() === true) {
			self._create_window_ifNecessary()
		}
	}
	startObserving_app()
	{
		const self = this
		const app = self.context.app
		//
		if (app.isReady() == false) {
			app.on('ready', function()
			{
				self._create_window_ifNecessary()
			})
		}
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
			title: self._new_browserWindowTitle()
		})
		window.loadURL(`file://${__dirname}/../Views/index.html`)
		//
		return window
	}


	////////////////////////////////////////////////////////////////////////////////
	// Imperatives - Window

	_create_window_ifNecessary()
	{
		const self = this
		if (self.window !== null && typeof self.window !== 'undefined') {
			return
		}
		self.window = self._new_window()
		self.window.on('closed', function() // this is not within new_window because such accessors should never directly or indirectly modify state of anything but within its own fn scope
		{
			self.window = null // release
		})
		if (process.env.NODE_ENV === 'development') { // never unless development env
			// self.window.webContents.openDevTools() // open the dev tools
		}
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Post-instantiation hook
	
	RuntimeContext_postWholeContextInit_setup()
	{
		const self = this
		// We have to wait until post-whole-context-init to guarantee all controllers exist
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
