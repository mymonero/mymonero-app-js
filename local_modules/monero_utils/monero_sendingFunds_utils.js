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
const async = require('async')
//
const monero_config = require('./monero_config')
const monero_utils = require('./monero_cryptonote_utils_instance')
const monero_paymentID_utils = require('./monero_paymentID_utils')
const monero_openalias_utils = require('../OpenAlias/monero_openalias_utils')
//
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
//
//
// Fee calculation port from Monero baseline
// https://github.com/monero-project/monero/blob/master/src/wallet/wallet2.cpp
//
const APPROXIMATE_INPUT_BYTES = 80 // used to choose when to stop adding outputs to a tx
//
function calculate_fee(fee_per_kb_JSBigInt, numberOf_bytes, fee_multiplier)
{
	const numberOf_kB_JSBigInt = new JSBigInt((numberOf_bytes + 1023.0) / 1024.0)
	const fee = fee_per_kb_JSBigInt.multiply(fee_multiplier).multiply(numberOf_kB_JSBigInt)
	//
	return fee
}
//
//
// Fee estimation for SendFunds
//
function EstimatedTransaction_ringCT_networkFee(
	nonZero_mixin_int
)
{
	return EstimatedTransaction_networkFee(
		2, // this might change - might select inputs
		nonZero_mixin_int,
		3, // dest + change + mymonero fee
		true // to be sure
	)
}
exports.EstimatedTransaction_ringCT_networkFee = EstimatedTransaction_ringCT_networkFee
//
function EstimatedTransaction_networkFee(
	numberOf_inputs,
	nonZero_mixin_int,
	numberOf_outputs,
	doesUseRingCT_orTrue
)
{
	const doesUseRingCT = doesUseRingCT_orTrue === false ? false : true // default to true unless false
	const fee_per_kb_JSBigInt = monero_config.feePerKB_JSBigInt
	var estimated_txSize;
	if (doesUseRingCT) {
		estimated_txSize = EstimatedTransaction_ringCT_txSize(numberOf_inputs, nonZero_mixin_int, numberOf_outputs)
	} else {
		estimated_txSize = EstimatedTransaction_preRingCT_txSize(numberOf_inputs, nonZero_mixin_int)
	}
	const fee_multiplier = 1 // TODO: expose this
    const estimated_fee = calculate_fee(fee_per_kb_JSBigInt, estimated_txSize, fee_multiplier)
	//
	return estimated_fee
}
exports.EstimatedTransaction_networkFee = EstimatedTransaction_networkFee
//
function EstimatedTransaction_preRingCT_txSize(
	numberOf_inputs,
	nonZero_mixin_int
)
{
    const numberOf_fakeOuts = nonZero_mixin_int
    const size = numberOf_inputs * (numberOf_fakeOuts + 1) * APPROXIMATE_INPUT_BYTES //
	//
	return size
}
function EstimatedTransaction_ringCT_txSize(
	numberOf_inputs,
	mixin_int,
	numberOf_outputs
)
{
	var size = 0;
	// tx prefix
	// first few bytes
	size += 1 + 6;
	size += numberOf_inputs * (1+6+(mixin_int+1)*3+32); // original implementation is *2+32 but luigi1111 said change 2 to 3
	// vout
	size += numberOf_outputs * (6+32);
	// extra
	size += 40;
	// rct signatures
	// type
	size += 1;
	// rangeSigs
	size += (2*64*32+32+64*32) * numberOf_outputs;
	// MGs
	size += numberOf_inputs * (32 * (mixin_int+1) + 32);
	// mixRing - not serialized, can be reconstructed
	/* size += 2 * 32 * (mixin_int+1) * numberOf_inputs; */
	// pseudoOuts
	size += 32 * numberOf_inputs;
	// ecdhInfo
	size += 2 * 32 * numberOf_outputs;
	// outPk - only commitment is saved
	size += 32 * numberOf_outputs;
	// txnFee
	size += 4;
	// const logStr = `estimated rct tx size for ${numberOf_inputs} at mixin ${mixin_int} and ${numberOf_outputs} : ${size}  (${((32 * numberOf_inputs/*+1*/) + 2 * 32 * (mixin_int+1) * numberOf_inputs + 32 * numberOf_outputs)}) saved)`
	// console.log(logStr)

	return size;
}
//
//
// Actually sending funds
// 
function SendFunds(
	target_address, // currency-ready wallet address, but not an OA address (resolve before calling)
	amount, // number
	wallet__public_address,
	wallet__private_keys,
	wallet__public_keys,
	hostedMoneroAPIClient,
	mixin, 
	payment_id,
	success_fn,
	// success_fn: (
	//		moneroReady_targetDescription_address?,
	//		sentAmount?,
	//		final__payment_id?,
	//		tx_hash?,
	//		tx_fee?
	// )
	failWithErr_fn
	// failWithErr_fn: (
	//		err
	// )
)
{
	// arg sanitization
	mixin = parseInt(mixin)
	//
	// some callback trampoline function declarations…
	function __trampolineFor_success(
		moneroReady_targetDescription_address,
		sentAmount,
		final__payment_id,
		tx_hash,
		tx_fee
	)
	{
		success_fn(
			moneroReady_targetDescription_address,
			sentAmount,
			final__payment_id,
			tx_hash,
			tx_fee
		)
	}
	function __trampolineFor_err_withErr(err)
	{
		failWithErr_fn(err)
	}
	function __trampolineFor_err_withStr(errStr)
	{
		const err = new Error(errStr)
		console.error(errStr)
		failWithErr_fn(err)
	}
	// status: preparing to send funds…
	//
	// parse & normalize the target descriptions by mapping them to Monero addresses & amounts
	const targetDescription =
	{ 
		address: target_address, 
		amount: amount
	}
	new_moneroReadyTargetDescriptions_fromTargetDescriptions(
		[ targetDescription ], // requires a list of descriptions - but SendFunds was
		// not written with multiple target support as MyMonero does not yet support it
		function(err, moneroReady_targetDescriptions)
		{
			if (err) {
				__trampolineFor_err_withErr(err)
				return
			}
			const invalidOrZeroDestination_errStr = "You need to enter a valid destination"
			if (moneroReady_targetDescriptions.length === 0) {
				__trampolineFor_err_withStr(invalidOrZeroDestination_errStr)
				return
			}
			const moneroReady_targetDescription = moneroReady_targetDescriptions[0]
			if (typeof moneroReady_targetDescription === null || typeof moneroReady_targetDescription === 'undefined') {
				__trampolineFor_err_withStr(invalidOrZeroDestination_errStr)
				return
			}
			_proceedTo_prepareToSendFundsTo_moneroReady_targetDescription(moneroReady_targetDescription)
		}
	)
	function _proceedTo_prepareToSendFundsTo_moneroReady_targetDescription(moneroReady_targetDescription)
	{
		var moneroReady_targetDescription_address = moneroReady_targetDescription.address
		var moneroReady_targetDescription_amount = moneroReady_targetDescription.amount
		//
        var totalAmountWithoutFee_JSBigInt = (new JSBigInt(0)).add(moneroReady_targetDescription_amount)
        console.log("💬  Total to send, before fee: " + monero_utils.formatMoney(totalAmountWithoutFee_JSBigInt));
        if (totalAmountWithoutFee_JSBigInt.compare(0) <= 0) {
			const errStr = "The amount you've entered is too low"
			__trampolineFor_err_withStr(errStr)
            return
		}
		//
		// Derive/finalize some values…
		var final__payment_id = payment_id
        var final__pid_encrypt = false // we don't want to encrypt payment ID unless we find an integrated one
        var address__decode_result; 
		try {
			address__decode_result = monero_utils.decode_address(moneroReady_targetDescription_address)
		} catch (e) {
			__trampolineFor_err_withStr(typeof e === 'string' ? e : e.toString())
			return
		}
        if (address__decode_result.intPaymentId && payment_id) {
			const errStr = "Payment ID field must be blank when using an Integrated Address"
			__trampolineFor_err_withStr(errStr)
            return
        }
		if (address__decode_result.intPaymentId) {
            final__payment_id = address__decode_result.intPaymentId
            final__pid_encrypt = true // we do want to encrypt if using an integrated address
        }
		//
		// Validation
        if (monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(final__payment_id) === false) {
			const errStr = "The payment ID you've entered is not valid"
			__trampolineFor_err_withStr(errStr)
            return
        }
		//
		_proceedTo_getUnspentOutsUsableForMixin(
			moneroReady_targetDescription_address,
			totalAmountWithoutFee_JSBigInt,
			final__payment_id,
			final__pid_encrypt
		)
	}
	function _proceedTo_getUnspentOutsUsableForMixin(
		moneroReady_targetDescription_address,
		totalAmountWithoutFee_JSBigInt,
		final__payment_id, // non-existent or valid
		final__pid_encrypt // true or false
	)
	{
		hostedMoneroAPIClient.UnspentOuts(
			wallet__public_address,
			wallet__private_keys.view,
			wallet__public_keys.spend,
			wallet__private_keys.spend,
			mixin,
			function(
				err, 
				unspentOuts,
				unusedOuts
			)
			{
				if (err) {
					__trampolineFor_err_withErr(err)
					return
				}
				_proceedTo_constructFundTransferListAndSendFundsByUsingUnusedUnspentOutsForMixin(
					moneroReady_targetDescription_address,
					totalAmountWithoutFee_JSBigInt,
					final__payment_id,
					final__pid_encrypt,
					unusedOuts
				)
			}
		)
	}
    function _proceedTo_constructFundTransferListAndSendFundsByUsingUnusedUnspentOutsForMixin(
		moneroReady_targetDescription_address,
		totalAmountWithoutFee_JSBigInt,
		final__payment_id,
		final__pid_encrypt,
		unusedOuts
    ) 
	{
		// status: constructing transaction…
		const network_minimumFee = monero_config.feePerKB_JSBigInt // we're going to try using this but the codepath
		// has to be able to be re-entered if we find after constructing the whole tx that it is larger in kb
		// than the minimum fee we're attempting to send it off with
		__reenterable_constructFundTransferListAndSendFundsByUsingUnusedUnspentOutsForMixin_findingLowestNetworkFee(
			moneroReady_targetDescription_address,
			totalAmountWithoutFee_JSBigInt,
			final__payment_id,
			final__pid_encrypt,
			unusedOuts,
			network_minimumFee
		)
	}		
    function __reenterable_constructFundTransferListAndSendFundsByUsingUnusedUnspentOutsForMixin_findingLowestNetworkFee(
		moneroReady_targetDescription_address,
		totalAmountWithoutFee_JSBigInt,
		final__payment_id,
		final__pid_encrypt,
		unusedOuts,
		attemptAt_network_minimumFee
    ) 
	{
        // We need to establish some values for balance validation and to construct the transaction
		const hostingService_chargeAmount = hostedMoneroAPIClient.HostingServiceChargeFor_transactionWithNetworkFee(attemptAt_network_minimumFee)
        const totalAmountIncludingNetworkAndHostingService = totalAmountWithoutFee_JSBigInt.add(attemptAt_network_minimumFee).add(hostingService_chargeAmount)
        console.log("Balance required: " + monero_utils.formatMoneySymbol(totalAmountIncludingNetworkAndHostingService))
		//
		const usableOutputsAndAmounts = OutputsAndAmountToUseForMixin(
			totalAmountIncludingNetworkAndHostingService,
			unusedOuts
		)
		const usingOuts = usableOutputsAndAmounts.usingOuts
		const usingOutsAmount = usableOutputsAndAmounts.usingOutsAmount
		//
        // Now we can validate available balance with usingOutsAmount (TODO? maybe this check can be done before selecting outputs?)
		const usingOutsAmount_comparedTo_totalAmount = usingOutsAmount.compare(totalAmountIncludingNetworkAndHostingService)
        if (usingOutsAmount_comparedTo_totalAmount < 0) {
			__trampolineFor_err_withStr(
				"Not enough spendable outputs / balance too low (have: " 
				+ monero_utils.formatMoneyFull(usingOutsAmount) 
				+ " need: " 
				+ monero_utils.formatMoneyFull(totalAmountIncludingNetworkAndHostingService) 
				+ ")"
			)
            return
        }
		//
		//
		// Now we can put together the list of fund transfers we need to perform
		const fundTransferDescriptions = [] // to build…
		// I. the actual transaction the user is asking to do
		fundTransferDescriptions.push({ 
			address: moneroReady_targetDescription_address,
			amount: totalAmountWithoutFee_JSBigInt				
		})
		// II. the fee that the hosting provider charges
		fundTransferDescriptions.push({ 
            address: hostedMoneroAPIClient.HostingServiceFeeDepositAddress(),
            amount: hostingService_chargeAmount
		})
		// III. some amount of the total outputs will likely need to be returned to the user as "change":			
		if (usingOutsAmount_comparedTo_totalAmount > 0) {
            var changeAmount = usingOutsAmount.subtract(totalAmountIncludingNetworkAndHostingService)
			console.log("changeAmount" , changeAmount)
            // do not give ourselves change < dust threshold
            var changeAmountDivRem = changeAmount.divRem(monero_config.dustThreshold)
			console.log("💬  changeAmountDivRem", changeAmountDivRem)
            if (changeAmountDivRem[1].toString() !== "0") {
                // miners will add dusty change to fee
                console.log("💬  Miners will add change of " + monero_utils.formatMoneyFullSymbol(changeAmountDivRem[1]) + " to transaction fee (below dust threshold)")
            }
            if (changeAmountDivRem[0].toString() !== "0") {
                // send non-dusty change to our address
                var usableChange = changeAmountDivRem[0].multiply(monero_config.dustThreshold)
                console.log("💬  Sending change of " + monero_utils.formatMoneySymbol(usableChange) + " to " + wallet__public_address)
                fundTransferDescriptions.push({
                    address: wallet__public_address,
                    amount: usableChange
                })
            }
        }
		console.log("fundTransferDescriptions so far", fundTransferDescriptions)
		if (mixin < 0 || isNaN(mixin)) {
            __trampolineFor_err_withStr("Invalid mixin")
            return
        }
        if (mixin > 0) { // first, grab RandomOuts, then enter __createTx 
			hostedMoneroAPIClient.RandomOuts(
				usingOuts,
				mixin,
				function(err, amount_outs)
				{
					if (err) {
						__trampolineFor_err_withErr(err)
						return
					}
					__createTxAndAttemptToSend(amount_outs)
				}
			)
			return
        } else { // mixin === 0: -- PSNOTE: is that even allowed? 
            __createTxAndAttemptToSend()
		}
		function __createTxAndAttemptToSend(mix_outs)
		{
			const serializedSignedTx = __new_serializedSignedMoneroTx(
				mix_outs,
				attemptAt_network_minimumFee
			)
	        var tx_hash = monero_utils.cn_fast_hash(
				serializedSignedTx,
				serializedSignedTx.length / 2
			)
	        console.log("Tx hash: " + tx_hash)
			//
            // work out per-kb fee for transaction and verify that it's enough
            var prevFee = attemptAt_network_minimumFee
            var txBlobBytes = serializedSignedTx.length / 2
            var numKB = Math.floor(txBlobBytes / 1024)
            if (txBlobBytes % 1024) {
                numKB++
            }
            console.log(txBlobBytes + " bytes <= " + numKB + " KB (current fee: " + monero_utils.formatMoneyFull(prevFee) + ")")
            const feeActuallyNeededByNetwork = monero_config.feePerKB_JSBigInt.multiply(numKB)
            // if we need a higher fee
            if (feeActuallyNeededByNetwork.compare(prevFee) > 0) {
                console.log("💬  Need to reconstruct the tx with enough of a network fee. Previous fee: " + monero_utils.formatMoneyFull(prevFee) + " New fee: " + monero_utils.formatMoneyFull(feeActuallyNeededByNetwork))
				__reenterable_constructFundTransferListAndSendFundsByUsingUnusedUnspentOutsForMixin_findingLowestNetworkFee(
					moneroReady_targetDescription_address,
					totalAmountWithoutFee_JSBigInt,
					final__payment_id,
					final__pid_encrypt,
					unusedOuts,
					feeActuallyNeededByNetwork // we are re-entering this codepath after changing this feeActuallyNeededByNetwork
				)
				//
                return
            }
			//
            // generated with correct per-kb fee
			const final_networkFee = attemptAt_network_minimumFee // just to make things clear
			console.log("💬  Successful tx generation, submitting tx. Going with final_networkFee of ", final_networkFee)
			// status: submitting…
			hostedMoneroAPIClient.SubmitSerializedSignedTransaction(
				wallet__public_address,
				wallet__private_keys.view,
				serializedSignedTx,
				function(err)
				{
					if (err) {
						__trampolineFor_err_withStr("Something unexpected occurred when submitting your transaction:", err)
						return
					}
					const tx_fee = attemptAt_network_minimumFee.add(hostingService_chargeAmount)
					__trampolineFor_success(
						moneroReady_targetDescription_address,
						amount,
						final__payment_id,
						tx_hash,
						tx_fee
					) // 🎉
				}
			)
		}
        function __new_serializedSignedMoneroTx(
			mix_outs,
			networkFee
		)
		{ // Construct & serialize transaction
            var signedTx;
            try {
                console.log('Destinations: ')
                monero_utils.printDsts(fundTransferDescriptions)
				//
				var realDestViewKey // need to get viewkey for encrypting here, because of splitting and sorting
                if (final__pid_encrypt) {
                    realDestViewKey = monero_utils.decode_address(moneroReady_targetDescription_address).view
					console.log("got realDestViewKey" , realDestViewKey)
                }
                var splitDestinations = monero_utils.decompose_tx_destinations(fundTransferDescriptions)
                console.log('Decomposed destinations:')
                monero_utils.printDsts(splitDestinations)
				//
                signedTx = monero_utils.create_transaction(
					wallet__public_keys, 
					wallet__private_keys, 
					splitDestinations, 
					usingOuts, 
					mix_outs, 
					mixin, 
					networkFee, 
					final__payment_id, 
					final__pid_encrypt, 
					realDestViewKey, 
					0
				)
            } catch (e) {
                __trampolineFor_err_withStr("Failed to create transaction: ", e)
                return
            }
            console.log("signed tx: ", JSON.stringify(signedTx))
            var serialized_signedTx = monero_utils.serialize_tx(signedTx)
            console.log("tx serialized: " + serialized_signedTx)
            //
			return serialized_signedTx
        }
    }
}
exports.SendFunds = SendFunds
//
function new_moneroReadyTargetDescriptions_fromTargetDescriptions( 
	targetDescriptions,
	fn
) // fn: (err, moneroReady_targetDescriptions) -> Void
{ // parse & normalize the target descriptions by mapping them to currency (Monero)-ready addresses & amounts
	// some pure function declarations for the map we'll do on targetDescriptions
	async.mapSeries(
		targetDescriptions,
		function(targetDescription, cb)
		{
            if (!targetDescription.address && !targetDescription.amount) { // PSNote: is this check rigorous enough?
				const errStr = "Please supply a target address and a target amount."
				const err = new Error(errStr)
				cb(err)
				return
            }
			const targetDescription_address = targetDescription.address
			const targetDescription_amount = "" + targetDescription.amount // we are converting it to a string here because parseMoney expects a string
			// now verify/parse address and amount
            if (monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(targetDescription_address) == true) {
				throw "You must resolve this OA address to a Monero address before calling SendFunds"
            }
			// otherwise this should be a normal, single Monero public address
	        try {
	            monero_utils.decode_address(targetDescription_address) // verify that the address is valid
	        } catch (e) {
	            const errStr = "Couldn't decode address " + targetDescription_address + ": " + e
				const err = new Error(errStr)
				cb(err)
	            return
	        }
			// amount:
            var moneroReady_amountToSend; // possibly need this ; here for the JS parser
            try {
                moneroReady_amountToSend = monero_utils.parseMoney(targetDescription_amount)
            } catch (e) {
                const errStr = "Couldn't parse amount " + targetDescription_amount + ": " + e
				const err = new Error(errStr)
				cb(err)
                return
            }
	        cb(null, { 
	            address: targetDescription_address,
	            amount: moneroReady_amountToSend
	        })
		},
		function(err, moneroReady_targetDescriptions)
		{
			fn(err, moneroReady_targetDescriptions)
		}
	)
}
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