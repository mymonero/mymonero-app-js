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
const ListCellView = require('../../Lists/Views/ListCellView.web')
//
class ContactsListCellView extends ListCellView
{
	constructor(options, context)
	{
		super(options, context)
	}
	overridable_startObserving_record()
	{
		const self = this
		super.overridable_startObserving_record()
		//
		if (typeof self.record === 'undefined' || self.contact === null) {
			throw "self.record undefined in start observing"
			return
		}
		// here, we're going to store a bunch of functions as instance properties
		// because if we need to stopObserving we need to have access to the listener fns
		const emitter = self.record
		self.contact_EventName_contactInfoUpdated_listenerFunction = function()
		{
			self.overridable_configureUIWithRecord()
		}
		emitter.on(
			emitter.EventName_contactInfoUpdated(),
			self.contact_EventName_contactInfoUpdated_listenerFunction
		)
	}
	overridable_stopObserving_record()
	{
		const self = this
		super.overridable_stopObserving_record()
		//
		if (typeof self.record === 'undefined' || !self.record) {
			return
		}
		const emitter = self.record
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.contact_EventName_contactInfoUpdated_listenerFunction) === true) {
			emitter.removeListener(
				emitter.EventName_contactInfoUpdated(),
				self.contact_EventName_contactInfoUpdated_listenerFunction
			)
		}
	}
	overridable_configureUIWithRecord()
	{
		super.overridable_configureUIWithRecord()
		//
		const self = this
		self._configureUIWithContact__contactInfo()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	_configureUIWithContact__contactInfo()
	{
		const self = this
		if (typeof self.record === 'undefined' || !self.record) {
			self.convenience_removeAllSublayers()
			return
		}
		if (self.record.didFailToInitialize_flag === true 
			|| self.record.didFailToBoot_flag === true) { // unlikely, but possible
			self.layer.innerHTML += 
				`<h4>Error: Couldn't open this contact.</h4>`
				+ `<p>Please report this issue to us via Support.</p>`
			return // ^-- (how) do we really want to do this ?
		}
		// flash views for now since we're not doing cell view recycling yet… these should be cached at setup and merely configured here
		self.convenience_removeAllSublayers()
		{ // emoji
			const layer = document.createElement("span")
			layer.innerHTML = self.record.emoji
			self.layer.appendChild(layer)
		}
		{ // name
			const layer = document.createElement("span")
			layer.innerHTML = self.record.fullname
			self.layer.appendChild(layer)
		}
		{ // address
			const layer = document.createElement("span")
			layer.innerHTML = self.record.address
			self.layer.appendChild(layer)
		}
	}
}
module.exports = ContactsListCellView
