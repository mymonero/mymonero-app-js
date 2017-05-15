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
const EventEmitter = require('events')
const extend = require('util')._extend
//
const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
const monero_txParsing_utils = require('../../monero_utils/monero_txParsing_utils')
const monero_sendingFunds_utils = require('../../monero_utils/monero_sendingFunds_utils')
const monero_wallet_locale = require('../../monero_utils/monero_wallet_locale')
const JSBigInt = require('../../cryptonote_utils/biginteger').BigInteger
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
//
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const wallet_persistence_utils = require('./wallet_persistence_utils')
const WalletHostPollingController = require('../Controllers/WalletHostPollingController')
//
const wallet_currencies =
{
	xmr: 'xmr'
}
const humanReadable__wallet_currencies =
{
	xmr: 'XMR'
}
//
// Shared utility functions (these can be factored out)
function areObjectsEqual(x, y)
{
	if ( x === y ) return true;
	if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
	if ( x.constructor !== y.constructor ) return false;
	for ( var p in x ) {
		if ( ! x.hasOwnProperty( p ) ) continue;
		if ( ! y.hasOwnProperty( p ) ) return false;
		if ( x[ p ] === y[ p ] ) continue;
		if ( typeof( x[ p ] ) !== "object" ) return false;
		if ( ! areObjectsEqual( x[ p ],  y[ p ] ) ) return false;
	}
	for ( p in y ) {
		if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
	}
	return true;
}
//
//
class Wallet extends EventEmitter
{

	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Init -> setup
	// Important: You must manually call one of the 'Boot_' methods after you initialize

