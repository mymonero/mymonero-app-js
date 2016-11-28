"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
const mainWindowController = remote__context.mainWindowController
mainWindowController.RendererProcessDidGetControl()
//
var root_container;
//
document.addEventListener("DOMContentLoaded", function()
{
	root_container = document.getElementById('root-container')
	setup_views()
})
//
function setup_views()
{
	const views = []
	views.push(_new_walletsList())
}
function _new_walletsList()
{
	const WalletsList = require('../../Wallets/Views/WalletsList')
	const view = new WalletsList({
		web: true,
		superview: root_container
	}, {
		walletsListController: remote__context.walletsListController
	})
	//
	return view
}
