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
/*global cordova, QRScanner */
/*eslint no-undef: "error"*/
//
const QRScanningUI_Abstract = require('./QRScanningUI_Abstract')
//
class QRScanningUI extends QRScanningUI_Abstract
{
	constructor(options, context)
	{
		super(options, context)
		if (!QRScanner || typeof QRScanner === 'undefined') {
			throw `${self.constructor.name} requires a 'QRScanner'`
		}
	}
	//
	// Runtime - Internal - Imperatives - Scanner presentation
	_hideDOMAndDisplayCameraUI()
	{
		const self = this
		// TODO: probably show camera UI as well here (nav bar) for cancel btn - which means don't hide whole body, but app root container
		document.body.style.visibility = "hidden"
	}
	_teardownScannerAndReShowDOM(fn)
	{
		const self = this
		self.__reShowDOM() // show this (a) before destroy to prevent flash and (b) in all error cb cases
		//
		QRScanner.pausePreview()
		QRScanner.destroy(
			function(status)
			{
				QRScanner.hide( // "Configures the native webview to be opaque with a white background, covering the video preview."
					function(status)
					{
						fn()
					}
				)
			}
		)
	}
	__reShowDOM()
	{
		const self = this
		// TODO: probably show camera UI as well here (nav bar) for cancel btn - which means don't re-show whole body, but app root container
		document.body.style.visibility = "visible"
	}
	//
	// Runtime - Interface - Imperatives - Scanning
	PresentUIToScanOneQRCodeString(
		fn // (err?, string) -> Void
	)
	{
		const self = this
		QRScanner.prepare( // show the prompt (if necessary(?))
			function(err, status)
			{
				if (err) { // here we can handle errors and clean up any loose ends.
					fn(err)
					return // must exit
				}
				if (status.denied != false) {
					fn(new Error("QR scanning requires camera access. Please enable MyMonero in your system Settings."))
					// TODO: ? give use the option to open up settings with some sort of prompt in the validation msg? may be possible via `QRScanner.openSettings()`
					return
				}
				if (status.authorized != true) {
					fn(new Error("Couldn't gain camera access for QR scanning. Please try again."))
					return
				}
				//
				// Now we must check if the app is still unlocked. If it is not, do not show the
				// QR code scanner here -- b/c the system  (Android) must have either killed or
				// backgrounded the app while requesting permissions. Until we fix this, the user
				// has to hit "Use  Camera" again after unlocking. So, a nice TODO….
				let passwordController = self.context.passwordController
				if (passwordController.hasUserSavedAPassword !== true) {
					throw "No password entered. Unexpected." // would be very odd
				}
				if (passwordController.IsUserChangingPassword()) {
					throw "User changing password. Unexpected." // would be very odd
				}
				// so a password has been entered… is app unlocked?
				if (passwordController.HasUserEnteredValidPasswordYet() !== true) { 
					// the app must have been backgrounded while camera permissions were being
					// requested… and the app needs to be unlocked before they can use it, so going
					// to treat this as a cancellation (silent reply) for now…. user has to try
					// again
					fn(null, null) 
					return
				}
				// app is still unlocked, so we can proceed…
				__qrScanner_wasAuthorizedAndAppUnlocked()
			}
		)		
		function __qrScanner_wasAuthorizedAndAppUnlocked()
		{
			QRScanner.show(function(status) // "Configures the native webview to have a transparent background, then sets the background of the <body> and <html> DOM elements to transparent, allowing the webview to re-render with the transparent background."
			{
				if (status.prepared != true) {
					fn("Camera unexpectedly not prepared. Please try again.", null)
					return
				}
				if (status.showing != true) {
					fn("Camera unexpectedly not showing. Please try again.", null)
					return
				}
				//
				// Now, since the QR scanner UI is not a DOM element, but
				// actually a layer behind the whole app, we must hide all DOM
				// elements while the camera is showing
				self._hideDOMAndDisplayCameraUI()
				//
				QRScanner.scan(function(err, text)
				{
					self._teardownScannerAndReShowDOM( // regardless of whether err exists
						function()
						{
							if (err) {
								console.error("err", err)
								if(err.name === 'SCAN_CANCELED') {
									console.error('The scan was canceled before a QR code was found.')
									fn(null, null) // return empty but no err -> canceled
									return
								}
								fn(err)
								return
							}
							fn(null, text) 
						}
					)
				})
			})
		}
	}
}
module.exports = QRScanningUI