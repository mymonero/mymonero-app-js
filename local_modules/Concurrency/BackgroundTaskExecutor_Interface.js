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
class BackgroundTaskExecutor
{
	constructor(options, context)
	{
		const self = this
		self.options = options || {}
		self.context = context
		{
			self.hasBooted = false
			self.callbacksByUUID = {}
		}		
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_worker()
		self.startObserving_worker()
	}
	setup_worker()
	{
		const self = this
		throw `You must override and implement ${self.constructor.name}/setup_worker and set self.worker`
	}
	startObserving_worker()
	{ // Implementors: override but call on super
		const self = this
		if (!self.worker || typeof self.worker === 'undefined') {
			throw `self.worker undefined in startObserving_worker`
		}
		const worker = self.worker
		self.timeout_waitingForBoot = setTimeout(
			function()
			{ // Wait for child to come up or error
				self.timeout_waitingForBoot = null
				//
				if (self.hasBooted !== true) {
					throw "Couldn't bring worker up."
				} else if (self.hasBooted === true) {
					throw "Code fault: timeout_waitingForBoot fired after successful boot."
				}
			},
			5000
		)
	}
	//
	// Runtime - Imperatives - Internal
	ExecuteWhenBooted(fn)
	{	// ^ capitalizing this as
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
	executeBackgroundTaskNamed(
		taskName,
		fn,
		args
	)
	{
		const self = this
		const taskUUID = uuidV1()
		{ // we need to generate taskUUID now to construct arguments so we might as well also hang onto it here instead of putting that within the call to ExecuteWhenBooted
			if (!fn || typeof fn !== 'function') {
				throw `executeBackgroundTaskNamed for ${taskName} given non fn as arg 2`
			}
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
			self._concrete_sendPayloadToWorker(payload)
		})
	}
	_concrete_sendPayloadToWorker(payload)
	{
		const self = this
		throw `You must override and implement ${self.constructor.name}/_concrete_sendPayloadToWorker`
	}	
	//
	// Runtime - Delegation
	_receivedBootAckFromWorker()
	{
		const self = this
		{
			if (self.timeout_waitingForBoot === null) {
				throw "Got message back from worker after timeout"
			}
			clearTimeout(self.timeout_waitingForBoot)
			self.timeout_waitingForBoot = null
		}
		{
			console.log("👶  " + self.constructor.name + " worker process up")
			self.hasBooted = true
		}
		return
	}
	_receivedPayloadFromWorker(payload)
	{
		const self = this
		// console.log("_receivedPayloadFromChild", payload)
		const eventName = payload.eventName
		if (eventName !== 'FinishedTask') {
			throw "child sent eventName !== 'FinishedTask'"
		} 
		const taskUUID = payload.taskUUID
		const err_str = payload.err_str && typeof payload.err_str !== 'undefined'
			? payload.err_str
			: null
		const err = err_str && err_str != null ? new Error(err_str) : null // reconstruct 
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
module.exports = BackgroundTaskExecutor