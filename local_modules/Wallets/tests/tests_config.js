const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
//
module.exports =
{
	//
	// shared - persistence
	//
	persistencePassword: "another wallet password",
	//
	
	// opening already saved
	openWalletWith_id: "Mm7xNrzK2tPI995y", // take the _id from the wallet creation test output
	
	
	// importing wallets
	// I
	initWithMnemonic__mnemonicString: "phone etiquette twice oars bounced left wonders aglow fleet avidly ramped fuzzy height nodes fever radar soapy fading boyfriend vortex wizard slug mowing occur soapy", 
	initWithMnemonic__wordsetName: monero_wallet_utils.wordsetNames.english,
	//
	// II
	initWithKeys__address: "42S6txwM9RA53BL2Uf46CeM5WMJHTj6jWKgmSMLiLeb6A8QwXiWTK51PxF7wR8wNdgLJkWCM3NaiTfhWJnhskk7A7S5bEfp",
	initWithKeys__view_key__private: "883ada1a057f177e5edcc8a85ab732e2c30e52ab2d4708ecadc6bd2338bcac08",
	initWithKeys__spend_key__private: "d5d5789e274f965c3edd72464512f29e0c1934b6e6c0b87bfff86007b0775b0d",
	
}