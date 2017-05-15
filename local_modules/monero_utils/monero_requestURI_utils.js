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
const monero_config = require('./monero_config')
//
function New_RequestFunds_URI(
	args
)// -> String?
{
	const address = args.address
	if (!address) {
		throw "missing address"
		// return null
	}
	var uri = monero_config.coinUriPrefix + "//" + address  // inserting a // so data detectors pick it up… maybe remove if/after not necessary
	var isAppendingParam0 = true
	function addParam(parameterName, value)
	{
		if (!value || typeof value === 'undefined') {
			return
		}
		var conjunctionStr = "&"
		if (isAppendingParam0 === true) {
			isAppendingParam0 = false
			conjunctionStr = "?"
		}
		uri += conjunctionStr
		uri += parameterName + '=' + encodeURIComponent(value)
	}
	{
		addParam('tx_amount', args.amount)
		addParam('tx_description', args.description)
		addParam('tx_payment_id', args.payment_id)
		addParam('tx_message', args.message)
	}
	return uri
}
exports.New_RequestFunds_URI = New_RequestFunds_URI
//
function New_ParsedPayload_FromRequestURIString(uriString)
{ // throws; -> {}
	// TODO
	const url = new URL(uriString)
	const protocol = url.protocol
	if (protocol !== monero_config.coinUriPrefix) {
		throw "Request URI has non-Monero protocol"
	}
	var target_address = url.pathname // var instead of const as have to finalize it
	// it seems that if the URL has // in it, pathname will be empty, but host will contain the address instead
	if (target_address === "" || typeof target_address === 'undefined' || !target_address) {
		target_address = url.host || url.hostname
	}
	if (target_address.indexOf("//") == 0) {
		target_address = target_address.slice(0 + "//".length, target_address.length) // strip prefixing "//" in case URL had protocol:// instead of protocol:
	}
	const searchParams = url.searchParams // needs to be parsed it seems
	//
	const payload =
	{
		address: target_address
	}	
	const keyPrefixToTrim = "tx_"
	const lengthOf_keyPrefixToTrim = keyPrefixToTrim.length
	searchParams.forEach(
		function(value, key)
		{
			var storeAt_key = key
			if (key.indexOf(keyPrefixToTrim) === 0) {
				storeAt_key = key.slice(lengthOf_keyPrefixToTrim, key.length)
			}
			payload["" + storeAt_key] = value
		}
	)
	//
	return payload
}
exports.New_ParsedPayload_FromRequestURIString = New_ParsedPayload_FromRequestURIString