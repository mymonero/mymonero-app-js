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
			self.doNotDisplayQRCode = self.options.doNotDisplayQRCode == true ? true : false // default false
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
				self.context,
				commonComponents_walletIcons.SizeClasses.Large43 // note: 43
			) 
			div.style.left = "16px"
			div.style.top = "16px"
			div.style.position = "absolute"
			self.walletIconLayer = div
			self.layer.appendChild(div)
		}
		if (self.doNotDisplayQRCode != true) {
			const div = document.createElement("div")
			div.style.left = "36px"
			div.style.top = "36px"
			div.style.width = "24px"
			div.style.height = "24px"
			div.style.borderRadius = "3px"
			div.style.position = "absolute"
			div.style.backgroundColor = "#F8F7F8"
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				div.style.boxShadow = "0 1px 2px 0 rgba(0,0,0,0.20), 0 1px 3px 0 rgba(0,0,0,0.10), inset 0 0 0 0 #FFFFFF"
			} else { // avoiding shadow - maybe turn this into image?
				div.style.boxShadow = "inset 0 0 0 0 #FFFFFF"
			}
			self.qrCodeContainerLayer = div
			self.layer.appendChild(div)
			const qrCode_side = 20 // for later usage… 
			{ // qrcode div
				const layer = document.createElement("img")
				self.qrCode_img = layer
				div.appendChild(layer)
				layer.style.width = `${qrCode_side}px`
				layer.style.height = `${qrCode_side}px`
				layer.style.margin = "2px 0 0 2px"
				layer.style.backgroundColor = "black" // not strictly necessary… mostly for debug
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
		layer.style.cursor = "default"
		// for long names, especially for QR display wallets
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		layer.style.display = "-webkit-box"
		layer.style.webkitBoxOrient = "vertical"
		layer.style.webkitLineClamp = 2 // number of lines to show
		layer.style.lineHeight = "16px" // fallback
		layer.style.maxHeight = "40px" // fallback
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
		layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
		layer.style.fontWeight = "100"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.maxWidth = "calc(70% - 6px)"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		layer.style.wordBreak = "break-word"
		layer.style.cursor = "default"
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
		layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
		layer.style.fontWeight = "100"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		layer.style.cursor = "default"
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
		if (self.record == null) { // then we've already prepared for reuse
			return
		}
		self.stopObserving_record()
		self.record = null
	}
	PrepareForReuse()
	{
		const self = this
		if (self.record == null) { // then we've already prepared for reuse
			return
		}
		self.stopObserving_record()
		self.record = null
	}
	//
	// Runtime - Accessors 
	givenRecordAndBootedWLC_toWallet_orNull()
	{
		const self = this
		if (typeof self.record === 'undefined' || self.record == null) {
			throw "Expected self.record != nil by fundsRequest cell givenBooted_toWallet_orNil()"
		}
		const wlc = self.context.walletsListController
		if (wlc.hasBooted != true) {
			// throw "Expected wlc to be booted by fundsRequest cell givenBooted_toWallet_orNil()"
			return null // this actually can happen when tearing down - WLC goes first... but we assume it means self is about to go too
		}
		const wallets = wlc.records || []
		for (let i = 0 ; i < wallets.length ; i++) {
			const this_w = wallets[i]
			if (this_w.public_address === self.record.to_address) {
				return this_w
			}
		}
		return null
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
			if (self.doNotDisplayQRCode != true) {
				self.qrCode_img.src = ""
			}
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
			self.memoLayer.innerHTML = self.record.didFailToBoot_errOrNil ? " " + self.record.didFailToBoot_errOrNil : ""
			return
		}
		const is_displaying_local_wallet = self.record.is_displaying_local_wallet == true // handle all JS non-true vals
		var wallet_ifRecordForQRDisplay = null
		if (is_displaying_local_wallet == true) {
			const wlc = self.context.walletsListController
			if (wlc.hasBooted == false) {
				throw "Expected WLC to have booted by time of FundsRequestCellContentsView _configureUIWithRecord with non nil record"
			}
			const n_wallets = wlc.records.length
			for (let i = 0 ; i < n_wallets ; i++) {
				const w = wlc.records[i]
				if (w.public_address === self.record.to_address) {
					wallet_ifRecordForQRDisplay = w
					break
				}
			}
		}
		if (is_displaying_local_wallet) {
			if (wallet_ifRecordForQRDisplay == null) {
				throw "Expected to find wallet_ifRecordForQRDisplay when is_displaying_local_wallet"
			}
		}
		//
		if (self.doNotDisplayQRCode != true) {
			if (typeof fundsRequest.qrCode_imgDataURIString == 'undefined') {
				console.warn("qrCode_imgDataURIString still being loaded… waiting for later reconfig")
			} else {
				self.qrCode_img.src = fundsRequest.qrCode_imgDataURIString
			}
		}
		const colorHexString = is_displaying_local_wallet ? wallet_ifRecordForQRDisplay.swatch : fundsRequest.to_walletHexColorString
		self.walletIconLayer.ConfigureWithHexColorString(colorHexString || "")
		let ccy = fundsRequest.amountCcySymbol || "XMR"
		if (is_displaying_local_wallet) {
			self.amountLayer.innerHTML = "To \"" + wallet_ifRecordForQRDisplay.walletLabel + "\""// TODO localize
		} else {
			self.amountLayer.innerHTML = fundsRequest.amount ? parseFloat("" + fundsRequest.amount) + " "+ccy : "Any amount"
		}
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
		const wallet_orNil = self.givenRecordAndBootedWLC_toWallet_orNull()
		if (wallet_orNil != null) {
			const wallet = wallet_orNil
			//
			self.wallet_EventName_walletSwatchChanged_listenerFunction = function()
			{
				self._configureUIWithRecord()
			}
			wallet.on(
				wallet.EventName_walletSwatchChanged(),
				self.wallet_EventName_walletSwatchChanged_listenerFunction
			)
			//
			self.wallet_EventName_walletLabelChanged_listenerFunction = function()
			{
				self._configureUIWithRecord()
			}
			wallet.on(
				wallet.EventName_walletLabelChanged(),
				self.wallet_EventName_walletLabelChanged_listenerFunction
			)
		}
	}
	stopObserving_record()
	{
		const self = this
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		const wallet_orNil = self.givenRecordAndBootedWLC_toWallet_orNull()
		if (doesListenerFunctionExist(self.wallet_EventName_walletSwatchChanged_listenerFunction)) {
			if (wallet_orNil == null) {
				// throw "Listener function exists but wallet not found" // this will leak the observer handler
				// commented b/c reason mentioned in givenRecordAndBootedWLC_toWallet_orNull
			} else {
				wallet_orNil.removeListener(
					wallet_orNil.EventName_walletSwatchChanged(),
					self.wallet_EventName_walletSwatchChanged_listenerFunction
				)
			}
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletLabelChanged_listenerFunction)) {
			if (wallet_orNil == null) {
				// throw "Listener function exists but wallet not found" // this will leak the observer handler
				// commented b/c reason mentioned in givenRecordAndBootedWLC_toWallet_orNull
			} else {
				wallet_orNil.removeListener(
					wallet_orNil.EventName_walletLabelChanged(),
					self.wallet_EventName_walletLabelChanged_listenerFunction
				)
			}
		}
	}
}
module.exports = FundsRequestCellContentsView
