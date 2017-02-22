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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
const commonComponents_walletIcons = require('../../WalletAppCommonComponents/walletIcons.web')
//
class FundsRequestsListCellView extends ListCellView
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
		{
			const div = commonComponents_walletIcons.New_WalletIconLayer(
				"", // for now - we will config in a moment
				"large-43" // size class - for css
			) 
			div.style.left = "16px"
			div.style.top = "16px"
			div.style.position = "absolute"
			self.walletIconLayer = div
			self.layer.appendChild(div)
		}
		{ // same line
			const div = document.createElement("div")
			div.style.position = "relative"
			div.style.marginLeft = "78px"
			div.style.marginBottom = "0px"
			div.style.marginTop = "3px"
			div.style.width = "calc(100% - 38px - 78px)"
			self.amountAndSenderContainerLayer = div
			self.__setup_amountLayer()
			self.__setup_senderLayer()
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
			self.layer.appendChild(div)
		}
		self.__setup_memoLayer()
		{ 
			const layer = commonComponents_tables.New_tableCell_accessoryChevronLayer()
			layer.style.top = "26px" // instead of halfway down
			self.layer.appendChild(layer)
		}
		self.__setup_cellSeparatorLayer()
	}
	__setup_amountLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.float = "left"
		layer.style.textAlign = "left" 
		layer.style.minWidth = "calc(30% - 6px)"
		layer.style.height = "auto"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		layer.style.fontWeight = "400"
		layer.style.wordBreak = "break-word"
		layer.style.color = "#fcfbfc"
		self.amountLayer = layer
		self.amountAndSenderContainerLayer.appendChild(layer)
	}
	__setup_senderLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.float = "right"
		layer.style.textAlign = "right"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
		layer.style.fontWeight = "light"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.maxWidth = "calc(70% - 6px)"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		layer.style.wordBreak = "break-word"
		self.senderLayer = layer
		self.amountAndSenderContainerLayer.appendChild(layer)
	}
	__setup_memoLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.position = "relative"
		layer.style.display = "block" // next line
		layer.style.margin = "0 38px 8px 78px"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
		layer.style.fontWeight = "light"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		self.memoLayer = layer
		self.layer.appendChild(layer)
	}
	__setup_cellSeparatorLayer()
	{
		const self = this
		const layer = commonComponents_tables.New_tableCell_separatorLayer()
		self.cellSeparatorLayer = layer
		self.layer.appendChild(layer)
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
			self.convenience_removeAllSublayers()
			return
		}
		const fundsRequest = self.record
		if (typeof self.record === 'undefined' || !self.record) {
			self.amountLayer.innerHTML = ""
			return
		}
		if (self.record.didFailToInitialize_flag === true || self.record.didFailToBoot_flag === true) { // unlikely, but possible
			self.amountLayer.innerHTML = "❌ Error: Contact support"
			return
		}
		const uri = fundsRequest.Lazy_URI()
		self.walletIconLayer.ConfigureWithHexColorString(fundsRequest.to_walletHexColorString || "")
		self.amountLayer.innerHTML = parseFloat("" + fundsRequest.amount) + " XMR"
		var memoString = fundsRequest.message
		if (!memoString || memoString.length == "") {
			memoString = fundsRequest.description || ""
		} else {
			memoString += (fundsRequest.description ? " " + fundsRequest.description : "")
		}
		self.memoLayer.innerHTML = memoString
		self.senderLayer.innerHTML = fundsRequest.from_fullname || ""
		// self.DEBUG_BorderAllLayers()
	}
}
module.exports = FundsRequestsListCellView