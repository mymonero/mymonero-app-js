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
const {ipcRenderer} = require('electron')
const uuidV1 = require('uuid/v1')
//
const TXTResolver_Interface = require('./TXTResolver_Interface')
const DNSResolverHandle = require('./DNSResolverHandle.node')
//
class TXTResolver extends TXTResolver_Interface
{
	constructor(options)
	{
		super(options)
		const self = this
		self.callbacksByUUID = {}
		//
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		ipcRenderer.on(
			"TXTRecords-Callback",
			function(event, arg)
			{
				const uuid = arg.uuid
				const callback = self.callbacksByUUID[uuid]
				delete self.callbacksByUUID[uuid]
				//
				if (arg.err && typeof arg.err != 'undefined') {
					callback(arg.err)
					return
				}
				callback(null, arg.records, arg.dnssec_used, arg.secured, arg.dnssec_fail_reason)
			}
		)
	}
	//
	// Accessors
	TXTRecords(
		hostname, 
		fn // (err, records, dnssec_used, secured, dnssec_fail_reason) -> Void
	) /* -> DNSResolverHandle */ {
		const self = this
		const uuid = uuidV1()
		self.callbacksByUUID[uuid] = fn
		//
		const dnsResolverHandle = new DNSResolverHandle({ // implements abort()
			uuid: uuid, 
			abort_called_fn: function() 
			{
				delete self.callbacksByUUID[uuid] // must let go of this here as we don't get notified back an error
				//
				ipcRenderer.send(
					"TXTRecords-Abort",
					{ 
						uuid: uuid 
					}
				)
			}
		})
		ipcRenderer.send(
			"TXTRecords",
			{
				hostname: hostname,
				uuid: uuid
			}
		)
		return dnsResolverHandle
	}

}
module.exports = TXTResolver