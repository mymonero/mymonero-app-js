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
//
// Accessors - Factories
//
function new_rootView()
{
	const superlayer = document.body
	const options = {}
	const renderer_context =
	{ // not 100% sure if we need to make the renderer context a different object, but
	  // this at least expicitly calls out the controllers that are intended for UI usage:
		mainWindowController: remote__context.mainWindowController,
		passwordController: remote__context.passwordController,
		walletsListController: remote__context.walletsListController,
		contactsListController: remote__context.contactsListController
	}
	const RootView = require('./RootView.web.js') // electron uses .web files as it has a web DOM
	const view = new RootView(options, renderer_context)
	view.superview = null // just to be explicit
	view.superlayer = superlayer
	// manually attach the rootView to the DOM
	superlayer.appendChild(view.layer) // the `layer` is actually the DOM element
	//
	return view
}
