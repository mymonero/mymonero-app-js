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
const monero_config = require('./monero_config')
const monero_utils = require('./monero_cryptonote_utils_instance')
const openalias_utils = require('../openalias_utils/openalias_utils')
//
const currency_openAliasPrefix = monero_config.openAliasPrefix
//
function CurrencyReadyAddressFromTXTRecords(
	records,
	dnssec_used,
	secured,
	dnssec_fail_reason,
	fn // (err?, currencyReady_address?, oaRecords_0_name?, oaRecords_0_description?, dnssec_used_and_secured?) -> Void
)
{	
	var oaRecords
	try {
		oaRecords = openalias_utils.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
			records, 
			dnssec_used, 
			secured, 
			dnssec_fail_reason, 
			currency_openAliasPrefix
		)
	} catch (e) {
		const err = new Error(e)
		fn(err)
        return
	}
	const sampled_oaRecord = oaRecords[0]
	console.log("OpenAlias record: ", sampled_oaRecord)
	var oaAddress = sampled_oaRecord.address
	try { // verify address is decodable for currency
	    monero_utils.decode_address(oaAddress)
	} catch (e) {
		const errStr = "Failed to decode OpenAlias address: " + oaAddress + ": " + e
		const error = new Error(errStr) // apparently if this is named err, JS will complain. no-semicolon parsing issue?
		fn(error)
	    return
	}
	const currencyReady_address = oaAddress
	const oaRecords_0_name = sampled_oaRecord.name 
	const oaRecords_0_description = sampled_oaRecord.description
    const dnssec_used_and_secured = dnssec_used && secured
	fn(
		null, 
		currencyReady_address,
		oaRecords_0_name,
		oaRecords_0_description,
		dnssec_used_and_secured
	)
}
exports.CurrencyReadyAddressFromTXTRecords = CurrencyReadyAddressFromTXTRecords