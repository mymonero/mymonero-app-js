"use strict"

const setup_utils = require('../../MMAppRendererSetup/renderer_setup.electron')
setup_utils({
	reporting_processName: "AboutWindow"
})

const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")

const rootView = new_rootView() // hang onto reference
{ // manually attach the rootView to the DOM, manually managing internal references in this special case
	const superlayer = document.body
	rootView.superlayer = superlayer
	superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
}

function new_rootView()
{
	const RootView = require('./RootView.web') // electron uses .web files as it has a web DOM
	const renderer_context = require('../Models/index_context.electron.renderer').NewHydratedContext(
		remote__app, 
		remote__context.menuController // for UI and app runtime access
	)
	const options = {}
	const view = new RootView(options, renderer_context)
	view.superview = null // just to be explicit
	
	return view
}
