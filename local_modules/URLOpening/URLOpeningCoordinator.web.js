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
const EventEmitter = require('events')
//
const PROTOCOL_PREFIX = "monero" // this is also specified for MacOS in packager.js under scheme
// maybe support "mymonero" too
//
class URLOpeningCoordinator extends EventEmitter
{
	//
	// Lifecycle - Init
	constructor(options, context)
	{
		super() // must call before accessing `this`
		const self = this
		self.options = options
		self.context = context
		self.setup()
	}
	setup()
	{
		const self = this
		const controller = self.context.urlOpeningController
		controller.on(
			controller.EventName_ReceivedURLToOpen_FundsRequest(),
			function(url)
			{
				if (self.isAllowedToReceiveURLs() == false) {
					if (self.context.passwordController.IsUserChangingPassword() === true) {
						console.log("User is changing pw - not waiting for that to finish since the user probably doesn't want to open the URL in this state anyway")
						return false
					}
					// This is commented because... it'll always be true! Better would be to have a check that says "no wallets saved to disk"
					// if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
					// 	console.log("No wallet - not waiting for PW entry to open this URL since that may not be what the user intends")
					// 	return false
					// }
					const hasUserSavedAPassword = self.context.passwordController.hasUserSavedAPassword;
					if (hasUserSavedAPassword == false) {
						// app is blank - no wallets have been created, password hasn't been entered…… ignore so as not to cause a superfluous password entry request
						return false
						// NOTE: returning before self.requestURLToOpen_pendingFromDisallowedFromOpening set - at least for now, b/c otherwise _yieldThatTimeToHandleReceivedMoneroURL would never be called unless code further enhanced to avoid call to OnceBootedAndPasswordObtained when hasAPasswordBeenSaved=false
					}
					let hadExistingPendingURL = self.requestURLToOpen_pendingFromDisallowedFromOpening != null && typeof self.requestURLToOpen_pendingFromDisallowedFromOpening !== 'undefined' ? true : false
					self.requestURLToOpen_pendingFromDisallowedFromOpening = url // we will clear this either on the app going back into the background (considered a cancellation or failed attempt to unlock), the requestURL is processed after unlock, or
					console.warn("URLOpening: Not allowed to perform URL opening ops yet but a password has been saved. Hanging onto requestURLToOpen until app unlocked.")
					if (hadExistingPendingURL == false) { // so we don't make duplicative requests for pw entry notification
						self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
							function(obtainedPasswordString, userSelectedTypeOfPassword)
							{ // it might be slightly more rigorous to observe the contact list controller for its next boot to do this but then we have to worry about whether that is waiting for all the information we would end up actually needing… so I'm opting for the somewhat more janky but probably safer option of using a delay to wait for things to load
								setTimeout(
									function()
									{
										if (self.requestURLToOpen_pendingFromDisallowedFromOpening != null && typeof self.requestURLToOpen_pendingFromDisallowedFromOpening !== 'undefined') { // if still have one - aka not cancelled
											self._yieldThatTimeToHandleReceivedMoneroURL(self.requestURLToOpen_pendingFromDisallowedFromOpening)
										} else {
											console.warn("URLOpening: Called back from a pw entry notification but no longer had a self.requestURLToOpen_pendingFromDisallowedFromOpening")
										}
									}, 
									1 * 1000 // waiting a longer time than the native apps b/c things can take a little while to set up... maybe tie this directly to the tab bar becoming active somehow instead of using this fudge-factor
								)
							},
							function()
							{ // user canceled
							}
						)
					}
				} else {
					self._yieldThatTimeToHandleReceivedMoneroURL(url)
				}
			}
		)
	}
	//
	// Runtime - Accessors
	EventName_TimeToHandleReceivedMoneroRequestURL()
	{
		return "EventName_TimeToHandleReceivedMoneroRequestURL"
	}
	//
	isAllowedToReceiveURLs()
	{
		const self = this
		if (self.context.passwordController.HasUserEnteredValidPasswordYet() === false) {
			console.log("User hasn't entered valid pw yet")
			return false
		}
		if (self.context.passwordController.IsUserChangingPassword() === true) {
			console.log("User is changing pw.")
			return false
		}
		if (!self.context.walletsListController.records || self.context.walletsListController.records.length == 0) {
			console.log("No wallets.")
			return false
		}
		return true;
	}
	//
	// Imperatives
	_yieldThatTimeToHandleReceivedMoneroURL(url)
	{
		const self = this;
		self.requestURLToOpen_pendingFromDisallowedFromOpening = null // JIC it was set
		self.emit(self.EventName_TimeToHandleReceivedMoneroRequestURL(), url)
	}
}
module.exports = URLOpeningCoordinator