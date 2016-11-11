const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
//
module.exports =
{
	// shared - persistence
	//
	persistencePassword: "a secret phrase",

	// used by readSavedWallet
	openWalletWith_id: "UrougbLX3qcNUXIa", // take the _id from the wallet creation test output or from fetchExistingWallet 

		
	// used by fetchExistingWallet
	// I
	initWithMnemonic__mnemonicString: "…", 
	initWithMnemonic__wordsetName: monero_wallet_utils.wordsetNames.english,
	// II
	initWithKeys__address: "…",
	initWithKeys__view_key__private: "…",
	initWithKeys__spend_key__private: "…",
}