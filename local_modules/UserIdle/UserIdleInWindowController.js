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
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES LOSS OF USE, DATA, OR PROFITS OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const EventEmitter = require('events')
//
class UserIdleInWindowController extends EventEmitter
{
	//
	//
	// Lifecycle - Setup
	//
	constructor(options, context)
	{
		super() // must call before can access `this`
		const self = this
		{ // inputs/deps
			self.options = options
			self.context = context
		}
		{ // initial state
			self.isUserIdle = false
			self._numberOfSecondsSinceLastUserInteraction = 0
			self._numberOfRequestsToLockUserIdleAsDisabled = 0
		}
		{ // begin observing things which break/reset idle
			function __userDidInteract()
			{ // trampoline to maintain `this` and encapsulate _userDidInteract call
				const wasUserIdle = self.isUserIdle
				{
					self._userDidInteract()
				}
				if (wasUserIdle === true) { // emit after we have set isUserIdle back to false
					self._userDidComeBackFromIdle()
				}
			}
			document.onclick = __userDidInteract
			document.onmousemove = __userDidInteract
			document.onkeypress = __userDidInteract
		}
		{ // begin watching and checking if user considered idle
			self._initiate_userIdle_intervalTimer()
		}
	}
	//
	//
	// Runtime - Accessors
	//
	EventName_userDidBecomeIdle()
	{
		return "EventName_userDidBecomeIdle"
	}
	EventName_userDidComeBackFromIdle()
	{
		return "EventName_userDidComeBackFromIdle"
	}
	//
	//
	// Runtime - Imperatives - User idle timer
	//
	TemporarilyDisable_userIdle()
	{
		const self = this
		self._numberOfRequestsToLockUserIdleAsDisabled += 1
		if (self._numberOfRequestsToLockUserIdleAsDisabled == 1) { // if we're requesting to disable without it already having been disabled, i.e. was 0, now 1
			console.log("⏳  Temporarily disabling the user idle timer.")
			self.__disable_userIdle()
		} else {
			console.log("⏳  Requested to temporarily disable user idle but already disabled. Incremented lock.")
		}
	}
	ReEnable_userIdle()
	{
		const self = this
		if (self._numberOfRequestsToLockUserIdleAsDisabled == 0) {
			console.log("⏳  ReEnable_userIdle, self._numberOfRequestsToLockUserIdleAsDisabled 0")
			return // don't go below 0
		}
		self._numberOfRequestsToLockUserIdleAsDisabled -= 1
		if (self._numberOfRequestsToLockUserIdleAsDisabled == 0) {
			console.log("⏳  Re-enabling the user idle timer.")
			self.__reEnable_userIdle()
		} else {
			console.log("⏳  Requested to re-enable user idle but other locks still exist.")
		}
	}
	//
	__disable_userIdle()
	{
		const self = this
		if (!self.userIdle_intervalTimer || typeof self.userIdle_intervalTimer === 'undefined') {
			throw "__disable_userIdle called but already have nil self.userIdle_intervalTimer"
		}
		clearInterval(self.userIdle_intervalTimer)
		self.userIdle_intervalTimer = null
	}
	__reEnable_userIdle()
	{
		const self = this
		if (self.userIdle_intervalTimer && typeof self.userIdle_intervalTimer !== 'undefined') {
			throw "__reEnable_userIdle called but non-nil self.userIdle_intervalTimer"
		}
		self._initiate_userIdle_intervalTimer()
	}
	//
	_initiate_userIdle_intervalTimer()
	{
		const self = this
		const intervalTimer_interval_ms = 1000
		if (!self._userIdle_intervalTimer_fn || typeof self._userIdle_intervalTimer_fn === 'undefined') {
			self._userIdle_intervalTimer_fn = function()
			{
				self._numberOfSecondsSinceLastUserInteraction += 1 // count the second
				var appTimeoutAfterS = self.context.settingsController.appTimeoutAfterS
				if (typeof appTimeoutAfterS === 'undefined') {
					appTimeoutAfterS = 20 // on no pw entered / no settings info yet
				}
				if (appTimeoutAfterS == -1) { // then idle timer is disabled
					return // do nothing
				}
				if (self._numberOfSecondsSinceLastUserInteraction >= appTimeoutAfterS) {
					if (self.isUserIdle !== true) { // not already idle (else redundant)
						self._userDidBecomeIdle()
					}
				}
			}
			
		}
		self.userIdle_intervalTimer = setInterval(
			self._userIdle_intervalTimer_fn, 
			intervalTimer_interval_ms
		)
	}
	//
	//
	// Runtime - Delegation
	//
	_userDidInteract()
	{
		const self = this
		self._numberOfSecondsSinceLastUserInteraction = 0 // reset counter
	}
	_userDidComeBackFromIdle()
	{
		const self = this
		{
			self.isUserIdle = false // in case they were
		}
		console.log("👀  User came back from having been idle.")
		self.emit(self.EventName_userDidComeBackFromIdle())
	}
	_userDidBecomeIdle()
	{
		const self = this
		{
			self.isUserIdle = true
		}
		console.log("⏲  User became idle.")
		self.emit(self.EventName_userDidBecomeIdle())
	}
}
module.exports = UserIdleInWindowController