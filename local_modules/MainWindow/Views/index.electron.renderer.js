// Copyright (c) 2014-2019, MyMonero.com
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
const setup_utils = require('../../MMAppRendererSetup/renderer_setup.electron')
setup_utils({
	reporting_processName: "MainWindow"
})
//
const remote__electron = require('electron').remote
const remote__app = remote__electron.app
const remote__context = remote__electron.getGlobal("context")
//
const RootView = require('./RootView.Full.web') // electron uses .web files as it has a web DOM
require('../../MoneroUtils/monero_utils.electron.web')({}).then(function(monero_utils)
{
	const renderer_context = require('../Models/index_context.electron.renderer').NewHydratedContext(
		remote__app,
		remote__context.menuController, // for UI and app runtime access
		remote__context.urlOpeningController,
		remote__context.appUpdatesController,
		monero_utils
	)
	{ // since we're using emoji, now that we have the context, we can call PreLoadAndSetUpEmojiOne
		const emoji_web = require('../../Emoji/emoji_web')
		emoji_web.PreLoadAndSetUpEmojiOne(renderer_context)
	}
	const options = {}
	const rootView = new RootView(options, renderer_context)
	rootView.superview = null // just to be explicit; however we will set a .superlayer
	{ // now manually attach the rootView to the DOM and specify view's usual managed reference(s)
		const superlayer = document.body
		rootView.superlayer = superlayer
		superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
	}
	//
	// setup the context menu
	require('electron-context-menu')({
		shouldShowMenu: (event, params) => params.isEditable,
		showInspectElement: false
	});
});