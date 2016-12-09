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
const uuidV1 = require('uuid/v1')
//
const electron = require('electron')
const BrowserWindow = process.type === 'renderer' ?
	electron.remote.BrowserWindow :
	electron.BrowserWindow;
const {ipcMain} = require('electron')
//
class BackgroundDocumentCryptor
{
	constructor(options, context)
	{
		const self = this
		{
			self.options = options
			self.context = context
		}
		{
			self.hasBooted = false
			self.callbacksByUUID = {}
		}
		{
			self.startObserving_ipcMain()
		}
		{
			const app = self.context.app
			if (app.isReady() === true) {
				self.setup_window()
			} else {
				app.on('ready', function()
				{
					self.setup_window()
				})
			}
		}
	}
	//
	startObserving_ipcMain()
	{
		const self = this
		ipcMain.on('FinishedTask', function(event, taskUUID, err, returnValue)
		{
			const callback = self.callbacksByUUID[taskUUID]
			if (typeof callback === 'undefined') {
				console.warn("Task callback undefined:", taskUUID)
				return
			}
			callback(err, returnValue)
		})
	}
	//
	setup_window()
	{
		const self = this
		const window = new BrowserWindow({ width: 1, height: 1, show: false })
		self.window = window
		// start observing
		window.webContents.on("did-finish-load", function()
		{
			console.log("finished loading")
			self.hasBooted = true
		})
		window.webContents.on("did-fail-load", function(event, errorCode, errorDescription, validatedURL, isMainFrame)
		{
			console.error("Failed to load background window… err ", errorCode, errorDescription)
			throw errorDescription
			process.exit(-1) // can't really continue
		})
		// then call load
		window.loadURL(`file://${__dirname}/index.electron.html`)
		//
		// debug:
		window.show()
		window.openDevTools()
	}
	//
	//
	// Runtime - Accessors - Interface
	//
	New_EncryptedDocument(
		plaintextDocument, 
		documentCryptScheme, 
		password, 
		fn // fn: (err?, encryptedDocument) -> Void
	)
	{
		const self = this
		self._executeBackgroundTaskNamed(
			'New_EncryptedDocument',
			fn,
			plaintextDocument, 
			documentCryptScheme, 
			password
		)
	}
	//
	//
	// Runtime - Imperatives - Internal
	//
	ExecuteWhenBooted(fn)
	{ // ^ capitalizing this as
	  // (a) it could theoretically be callable by self consumers
	  // (b) it's the same code as used in other places so maintains regularity
		const self = this
		if (self.hasBooted === true) {
			fn()
			return
		}
		setTimeout(
			function()
			{
				self.ExecuteWhenBooted(fn)
			},
			10 // ms
		)
	}
	_executeBackgroundTaskNamed(
		rendererProcess_fnName,
		fn
		// …args
	)
	{
		const self = this
		const taskUUID = uuidV1()
		{ // we need to generate taskUUID now to construct arguments so we might as well also hang onto it here instead of putting that within the call to ExecuteWhenBooted
			self.callbacksByUUID[taskUUID] = fn
		}
		const webContents_send_arguments = [] // to build
		{
			webContents_send_arguments.push(rendererProcess_fnName)
			webContents_send_arguments.push(taskUUID)
			// apply any remaining arguments that the caller of _executeBackgroundTaskNamed wants to send to the bg method
			for (let i = 2 ; i < arguments.length ; i++) {
				// i at 2 to skip method name and fn
				var i_arg = arguments["" + i] // as it's a hash
				webContents_send_arguments.push(i_arg)
			}
		}
		self.ExecuteWhenBooted(function()
		{ // wait til window/threads set up
			const webContents = self.window.webContents
			webContents.send.apply(
				webContents,
				webContents_send_arguments
			)
		})

	}
	
	
	//
	//
	// Runtime - Delegation
	//
	
}
module.exports = BackgroundDocumentCryptor