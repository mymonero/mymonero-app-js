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
		self.mnemonic_language = 'english' // default // TODO: store in and hydrate from db
		self.isLoggingIn = false // not persisted in DB
		self.isLoggedIn = false // TODO: toggle this based on what is persisted in the DB
    }
    setup()
    {
        var self = this
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Public
	
    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Public	
	
	LogIn_mnemonic(mnemonic, language, fn)
	{ // fn: (err?, …) -> Void (see _logIn)
		const self = this
		monero_wallet_utils.SeedAndKeysFromMnemonic(
			mnemonic,
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
    // Runtime - Imperatives - Private

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
			console.log("SUCCESS", data, wasAccountImported)
			self.isLoggingIn = false
	        self.isLoggedIn = true
			//
            const wasAccountImported = !wasAGeneratedWallet && new_address
			self.wasAccountImported = wasAccountImported
			//
			// TODO: emit event that login status changed?
			fn(null, data)
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