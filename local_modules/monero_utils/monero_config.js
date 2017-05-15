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
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
//
module.exports = 
{
	// Number of atomic units in one unit of currency. e.g. 12 => 10^12 = 1000000000000
	coinUnitPlaces: 12,

	// Minimum number of confirmations for a transaction to show as confirmed
	txMinConfirms: 10,

	// Currency symbol
	coinSymbol: 'XMR',

	// OpenAlias prefix
	openAliasPrefix: "xmr",

	// Currency name
	coinName: 'Monero',

	// Payment URI Prefix
	coinUriPrefix: 'monero:',

	// Prefix code for addresses
	addressPrefix: 18, // 18 => addresses start with "4"
	integratedAddressPrefix: 19,

	// Network per kb fee in atomic units
	feePerKB_JSBigInt: new JSBigInt('2000000000'), // 0.002

	// Dust threshold in atomic units
	// 10^10 used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	dustThreshold: new JSBigInt('10000000000'),
	
	// Maximum block number, used for tx unlock time
	maxBlockNumber: 500000000,

	// Average block time in seconds, used for unlock time estimation
	avgBlockTime: 60
}