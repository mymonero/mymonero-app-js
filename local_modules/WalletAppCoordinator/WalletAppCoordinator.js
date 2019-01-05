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

"use strict"
//
const EventEmitter = require('events')
//
class WalletAppCoordinator extends EventEmitter
{
	//
	//
	// Lifecycle - Constructor
	//
	constructor(options, context)
	{
		super() // must call super before we can access `this`
		const self = this
		{
			self.options = options
			self.context = context
		}
		self.setup()
	}
	setup()
	{
		const self = this
	}
	//
	// Runtime - Accessors - Event names
	EventName_willTrigger_sendFundsFromWallet()
	{
		return "EventName_willTrigger_sendFundsFromWallet"
	}
	EventName_didTrigger_sendFundsFromWallet()
	{
		return "EventName_didTrigger_sendFundsFromWallet"
	}
	//
	EventName_willTrigger_requestFundsFromContact()
	{
		return "EventName_willTrigger_requestFundsFromContact"
	}
	EventName_didTrigger_requestFundsFromContact()
	{
		return "EventName_didTrigger_requestFundsFromContact"
	}
	//
	EventName_willTrigger_sendFundsToContact()
	{
		return "EventName_willTrigger_sendFundsToContact"
	}
	EventName_didTrigger_sendFundsToContact()
	{
		return "EventName_didTrigger_sendFundsToContact"
	}
	//
	// Runtime - Imperatives - Triggering events with Wallet
	Trigger_sendFundsFromWallet(object)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_sendFundsFromWallet(),
			object
		)
		self.emit(
			self.EventName_didTrigger_sendFundsFromWallet(),
			object
		)
	}
	//
	//
	// Runtime - Imperatives - Triggering events with Contact
	//
	Trigger_requestFundsFromContact(contact)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_requestFundsFromContact(),
			contact
		)
		self.emit(
			self.EventName_didTrigger_requestFundsFromContact(),
			contact
		)
	}
	Trigger_sendFundsToContact(contact)
	{
		const self = this
		self.emit(
			self.EventName_willTrigger_sendFundsToContact(),
			contact
		)
		self.emit(
			self.EventName_didTrigger_sendFundsToContact(),
			contact
		)
	}
}
module.exports = WalletAppCoordinator
