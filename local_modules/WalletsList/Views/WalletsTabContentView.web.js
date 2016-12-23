setup_DEVELOPMENTMOCK_addWalletButton()
{
	// mocking an 'add wallet' button view here to test having to enter a pw for the first time on creating password protected data
	const self = this
		const layer = document.createElement("a")
	{ // setup
		layer.href = "#"
		layer.innerHTML = "[+] Create New Wallet"
	}
	{ // run
		self.layer.appendChild(layer)
	} // observe
	{
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					const informingAndVerifyingMnemonic_cb = function(mnemonicString, confirmation_cb)
					{ // simulating user correctly entering mnemonic string they needed to have written down
						confirmation_cb(mnemonicString)
					}
					const fn = function(err, walletInstance) {}
					self.context.walletsListController.WhenBooted_CreateAndAddNewlyGeneratedWallet(
						informingAndVerifyingMnemonic_cb,
						fn
					)					
				}
				return false
			}
		)
	}
}