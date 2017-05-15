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

"use strict"
//
const mnemonic = require('../cryptonote_utils/mnemonic')
const monero_utils = require('./monero_cryptonote_utils_instance')
const monero_config = require('./monero_config')
//
//
////////////////////////////////////////////////////////////////////////////////
// Mnemonic wordset utilities - Exposing available names
//	
const wordsetNamesByWordsetName = {}
const allWordsetNames = Object.keys(mnemonic.mn_words)
for (let wordsetName of allWordsetNames) {
	wordsetNamesByWordsetName[wordsetName] = wordsetName
}
exports.WordsetNamesByWordsetName = wordsetNamesByWordsetName
exports.AllWordsetNames = allWordsetNames
//
//
////////////////////////////////////////////////////////////////////////////////
// Mnemonic wordset utilities - Wordset name detection by mnemonic contents
//	
function WordsetNameAccordingToMnemonicString(mnemonicString) // throws
{
	const mnemonicString_words = mnemonicString.split(' ')
	if (mnemonicString_words.length == 0) {
		throw "Invalid mnemonic"
	}
	var wholeMnemonicSuspectedAsWordsetNamed = null // to derive
	for (let mnemonicString_word of mnemonicString_words) {
		var thisWordIsInWordsetNamed = null // to derive
		for (let wordsetName of allWordsetNames) {
			if (wordsetName === 'electrum') {
				continue // skip because it conflicts with 'english'
			}
			const wordsetWords = mnemonic.mn_words[wordsetName].words
			if (wordsetWords.indexOf(mnemonicString_word) !== -1) {
				thisWordIsInWordsetNamed = wordsetName
				break // done looking
			}
			// haven't found it yet
		}
		if (thisWordIsInWordsetNamed === null) { // didn't find this word in any of the mnemonic wordsets
			throw "Unrecognized mnemonic language"
		}
		if (wholeMnemonicSuspectedAsWordsetNamed === null) { // haven't found it yet
			wholeMnemonicSuspectedAsWordsetNamed = thisWordIsInWordsetNamed 
		} else if (thisWordIsInWordsetNamed !== wholeMnemonicSuspectedAsWordsetNamed) {
			throw "Ambiguous mnemonic language" // multiple wordset names detected
		} else {
			// nothing to do but keep verifying the rest of the words that it's the same suspsected wordset
		}
	}
	if (wholeMnemonicSuspectedAsWordsetNamed === null) { // this might be redundant, but for logical rigor……
		throw "Unrecognized mnemonic language"
	}
	//
	return wholeMnemonicSuspectedAsWordsetNamed
}
exports.WordsetNameAccordingToMnemonicString = WordsetNameAccordingToMnemonicString
//
//
////////////////////////////////////////////////////////////////////////////////
// Mnemonic wordset utilities - By locale
//	
const mnemonicWordsetNamesByAppLocaleNames =
{
	English: "english",
	Japanese: "japanese",
	Spanish: "spanish",
	Portuguese: "portuguese"
	// NOTE: no support for 'electrum' wordset here
}
exports.MnemonicWordsetNamesByAppLocaleNames = mnemonicWordsetNamesByAppLocaleNames
//
exports.DefaultWalletMnemonicWordsetName = mnemonicWordsetNamesByAppLocaleNames.English
//
//
////////////////////////////////////////////////////////////////////////////////
// Wallet creation:
//	
function NewlyCreatedWallet(mnemonic_wordsetName)
{
	const seed = monero_utils.rand_16() // 128-bit/16-byte key -- comes out as 32 chars
	const mnemonicString = mnemonic.mn_encode(seed, mnemonic_wordsetName)
	const keys = monero_utils.create_address(seed)
	//
	return {
		seed: seed,
		mnemonicString: mnemonicString,
		keys: keys
	}
}
exports.NewlyCreatedWallet = NewlyCreatedWallet
//
//
////////////////////////////////////////////////////////////////////////////////
// Wallet login:
//	
function MnemonicStringFromSeed(account_seed, mnemonic_wordsetName)
{
	const mnemonicString = mnemonic.mn_encode(account_seed, mnemonic_wordsetName)
	//
	return mnemonicString
}
exports.MnemonicStringFromSeed = MnemonicStringFromSeed
//
function SeedAndKeysFromMnemonic_sync(mnemonicString, mnemonic_wordsetName)
{ // -> {err_str?, seed?, keys?}
	mnemonicString = mnemonicString.toLowerCase() || ""
	try {
		var seed = null
		var keys = null
		switch (mnemonic_wordsetName) {
			case 'english':
				try {
					seed = mnemonic.mn_decode(mnemonicString)
				} catch (e) {
					// Try decoding as an electrum seed, on failure throw the original exception
					try {
						seed = mnemonic.mn_decode(mnemonicString, "electrum")
					} catch (ee) {
						throw e 
					}
				}
				break
			default:
				seed = mnemonic.mn_decode(mnemonicString, mnemonic_wordsetName)
				break
		}
		if (seed === null) {
			return { err_str: "Unable to derive seed", seed: null, keys: null }
		}
		keys = monero_utils.create_address(seed)
		if (keys === null) {
			return { err_str: "Unable to derive keys from seed", seed: seed, keys: null }
		}
		return { err_str: null, seed: seed, keys: keys }
	} catch (e) {
		console.error("Invalid mnemonic!")
		return { err_str: typeof e === 'string' ? e : ""+e, seed: null, keys: null }
	}
}
exports.SeedAndKeysFromMnemonic_sync = SeedAndKeysFromMnemonic_sync

