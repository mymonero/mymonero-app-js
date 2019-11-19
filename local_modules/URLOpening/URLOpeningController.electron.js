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
const URLOpeningController_Abstract = require('./URLOpeningController_Abstract')
//
class URLOpeningController extends URLOpeningController_Abstract
{
	constructor(options, context)
	{
		super(options, context)
	}
	_override_startObserving()
	{
		const self = this
		const app = self.context.app
		app.on('will-finish-launching', function()
		{ // ^ we might not need to do this
			setTimeout(function()
			{ // it might be necessary to give everything a moment to get established
				app.on("open-url", function(event, url)
				{
					event.preventDefault() // "should call this" since we want to handle it
					self.__didReceivePossibleURIToOpen(
						url,
						function()
						{
							event.preventDefault()
						}
					)
				})
				app.on('launched-duplicatively', function(argv)
				{ // main window listens for this too - and brings itself to forefont…
					// we need to listen for this here for Windows (not MacOS)
					self._didLaunchOrReOpenWithArgv(argv)
				})
				//
				function do_setAsDefaultProtocolClient()
				{
					app.setAsDefaultProtocolClient(self.PROTOCOL_PREFIX()) // this seems to be mainly necessary for Windows
				}
				// unsure if this 'ready' check is necessary - but probably can't hurt
				if (self.context.app.isReady()) {
					do_setAsDefaultProtocolClient()
				} else {
					self.context.app.on("ready", function() { do_setAsDefaultProtocolClient() })
				}
			})
		})
		setTimeout(function()
		{
			self._didLaunchOrReOpenWithArgv(process.argv)
		})
	}
	//
	// Delegation - Override implementations
	_override_didReceiveInvalidURL()
	{
		const self = this
		function do_dialog()
		{
			const {dialog} = require('electron')
			dialog.showMessageBox({
				buttons: [ 'OK' ],
				message: "Sorry, that does not appear to be a valid Monero URL."
			})
		}
		if (self.context.app.isReady()) {
			do_dialog()
		} else {
			self.context.app.on("ready", function() { do_dialog() })
		}
	}
	//
	// Delegation - Electron-specific
	_didLaunchOrReOpenWithArgv(argv)
	{
		const self = this
		const isMacOS = process.platform === "darwin"
		if (isMacOS == true) { // as we handle this with open-url
			return
		}
		const isLinux = /linux/.test(process.platform)
		const numberOfArgsIfNoPossibleURIPassed = process.env.NODE_ENV === 'development' ? 3 : (isLinux?2/*see electron-builder afterPack*/:1)
		// ^-- we need to check if prod because in dev, the app is run by executing electron with the app entrypoint as the first arg
		if (argv.length <= numberOfArgsIfNoPossibleURIPassed) { // simply launched, no args
			return
		}
		const indexOf_possibleURI = numberOfArgsIfNoPossibleURIPassed - 0 // the last one
		const possibleURI = argv[indexOf_possibleURI]
		self.__didReceivePossibleURIToOpen(possibleURI) // patch to URI reception handler, which happens to be on super
	}
}
module.exports = URLOpeningController