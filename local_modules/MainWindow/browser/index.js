"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
const mainWindowController = remote__context.mainWindowController
mainWindowController.RendererProcessDidGetControl()
//
const WalletsList = require('../../Wallets/Views/WalletsList')
//
const renderer_context = {}
//
document.addEventListener("DOMContentLoaded", function()
{
	const root_container = document.getElementById('root-container')
	setup_views(root_container, mainWindowController)
})
//
function setup_views(root_container)
{
	const walletsList = new WalletsList({}, renderer_context)
	console.log("walletsList", walletsList)
}
