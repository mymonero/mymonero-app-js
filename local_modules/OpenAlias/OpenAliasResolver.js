// Copyright (c) 2014-2018, MyMonero.com
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
const EventEmitter = require('events')
//
const monero_openalias_utils = require('./monero_openalias_utils')
//
class OpenAliasResolver extends EventEmitter
{
	//
	//
	// Constructor
	//
	constructor(options, context)
	{
		super() // must call super before we can access `this`
		const self = this
		{
			self.options = options
			self.context = context
		}
		self.setMaxListeners(10000) // in case we have many contacts… :P
	}
	//
	//
	// Runtime - Accessors - Events
	//
	EventName_resolvedOpenAliasAddress()
	{
		return "EventName_resolvedOpenAliasAddress"
	}
	//
	// 
	// Runtime - Accessors - Transforms
	//
	DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address)
	{
		const self = this
		//
		return monero_openalias_utils.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address)
	}
	//
	//
	// Runtime - Imperatives (not Accessors because these cause emits and so have [side-]effects)
	//
	ResolveOpenAliasAddress(openAliasAddress, fn)
	{ // -> HostedMoneroAPIClient_RequestHandle
		const self = this
		const requestHandle = monero_openalias_utils.ResolvedMoneroAddressInfoFromOpenAliasAddress( 
			openAliasAddress,
			self.context.hostedMoneroAPIClient,
			self.context.nettype,
			function(
				err,
				moneroReady_address,
				payment_id, // may be undefined
				tx_description,
				openAlias_domain,
				oaRecords_0_name,
				oaRecords_0_description,
				dnssec_used_and_secured
			) {
				if (err) {
					fn(
						err,
						openAliasAddress // for consumer reference
					)
					return
				}
				setTimeout(
					function()
					{
						self.emit(
							self.EventName_resolvedOpenAliasAddress(),
							//
							openAliasAddress,
							//
							moneroReady_address,
							payment_id, // may be undefined
							tx_description, // may be undefined
							//
							openAlias_domain,
							oaRecords_0_name,
							oaRecords_0_description,
							dnssec_used_and_secured
						)
					}
				)
				if (fn) {
					fn(
						null,
						openAliasAddress, // for consumer reference
						//
						moneroReady_address,
						payment_id, // may be undefined
						tx_description, // may be undefined
						//
						openAlias_domain,
						oaRecords_0_name,
						oaRecords_0_description,
						dnssec_used_and_secured
					)
				}
			}
		)
		return requestHandle
	}
}
module.exports = OpenAliasResolver