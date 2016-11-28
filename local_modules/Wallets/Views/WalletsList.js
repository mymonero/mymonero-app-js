"use strict"
//
class WalletsList
{
	constructor(options, dependencies)
	{
		const self = this
		// options
		self.web = options.web || false
		self.superview = options.superview || undefined
		if (typeof self.superview === 'undefined') {
			throw "superview undefined"
		}
		// dependencies
		self.walletsListController = dependencies.walletsListController
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self.reloadData()

		// const initWithMnemonic__mnemonicString = "…"
		// const initWithMnemonic__wordsetName = "english"
		// //
		// self.walletsListController.WhenBooted_AddExtantWalletWith_mnemonicString(
		// 	initWithMnemonic__mnemonicString,
		// 	initWithMnemonic__wordsetName,
		// 	function(err, walletInstance, wasWalletAlreadyInserted)
		// 	{
		// 		if (err) {
		// 			console.log(err)
		// 			throw err
		// 			return
		// 		}
		// 		console.log("Successfully added extant wallet", walletInstance.Description())
		// 		if (wasWalletAlreadyInserted === true) {
		// 			console.warn("⚠️  That wallet had already been added to the database.")
		// 		}
		// 	}
		// )
	}
	//
	//
	// Accessors - Factories
	//

	//
	//
	// Imperatives - Reload
	//
	reloadData()
	{
		const self = this
		// TODO: because this is asynchronous, we might want to put some kind of locking/polling system on this
		self.walletsListController.WhenBooted_Wallets(
			function(wallets)
			{
				console.log("Wallets", wallets)
				//
			}
		)
	}
}
module.exports = WalletsList
