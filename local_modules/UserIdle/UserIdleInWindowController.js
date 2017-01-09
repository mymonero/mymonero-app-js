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
var kUserIdleTimeout_s = 60 * 5
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
			window.setInterval(
				function()
				{
				    self._numberOfSecondsSinceLastUserInteraction += 1 // count the second
				    if (self._numberOfSecondsSinceLastUserInteraction >= kUserIdleTimeout_s) {
						if (self.isUserIdle !== true) { // not already idle (else redundant)
							self._userDidBecomeIdle()
						}
				    }
				}, 
				1000
			)
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
	// Runtime - Imperatives
	//
	
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