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
const child_process = require('child_process')
const fork = child_process.fork	
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
		//
		const child = fork( // fork will set up electron properly in the child process for us (e.g. env)
			__dirname + '/./child.electron.js',
			[],
			{
				stdio: 'ipc'
			}
		)
		self.child = child
		var timeout_waitingForBoot = setTimeout(
			function()
			{ // Wait for child to come up or error
				timeout_waitingForBoot = null
				//
				if (self.hasBooted !== true) {
					throw "Couldn't bring background process up."
				} else if (self.hasBooted === true) {
					throw "Code fault: timeout_waitingForBoot fired after successful boot."
				}
			},
			5000
		)
		child.on(
			'message', 
			function(message)
			{
				if (message === "child is up") {
					{
						if (timeout_waitingForBoot === null) {
							throw "Got message back from child after timeout"
							return
						}
						clearTimeout(timeout_waitingForBoot)
						timeout_waitingForBoot = null
					}
					{
						console.log("BackgroundDocumentCryptor background process up")
						self.hasBooted = true
					}
				} else {
					var payload = null
					if (typeof message === 'string') {
						try {
							payload = JSON.parse(message)
						} catch (e) {
							console.error("JSON couldn't be parsed in BackgroundDocumentCryptor", e)
							throw e
							return
						}
					} else if (typeof message === 'object') {
						payload = message
					} else {
						throw "unrecognized typeof message received from child"
					}
					self._receivedPayloadFromChild(payload)
				}
			}
		)
	}
	//
	startObserving_workers()
	{
		const self = this
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
			fn, // fn goes as second arg
			[
				plaintextDocument, 
				documentCryptScheme, 
				password
			]
		)
	}
	New_DecryptedDocument(
		encryptedDocument,
		documentCryptScheme,
		password,
		fn // fn: (err?, decryptedDocument) -> Void
	)
	{
		const self = this
		self._executeBackgroundTaskNamed(
			'New_DecryptedDocument',
			fn, // fn goes as second arg
			[
				encryptedDocument, 
				documentCryptScheme, 
				password
			]
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
		taskName,
		fn,
		args
	)
	{
		const self = this
		const taskUUID = uuidV1()
		{ // we need to generate taskUUID now to construct arguments so we might as well also hang onto it here instead of putting that within the call to ExecuteWhenBooted
			self.callbacksByUUID[taskUUID] = fn
		}
		self.ExecuteWhenBooted(function()
		{ // wait til window/threads set up
			const payload = 
			{
				taskName: taskName,
				taskUUID: taskUUID,
				args: args || []
			}
			// console.log("sending ", payload)
			self.child.send(payload)
		})
	}	
	//
	//
	// Runtime - Delegation
	//
	_receivedPayloadFromChild(payload)
	{
		const self = this
		// console.log("_receivedPayloadFromChild", payload)
		const eventName = payload.eventName
		if (eventName !== 'FinishedTask') {
			throw "child sent eventName !== 'FinishedTask'"
		} 
		const taskUUID = payload.taskUUID
		const err = 
			payload.err && typeof payload.err !== 'undefined'
			 ? typeof payload.err === 'string' ? new Error(payload.err) : payload.err
			 : null
		const returnValue = payload.returnValue
		{
			const callback = self.callbacksByUUID[taskUUID]
			if (typeof callback === 'undefined') {
				console.warn("Task callback undefined:", taskUUID)
				return
			}
			callback(err, returnValue)
		}
	}
}
module.exports = BackgroundDocumentCryptor