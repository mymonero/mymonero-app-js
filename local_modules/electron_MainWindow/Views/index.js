"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
const mainWindowController = remote__context.mainWindowController
mainWindowController.RendererProcessDidGetControl()
//
var rootView;
setup_rootView()
function setup_rootView()
{
	const options = {}
	const renderer_context =
	{
		passwordController: remote__context.passwordController,
		walletsListController: remote__context.walletsListController,
		contactsListController: remote__context.contactsListController
	}
	const RootView = require('./RootView.web.js')
	const view = new RootView(options, renderer_context)
	view.superview = null // just to be explicit
	//
	// manually attach the rootView to the DOM
	rootView = view // hang onto reference
	document.body.appendChild(view.layer) // the `layer` is actually the DOM element
}
