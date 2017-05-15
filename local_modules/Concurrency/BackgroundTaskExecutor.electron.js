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
const BackgroundTaskExecutor_Interface = require('./BackgroundTaskExecutor_Interface')
//
const child_process = require('child_process')
const fork = child_process.fork	
//
class BackgroundTaskExecutor extends BackgroundTaskExecutor_Interface
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		const self = this
		{ // before calling on super - which will call setup_worker
			self.absolutePathToChildProcessSourceFile = self.options.absolutePathToChildProcessSourceFile
			if (typeof self.absolutePathToChildProcessSourceFile === 'undefined' || !self.absolutePathToChildProcessSourceFile) {
				throw `absolutePathToChildProcessSourceFile required in ${self.constructor.name}`
			}
			//
			self.argsForChild = self.options.argsForChild || []
		}
		super.setup()
	}
	setup_worker()
	{
		const self = this
		const child = fork( // fork will set up electron properly in the child process for us (e.g. env)
			self.absolutePathToChildProcessSourceFile,
			self.argsForChild,
			{ stdio: 'ipc' }
		)
		self.worker = child // so that super is satisfied with existence of self.worker - we will translate internally
	}
	startObserving_worker()
	{
		const self = this
		super.startObserving_worker() // to get the boot timeout going
		const child = self.worker // semantics translation
		child.on('message', function(message)
		{
			if (message === "child is up") {
				self._receivedBootAckFromWorker()
				return
			}
			var payload = null
			if (typeof message === 'string') {
				try {
					payload = JSON.parse(message)
				} catch (e) {
					console.error("JSON couldn't be parsed in " + self.constructor.name, e)
					throw e
				}
			} else if (typeof message === 'object') {
				payload = message
			} else {
				throw "unrecognized typeof message received from child"
			}
			self._receivedPayloadFromWorker(payload)
		})
	}
	_concrete_sendPayloadToWorker(payload)
	{
		const self = this
		const child = self.worker // semantics translation
		child.send(payload)
	}
}
module.exports = BackgroundTaskExecutor