function SeedAndKeysFromMnemonic(mnemonicString, mnemonic_wordsetName, fn) // made available via callback not because it's async but for convenience
{ // fn: (err?, seed?, keys?)
	const payload = SeedAndKeysFromMnemonic_sync(mnemonicString, mnemonic_wordsetName)
	const err = payload.err_str ? new Error(payload.err_str) : null
	const seed = payload.seed
	const keys = payload.keys
	fn(err, seed, keys) 
}
exports.SeedAndKeysFromMnemonic = SeedAndKeysFromMnemonic
//
function VerifiedComponentsForLogIn_sync(
	address, 
	view_key, 
	spend_key_orUndefinedForViewOnly, 
	seed_orUndefined, 
	wasAGeneratedWallet
)
{
	var spend_key
	if (typeof spend_key_orUndefinedForViewOnly === 'undefined' && (typeof seed_orUndefined === 'undefined' || seed_orUndefined === '') && wasAGeneratedWallet === false) {
		spend_key = ''
	} else {
		spend_key = spend_key_orUndefinedForViewOnly
	}
	const isInViewOnlyMode = (spend_key === '')	
	if (!view_key || view_key.length !== 64 || (isInViewOnlyMode ? false : spend_key.length !== 64)) {
		return { err_str: "invalid secret key length" }
	}
	if (!monero_utils.valid_hex(view_key) || (isInViewOnlyMode ? false : !monero_utils.valid_hex(spend_key))) {
		return { err_str: "invalid hex formatting" }
	}
	var public_keys;
	try {
		public_keys = monero_utils.decode_address(address)
	} catch (e) {
		return { err_str: "invalid address" }
	}
	var expected_view_pub;
	try {
		expected_view_pub = monero_utils.sec_key_to_pub(view_key)
	} catch (e) {
		return { err_str: "invalid view key" }
	}
	var expected_spend_pub
	if (spend_key.length === 64) {
		try {
			expected_spend_pub = monero_utils.sec_key_to_pub(spend_key)
		} catch (e) {
			return { err_str: "invalid spend key" }
		}
	}
	if (public_keys.view !== expected_view_pub) {
		return { err_str: "invalid view key" }
	}
	if (!isInViewOnlyMode && (public_keys.spend !== expected_spend_pub)) {
		return { err_str: "invalid spend key" }
	}
	const private_keys =
	{
		view: view_key,
		spend: spend_key
	}
	var account_seed
	if (typeof seed_orUndefined !== 'undefined' && seed_orUndefined && seed_orUndefined.length != 0) {
		var expected_account;
		try {
			expected_account = monero_utils.create_address(seed_orUndefined)
		} catch (e) {
			return { err_str: "invalid seed" }
		}
		if (expected_account.view.sec !== view_key ||
			expected_account.spend.sec !== spend_key ||
			expected_account.public_addr !== address) {
			return { err_str: "invalid seed" }
		}
		account_seed = seed_orUndefined
	} else {
		account_seed = ''
	}
	const payload =
	{
		err_str: null, // err
		address: address,
		account_seed: account_seed,
		public_keys: public_keys,
		private_keys: private_keys,
		isInViewOnlyMode: isInViewOnlyMode
	}
	return payload
}
exports.VerifiedComponentsForLogIn_sync = VerifiedComponentsForLogIn_sync
//
function VerifiedComponentsForLogIn(
	address, 
	view_key, 
	spend_key_orUndefinedForViewOnly, 
	seed_orUndefined, 
	wasAGeneratedWallet,
	fn
)
{ // fn: (err?, address, account_seed, public_keys, private_keys, isInViewOnlyMode) -> Void
	const payload = VerifiedComponentsForLogIn_sync(
		address, 
		view_key, 
		spend_key_orUndefinedForViewOnly, 
		seed_orUndefined, 
		wasAGeneratedWallet
	)
	fn(
		payload.err_str ? new Error(payload.err_str) : null,
		payload.address,
		payload.account_seed,
		payload.public_keys,
		payload.private_keys,
		payload.isInViewOnlyMode
	)
}
exports.VerifiedComponentsForLogIn = VerifiedComponentsForLogIn