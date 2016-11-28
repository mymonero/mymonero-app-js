"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
//
var rootView;
setup_rootView()
function setup_rootView()
{
	const superlayer = document.body
	const options = {}
	const renderer_context =
	{
		mainWindowController: remote__context.mainWindowController,
		passwordController: remote__context.passwordController,
		walletsListController: remote__context.walletsListController,
		contactsListController: remote__context.contactsListController
	}
	const RootView = require('./RootView.web.js')
	const view = new RootView(options, renderer_context)
	view.superview = null // just to be explicit
	view.superlayer = superlayer
	// manually attach the rootView to the DOM
	superlayer.appendChild(view.layer) // the `layer` is actually the DOM element
	//
	rootView = view // hang onto reference
}
