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
const EventEmitter = require('events')
const async = require('async')
//
const Wallet = require('../../Wallets/Models/Wallet')
const wallet_persistence_utils = require('../../Wallets/Models/wallet_persistence_utils')
//
const hexColorStrings = 
[
	"#6B696B", // dark grey
	"#CFCECF", // light grey
	"#00F4CD", // teal
	"#D975E1", // purple
	"#F97777", // salmon/red
	"#EB8316", // orange
	"#EACF12", // yellow
	"#00C6FF" // blue
]
//
class WalletsListController extends EventEmitter
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		super() // must call super before we can access `this`
		//
		const self = this
		self.options = options
		self.context = context
		{
			self.hasBooted = false // not booted yet - we'll defer things till we have
		}
		self.setup()
	}
	_setup_didBoot(optlFn)
	{
		const self = this
		optlFn = optlFn || function() {}
		{
			self.hasBooted = true // all done!
		}
		setTimeout(function()
		{ // on next tick to avoid instantiator missing this
			self.emit(self.EventName_booted())
			optlFn()
		})
	}
	_setup_didFailToBootWithError(err)
	{
		const self = this
		setTimeout(function()
		{ // on next tick to avoid instantiator missing this
			self.emit(self.EventName_errorWhileBooting(), err)
		})
	}
	setup()
	{
		const self = this
		self.context.passwordController.AddRegistrantForDeleteEverything(self)
		self._setup_fetchAndReconstituteExistingRecords()
		self.startObserving_passwordController()
	}
	_setup_fetchAndReconstituteExistingRecords()
	{
		const self = this
		{ // load
			self._new_idsOfPersistedWallets(
				function(err, ids)
				{
					if (err) {
						const errStr = "Error fetching persisted wallet ids: " + err.message
						const err = new Error(errStr)
						self._setup_didFailToBootWithError(err)
						return
					}
					__proceedTo_loadWalletsWithIds(ids)
				}
			)
		}
		function __proceedTo_loadWalletsWithIds(ids)
		{
			self.wallets = []
			if (ids.length === 0) { // do not cause the pw to be requested yet
				self._setup_didBoot()
				// and we don't want/need to emit that the list updated here
				return
			}
			self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
				function(obtainedPasswordString, userSelectedTypeOfPassword)
				{
					__proceedTo_loadAndBootAllExtantRecordsWithPassword(obtainedPasswordString)
				}
			)
			function __proceedTo_loadAndBootAllExtantRecordsWithPassword(persistencePassword)
			{
				async.each(
					ids,
					function(_id, cb)
					{
						const options =
						{
							_id: _id,
							//
							failedToInitialize_cb: function(err, walletInstance)
							{
								console.error("Failed to initialize wallet ", err)
								cb(err)
							},
							successfullyInitialized_cb: function(walletInstance)
							{
								walletInstance.Boot_decryptingExistingInitDoc(
									persistencePassword,
									function(err)
									{
										if (err) {
											console.error("Error fetching persisted wallet", err)
											// but we're not going to call cb with err because that prevents boot - the instance will be marked as 'errored' and we'll display it/able to treat it as such
										} else {
											// console.log("💬  Initialized wallet", wallet.Description())
										}
										self.wallets.push(walletInstance) // we manually manage the list here and
										// thus take responsibility to emit EventName_listUpdated below
										self._startObserving_wallet(walletInstance) // taking responsibility to start observing
										//
										cb()
									}
								)
							},
							didReceiveUpdateToAccountInfo: function()
							{ // TODO: bubble?
							},
							didReceiveUpdateToAccountTransactions: function()
							{ // TODO: bubble?
							}
						}
						const wallet = new Wallet(options, self.context)
					},
					function(err)
					{
						if (err) {
							console.error("Fatal error fetching persisted wallets", err)
							self._setup_didFailToBootWithError(err)
							return
						}
						{ // before proceeding, just sorting the wallets by date added
							self.wallets = self.wallets.sort(function(a, b)
							{
								return b.dateWalletFirstSavedLocally - a.dateWalletFirstSavedLocally
							})
						}
						self._setup_didBoot(function()
						{ // in cb to ensure serialization of calls
							self.__listUpdated_wallets() // emit after booting so this becomes an at-runtime emission
						})
					}
				)
			}
		}
	}
	startObserving_passwordController()
	{
		const self = this
		const controller = self.context.passwordController
		{ // EventName_ChangedPassword
			if (self._passwordController_EventName_ChangedPassword_listenerFn !== null && typeof self._passwordController_EventName_ChangedPassword_listenerFn !== 'undefined') {
				throw "self._passwordController_EventName_ChangedPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
			}
			self._passwordController_EventName_ChangedPassword_listenerFn = function()
			{
				self._passwordController_EventName_ChangedPassword()
			}
			controller.on(
				controller.EventName_ChangedPassword(),
				self._passwordController_EventName_ChangedPassword_listenerFn
			)
		}
		{ // EventName_willDeconstructBootedStateAndClearPassword
			if (self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn !== null && typeof self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn !== 'undefined') {
				throw "self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
			}
			self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn = function()
			{
				console.log("~~~~~> observed will deconstruct booted state…")
				self._passwordController_EventName_willDeconstructBootedStateAndClearPassword()
			}
			controller.on(
				controller.EventName_willDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn
			)
		}
		{ // EventName_didDeconstructBootedStateAndClearPassword
			if (self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn !== null && typeof self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn !== 'undefined') {
				throw "self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn not nil in _setup_didBoot of " + self.constructor.name
			}
			self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn = function()
			{
				self._passwordController_EventName_didDeconstructBootedStateAndClearPassword()
			}
			controller.on(
				controller.EventName_didDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn
			)
		}		
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle/Runtime - Teardown
	
	TearDown()
	{
		const self = this
		self._tearDown_wallets()
		self._stopObserving_passwordController()
	}
	_tearDown_wallets()
	{
		const self = this
		const wallets = self.wallets
		const wallets_length = wallets.length
		for (let i = 0 ; i < wallets_length ; i++) {
			const wallet = wallets[i]
			wallet.TearDown()
		}
	}
	//
	_stopObserving_passwordController()
	{
		const self = this
		const controller = self.context.passwordController
		{ // EventName_ChangedPassword
			if (typeof self._passwordController_EventName_ChangedPassword_listenerFn === 'undefined' || self._passwordController_EventName_ChangedPassword_listenerFn === null) {
				throw "self._passwordController_EventName_ChangedPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_ChangedPassword(),
				self._passwordController_EventName_ChangedPassword_listenerFn
			)
			self._passwordController_EventName_ChangedPassword_listenerFn = null
		}
		{ // EventName_willDeconstructBootedStateAndClearPassword
			if (typeof self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn === 'undefined' || self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn === null) {
				throw "self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_willDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn
			)
			self._passwordController_EventName_willDeconstructBootedStateAndClearPassword_listenerFn = null
		}
		{ // EventName_didDeconstructBootedStateAndClearPassword
			if (typeof self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn === 'undefined' || self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn === null) {
				throw "self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn undefined"
			}
			controller.removeListener(
				controller.EventName_didDeconstructBootedStateAndClearPassword(),
				self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn
			)
			self._passwordController_EventName_didDeconstructBootedStateAndClearPassword_listenerFn = null
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Booting/Booted - Accessors - Public - Events emitted

	EventName_booted()
	{
		return "EventName_booted"
	}
	EventName_errorWhileBooting()
	{
		return "EventName_errorWhileBooting"
	}
	EventName_listUpdated() // -> String
	{
		return "EventName_listUpdated"
	}
	//
	EventName_aWallet_balanceChanged()
	{
		return "EventName_aWallet_balanceChanged"
	}
	EventName_aWallet_transactionsAdded()
	{
		return "EventName_aWallet_transactionsAdded"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Lookups - Documents & instances

	_new_idsOfPersistedWallets(
		fn // (err?, ids?) -> Void
	)
	{
		const self = this
		self.context.persister.DocumentsWithQuery(
			wallet_persistence_utils.CollectionName,
			{}, // blank query - find all
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.message)
					fn(err)
					return
				}
				const ids = []
				docs.forEach(function(el, idx)
				{
					ids.push(el._id)
				})
				fn(null, ids)
			}
		)
	}
	__walletInstanceAndIndexWithId(_id)
	{
		const self = this
		//
		const wallets_length = self.wallets.length
		var targetWallet_index = null
		var targetWallet_instance = null
		for (let i = 0 ; i < wallets_length ; i++) {
			const wallet = self.wallets[i]
			if (wallet._id === _id) {
				targetWallet_index = i
				targetWallet_instance = wallet
				break
			}
		}
		//
		return {
			index: targetWallet_index,
			instance: targetWallet_instance
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Factories - Properties

	_new_autogeneratedWalletLabel()
	{
		const self = this
		if (self.wallets.length == 0) {
			return "My First Wallet"
		}
		return "Untitled Wallet" // TODO: maybe pick from a list of funny/apt names, e.g. "Savings", "Piggy Bank", etc
	}


	////////////////////////////////////////////////////////////////////////////////
	// Booted - Accessors - Public

	WhenBooted_Wallets(fn)
	{
		const self = this
		self.ExecuteWhenBooted(
			function()
			{
				fn(self.wallets)
			}
		)
	}
	GivenBooted_SwatchesInUse()
	{
		const self = this
		if (self.hasBooted !== true) {
			console.warn("GivenBooted_SwatchesInUse called when " + self.constructor.name + " not yet booted.")
			return [] // this may be for the first wallet creation - let's say nothing in use yet
		}
		const inUseSwatches = []
		{
			self.wallets.forEach(
				function(wallet, i)
				{
					const swatch = wallet.swatch
					if (typeof swatch !== 'undefined' && swatch) {
						inUseSwatches.push(swatch)
					}
				}
			)
		}
		return inUseSwatches
	}
	//
	All_SwatchHexColorStrings()
	{
		return hexColorStrings
	}



	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deferring control til boot

	ExecuteWhenBooted(fn)
	{
		const self = this
		if (self.hasBooted === true) {
			fn()
			return
		}
		setTimeout(
			function()
			{
				self.ExecuteWhenBooted(fn)
			},
			50 // ms
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Booted - Imperatives - Public - Wallets list

	CreateNewWallet_NoBootNoListAdd(
		fn // fn: (err: Error?, walletInstance: Wallet) -> Void
	)
	{ // call this first, then call WhenBooted_BootAndAdd_NewlyGeneratedWallet
		const self = this
		const context = self.context
		const options =
		{
			generateNewWallet: true, // must flip this flag to true
			//
			failedToInitialize_cb: function(err, walletInstance)
			{
				fn(err)
			},
			successfullyInitialized_cb: function(walletInstance)
			{
				fn(null, walletInstance)
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{ // TODO: bubble? have to know it's in list first
			},
			didReceiveUpdateToAccountTransactions: function()
			{ // TODO: bubble? have to know it's in list first
			}
		}
		const wallet = new Wallet(options, context)
	}	
	WhenBooted_BootAndAdd_NewlyGeneratedWallet(
		walletInstance,
		walletLabel,
		swatch,
		fn // fn: (err: Error?, walletInstance: Wallet) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
					function(obtainedPasswordString, userSelectedTypeOfPassword)
					{
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
					walletInstance.Boot_byLoggingIn_givenNewlyCreatedWallet(
						persistencePassword,
						walletLabel,
						swatch,
						function(err)
						{
							if (err) {
								fn(err)
								return
							}
							self._atRuntime__wallet_wasSuccessfullyInitialized(walletInstance)
							//
							fn(null, walletInstance)
						}
					)
				}
			}
		)
	}
	WhenBooted_AddExtantWalletWith_mnemonicString(
		walletLabel,
		swatch,
		mnemonicString,
		fn // fn: (err: Error?, walletInstance: Wallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
					function(obtainedPasswordString, userSelectedTypeOfPassword)
					{
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
					var walletAlreadyExists = false
					const wallets_length = self.wallets.length
					for (let i = 0 ; i < wallets_length ; i++) {
						const wallet = self.wallets[i]
						if (wallet.mnemonicString === mnemonicString) {
							// simply return existing wallet
							fn(null, wallet, true) // wasWalletAlreadyInserted: true
							return
						}
						// TODO: solve limitation of this code; how to check if wallet with same address (but no mnemonic) was already added?
					}
					//
					const options =
					{
						failedToInitialize_cb: function(err, walletInstance)
						{
							fn(err)
						},
						successfullyInitialized_cb: function(walletInstance)
						{
							walletInstance.Boot_byLoggingIn_existingWallet_withMnemonic(
								persistencePassword,
								walletLabel,
								swatch,
								mnemonicString,
								function(err) {
									if (err) {
										fn(err)
										return
									}
									self._atRuntime__wallet_wasSuccessfullyInitialized(walletInstance)
									//
									fn(null, walletInstance, false) // wasWalletAlreadyInserted: false
								}
							)
						},
						//
						didReceiveUpdateToAccountInfo: function()
						{ // TODO: bubble?
						},
						didReceiveUpdateToAccountTransactions: function()
						{ // TODO: bubble?
						}
					}
					const wallet = new Wallet(options, context)
				}
			}
		)
	}
	WhenBooted_AddExtantWalletWith_addressAndKeys(
		walletLabel,
		swatch,
		address,
		view_key__private,
		spend_key__private,
		fn // fn: (err: Error?, walletInstance: Wallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
					function(obtainedPasswordString, userSelectedTypeOfPassword)
					{
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
					var walletAlreadyExists = false
					const wallets_length = self.wallets.length
					for (let i = 0 ; i < wallets_length ; i++) {
						const wallet = self.wallets[i]
						if (wallet.public_address === address) {
							// simply return existing wallet; note: this wallet might have mnemonic and thus seed
							// so might not be exactly what consumer of WhenBooted_AddExtantWalletWith_addressAndKeys is expecting
							fn(null, wallet, true) // wasWalletAlreadyInserted: true
							return
						}
					}
					//
					const options =
					{
						failedToInitialize_cb: function(err, walletInstance)
						{
							fn(err)
						},
						successfullyInitialized_cb: function(walletInstance)
						{
							walletInstance.Boot_byLoggingIn_existingWallet_withAddressAndKeys(
								persistencePassword,
								walletLabel,
								swatch,
								address,
								view_key__private,
								spend_key__private,
								function(err)
								{
									if (err) {
										fn(err)
										return
									}
									self._atRuntime__wallet_wasSuccessfullyInitialized(walletInstance)
									//
									fn(null)
								}
							)
						},
						//
						didReceiveUpdateToAccountInfo: function()
						{ // TODO: bubble?
						},
						didReceiveUpdateToAccountTransactions: function()
						{ // TODO: bubble?
						}
					}
					const wallet = new Wallet(options, context)
				}
			}
		)
	}
	//
	WhenBooted_DeleteWalletWithId(
		_id,
		fn
	)
	{
		const self = this
		//
		self.ExecuteWhenBooted(
			function()
			{
				const instanceAndIndex = self.__walletInstanceAndIndexWithId(_id)
				var indexOfWallet = instanceAndIndex.index
				var walletInstance = instanceAndIndex.instance
				if (indexOfWallet === null || walletInstance === null) {
					fn(new Error("Wallet not found"))
					return
				}
				//
				walletInstance.TearDown() // stop polling, etc -- important.
				//
				self._stopObserving_wallet(walletInstance) // important
				self.wallets.splice(indexOfWallet, 1) // pre-emptively remove the wallet from the list
				self.__listUpdated_wallets() // ensure delegate notified
				//
				walletInstance.Delete(
					function(err)
					{
						if (err) {
							walletInstance.Revert_TearDown() // cause we called .TearDown()
							//
							self.wallets.splice(indexOfWallet, 0, walletInstance) // revert deletion
							self._atRuntime__wallet_wasSuccessfullyInitialized() // start observing, ensure delegate notified
							fn(err)
							return
						}
						walletInstance = null // 'free'
						fn()
					}
				)
			}
		)
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Post-instantiation hook
	
	RuntimeContext_postWholeContextInit_setup()
	{
		const self = this
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Event observation - Wallets
	
	_startObserving_wallet(wallet)
	{
		const self = this
		// we need to be able to stop observing a wallet when the user deletes it (as we free the wallet),
		// so we (stupidly) have to hang onto the listener function
		{ // balanceChanged
			if (typeof self.wallet_listenerFnsByWalletId_balanceChanged === 'undefined') {
				self.wallet_listenerFnsByWalletId_balanceChanged = {}
			}		
			const fn = function(emittingWallet, old_total_received, old_total_sent, old_locked_balance)
			{
				self.emit(self.EventName_aWallet_balanceChanged(), emittingWallet, old_total_received, old_total_sent, old_locked_balance)
			}
			self.wallet_listenerFnsByWalletId_balanceChanged[wallet._id] = fn
			wallet.on(wallet.EventName_balanceChanged(), fn)
		}
		{ // transactionsAdded
			if (typeof self.wallet_listenerFnsByWalletId_transactionsAdded === 'undefined') {
				self.wallet_listenerFnsByWalletId_transactionsAdded = {}
			}		
			const fn = function(emittingWallet, numberOfTransactionsAdded, newTransactions)
			{
				self.emit(self.EventName_aWallet_transactionsAdded(), emittingWallet, numberOfTransactionsAdded, newTransactions)
			}
			self.wallet_listenerFnsByWalletId_transactionsAdded[wallet._id] = fn
			wallet.on(wallet.EventName_transactionsAdded(), fn)
		}
	}
	_stopObserving_wallet(wallet)
	{
		const self = this
		{ // balanceChanged
			const fn = self.wallet_listenerFnsByWalletId_balanceChanged[wallet._id]
			if (typeof fn === 'undefined') {
				throw "listener shouldn't have been undefined"
			}
			wallet.removeListener(wallet.EventName_balanceChanged(), fn)
		}
		{ // transactionsAdded
			const fn = self.wallet_listenerFnsByWalletId_transactionsAdded[wallet._id]
			if (typeof fn === 'undefined') {
				throw "listener shouldn't have been undefined"
			}
			wallet.removeListener(wallet.EventName_transactionsAdded(), fn)
		}
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime/Boot - Delegation - Private - List updating/instance management

	_atRuntime__wallet_wasSuccessfullyInitialized(walletInstance)
	{
		const self = this
		self.wallets.unshift(walletInstance) // so we add it to the top
		self._startObserving_wallet(walletInstance)
		self.__listUpdated_wallets()
	}
	__listUpdated_wallets()
	{
		const self = this
		self.emit(self.EventName_listUpdated())
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime/Boot - Delegation - Private
	
	_passwordController_EventName_ChangedPassword()
	{
		const self = this
		if (self.hasBooted !== true) {
			console.warn("⚠️  " + self.constructor.name + " asked to ChangePassword but not yet booted.")
			return // critical: not ready to get this 
		}
		// change all wallet passwords:
		const toPassword = self.context.passwordController.password // we're just going to directly access it here because getting this event means the passwordController is also saying it's ready
		self.wallets.forEach(
			function(wallet, i)
			{
				if (wallet.didFailToInitialize_flag !== true && wallet.didFailToBoot_flag !== true) {
					wallet.ChangePasswordTo(
						toPassword,
						function(err)
						{
							// err is logged in ChangePasswordTo
							// TODO: is there any sensible strategy to handle failures here?
						}
					)
				} else {
					console.warn("This wallet failed to boot. Not messing with its saved data")
				}
			}
		)
	}
	_passwordController_EventName_willDeconstructBootedStateAndClearPassword()
	{
		const self = this
		self._tearDown_wallets()
		self.wallets = []
		self.hasBooted = false
		// now we'll wait for the "did" event ---v before emiting anything like list updated, etc
	}
	passwordController_DeleteEverything(fn)
	{
		const self = this
		const collectionName = wallet_persistence_utils.CollectionName
		self.context.persister.RemoveDocuments(
			collectionName, 
			{}, 
			{ multi: true }, 
			function(err, numRemoved)
			{
				if (err) {
					fn(err)
					return
				}
				console.log(`🗑  Deleted all ${collectionName}.`)
				fn()
			}
		)
	}
	_passwordController_EventName_didDeconstructBootedStateAndClearPassword()
	{
		const self = this
		{ // this will re-request the pw and lead to loading records & booting self 
			self._setup_fetchAndReconstituteExistingRecords()
		}
		{ // and then at the end we're going to manually emit so that the UI updates to empty list after the pw entry screen is shown
			self.__listUpdated_wallets()
		}
	}
}
module.exports = WalletsListController
