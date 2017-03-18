// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const setup_utils = require('../../electron_renderer_utils/renderer_setup_utils')
setup_utils()
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
//
const rootView = new_rootView() // hang onto reference
//
if (process.env.NODE_ENV !== 'development') { // cause it's slightly intrusive to the dev process and obscures stack trace
	process.on('uncaughtException', function (error)
	{ // We're going to observe this here (for electron especially) so
	  // that the exceptions are prevented from bubbling up to the UI.
		console.error("Observed uncaught exception", error)
		// TODO: re-emit and send this to the error reporting service
		var errStr;
		if (error) {
			errStr = "An unexpected application error occurred.\n\nPlease let us know of the following error message as it could be a bug:\n\n"+ error.toString()
		} else {
			errStr = "An unexpected application error occurred.\n\nPlease let us know of this issue as it could be a bug."
		}
		alert(errStr)
	})
}
//
//
// Accessors - Factories
//
function new_rootView()
{
	const RootView = require('./RootView.web') // electron uses .web files as it has a web DOM
	const renderer_context = require('./index_context.electron.renderer').NewHydratedContext(
		remote__app, 
		remote__context.menuController, // for UI and app runtime access
		remote__context.urlOpeningController
	)
	const options = {}
	const view = new RootView(options, renderer_context)
	{
		view.superview = null // just to be explicit
	}
	{
		const superlayer = document.body
		view.superlayer = superlayer
		// manually attach the rootView to the DOM
		superlayer.appendChild(view.layer) // the `layer` is actually the DOM element
	}
	//
	return view
}
