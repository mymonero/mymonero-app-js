"use strict"
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
const mainWindowController = remote__context.mainWindowController
mainWindowController.RendererProcessDidGetControl()
//
const RootView = require('./RootView.web.js')
var rootView;
//
document.addEventListener("DOMContentLoaded", function()
{
	const options = {}
	rootView = new RootView(options, remote__context)
})
