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
	setup_views()
	{
		const self = this
		super.setup_views()
		self.layer.style.position = "relative"
		self.layer.style.padding = "19px 0 7px 0"
		self.__setup_emojiLayer()
		self.__setup_nameLayer()
		self.__setup_addressLayer()
		self.__setup_accessoryArrow()
		self.__setup_cellSeparatorLayer()
	}
	__setup_emojiLayer()
	{
		const self = this
		const layer = document.createElement("span")
		layer.style.position = "absolute"
		layer.style.left = "16px"
		layer.style.top = "20px"
		layer.style.fontSize = "13px"
		layer.style.color = "#9e9c9e"
		self.emojiLayer = layer
		self.layer.appendChild(layer)
	}
	__setup_nameLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.position = "relative"
		layer.style.margin = "0 66px 4px 50px"
		layer.style.height = "auto"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		layer.style.fontWeight = "400"
		layer.style.wordBreak = "break-word"
		layer.style.color = "#fcfbfc"
		self.nameLayer = layer
		self.layer.appendChild(layer)
	}
	__setup_addressLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.position = "relative"
		layer.style.margin = "0 66px 4px 50px"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
		layer.style.fontWeight = "normal"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		self.addressLayer = layer
		self.layer.appendChild(layer)
	}	
	__setup_accessoryArrow()
	{
		const self = this
		const image_filename = "list_rightside_chevron.png"
		const layer = document.createElement("img")
		layer.src = "../../Contacts/Resources/" + image_filename
		layer.style.position = "absolute"
		layer.style.width = "7px"
		const h = 12
		layer.style.height = `${h}px`
		layer.style.right = "16px"
		layer.style.top = `calc(50% - ${h / 2}px)`
		self.layer.appendChild(layer)
	}
	__setup_cellSeparatorLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.background = "#413e40"
		layer.style.position = "absolute"
		layer.style.bottom = "0"
		layer.style.height = "1px"
		const margin_left = 50
		layer.style.width = `calc(100% - ${margin_left}px)`
		layer.style.left = `${margin_left}px`
		layer.style.visibility = "visible" // to be configured
		self.cellSeparatorLayer = layer
		self.layer.appendChild(layer)
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
		if (self.isAtEnd == true) {
			self.cellSeparatorLayer.style.visibility = "hidden"
		} else {
			self.cellSeparatorLayer.style.visibility = "visible"
		}
		if (typeof self.record === 'undefined' || !self.record) {
			self.emojiLayer.innerHTML = ""
			self.nameLayer.innerHTML = ""
			self.addressLayer.innerHTML = ""
			return
		}
		if (self.record.didFailToInitialize_flag === true || self.record.didFailToBoot_flag === true) { // unlikely, but possible
			self.emojiLayer.innerHTML = "❌"
			self.nameLayer.innerHTML = "Error: Please contact support."
			self.addressLayer.innerHTML = ""
			return
		}
		self.emojiLayer.innerHTML = self.record.emoji
		self.nameLayer.innerHTML = self.record.fullname
		self.addressLayer.innerHTML = self.record.address
		// self.DEBUG_BorderAllLayers()
	}
}
module.exports = ContactsListCellView
