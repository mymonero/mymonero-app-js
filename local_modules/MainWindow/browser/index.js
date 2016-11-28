"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
const mainWindowController = remote__context.mainWindowController
mainWindowController.RendererProcessDidGetControl()
//
var rootView;
const views = [];
//
document.addEventListener("DOMContentLoaded", function()
{
	rootView = document.getElementById('RootView')
	setup_views()
})
//
function setup_views()
{
	views.push(_new_walletsList())
}
function _new_walletsList()
{
	const WalletsListView = require('../../Wallets/Views/WalletsListView')
	const view = new WalletsListView({
		web: true,
		superview: rootView,
		document: document
	}, {
		walletsListController: remote__context.walletsListController
	})
	//
	return view
}
