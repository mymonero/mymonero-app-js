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
const QRCode = require('../Vendor/qrcode.min')
//
const View = require('../../Views/View.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')
//
class FundsRequestCellContentsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		{
			self.margin_right = typeof self.options.margin_right == 'undefined' ? 38 : self.options.margin_right
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		self.layer.style.padding = "19px 0 7px 0"
		{
			const div = commonComponents_walletIcons.New_WalletIconLayer(
				commonComponents_walletIcons.SizeClasses.Large43 // note: 43
			) 
			div.style.left = "16px"
			div.style.top = "16px"
			div.style.position = "absolute"
			self.walletIconLayer = div
			self.layer.appendChild(div)
		}
		{ 
			const div = document.createElement("div")
			div.style.left = "36px"
			div.style.top = "36px"
			div.style.width = "24px"
			div.style.height = "24px"
			div.style.borderRadius = "3px"
			div.style.position = "absolute"
			div.style.backgroundColor = "#F8F7F8"
			div.style.boxShadow = "0 1px 2px 0 rgba(0,0,0,0.20), 0 1px 3px 0 rgba(0,0,0,0.10), inset 0 0 0 0 #FFFFFF"			
			self.qrCodeContainerLayer = div
			self.layer.appendChild(div)
			self.qrCode_side = 20 // for later usage… 
			{ // qrcode div
				const layer = document.createElement("div")
				{
					layer.style.width = `${self.qrCode_side}px`
					layer.style.height = `${self.qrCode_side}px`
					layer.style.margin = "2px 0 0 2px"
					layer.style.backgroundColor = "black" // not strictly necessary… mostly for debug
				}
				self.qrCode_div = layer
				div.appendChild(layer)
			}
		}
		{ // same line
			const div = document.createElement("div")
			div.style.position = "relative"
			div.style.marginLeft = "78px"
			div.style.marginBottom = "0px"
			div.style.marginTop = "3px"
			div.style.width = `calc(100% - ${self.margin_right}px - 78px)`
			self.amountAndSenderContainerLayer = div
			self.__setup_amountLayer()
			self.__setup_senderLayer()
			div.appendChild(commonComponents_tables.New_clearingBreakLayer())
			self.layer.appendChild(div)
		}
		self.__setup_memoLayer()
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
		layer.style.fontWeight = "100"
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
		layer.style.margin = `0 ${self.margin_right}px 8px 78px`
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
		layer.style.fontWeight = "100"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		self.memoLayer = layer
		self.layer.appendChild(layer)
	}
	//
	//
	// Lifecycle - Teardown/Recycling
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.stopObserving_record()
		self.record = null
	}
	PrepareForReuse()
	{
		const self = this
		//
		self.stopObserving_record()
		self.record = null
	}
	//
	//
	// Runtime - Accessors - QR Code
	//
	QRCode_imgData_base64String()
	{
		const self = this
		if (!self.qrCode_imgLayer || typeof self.qrCode_imgLayer === 'undefined') {
			throw "QRCode_imgData_base64String but nil qrCode_imgLayer"
		}
		return self.qrCode_imgLayer.src
	}
	//
	//
	// Interface - Runtime - Imperatives - State/UI Configuration
	//
	ConfigureWithRecord(record)
	{
		const self = this
		if (typeof self.record !== 'undefined') {
			self.PrepareForReuse()
		}
		self.record = record
		self._configureUIWithRecord()
		self.startObserving_record()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	_configureUIWithRecord()
	{
		const self = this
		function __clearAllLayers()
		{
			self.qrCode_div.innerHTML = ""
			self.amountLayer.innerHTML = ""
			self.memoLayer.innerHTML = ""
			self.senderLayer.innerHTML = ""
		}
		if (typeof self.record === 'undefined' || !self.record) {
			__clearAllLayers()
			return
		}
		const fundsRequest = self.record
		if (typeof self.record === 'undefined' || !self.record) {
			__clearAllLayers()
			return
		}
		if (self.record.didFailToInitialize_flag === true || self.record.didFailToBoot_flag === true) { // unlikely, but possible
			__clearAllLayers() // then, show an err
			self.amountLayer.innerHTML = "❌ Error: Contact support"
			return
		}
		const uri = fundsRequest.Lazy_URI()
		{ // qr code
			self.qrCode_div.innerHTML = "" // clear first - not sure if we need to do this
	        const qrCode = new QRCode(
				self.qrCode_div,
				{
	            	correctLevel: QRCode.CorrectLevel.L
				}
			)
			qrCode.makeCode(uri)
			{ // now must set height of qr code img layer (unless we use css rules)
				const layer = self.qrCode_div.querySelector("img")
				self.qrCode_imgLayer = layer
				layer.style.width = `${self.qrCode_side}px`
				layer.style.height = `${self.qrCode_side}px`
			}
		}
		const colorHexString = fundsRequest.to_walletHexColorString || ""
		self.walletIconLayer.ConfigureWithHexColorString(colorHexString)
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
	//
	//
	//
	// Internal - Runtime - Imperatives - Observation
	//
	startObserving_record()
	{
		const self = this
		
	}
	stopObserving_record()
	{
		const self = this
	}
	
	// startObserving_wallet()
	// {
	// 	const self = this
	// 	if (!self.wallet) {
	// 		return
	// 	}
	// 	if (typeof self.wallet === 'undefined' || self.wallet === null) {
	// 		throw "wallet undefined in start observing"
	// 		return
	// 	}
	// 	// here, we're going to store a bunch of functions as instance properties
	// 	// because if we need to stopObserving we need to have access to the listener fns
	// 	//
	// 	// wallet swatch
	// 	self.wallet_EventName_walletSwatchChanged_listenerFunction = function()
	// 	{
	// 		self._configureUIWithWallet__color()
	// 	}
	// 	self.wallet.on(
	// 		self.wallet.EventName_walletSwatchChanged(),
	// 		self.wallet_EventName_walletSwatchChanged_listenerFunction
	// 	)
	// }
	// stopObserving_wallet()
	// {
	// 	const self = this
	// 	if (typeof self.wallet === 'undefined' || !self.wallet) {
	// 		return
	// 	}
	// 	function doesListenerFunctionExist(fn)
	// 	{
	// 		if (typeof fn !== 'undefined' && fn !== null) {
	// 			return true
	// 		}
	// 		return false
	// 	}
	// 	if (doesListenerFunctionExist(self.wallet_EventName_walletSwatchChanged_listenerFunction) === true) {
	// 		self.wallet.removeListener(
	// 			self.wallet.EventName_walletSwatchChanged(),
	// 			self.wallet_EventName_walletSwatchChanged_listenerFunction
	// 		)
	// 	}
	// }
}
module.exports = FundsRequestCellContentsView
