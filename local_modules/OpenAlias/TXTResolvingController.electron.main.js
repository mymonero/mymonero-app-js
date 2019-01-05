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
const { Resolver } = require('dns')
const { ipcMain } = require('electron')
//
const TXTResolver_Interface = require('./TXTResolver_Interface')
const DNSResolverHandle = require('./DNSResolverHandle.node')
//
class TXTResolver
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.resolversByUUID = {}
		//
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		ipcMain.on(
			"TXTRecords",
			function(event, params)
			{
				self._resolveJob(
					event,
					params.hostname,
					params.uuid // use uuid as resolverUUID
				)
			}
		)
		ipcMain.on(
			"TXTRecords-Abort",
			function(event, params)
			{
				self._abortJob(
					event,
					params.uuid
				)
			}
		)
	}
	//
	// Imperatives
	_resolveJob(
		event,
		hostname,
		resolverUUID
	) {
		const self = this
		const resolver = new Resolver()
		self.resolversByUUID[resolverUUID] = resolver
		resolver.resolveTxt(
			hostname, 
			function(err, arraysOfSplitRecords)
			{
				delete self.resolversByUUID[resolverUUID] // letting this go
				//
				if (err) {
					event.sender.send(
						"TXTRecords-Callback",
						{
							uuid: resolverUUID,
							err: err.toString()
						}
					)
					return
				}
				var records = []
				for (let splitRecords of arraysOfSplitRecords) {
					records.push(
						splitRecords.join(''/*all spaces should already be present */)
					)
				}
				event.sender.send(
					"TXTRecords-Callback",
					{
						uuid: resolverUUID,
						records: records,
						dnssec_used: false,
						secured: false,
						dnssec_fail_reason: null
					}
				)
			}
		)
	}
	_abortJob(
		event,
		resolverUUID
	) {
		const self = this
		const resolver = self.resolversByUUID[resolverUUID]
		if (resolver && typeof resolver !== undefined) {
			resolver.cancel()
			delete self.resolversByUUID[resolverUUID]
		}
	}
}
module.exports = TXTResolver