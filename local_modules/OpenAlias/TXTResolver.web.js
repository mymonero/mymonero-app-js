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
const TXTResolver_Interface = require('./TXTResolver_Interface')
const request = require('xhr')
//
class TXTResolver extends TXTResolver_Interface
{
	constructor(options)
	{
		super(options)
		const self = this
	}
	//
	// Accessors
	TXTRecords(
		name, 
		fn // (err, records, dnssec_used, secured, dnssec_fail_reason) -> Void
	) {
		const completeURL = "https://cloudflare-dns.com/dns-query?ct=application/dns-json&name="+encodeURIComponent(name)+"&type=TXT"
		const requestHandle = request(
			completeURL,
			function(err, response, body)
			{
				if (err) {
					fn(err)
					return
				}
				var json;
				try {
					json = JSON.parse(body)
				} catch (e) {
					fn(e.toString())
					return
				}
				const answerEntries = json.Answer
				if (!answerEntries || typeof answerEntries == 'undefined') {
					fn("Unrecognized DNS response")
					return
				}
				const records = []
				for (let answerEntry of answerEntries) {
					var entryData = answerEntry.data
					if (!entryData || typeof entryData == 'undefined') {
						fn("Unrecognized DNS response entry format")
						return
					}
					{ // remove wrapping escaped "s
						if (entryData.charAt(0) == "\"") { // remove 
							entryData = entryData.substring(1)
						}
						if (entryData.charAt(entryData.length-1) == "\"") {
							entryData = entryData.slice(0,entryData.length-1) // remove last char
						}
					}
					records.push(entryData)
				}
				fn(null, records, false, false, null) // TODO: add DNSSEC support
			}
		)
		return requestHandle
	}

}
module.exports = TXTResolver