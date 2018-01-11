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
function ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
	domain,
	records,
	dnssec_used,
	secured,
	dnssec_fail_reason,
	openAliasPrefix
) // throws; returns validatedOARecords
{
	var oaRecords = [];
	if (dnssec_used) {
		if (secured) {
			console.log("DNSSEC validation successful")
		} else {
			throw "DNSSEC validation failed for " + domain + ": " + dnssec_fail_reason
		}
	} else {
		console.log("DNSSEC Not used");
	}
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		// console.log("Found OpenAlias record: " + record);
		var parsedDescription;
		try {
			parsedDescription = New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix(record, openAliasPrefix)
		} catch (e) {
			// throw "Invalid OpenAlias record:", record, e
			continue // instaed of throwing, i.e. if records contains another (btc) address before the openAliasPrefix (xmr) address we're looking for
		}
		oaRecords.push(parsedDescription)
	}
	if (oaRecords.length === 0) {
		throw "No valid OpenAlias records with prefix " + openAliasPrefix + " found for: " + domain
	}
	if (oaRecords.length !== 1) {
		throw "Multiple addresses found for given domain: " + domain
	}
	const validated_oaRecords = oaRecords
	//
	return validated_oaRecords
}
exports.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix = ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix
//
//
function New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix(
	record, 
	openAliasPrefix
) // throws on validation error
{
	var parsedDescription = {}
	if (DoesRecordHaveValidOpenAliasPrefix(record, openAliasPrefix) == false) {
		throw "Invalid OpenAlias prefix"
	}
	function parsed_paramValueWithName(valueName)
	{
		
		var pos = record.indexOf(valueName + "=")
		if (pos === -1) { // Record does not contain param
			console.log("⚠️  " + valueName + " not found in OA record.")
			return undefined
		}
		pos += valueName.length + 1
		const posOfNextDelimiter = record.indexOf(";", pos)
		var pos2 = posOfNextDelimiter == -1 ? record.length : posOfNextDelimiter // cause we may be at end
		const parsedValue = record.substr(pos, pos2 - pos)
		//
		return parsedValue
	}
	parsedDescription.address = parsed_paramValueWithName("recipient_address")
	parsedDescription.name = parsed_paramValueWithName("recipient_name")
	parsedDescription.tx_payment_id = parsed_paramValueWithName("tx_payment_id")
	parsedDescription.tx_description = parsed_paramValueWithName("tx_description")
	//
	return parsedDescription
}
exports.New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix = New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix
//
//
function DoesRecordHaveValidOpenAliasPrefix(
	record, 
	openAliasPrefix
)
{
	if (record.slice(0, 4 + openAliasPrefix.length + 1) !== "oa1:" + openAliasPrefix + " ") {
		return false
	}
	return true
}
exports.DoesRecordHaveValidOpenAliasPrefix = DoesRecordHaveValidOpenAliasPrefix