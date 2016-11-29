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
const async = require('async')
const EventEmitter = require('events')
const extend = require('util')._extend
//
const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
const monero_txParsing_utils = require('../../monero_utils/monero_txParsing_utils')
const monero_sendingFunds_utils = require('../../monero_utils/monero_sendingFunds_utils')
const JSBigInt = require('../../cryptonote_utils/biginteger').BigInteger
const monero_utils = require('../../monero_utils/monero_cryptonote_utils_instance')
//
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const secretWallet_persistence_utils = require('./secretWallet_persistence_utils')
//
const wallet_currencies =
{
	xmr: 'xmr'
}
//
class SecretPersistingHostedWallet extends EventEmitter
{
	// Init -> setup
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
			setTimeout(function()
			{
				(self.options.failedToInitialize_cb || function(err) {})()
			})
		}
		self.successfullyInitialized_cb = function()
		{ // v--- Trampoline by executing on next tick to avoid instantiators having undefined instance ref when success cb called
			setTimeout(function()
			{
				(self.options.successfullyInitialized_cb || function() {})()
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
		self.context.persister.DocumentsWithQuery(
			secretWallet_persistence_utils.CollectionName,
			{ _id: self._id }, // cause we're saying we have an _id passed in…
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.toString)
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
				secretWallet_persistence_utils.HydrateInstance_withUnencryptedValues(
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
		self.mnemonic_wordsetName = self.options.mnemonic_wordsetName || monero_wallet_utils.wordsetNames.english // default
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
	}


	////////////////////////////////////////////////////////////////////////////////
	// Post init, pre-boot - Public - Accessors - Creating new wallets

	MnemonicStringWhichWasGeneratedOnInit()
	{
		return self.generatedOnInit_walletDescription.mnemonicString
	}
	// TODO: there may be room for a 'regenerate mnemonic' with new wordset imperative function


	////////////////////////////////////////////////////////////////////////////////
	// Booting - Public - Imperatives - Creating/adding wallets

	Boot_byLoggingIntoHostedService_byCreatingNewWallet(
		persistencePassword,
		walletLabel,
		informingAndVerifyingMnemonic_cb,
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
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of SecretPersistingHostedWallet"
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		//
		self.walletLabel = walletLabel || ""
		//
		const generatedOnInit_walletDescription = self.generatedOnInit_walletDescription
		const seed = generatedOnInit_walletDescription.seed
		const mnemonicString = generatedOnInit_walletDescription.mnemonicString
		const keys = generatedOnInit_walletDescription.keys
		//
		// Now we must have the user confirm they wrote down their seed correctly
		if (typeof informingAndVerifyingMnemonic_cb === 'undefined') {
			const errStr = "❌  informingAndVerifyingMnemonic_cb was undefined."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		informingAndVerifyingMnemonic_cb(
			mnemonicString,
			function(userConfirmed_mnemonicString)
			{
				var trimmed_userConfirmed_mnemonicString = userConfirmed_mnemonicString.trim()
				if (trimmed_userConfirmed_mnemonicString === '') {
					const errStr = "❌  Please enter a private login key"
					const err = new Error(errStr)
					fn(err)
					return
				}
				if (trimmed_userConfirmed_mnemonicString.toLocaleLowerCase() !== mnemonicString.trim().toLocaleLowerCase()) {
					const errStr = "❌  Private login key does not match"
					const err = new Error(errStr)
					fn(err)
					return
				}
				// Now we can proceed
				_proceedTo_logIn()
			}
		)
		function _proceedTo_logIn()
		{
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
	}
	Boot_byLoggingIntoHostedService_withMnemonic(
		persistencePassword,
		walletLabel,
		mnemonicString,
		wordsetName,
		fn
	)
	{ // fn: (err?) -> Void
		const self = this
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of SecretPersistingHostedWallet"
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		//
		self.walletLabel = walletLabel || ""
		self.mnemonic_wordsetName = wordsetName || self.mnemonic_wordsetName // default has already been initialized
		//
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonicString,
			wordsetName,
			function(err, seed, keys)
			{
				if (err) {
					fn(err)
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
	Boot_byLoggingIntoHostedService_withAddressAndKeys(
		persistencePassword,
		address,
		view_key__private,
		spend_key__private,
		fn
	)
	{ // fn: (err?) -> Void
		const self = this
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of SecretPersistingHostedWallet"
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		//
		self.walletLabel = walletLabel || ""
		//
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


	////////////////////////////////////////////////////////////////////////////////
	// Booting - Public - Imperatives - Reading saved wallets

	Boot_decryptingExistingInitDoc(
		persistencePassword,
		fn
	)
	{
		const self = this
		//
		self.persistencePassword = persistencePassword || null
		if (persistencePassword === null) {
			const errStr = "❌  You must supply a persistencePassword when you are calling a Boot_* method of SecretPersistingHostedWallet"
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		//
		const encryptedDocument = self.initialization_encryptedDocument
		if (typeof encryptedDocument === 'undefined' || encryptedDocument === null) {
			const errStr = "__boot_decryptInitDoc_andBoot called but encryptedDocument undefined"
			const err = new Error(err)
			fn(err)
			return
		}
		//
		__proceedTo_decryptDocument(encryptedDocument)
		//
		function __proceedTo_decryptDocument(encryptedDocument)
		{
			var plaintextDocument
			try {
				plaintextDocument = document_cryptor.New_DecryptedDocument(
					encryptedDocument,
					secretWallet_persistence_utils.DocumentCryptScheme,
					self.persistencePassword
				)
			} catch (e) {
				const errStr = "❌  Decryption err: " + e.toString()
				const err = new Error(errStr)
				console.error(errStr)
				fn(err)
				return
			}
			//
			self.initialization_encryptedDocument = null // now we can free this
			//
			__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		}
		function __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		{ // reconstituting state…
			secretWallet_persistence_utils.HydrateInstance_withDecryptedValues(
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
				self.failedToInitialize_cb(err)
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
	// Booting - Private - Imperatives

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
					fn(err)
					return
				}
				__proceedTo_loginViaHostedAPI(
					account_seed,
					public_keys,
					private_keys,
					isInViewOnlyMode,
					fn
				)
			}
		)
		function __proceedTo_loginViaHostedAPI(
			account_seed,  // these arguments only get passed through
			public_keys,  // so they can be set in one place below
			private_keys,
			isInViewOnlyMode,
			fn
		)
		{
			self.context.hostedMoneroAPIClient.LogIn(
				address,
				view_key,
				function(err, new_address)
				{
					if (err) {
						fn(err)
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
								fn(err)
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
	// Booting - Private - Delegation

	_trampolineFor_successfullyBooted(
		fn
	)
	{ // fn: (err?) -> Void
		const self = this
		if (typeof self.account_seed === 'undefined' || self.account_seed === null || self.account_seed.length < 1) {
			console.warn("⚠️  Wallet initialized without an account_seed.")
			self.wasInitializedWith_addrViewAndSpendKeysInsteadOfSeed = true
		} else {
			self.mnemonicString = monero_wallet_utils.MnemonicStringFromSeed(self.account_seed, self.mnemonic_wordsetName)
		}
		//
		console.info("✅  Successfully instantiated", self.Description())
		self.isBooted = true
		fn() // ensure we call the callback
		//
		function __callAllSyncFunctions()
		{
			self._fetch_accountInfo(
				function(err)
				{
				}
			)
			self._fetch_transactionHistory(
				function(err)
				{
				}
			)
		}
		//
		// kick off synchronizations
		setTimeout(function()
		{
			__callAllSyncFunctions()
		})
		//
		// and kick off the polling call to pull latest updates
		const syncPollingInterval = 30 * 1000 // ms
		setInterval(function()
		{
			__callAllSyncFunctions()
		}, syncPollingInterval)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	EventName_accountInfoUpdated()
	{
		return "EventName_accountInfoUpdated"
	}
	EventName_transactionsUpdated()
	{
		return "EventName_transactionsUpdated"
	}
	//
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
	{ // this function is preferred for public access
	  // as it caches the derivations of the above accessors
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
	Balance()
	{
		const self = this
		// TODO: (?) detect whether account is synched yet
		//
		var total_received = self.total_received
		var total_sent = self.total_sent
		if (typeof total_received === 'undefined') {
			total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
			console.log("⚠️  Wallet Balance() called while self.total_received was undefined. Using 0. Uncomment .trace() here and check: This is likely fine (not a code fault) if trace reveals Balance() called by Description()")
			// console.trace()
		}
		if (typeof total_sent === 'undefined') {
			total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
			console.log("⚠️  Wallet Balance() called while self.total_sent was undefined. Using 0. Uncomment .trace() here and check: This is likely fine (not a code fault) if trace reveals Balance() called by Description()")
			// console.trace()
		}
		const balance_JSBigInt = total_received.subtract(total_sent)
		//
		return monero_utils.formatMoney(balance_JSBigInt)
	}
	Description()
	{
		const self = this
		//
		return "Wallet with _id " + self._id + " named " + self.walletLabel + ", Balance:" + self.Balance()
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Sending funds

	SendFunds(
		target_address, // currency-ready wallet public address or OpenAlias address
		amount, // number
		mixin,
		payment_id,
		fn,
		// fn: (
		//		err?,
		//		currencyReady_targetDescription_address?,
		//		sentAmount?,
		//		targetDescription_domain_orNone?,
		//		final__payment_id?,
		//		tx_hash?,
		//		tx_fee?
		// )
		confirmWithUser_openAliasAddress_cb
	)
	{
		const self = this
		//
		// state-lock function
		if (self.isSendingFunds === true) {
			const errStr = "Currently already sending funds. Please try again when complete."
			const err = new Error(errStr)
			console.error(errStr)
			fn(err)
			return
		}
		self.isSendingFunds = true
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
			self.isSendingFunds = false
		}
		//
		monero_sendingFunds_utils.SendFunds(
			target_address,
			amount,
			self.public_address,
			self.private_keys,
			self.public_keys,
			self.context.hostedMoneroAPIClient,
			mixin,
			payment_id,
			__trampolineFor_success,
			__trampolineFor_err_withErr,
			confirmWithUser_openAliasAddress_cb
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Persistence

	saveToDisk(fn)
	{
		const self = this
		secretWallet_persistence_utils.SaveToDisk(
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
		secretWallet_persistence_utils.DeleteFromDisk(
			self,
			fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password

	ChangePasswordFromTo(
		testWithExisting_persistencePassword,
		changeTo_persistencePassword,
		fn
	)
	{
		const self = this
		if (typeof self.persistencePassword === 'undefined' || self.persistencePassword === null || self.persistencePassword == '') {
			return fn(new Error("Invalid self.persistencePassword"))
		}
		if (self.persistencePassword !== testWithExisting_persistencePassword) {
			return fn(new Error("Unable to unlock wallet with that password"))
		}
		if (changeTo_persistencePassword.length < 5) {
			return fn(new Error("New password must be more than 5 characters"))
		}
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

	SetWalletLabel(
		toLabel,
		fn
	)
	{
		const self = this
		if (typeof toLabel === 'undefined' || toLabel === null || toLabel.length < 1) {
			return fn(new Error("Please enter a wallet name"))
		}
		self.walletLabel = toLabel
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new wallet name", err)
				} else {
					console.log("Successfully saved new wallet name.")
				}
				fn(err)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Account info & tx history fetch/sync

	_fetch_accountInfo(fn)
	{
		const self = this
		var __debug_fnName = "_fetch_accountInfo"
		if (self.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.public_address === 'undefined' && self.public_address === null || self.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.private_keys === 'undefined' && self.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressInfo(
			self.public_address,
			self.private_keys.view,
			self.public_keys.spend,
			self.private_keys.spend,
			function(
				err,
				total_received,
				locked_balance,
				total_sent,
				spent_outputs,
				account_scanned_tx_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height
			)
			{
				if (err) {
					console.error(err.toString())
					fn(err)
					return
				}
				//
				self.__didFetch_accountInfo(
					total_received,
					locked_balance,
					total_sent,
					spent_outputs,
					account_scanned_tx_height,
					account_scanned_block_height,
					account_scan_start_height,
					transaction_height,
					blockchain_height
				)
			}
		)
	}

	_fetch_transactionHistory(fn)
	{ // fn: (err?) -> Void
		const self = this
		var __debug_fnName = "_fetch_transactionHistory"
		if (self.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.public_address === 'undefined' && self.public_address === null || self.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof self.private_keys === 'undefined' && self.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressTransactions(
			self.public_address,
			self.private_keys.view,
			self.public_keys.spend,
			self.private_keys.spend,
			function(
				err,
				account_scanned_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height,
				transactions
			)
			{
				if (err) {
					console.error(err)
					fn(err)
					return
				}
				//
				self.__didFetch_transactionHistory(
					account_scanned_height,
					account_scanned_block_height,
					account_scan_start_height,
					transaction_height,
					blockchain_height,
					transactions
				)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private - Account info & tx history fetch/save/sync

	__didFetch_accountInfo(
		total_received,
		locked_balance,
		total_sent,
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
		self.total_received = total_received
		self.locked_balance = locked_balance
		self.total_sent = total_sent
		self.spent_outputs = spent_outputs
		self.account_scanned_tx_height = account_scanned_tx_height
		self.account_scanned_block_height = account_scanned_block_height
		self.account_scan_start_height = account_scan_start_height
		self.transaction_height = transaction_height
		self.blockchain_height = blockchain_height
		//
		self.dateThatLast_fetchedAccountInfo = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					self.___didReceiveAndSaveUpdateTo_accountInfo()
				}
			}
		)
	}
	___didReceiveAndSaveUpdateTo_accountInfo()
	{
		const self = this
		if (typeof self.options.didReceiveUpdateToAccountInfo === 'function') {
			self.options.didReceiveUpdateToAccountInfo()
		}
		self.emit(self.EventName_accountInfoUpdated())
	}
	//
	//
	__didFetch_transactionHistory(
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
		self.account_scanned_height = account_scanned_height
		self.account_scanned_block_height = account_scanned_block_height
		self.account_scan_start_height = account_scan_start_height
		self.transaction_height = transaction_height
		self.blockchain_height = blockchain_height
		self.transactions = transactions
		//
		self.dateThatLast_fetchedAccountTransactions = new Date()
		//
		self.saveToDisk(
			function(err)
			{
				if (!err) {
					self.___didReceiveAndSaveUpdateTo_accountTransactions()
				}
			}
		)
	}
	___didReceiveAndSaveUpdateTo_accountTransactions()
	{
		const self = this
		if (typeof self.options.didReceiveUpdateToAccountTransactions === 'function') {
			self.options.didReceiveUpdateToAccountTransactions()
		}
		self.emit(self.EventName_transactionsUpdated())
	}
}
module.exports = SecretPersistingHostedWallet
