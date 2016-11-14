// Copyright (c) 2014-2016, MyMonero.com
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
const monero_config = require('../monero_utils/monero_config')
const monero_utils = require('../monero_utils/monero_cryptonote_utils_instance')
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
//
//
function IsValidPaymentIDOrNoPaymentID(payment_id)
{
	if (
		payment_id 
			&&
		(
			payment_id.length !== 64 
				|| 
			!(/^[0-9a-fA-F]{64}$/.test(payment_id))
		) 
			&& 
		payment_id.length !== 16
	) {
		return false
	}
	return true
}
exports.IsValidPaymentIDOrNoPaymentID = IsValidPaymentIDOrNoPaymentID
//
function OutputsAndAmountToUseForMixin(
	target_amount,
	unusedOuts
)
{
	function __randomIndex(list)
	{
		return Math.floor(Math.random() * list.length);
	}
	function _poppedRandomValueFromList(list)
	{
		var idx = __randomIndex(list)
		var val = list[idx]
		list.splice(idx, 1)
		//
		return val
	}
	console.log("Selecting outputs to use. target: " + monero_utils.formatMoney(target_amount))
	var toFinalize_usingOutsAmount = new JSBigInt(0)
	const toFinalize_usingOuts = []
	while (toFinalize_usingOutsAmount.compare(target_amount) < 0 && unusedOuts.length > 0) {
		var out = _poppedRandomValueFromList(unusedOuts)
		const out_amount = out.amount
		toFinalize_usingOuts.push(out)
		toFinalize_usingOutsAmount = toFinalize_usingOutsAmount.add(out_amount)
		console.log(
			"Using output: "
			+ monero_utils.formatMoney(out_amount) 
			+ " - " 
			+ JSON.stringify(out)
		)
	}
	//
	return {
		usingOuts: toFinalize_usingOuts,
		usingOutsAmount: toFinalize_usingOutsAmount
	}
}
exports.OutputsAndAmountToUseForMixin = OutputsAndAmountToUseForMixin