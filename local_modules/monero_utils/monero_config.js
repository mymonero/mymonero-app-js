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
	feePerKB: new JSBigInt('10000000000'),

	// Dust threshold in atomic units
	// 10^10 used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	dustThreshold: new JSBigInt('10000000000')
}