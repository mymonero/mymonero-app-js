// Copyright (c) 2014-2016, MyMonero.com
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
const WindowController = require('../electron_utils/WindowController')
//
class MainWindowController extends WindowController
{
	//
	//
	// Initialization
	//	
	setup()
	{
		var self = this
		super.setup()
		//
		self.setup_window()
		self.setup_observation()
	}
	setup_window()
	{
		var self = this
		var app = self.context.app
		//
		self.window = null // zeroing and declaration
		if (app.isReady() === true) {
			self._create_window_ifNecessary()
		}
	}
	setup_observation()
	{
		var self = this
		var app = self.context.app
		//
		if (app.isReady() == false) {
			app.on('ready', function()
			{
				self._create_window_ifNecessary()
			})
		}
		app.on('window-all-closed', self._allWindowsDidClose)
		app.on('activate', function()
		{
			if (self.window === null) {
				self._create_window_ifNecessary()
			}
		})
	}
	//
	//
	// Accessors
	//
	_new_window()
	{
		var self = this
		//
		var window = new electron.BrowserWindow({
	  	  width: 800, 
	  	  height: 600
		})
		window.loadURL(`file://${__dirname}/html/index.html`)
		//
		return window
	}
	//
	//
	// Imperatives
	//
	_create_window_ifNecessary()
	{
		var self = this
		//
		if (self.window !== null && typeof self.window !== 'undefined') {
			return
		}
		self.window = self._new_window()
		self.window.on('closed', function() // this is not within new_window because such accessors should never directly or indirectly modify state of anything but within its own fn scope
		{
			self.window = null // release
		})
	}
	//
	//
	// Delegation
	//
	_allWindowsDidClose()
	{
		var self = this
		var app = self.context.app
		//
		if (process.platform !== 'darwin') { // because macos apps stay active while main window closed
			app.quit() 
		}
	}
}
module.exports = MainWindowController