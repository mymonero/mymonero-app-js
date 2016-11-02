"use strict"
//
const monero_wallet_utils = require('../monero_utils/monero_wallet_utils')
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class SecretWallet
{
    //
    //
    ////////////////////////////////////////////////////////////////////////////////
    // Lifecycle - Initialization
    //
    constructor(options, context)
    {
        var self = this
        self.options = options
        self.context = context
        //
        self.setup()
		//
		// TODO: load record from database if key provided in options.... maybe SecretWallet shouldn't really handle 
		self.wallet_currency = 'xmr' // default // TODO: persist in db
		// TODO: abstract out currency from this 
		self.mnemonic_wordsetName = 'english' // default // TODO: store in and hydrate from db; TODO: declare & lookup language constants in monero_utils_instance
		self.isLoggingIn = false // not persisted in DB
		self.isLoggedIn = false // TODO: toggle this based on what is persisted in the DB -- the wallet needs to be imported to MyMonero for the hosted API stuff to work
    }
    setup()
    {
        var self = this
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Public
	
    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Public	
	
	LogIn_creatingNewWallet(
		informingAndVerifyingMnemonic_cb,
		fn
	)
	{ // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
		// confirmation_cb: (userConfirmed_mnemonicString) -> Void
	  // fn: (err?, …) -> Void (see _logIn)
	  //
	  // To use this function, you must supply a informingAndVerifyingMnemonic_cb.
	  // Your supplied cb will be called with the generated mnemonicString and another
	  // _cb, which you must call after you get the user to confirm their mnemonicString.
	  // This function will proceed to verify the confirmation mnemonic string and 
	  // then log into the hosted node server to create an account
	  //	
		const self = this
		//
		const walletDescription = monero_wallet_utils.NewlyCreatedWallet(self.mnemonic_wordsetName)
		const seed = walletDescription.seed
		const mnemonicString = walletDescription.mnemonicString
		const keys = walletDescription.keys
		//
		// Now we must have the user confirm they wrote down their seed correctly
		informingAndVerifyingMnemonic_cb(
			mnemonicString,
			function(userConfirmed_mnemonicString)
			{
				var trimmed_userConfirmed_mnemonicString = userConfirmed_mnemonicString.trim()
		        if (trimmed_userConfirmed_mnemonicString === '') {
					const errStr = "Please enter a private login key"
					const err = new Error(errStr)
					fn(err)
		            return
		        }
		        if (trimmed_userConfirmed_mnemonicString.toLocaleLowerCase() !== mnemonicString.trim().toLocaleLowerCase()) {
					const errStr = "Private login key does not match"
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
	        // var keys = cnUtil.create_address(seed)
			const address = keys.public_addr
			const view_key__private = keys.view.sec
			const spend_key__private = keys.spend.sec
			const wasAGeneratedWallet = true // true, in this case
			//
			self._logIn(
				address,
				view_key__private,
				spend_key__private,
				seed,
				wasAGeneratedWallet,
				fn
			)
		}
	}
	
	LogIn_mnemonic(mnemonicString, language, fn)
	{ // fn: (err?, …) -> Void (see _logIn)
		const self = this
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonicString,
			self.mnemonic_wordsetName,
			function(err, seed, keys)
			{
				if (err) {
					fn(err)
					return
				}
				console.log("keys" , keys)
				const address = keys.public_addr
				const view_key__private = keys.view.sec
				const spend_key__private = keys.spend.sec
				const wasAGeneratedWallet = false
				self._logIn(
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
    LogIn_keys(address, view_key__private, spend_key__private)
	{
		const self = this
		const seed = undefined
		const wasAGeneratedWallet = false
		self._logIn(
			address,
			view_key__private,
			spend_key__private,
			seed, // seed
			wasAGeneratedWallet,
			fn
		)
    }
	
	

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Private

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private - Account registration with hosted node API

	_logOut()
	{
		const self = this
        self.isLoggedIn = false
		// TODO: more fields……
		// TODO: emit event
    }

	_logIn(
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
		function __succeeded(new_address)
		{
			self.isLoggingIn = false
	        self.isLoggedIn = true
			//
            const wasAccountImported = !wasAGeneratedWallet && new_address
			// console.log("SUCCESS… wasAccountImported", wasAccountImported)
			self.wasAccountImported = wasAccountImported
			//
			// TODO: emit event that login status changed?
			fn(null)
		}
		function __failed(err)
		{
			self.isLoggingIn = false
			self.isLoggedIn = false // obvs
			//
			// TODO: emit event?
			fn(err, null)
		}
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
					__failed(err)
					return
				}
				console.log("address account_seed public_keys private_keys isInViewOnlyMode", address, 
				account_seed, 
				public_keys, 
				private_keys,
				isInViewOnlyMode)
				__proceedTo_loginViaHostedAPI()
			}
		)
		function __proceedTo_loginViaHostedAPI()
		{
			self.context.hostedMoneroAPIClient.LogIn(
				address,
				view_key,
				function(err, new_address)
				{
					if (err) {
						__failed(err)
						return
					} 
					__succeeded(new_address)
				}
			)
		}
    }
	

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Delegation - Private

}
module.exports = SecretWallet