	constructor(options, context)
	{
		super() // must call super before we can access this
		//
		var self = this
		self.options = options
		self.context = context
		//
		// initialization state
		self._id = self.options._id || null // initialize to null if creating wallet
		self.failedToInitialize_cb = function(err)
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when failure cb called
			{
				self.didFailToInitialize_flag = true
				self.didFailToInitialize_errOrNil = err
			}
			setTimeout(function()
			{
				const fn = self.options.failedToInitialize_cb || function(err, walletInstance) {}
				fn(err, self)
			})
		}
		self.successfullyInitialized_cb = function()
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when success cb called
			setTimeout(function()
			{
				const fn = self.options.successfullyInitialized_cb || function(walletInstance) {}
				fn(self)
			})
		}
		//
		// runtime state initialization
		self.isBooted = false // you must manually boot the instance
		self.isLoggingIn = false
		self.isLoggedIn = true // maybe modified by existing doc
		//
		// detecting how to set up instance
		if (self._id !== null) { // need to look up existing document but do not decrypt & boot
			self.__setup_fetchExistingDoc_andAwaitBoot()
		} else {
			self.__setup_andAwaitBootAndLogInAndDocumentCreation()
		}
	}
	__setup_fetchExistingDoc_andAwaitBoot()
	{
		const self = this
		self.context.persister.DocumentsWithIds(
			wallet_persistence_utils.CollectionName,
			[ self._id ], // cause we're saying we have an _id passed in…
			function(err, docs)
			{
				if (err) {
					console.error("err.message:", err.message)
					self.failedToInitialize_cb(err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  Wallet with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					self.failedToInitialize_cb(err)
					return
				}
				const encryptedDocument = docs[0]
				//
				// we can pull out unencrypted values like metadata
				wallet_persistence_utils.HydrateInstance_withUnencryptedValues(
					self,
					encryptedDocument
				)
				// Validation of necessary non-encrypted values
				function _failWithValidationErr(errStr)
				{
					const err = new Error(errStr)
					console.error(errStr)
					self.failedToInitialize_cb(err)
				}
				if (self.isLoggedIn !== true) {
					return _failWithValidationErr("Reconstituted wallet had non-true isLoggedIn") // TODO: not sure how we should handle this yet. maybe login failed while adding the wallet?
				}
				//
				// and we hang onto this for when the instantiator opts to boot the instance
				self.initialization_encryptedDocument = encryptedDocument
				self.successfullyInitialized_cb()
			}
		)
	}
	__setup_andAwaitBootAndLogInAndDocumentCreation()
	{
		const self = this
		//
		// need to create new document. gather metadata & state we need to do so
		self.isLoggedIn = false
		self.wallet_currency = self.options.wallet_currency || wallet_currencies.xmr // default
		self.context.locale.Locale(function(err, currentLocale)
		{
			if (err) {
				console.error("Error obtaining locale.")
				self.failedToInitialize_cb(err)
				throw err
			}
			self.mnemonic_wordsetName = monero_wallet_locale.MnemonicWordsetNameWithLocale(currentLocale) // will default to english if no match
			//
			// NOTE: the wallet needs to be imported to the hosted API (e.g. MyMonero) for the hosted API stuff to work
			// case I: user is inputting mnemonic string
			// case II: user is inputting address + view & spend keys
			// case III: we're creating a new wallet
			if (self.options.generateNewWallet === true) { // generate new mnemonic seed -- we will pick this up later in the corresponding Boot_*
				self.generatedOnInit_walletDescription = monero_wallet_utils.NewlyCreatedWallet(self.mnemonic_wordsetName)
			}
			//
			// First, for now, pre-boot, we'll simply await boot - no need to create a document yet
			self.successfullyInitialized_cb()
		})
	}

	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Teardown
	// Important: You must manually call TearDown() based on how you retain self
	
	TearDown()
	{
		const self = this
		self.hasBeenTornDown = true
		console.log("♻️  Tearing down Wallet", self._id)
		self._tearDown_polling()
	}
	_tearDown_polling()
	{
		const self = this
		if (typeof self.hostPollingController !== 'undefined' && self.hostPollingController !== null) {
			self.hostPollingController.TearDown()
			self.hostPollingController = null
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime (Post init, pre-boot) - Accessors - Public - Creating new wallets

	MnemonicStringWhichWasGeneratedOnInit()
	{
		return self.generatedOnInit_walletDescription.mnemonicString
	}
	// TODO: there may be room for a 'regenerate mnemonic' with new wordset imperative function


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Booting - Creating/adding wallets

	Boot_byLoggingIn_givenNewlyCreatedWallet(
		persistencePassword,
		walletLabel,
		swatch,
		fn
	)
	{ // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
		// confirmation_cb: (userConfirmed_mnemonicString) -> Void
		// fn: (err?) -> Void
		//
		// To use this function, you must supply a informingAndVerifyingMnemonic_cb.
		// Your supplied cb will be called with the generated mnemonicString and another
		// _cb, which you must call after you get the user to confirm their mnemonicString.
		// This function will proceed to verify the confirmation mnemonic string and
		// then log into the hosted node server to create an account
		//
		const self = this
		//		
		self.persistencePassword = persistencePassword || null
		if (self.persistencePassword === null) {
			throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
		}
		self.walletLabel = walletLabel || ""
		self.swatch = swatch || ""
		//
		const generatedOnInit_walletDescription = self.generatedOnInit_walletDescription
		const seed = generatedOnInit_walletDescription.seed
		const mnemonicString = generatedOnInit_walletDescription.mnemonicString
		const keys = generatedOnInit_walletDescription.keys
		//
		// pretty sure this is redundant, so commenting:
		const address = keys.public_addr
		const view_key__private = keys.view.sec
		const spend_key__private = keys.spend.sec
		const wasAGeneratedWallet = true // true, in this case
		//
		self._boot_byLoggingIn(
			address,
			view_key__private,
			spend_key__private,
			seed,
			wasAGeneratedWallet,
			fn
		)
	}
	Boot_byLoggingIn_existingWallet_withMnemonic(
		persistencePassword,
		walletLabel,
		swatch,
		mnemonicString,
		fn
	)
	{ // fn: (err?) -> Void
		const self = this
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
		}
		//
		self.walletLabel = walletLabel || ""
		self.swatch = swatch || ""
		//
		// TODO: remove wordset name from this function signature and autodetect the wordset based on checking the presence of all the words in a given wordset.
		// error if wordset comparison issue		
		try {
			self.mnemonic_wordsetName = monero_wallet_utils.WordsetNameAccordingToMnemonicString(mnemonicString)
		} catch (e) {
			console.error("Error while detecting mnemonic wordset from mnemonic string: ", e)
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, e)
			return
		}
		//
		// We're not going to set self.mnemonicString here because we re-derive it from seed in _trampolineFor_successfullyBooted
		//
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonicString,
			self.mnemonic_wordsetName,
			function(err, seed, keys)
			{
				if (err) {
					self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
					return
				}
				// console.log("keys" , keys)
				const address = keys.public_addr
				const view_key__private = keys.view.sec
				const spend_key__private = keys.spend.sec
				const wasAGeneratedWallet = false
				self._boot_byLoggingIn(
					address,
					view_key__private,
					spend_key__private,
					seed,
					wasAGeneratedWallet,
					fn
				)
			}
		)
	}
	Boot_byLoggingIn_existingWallet_withAddressAndKeys(
		persistencePassword,
		walletLabel,
		swatch,
		address,
		view_key__private,
		spend_key__private,
		fn // (err?) -> Void
	)
	{
		const self = this
		{
			self.persistencePassword = persistencePassword || null
			if (persistencePassword === null) {
				throw "You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
			}
		}
		{
			self.walletLabel = walletLabel || ""
			self.swatch = swatch || ""
		}
		{
			const seed = undefined
			const wasAGeneratedWallet = false
			self._boot_byLoggingIn(
				address,
				view_key__private,
				spend_key__private,
				seed, // seed
				wasAGeneratedWallet,
				fn
			)
		}
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Booting - Reading saved wallets

	Boot_decryptingExistingInitDoc(
		persistencePassword,
		fn
	)
	{
		const self = this
		const document_cryptor__background = self.context.document_cryptor__background
		// TODO: move this function's contents to wallet_persistence_utils?
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of Wallet"
			const err = new Error(errStr)
			console.error(errStr)
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			return
		}
		//
		const encryptedDocument = self.initialization_encryptedDocument
		if (typeof encryptedDocument === 'undefined' || encryptedDocument === null) {
			const errStr = "__boot_decryptInitDoc_andBoot called but encryptedDocument undefined"
			const err = new Error(err)
			self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			return
		}
		//
		__proceedTo_decryptDocument(encryptedDocument)
		//
		function __proceedTo_decryptDocument(encryptedDocument)
		{
			document_cryptor__background.New_DecryptedDocument__Async(
				encryptedDocument,
				wallet_persistence_utils.DocumentCryptScheme,
				self.persistencePassword,
				function(err, plaintextDocument)
				{
					if (err) {
						console.error("❌  Decryption err: " + err.toString())
						self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
						return
					}
					self.initialization_encryptedDocument = null // now we can free this
					//
					__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
				}
			)
		}
		function __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		{ // reconstituting state…
			wallet_persistence_utils.HydrateInstance_withDecryptedValues(
				self,
				plaintextDocument
			)
			__proceedTo_validateEncryptedValuesHydration()
		}
		function __proceedTo_validateEncryptedValuesHydration()
		{
			function _failWithValidationErr(errStr)
			{
				const err = new Error(errStr)
				console.error(errStr)
				self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
			}
			if (self.walletLabel === null || typeof self.walletLabel === 'undefined' || self.walletLabel === "") {
				return _failWithValidationErr("Reconstituted wallet had no valid self.walletLabel")
			}
			if (self.wallet_currency === null || typeof self.wallet_currency === 'undefined' || self.wallet_currency === "") {
				return _failWithValidationErr("Reconstituted wallet had no valid self.wallet_currency")
			}
			// We are not going to check whether the acct seed is nil/'' here because if the wallet was
			// imported with public addr, view key, and spend key only rather than seed/mnemonic, we
			// cannot obtain the seed.
			if (self.public_address === null || typeof self.public_address === 'undefined' || self.public_address === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_address")
			}
			if (self.public_keys === null || typeof self.public_keys === 'undefined' || self.public_keys === {}) {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys")
			}
			if (self.public_keys.view === null || typeof self.public_keys.view === 'undefined' || self.public_keys.view === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys.view")
			}
			if (self.public_keys.spend === null || typeof self.public_keys.spend === 'undefined' || self.public_keys.spend === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid public_keys.spend")
			}
			if (self.private_keys === null || typeof self.private_keys === 'undefined' || self.private_keys === {}) {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys")
			}
			if (self.private_keys.view === null || typeof self.private_keys.view === 'undefined' || self.private_keys.view === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys.view")
			}
			if (self.private_keys.spend === null || typeof self.private_keys.spend === 'undefined' || self.private_keys.spend === '') {
				return _failWithValidationErr("Reconstituted wallet had no valid private_keys.spend")
			}
			//
			// finally
			self._trampolineFor_successfullyBooted(fn)
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Booting

	__trampolineFor_failedToBootWith_fnAndErr(fn, err)
	{
		const self = this
		{
			self.didFailToBoot_flag = true
			self.didFailToBoot_errOrNil = err
		}
		fn(err)
	}

	_boot_byLoggingIn(
		address,
		view_key,
		spend_key_orUndefinedForViewOnly,
		seed_orUndefined,
		wasAGeneratedWallet,
		fn
	)
	{
		const self = this
		//
		self.isLoggingIn = true
		//
		monero_wallet_utils.VerifiedComponentsForLogIn(
			address,
			view_key,
			spend_key_orUndefinedForViewOnly,
			seed_orUndefined,
			wasAGeneratedWallet,
			function(
				err,
				address,
				account_seed,
				public_keys,
				private_keys,
				isInViewOnlyMode
			)
			{
				if (err) {
					self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
					return
				}
				__proceedTo_loginViaHostedAPI(
					account_seed,
					public_keys,
					private_keys,
					isInViewOnlyMode
				)
			}
		)
		function __proceedTo_loginViaHostedAPI(
			account_seed,  // these arguments only get passed through
			public_keys,  // so they can be set in one place below
			private_keys,
			isInViewOnlyMode
		)
		{
			self.context.hostedMoneroAPIClient.LogIn(
				address,
				view_key,
				function(err, new_address)
				{
					if (err) {
						self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
						return
					}
					self.public_address = address
					self.account_seed = account_seed
					self.public_keys = public_keys
					self.private_keys = private_keys
					self.isInViewOnlyMode = isInViewOnlyMode
					//
					self.isLoggingIn = false
					self.isLoggedIn = true
					//
					const shouldDisplayImportAccountOption = !wasAGeneratedWallet && new_address
					self.shouldDisplayImportAccountOption = shouldDisplayImportAccountOption
					//
					self.saveToDisk(
						function(err)
						{
							if (err) {
								self.__trampolineFor_failedToBootWith_fnAndErr(fn, err)
								return
							}
							self._trampolineFor_successfullyBooted(fn)
						}
					)
				}
			)
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Events - Booting

	EventName_booted()
	{
		return "EventName_booted"
	}
	EventName_errorWhileBooting()
	{
		return "EventName_errorWhileBooting"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Events - Updates

	EventName_walletLabelChanged()
	{
		return "EventName_walletLabelChanged"
	}
	EventName_walletSwatchChanged()
	{
		return "EventName_walletSwatchChanged"
	}
	EventName_balanceChanged()
	{
		return "EventName_balanceChanged"
	}
	EventName_spentOutputsChanged()
	{
		return "EventName_spentOutputsChanged"
	}
	EventName_heightsUpdated()
	{
		return "EventName_heightsUpdated"
	}
	EventName_transactionsChanged()
	{
		return "EventName_transactionsChanged"
	}
	EventName_transactionsAdded()
	{
		return "EventName_transactionsAdded"
	}
	//
	EventName_willBeDeleted()
	{
		return "EventName_willBeDeleted"
	}
	EventName_deleted()
	{
		return "EventName_deleted"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Wallet properties
	
	HasEverFetched_accountInfo()
	{ // semantically, accountInfo here actually excludes the address, keys, mnemonic, …
		// and mostly means stuff like totals (balances) and heights… but we keep accountInfo
		// cause of the endpoint name
		const self = this
		if (typeof self.dateThatLast_fetchedAccountInfo === 'undefined') {
			return false
		}
		if (self.dateThatLast_fetchedAccountInfo === null) {
			return false
		}
		//
		return true
	}
	HasEverFetched_transactions()
	{
		const self = this
		if (typeof self.dateThatLast_fetchedAccountTransactions === 'undefined') {
			return false
		}
		if (self.dateThatLast_fetchedAccountTransactions === null) {
			return false
		}
		//
		return true
	}
	IsScannerCatchingUp()
	{
		const self = this
		if (self.blockchain_height == 0 || typeof self.blockchain_height == 'undefined' || self.blockchain_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 blockchain_height")
			return true
		}
		if (self.account_scanned_block_height == 0 || typeof self.account_scanned_block_height === 'undefined' || self.account_scanned_block_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 account_scanned_block_height.")
			return true
		}
		const nBlocksBehind = self.blockchain_height - self.account_scanned_block_height
		if (nBlocksBehind >= 10) {
			return true
		} else if (nBlocksBehind < 0) {
			throw "nBlocksBehind < 0" // maybe replace with warn log
			// return false 
		}
		return false
	}
	NBlocksBehind()
	{
		const self = this
		if (self.blockchain_height == 0 || typeof self.blockchain_height == 'undefined' || self.blockchain_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 blockchain_height")
			return 0
		}
		if (self.account_scanned_block_height == 0 || typeof self.account_scanned_block_height === 'undefined' || self.account_scanned_block_height == null) {
			console.warn("IsScannerCatchingUp() called while nil/0 account_scanned_block_height.")
			return 0
		}
		const nBlocksBehind = self.blockchain_height - self.account_scanned_block_height
		return nBlocksBehind
	}
	CatchingUpPercentageFloat() // btn 0 and 1.0
	{
		const self = this
		if (self.account_scanned_height == 0 || typeof self.account_scanned_height === 'undefined' || self.account_scanned_height === null) {
			throw "CatchingUpPercentageFloat() requested but self.account_scanned_height still 0" // maybe replace with warn log
			// return 0
		} else if (self.transaction_height == 0 || typeof self.transaction_height === 'undefined' || self.transaction_height === null) {
			throw "CatchingUpPercentageFloat() requested but self.transaction_height still 0" // maybe replace with warn log
			// return 0
		}
		const pctFloat = self.account_scanned_height / self.transaction_height
		console.log(`CatchingUpPercentageFloat ${self.account_scanned_height}/${self.transaction_height}=${pctFloat.toFixed(2)}%`)
		return pctFloat
	}
	
	IsTransactionConfirmed(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.IsTransactionConfirmed(tx, blockchain_height)
	}
	IsTransactionUnlocked(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.IsTransactionUnlocked(tx, blockchain_height)
	}
	TransactionLockedReason(tx)
	{
		const self = this
		const blockchain_height = self.blockchain_height
		//
		return monero_txParsing_utils.TransactionLockedReason(tx, blockchain_height)
	}
	//
	New_StateCachedTransactions()
	{	// this function is preferred for public access
		// as it caches the derivations of the above accessors.
		// these things could maybe be derived on reception from API instead of on each access
		const self = this
		const transactions = self.transactions || []
		const stateCachedTransactions = [] // to finalize
		const transactions_length = transactions.length
		for (let i = 0 ; i < transactions_length ; i++) {
			const transaction = transactions[i]
			const shallowCopyOf_transaction = extend({}, transaction)
			shallowCopyOf_transaction.isConfirmed = self.IsTransactionConfirmed(transaction)
			shallowCopyOf_transaction.isUnlocked = self.IsTransactionUnlocked(transaction)
			shallowCopyOf_transaction.lockedReason = self.TransactionLockedReason(transaction)
			//
			stateCachedTransactions.push(shallowCopyOf_transaction)
		}
		//
		return stateCachedTransactions
	}
	//
	IsAccountCatchingUp()
	{
		const self = this
		// TODO: detect whether account is synched yet
		//
		return (self.blockchain_height - self.account_scanned_block_height) >= 10
	}
	//
	Balance_FormattedString()
	{
		const self = this
		var total_received = self.total_received
		var total_sent = self.total_sent
		if (typeof total_received === 'undefined') {
			total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
		}
		if (typeof total_sent === 'undefined') {
			total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
		}
		const balance_JSBigInt = total_received.subtract(total_sent)
		//
		return monero_utils.formatMoney(balance_JSBigInt)
	}
	LockedBalance_FormattedString()
	{
		const self = this
		var locked_balance_JSBigInt = self.locked_balance
		if (typeof locked_balance_JSBigInt === 'undefined') {
			locked_balance_JSBigInt = new JSBigInt(0)
		}
		//
		return monero_utils.formatMoney(locked_balance_JSBigInt)
	}
	HasLockedFunds()
	{
		const self = this
		var locked_balance_JSBigInt = self.locked_balance
		if (typeof locked_balance_JSBigInt === 'undefined') {
			return false
		}
		if (locked_balance_JSBigInt === new JSBigInt(0)) {
			return false
		}
		//
		return true
	}
	HumanReadable_walletCurrency()
	{
		const self = this
		var wallet_currency = self.wallet_currency
		if (typeof wallet_currency === 'undefined') {
			console.error("HumanReadable_walletCurrency called while self.wallet_currency was nil, which shouldn't happen")
			console.trace()
			return ''
		}
		//
		return humanReadable__wallet_currencies[wallet_currency] // declared outside of class 
	}
	Description()
	{
		const self = this
		//
		return "Wallet with _id " + self._id + " named " + self.walletLabel + ", Balance:" + self.Balance_FormattedString()
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Sending funds

	SendFunds(
		target_address, // currency-ready wallet address, but not an OpenAlias address (resolve before calling)
		amount, // number
		mixin,
		payment_id,
		fn
		// fn: (
		//		err?,
		//		currencyReady_targetDescription_address?,
		//		sentAmount?,
		//		targetDescription_domain_orNone?,
		//		final__payment_id?,
		//		tx_hash?,
		//		tx_fee?
		// )
	)
	{
		const self = this
		// state-lock the function
		if (self.isSendingFunds === true) {
			const errStr = "Currently already sending funds. Please try again when complete."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		self.isSendingFunds = true
		//
		// now that we've done that, we can ask the user idle controller to disable user idle until we're done with this - cause it's not something we want to have interrupted by the user idle controller tearing everything down!!
		self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
		if (self.context.Cordova_isMobile === true) {
			window.plugins.insomnia.keepAwake() // disable screen dim/off
		}
		//
		// some callback trampoline function declarations…
		// these are important for resetting self's state,
		// which is done in ___aTrampolineForFnWasCalled below
		function __trampolineFor_success(
			currencyReady_targetDescription_address,
			sentAmount,
			targetDescription_domain_orNone,
			final__payment_id,
			tx_hash,
			tx_fee
		)
		{
			___aTrampolineForFnWasCalled()
			//
			console.log("✅  Successfully sent funds.")
			//
			fn(
				null,
				currencyReady_targetDescription_address,
				sentAmount,
				targetDescription_domain_orNone,
				final__payment_id,
				tx_hash,
				tx_fee
			)
		}
		function __trampolineFor_err_withErr(err)
		{
			___aTrampolineForFnWasCalled()
			//
			console.error(err)
			fn(err)
		}
		function __trampolineFor_err_withStr(errStr)
		{
			__trampolineFor_err_withErr(new Error(errStr))
		}
		function ___aTrampolineForFnWasCalled()
		{ // private - no need to call this yourself unless you're writing a trampoline function
			// Note: This function is to be called before you call fn() anywhere - so we can do critical things like unlocking this method and re-enabling user idle
			self.isSendingFunds = false
			//
			// critical to do on every exit from this method
			self.context.userIdleInWindowController.ReEnable_userIdle()
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.allowSleepAgain() // re-enable screen dim/off
			}
		}
		//
		monero_sendingFunds_utils.SendFunds(
			true, // isRingCT
			target_address,
			amount,
			self.public_address,
			self.private_keys,
			self.public_keys,
			self.context.hostedMoneroAPIClient,
			mixin,
			payment_id,
			__trampolineFor_success,
			__trampolineFor_err_withErr
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Persistence

	saveToDisk(fn)
	{
		const self = this
		if (self.hasBeenTornDown) {
			console.warn("Wallet asked to saveToDisk after having been torn down.")
			console.warn((new Error()).stack)
			return
		}
		wallet_persistence_utils.SaveToDisk(
			self,
			fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deletion

	Delete(
		fn // (err?) -> Void
	)
	{
		const self = this
		self.emit(self.EventName_willBeDeleted(), self._id)
		wallet_persistence_utils.DeleteFromDisk(
			self,
			function(err) {
				if (err) {
					fn(err)
					return
				}
				self.emit(self.EventName_deleted(), self._id)
				fn()
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password

	ChangePasswordTo(
		changeTo_persistencePassword,
		fn
	)
	{
		const self = this
		console.log("Wallet changing password.")
		const old_persistencePassword = self.persistencePassword
		self.persistencePassword = changeTo_persistencePassword
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to change password with error", err)
					self.persistencePassword = old_persistencePassword // revert
				} else {
					console.log("Successfully changed password.")
				}
				fn(err)
			}
		)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing meta data

	Set_valuesByKey(
		valuesByKey, // keys like "walletLabel", "swatch"
		fn // (err?) -> Void
	)
	{
		const self = this
		const valueKeys = Object.keys(valuesByKey)
		var didUpdate_walletLabel = false
		var didUpdate_swatch = false
		for (let valueKey of valueKeys) {
			const value = valuesByKey[valueKey]
			{ // validate / mark as updated for yield later
				if (valueKey === "walletLabel") {
					if (typeof value === 'undefined' || value === null || value.length < 1) {
						return fn(new Error("Please enter a wallet name"))
					}
					didUpdate_walletLabel = true
				} else if (valueKey === "swatch") {
					if (typeof value === 'undefined' || value === null || value.length < 1) {
						return fn(new Error("Please select a wallet color."))
					}
					didUpdate_swatch = true
				}
			}
			{ // set
				self[valueKey] = value
			}
		}
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new valuesByKey", err)
				} else {
					console.log("📝  Successfully saved " + self.constructor.name + " update ", JSON.stringify(valuesByKey))
					if (didUpdate_walletLabel) {
						self.emit(self.EventName_walletLabelChanged(), self.walletLabel)
					}
					if (didUpdate_swatch) {
						self.emit(self.EventName_walletSwatchChanged(), self.swatch)
					}
				}
				fn(err)
			}
		)
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - Booting

	_trampolineFor_successfullyBooted(
		fn
	)
	{ // fn: (err?) -> Void
		const self = this
		{
			if (typeof self.account_seed === 'undefined' || self.account_seed === null || self.account_seed.length < 1) {
				console.warn("⚠️  Wallet initialized without an account_seed.")
				self.wasInitializedWith_addrViewAndSpendKeysInsteadOfSeed = true
			} else {
				self.mnemonicString = monero_wallet_utils.MnemonicStringFromSeed(self.account_seed, self.mnemonic_wordsetName)
			}
		}
		// console.info("✅  Successfully instantiated", self.Description())
		{
			self.isBooted = true
		}
		{ // ensure we call the callback
			fn() 
		}
		{
			self._atRuntime_setup_hostPollingController() // instantiate (and kick off) polling controller
		}
	}
	_atRuntime_setup_hostPollingController()
	{ 
		const self = this
		let options = { wallet: self }
		let context = self.context
		self.hostPollingController = new WalletHostPollingController(options, context)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - WalletHostPollingController delegation fns

	_WalletHostPollingController_didFetch_accountInfo(
		total_received_JSBigInt,
		locked_balance_JSBigInt,
		total_sent_JSBigInt,
		spent_outputs,
		account_scanned_tx_height,
		account_scanned_block_height,
		account_scan_start_height,
		transaction_height,
		blockchain_height
	)
	{
		const self = this
		// console.log("_didFetchTransactionHistory")
		//
		// JSBigInts
		var accountBalance_didActuallyChange = false
		var existing_total_received = self.total_received || new JSBigInt(0)
		var existing_total_sent = self.total_sent || new JSBigInt(0)
		var existing_locked_balance = self.locked_balance || new JSBigInt(0)
		function isExistingBigIntDifferentFrom(existingValue, newValue)
		{
			if (typeof existingValue === 'undefined' || existingValue === null || typeof existingValue !== 'object') { // let's always broadcast-as-diff receiving a newValue when existingValue is undefined, null, or non JSBigInts
				return true
			} // now we presume it's a JSBigInt…
			if (existingValue.compare(newValue) != 0) {
				return true
			}
			return false
		}
		if (isExistingBigIntDifferentFrom(existing_total_received, total_received_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		if (isExistingBigIntDifferentFrom(existing_total_sent, total_sent_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		if (isExistingBigIntDifferentFrom(existing_locked_balance, locked_balance_JSBigInt) === true) {
			accountBalance_didActuallyChange = true
		}
		self.total_received = total_received_JSBigInt
		self.total_sent = total_sent_JSBigInt
		self.locked_balance = locked_balance_JSBigInt
		//
		// outputs
		// TODO: diff spent_outputs
		var spentOutputs_didActuallyChange = false
		const existing_spent_outputs = self.spent_outputs
		if (typeof existing_spent_outputs === 'undefined' || existing_spent_outputs === null || areObjectsEqual(spent_outputs, existing_spent_outputs) === false) {
			spentOutputs_didActuallyChange = true
		}
		self.spent_outputs = spent_outputs
		//
		// heights
		var heights_didActuallyChange = false
		// TODO: should this actually be account_scanned_height? can we remove account_scanned_tx_height?
		if (account_scanned_tx_height !== self.account_scanned_tx_height) {
			heights_didActuallyChange = true
			self.account_scanned_tx_height = account_scanned_tx_height
		}
		if (account_scanned_block_height !== self.account_scanned_block_height) {
			heights_didActuallyChange = true
			self.account_scanned_block_height = account_scanned_block_height
		}
		if (account_scan_start_height !== self.account_scan_start_height) {
			heights_didActuallyChange = true
			self.account_scan_start_height = account_scan_start_height
		}
		// NOTE: the following change even when we do not do/get any txs
		if (transaction_height !== self.transaction_height) {
			heights_didActuallyChange = true
			self.transaction_height = transaction_height
		}
		if (blockchain_height !== self.blockchain_height) {
			heights_didActuallyChange = true
			self.blockchain_height = blockchain_height
		}
		//
		var wasFirstFetchOf_accountInfo = false
		if (typeof self.dateThatLast_fetchedAccountInfo === 'undefined' || self.dateThatLast_fetchedAccountInfo === null) {
			wasFirstFetchOf_accountInfo = true
		}		
		self.dateThatLast_fetchedAccountInfo = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					// no matter what we'll notify that updates were received
					if (typeof self.options.didReceiveUpdateToAccountInfo === 'function') {
						self.options.didReceiveUpdateToAccountInfo()
					}
					//
					// then we'll check if anything actually changed
					var anyChanges = false
					if (accountBalance_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.___didReceiveActualChangeTo_balance(
							existing_total_received,
							existing_total_sent,
							existing_locked_balance
						)
					}
					if (spentOutputs_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.___didReceiveActualChangeTo_spentOutputs(existing_spent_outputs)
					}
					if (heights_didActuallyChange === true || wasFirstFetchOf_accountInfo === true) {
						anyChanges = true
						self.___didReceiveActualChangeTo_heights()
					}
					if (anyChanges == false) {
						// console.log("💬  No actual changes to balance, heights, or spent outputs")
					}
				}
			}
		)
	}
	_WalletHostPollingController_didFetch_transactionHistory(
		account_scanned_height,
		account_scanned_block_height,
		account_scan_start_height,
		transaction_height,
		blockchain_height,
		transactions
	)
	{
		const self = this
		//
		var heights_didActuallyChange = false
		if (account_scanned_height !== self.account_scanned_height) {
			heights_didActuallyChange = true
			self.account_scanned_height = account_scanned_height
		}
		if (account_scanned_block_height !== self.account_scanned_block_height) {
			heights_didActuallyChange = true
			self.account_scanned_block_height = account_scanned_block_height
		}
		if (account_scan_start_height !== self.account_scan_start_height) {
			heights_didActuallyChange = true
			self.account_scan_start_height = account_scan_start_height
		}
		// NOTE: the following change even when we do not do/get any txs
		if (transaction_height !== self.transaction_height) {
			heights_didActuallyChange = true
			self.transaction_height = transaction_height
		}
		if (blockchain_height !== self.blockchain_height) {
			heights_didActuallyChange = true
			self.blockchain_height = blockchain_height
		}
		//
		// 
		var transactionsList_didActuallyChange = false // we'll see if anything actually changed and only emit if so
		var finalized_transactions = []
		// We will construct the txs from the incoming txs here as follows.
		// Doing this allows us to selectively preserve already-cached info.
		var numberOfTransactionsAdded = 0
		const newTransactions = []
		const existing_transactions = self.transactions || []
		const self_transactions_length = existing_transactions.length
		const incoming_transactions_length = transactions.length
		for (let i = 0 ; i < incoming_transactions_length ; i++) {
			const incoming_tx = transactions[i]
			delete incoming_tx["id"] // because this field changes while sending funds, even though hash stays the same, 
			// and because we don't want `id` messing with our ability to diff. so we're not even going to try to store this
			
			var isNewTransaction = false // let's see……
			var didFindIncomingTxIdInExistingTxs = false // let's see…
			for (let j = 0 ; j < self_transactions_length ; j++) {
				// search for tx with same id in existing list to check if tx actually new. if not actually new, do diff to check if change received in update
				const existing_tx = existing_transactions[j]
				if (existing_tx.hash === incoming_tx.hash) { // already known tx; diff
					didFindIncomingTxIdInExistingTxs = true
					const existing_same_tx = existing_tx
					delete existing_same_tx["id"] // we are deleting `id` here even though on a completely fresh import, according to this code, since we say finalized_tx=incoming_tx, we should never technically have a defined `id` in any existing_tx... but this is done here not only for explicit clarity but to preclude a false positive on a diff (areObjectsEqual below) in case any old data is present (which it is probably only likely to be at around the time of writing this :))
					//
					// unfortunately this is possibly going to be true if everything is the same except for the id field
					// but technically it's an 'update'…… even though the id change should be opaque to the client
					if (areObjectsEqual(incoming_tx, existing_same_tx) === false) {
						transactionsList_didActuallyChange = true // this is likely to happen if tx.height changes while pending confirmation
						// console.log("incoming_tx is not the same as existing_tx")
						// console.log("incoming_tx" , incoming_tx)
						// console.log("existing_same_tx" , existing_same_tx)
					}
					break // no need to keep looking
				}
			}
			if (didFindIncomingTxIdInExistingTxs !== true) { // then we have a new tx
				// console.log("a tx added")
				transactionsList_didActuallyChange = true
				numberOfTransactionsAdded += 1
				isNewTransaction = true // NOTE: we set isNewTransaction=true so we can push the finalized tx to newTransactions below
			}
			//
			const finalized_tx = incoming_tx // setting incoming_tx as based instead of existing_tx, if any, so we allow the server to give us updates to transactions with ids we already know about
			// TODO: now finalize tx if necessary here... (e.g. check if existing tx has any cached info we want to bring into the finalized_tx before setting)
			//
			// now that actually finalized, accumulate:
			finalized_transactions.push(finalized_tx) 
			if (isNewTransaction === true) { // we break this out until here instead
			// of putting above so we have the actually finalized_tx to push to newTransactions
				newTransactions.push(finalized_tx)
			}
		}
		self.transactions = finalized_transactions
		//
		var wasFirstFetchOf_transactions = false
		if (typeof self.dateThatLast_fetchedAccountTransactions === 'undefined' || self.dateThatLast_fetchedAccountTransactions === null) {
			wasFirstFetchOf_transactions = true
		}
		self.dateThatLast_fetchedAccountTransactions = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					// notify/yield
					//
					// no matter what, we'll say we received update
					if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
						self.options.didReceiveUpdateToAccountTransactions()
					}
					//
					// and here we'll check whether things actually changed
					if (transactionsList_didActuallyChange === true || wasFirstFetchOf_transactions === true) {
						self.___didReceiveActualChangeTo_transactionsList(numberOfTransactionsAdded, newTransactions, existing_transactions)
					} else {
						// console.log("💬  No info from txs fetch actually changed txs list so not emiting that txs changed")
					}
					if (heights_didActuallyChange === true || wasFirstFetchOf_transactions === true) {
						self.___didReceiveActualChangeTo_heights()
					}
				}
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - When actual data changes received from host 
	
	___didReceiveActualChangeTo_balance(
		old_total_received,
		old_total_sent,
		old_locked_balance
	)
	{
		const self = this
		console.log("💬  Received an update to balance")
		self.emit(self.EventName_balanceChanged(), self, old_total_received, old_total_sent, old_locked_balance)
	}
	___didReceiveActualChangeTo_spentOutputs(old_spent_outputs)
	{
		const self = this
		console.log("💬  Received an update to spent outputs")
		self.emit(self.EventName_spentOutputsChanged(), self, (old_spent_outputs || []))
	}
	___didReceiveActualChangeTo_heights()
	{
		const self = this
		// console.log("💬  Received an update to heights")
		self.emit(self.EventName_heightsUpdated(), self)
	}
	___didReceiveActualChangeTo_transactionsList(numberOfTransactionsAdded, newTransactions, oldTransactions)
	{
		const self = this
		console.log("💬  Got an update to txs list")
		self.emit(self.EventName_transactionsChanged(), self, oldTransactions)
		if (numberOfTransactionsAdded > 0) {
			console.log(`💬  ${numberOfTransactionsAdded} new transaction(s) added`)
			self.emit(self.EventName_transactionsAdded(), self, numberOfTransactionsAdded, newTransactions)
		}
	}
}
module.exports = Wallet
