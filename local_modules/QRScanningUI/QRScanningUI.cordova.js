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
const QRScanningCameraUIMockView = require('./QRScanningCameraUIMockView.web')
const commonComponents_navigationBarButtons = require('../MMAppUICommonComponents/navigationBarButtons.web')
const NavigationBarView = require('../StackNavigation/Views/NavigationBarView.web')
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
	// Imperatives - Interface - Scanning
	PresentUIToScanOneQRCodeString(
		consumerInterface_fn // (err?, string) -> Void
	)
	{
		const self = this
		{ // some state validations
			if (typeof self.didDeconstructBootedStateAndClearPassword_listenerFn !== "undefined" && self.didDeconstructBootedStateAndClearPassword_listenerFn !== null) {
				throw "Expected self.didDeconstructBootedStateAndClearPassword_listenerFn to be null"
			}
			if (typeof self.navigationBarView !== "undefined" && self.navigationBarView !== null) {
				throw "Expected self.navigationBarView to be null"
			}
			if (typeof self.cameraUIMockView !== "undefined" && self.cameraUIMockView !== null) {
				throw "Expected self.cameraUIMockView to be null"
			}
		}
		{
			if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
				self.context.Cordova_disallowLockDownOnAppPause += 1 // place lock so Android app doesn't tear down UI and mess up flow
			}
		}
		QRScanner.prepare( // show the prompt (if necessary(?))
			function(err, status)
			{
				if (typeof self.context.Cordova_disallowLockDownOnAppPause !== 'undefined') {
					self.context.Cordova_disallowLockDownOnAppPause -= 1 // remove lock
				}
				//
				if (err) { // here we can handle errors and clean up any loose ends.
					consumerInterface_fn(err)
					return // must exit
				}
				if (status.denied != false) {
					consumerInterface_fn(new Error("QR scanning requires camera access. Please enable MyMonero in your system Settings."))
					// TODO: ? give use the option to open up settings with some sort of prompt in the validation msg? may be possible via `QRScanner.openSettings()`
					return
				}
				if (status.authorized != true) {
					consumerInterface_fn(new Error("Couldn't gain camera access for QR scanning. Please try again."))
					return
				}
				//
				// Now we must check if the app is still unlocked. If it is not, do not show the
				// QR code scanner here -- b/c the system  (Android) must have either killed or
				// backgrounded the app while requesting permissions. Until we fix this, the user
				// has to hit "Use  Camera" again after unlocking. So, a nice TODO….
				let passwordController = self.context.passwordController
				if (passwordController.hasUserSavedAPassword !== true) {
					throw "No password ever entered. Unexpected." // would be very odd
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
					consumerInterface_fn(null, null) 
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
					consumerInterface_fn("Camera unexpectedly not prepared. Please try again.", null)
					return
				}
				if (status.showing != true) {
					consumerInterface_fn("Camera unexpectedly not showing. Please try again.", null)
					return
				}
				//
				// Now, since the QR scanner UI is not a DOM element, but
				// actually a layer behind the whole app, we must hide all DOM
				// elements while the camera is showing
				self._hideDOMAndDisplayCameraUI(
					function()
					{ // cancelButtonTapped_fn
						self._teardownScannerAndCameraUIAndReShowDOM( // if they hit cancel
							function()
							{
								consumerInterface_fn(null, null) // ensure this gets called
							}
						)
					},
					function()
					{ // didDeconstructBootedStateAndClearPassword_fn
						self._teardownScannerAndCameraUIAndReShowDOM(
							function()
							{
								consumerInterface_fn(null, null) // ensure this gets called
							}
						)
					}
				)
				//
				QRScanner.scan(function(err, text)
				{
					self._teardownScannerAndCameraUIAndReShowDOM( // regardless of whether err exists
						function()
						{
							if (err) {
								console.error("err", err)
								if(err.name === 'SCAN_CANCELED') {
									console.error('The scan was canceled before a QR code was found.')
									consumerInterface_fn(null, null) // return empty but no err -> canceled
									return
								}
								consumerInterface_fn(err)
								return
							}
							consumerInterface_fn(null, text) 
						}
					)
				})
			})
		}
	}
	//
	// Imperatives - Internal - Scanner UI presentation and scanner teardown
	_hideDOMAndDisplayCameraUI(
		cancelButtonTapped_fn,
		didDeconstructBootedStateAndClearPassword_fn
	)
	{
		const self = this
		{ // before inserting the camera UI…
			self.elementsHiddenForScanning = document.body.children // hang onto these for re-show
			self.hiddenChildrenStyleDisplayByIndex = {} // initialize for recording
			const numberOfHiddenChildren = self.elementsHiddenForScanning.length
			for (var i = 0 ; i < numberOfHiddenChildren ; i++) {
				const child = self.elementsHiddenForScanning[i]
				self.hiddenChildrenStyleDisplayByIndex[i] = child.style.display // record for re-display
				child.style.display = "none"
			}
		}
		{ // show camera UI here for cancel btn
			{ // navigationBarView
				const view = new NavigationBarView(
					{
						navigationController: {}
						// NOTE: ^-- this is a mock object… which is slightly janky, but ok in this case, b/c
						// the nav bar only needs the navigationController option for stuff like animations etc
					}, 
					self.context
				)
				document.body.appendChild(view.layer)
				self.navigationBarView = view
			}
			{ // need to create a mocked view to pass to the navigationBar for it to query for nav bar title and cancel button
				self.cameraUIMockView = new QRScanningCameraUIMockView(
					{
						cancelButtonTapped_fn: function()
						{
							cancelButtonTapped_fn()
						}
					}, 
					self.context
				)
				self.navigationBarView.SetTopStackView(
					self.cameraUIMockView, 
					null, // old_topStackView
					false, // isAnimated 
					undefined, // ifAnimated_isFromRightNotLeft
					false // trueIfPoppingToRoot
				)
			}
		}
		{ // observe password controller for lockdown and treat as cancellation
			const emitter = self.context.passwordController
			self.didDeconstructBootedStateAndClearPassword_listenerFn = function()
			{
				didDeconstructBootedStateAndClearPassword_fn()
			}
			emitter.on(
				emitter.EventName_didDeconstructBootedStateAndClearPassword(),
				self.didDeconstructBootedStateAndClearPassword_listenerFn
			)
		}
	}
	_teardownScannerAndCameraUIAndReShowDOM(finished_fn)
	{
		const self = this
		{ // stop observing
			const emitter = self.context.passwordController
			emitter.removeListener(
				emitter.EventName_didDeconstructBootedStateAndClearPassword(),
				self.didDeconstructBootedStateAndClearPassword_listenerFn
			)
			self.didDeconstructBootedStateAndClearPassword_listenerFn = null
		}
		{ // show elements before destroy to prevent flash
			const numberOfHiddenChildren = self.elementsHiddenForScanning.length
			for (var i = 0 ; i < numberOfHiddenChildren ; i++) {
				const child = self.elementsHiddenForScanning[i]
				child.style.display = self.hiddenChildrenStyleDisplayByIndex[i] // original value
			}
			self.elementsHiddenForScanning = null // zero
			self.hiddenChildrenStyleDisplayByIndex = null // zero
		}
		{ // remove camera UI
			self.navigationBarView.layer.parentNode.removeChild(self.navigationBarView.layer)
			self.navigationBarView = null
			self.cameraUIMockView = null
		}
		{ // tear down QR scanner
			QRScanner.pausePreview()
			QRScanner.destroy(
				function(status)
				{
					QRScanner.hide( // "Configures the native webview to be opaque with a white background, covering the video preview."
						function(status)
						{
							finished_fn()
						}
					)
				}
			)
		}
	}
}
module.exports = QRScanningUI