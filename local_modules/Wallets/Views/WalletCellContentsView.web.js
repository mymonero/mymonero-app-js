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
const View = require('../../Views/View.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
//
class WalletCellContentsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.icon_sizeClass = self.options.icon_sizeClass || commonComponents_walletIcons.SizeClasses.Large48
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
		// hover effects/classes
		self.layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
		self.layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
		{ 
			const layer = self.layer
			layer.style.wordBreak = "break-all" // to get the text to wrap
			layer.style.height = "100%"
			layer.style.position = "relative"
			layer.style.left = "0"
			layer.style.top = "0"
		}
		{ // icon
			const div = commonComponents_walletIcons.New_WalletIconLayer(
				self.context,
				self.icon_sizeClass
			)
			div.style.position = "absolute"
			div.style.left = self._lookup_walletIconLayer_left() + "px"
			div.style.top = "16px"
			self.walletIconLayer = div
			self.layer.appendChild(div)
		}
		self.__setup_titleLayer()
		self.__setup_descriptionLayer()
	}
	_lookup_walletIconLayer_left()
	{
		const self = this
		switch (self.icon_sizeClass) {
			case commonComponents_walletIcons.SizeClasses.Large48:
				return 15
			case commonComponents_walletIcons.SizeClasses.Large43:
				return 15
			case commonComponents_walletIcons.SizeClasses.Medium32:
				return 16
		}
		throw "Unhandled sef.icon_sizeClass in _lookup_walletIconLayer_left"
		// return 15
	}
	_lookup_labelsPaddingLeft()
	{
		const self = this
		switch (self.icon_sizeClass) {
			case commonComponents_walletIcons.SizeClasses.Large48:
				return 80
			case commonComponents_walletIcons.SizeClasses.Large43:
				return 75
			case commonComponents_walletIcons.SizeClasses.Medium32:
				return 66
		}
		throw "Unhandled sef.icon_sizeClass in _lookup_labelsPaddingLeft"
		// return 80
	}
	_lookup_titlelabelPaddingTop()
	{
		const self = this
		switch (self.icon_sizeClass) {
			case commonComponents_walletIcons.SizeClasses.Large48:
				return 20
			case commonComponents_walletIcons.SizeClasses.Large43:
				return 19
			case commonComponents_walletIcons.SizeClasses.Medium32:
				return 15
		}
		throw "Unhandled sef.icon_sizeClass in _lookup_titlelabelPaddingTop"
		// return 20
	}
	__setup_titleLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		const paddingTop = self._lookup_titlelabelPaddingTop()
		const paddingLeft = self._lookup_labelsPaddingLeft()
		layer.style.padding = paddingTop + "px 66px 4px "+paddingLeft+"px"
		layer.style.display = "block"
		layer.style.wordBreak = "break-word"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		self.context.themeController.StyleLayer_FontAsMiddlingSemiboldSansSerif(layer)
		layer.style.color = "#fcfbfc"
		layer.style.cursor = "default"
		// layer.style.border = "1px solid red"
		self.titleLayer = layer
		self.layer.appendChild(layer)
	}
	__setup_descriptionLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		const paddingLeft = self._lookup_labelsPaddingLeft()
		layer.style.padding = "0px 66px 4px "+paddingLeft+"px"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
		layer.style.fontWeight = "100"
		layer.style.webkitFontSmoothing = "subpixel-antialiased"
		layer.style.height = "20px"
		layer.style.color = "#9e9c9e"
		layer.style.whiteSpace = "nowrap"
		layer.style.overflow = "hidden"
		layer.style.textOverflow = "ellipsis"
		layer.style.cursor = "default"
		self.descriptionLayer = layer
		self.layer.appendChild(layer)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.stopObserving_wallet()
		self.wallet = null
	}
	//
	//
	// Internal - Teardown/Recycling
	//
	PrepareForReuse()
	{
		const self = this
		//
		self.stopObserving_wallet()
		self.wallet = null
	}
	stopObserving_wallet()
	{
		const self = this
		if (typeof self.wallet === 'undefined' || !self.wallet) {
			return
		}
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletLabelChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletLabelChanged(),
				self.wallet_EventName_walletLabelChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletSwatchChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletSwatchChanged(),
				self.wallet_EventName_walletSwatchChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
			)
		}
	}
	// Interface - Runtime - Imperatives - State/UI Configuration
	ConfigureWithRecord(wallet)
	{
		const self = this
		if (typeof self.wallet !== 'undefined') {
			self.PrepareForReuse()
		}
		self.wallet = wallet
		self._configureUIWithWallet()
		self.startObserving_wallet()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	_configureUIWithWallet()
	{
		const self = this
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__color()
	}
	_configureUIWithWallet__accountInfo()
	{
		const self = this
		const wallet = self.wallet
		if (!wallet) {
			self.titleLayer.innerHTML = ""
			self.descriptionLayer.innerHTML = ""
			return
		}
		if (wallet.didFailToInitialize_flag == true || wallet.didFailToBoot_flag == true) { // unlikely but possible
			self.titleLayer.innerHTML = "Error: Couldn't unlock wallet. Please contact support."
			self.descriptionLayer.innerHTML = ""
		} else {
			self.titleLayer.innerHTML = wallet.walletLabel
			if (wallet.HasEverFetched_accountInfo() === false) {
				self.descriptionLayer.innerHTML = "Loading…"
			} else {
				var htmlString = `${wallet.Balance_FormattedString()} ${wallet.HumanReadable_walletCurrency()}`
				if (wallet.HasLockedFunds() === true) {
					htmlString += ` (${wallet.LockedBalance_FormattedString()} 🔒)`
				}
				self.descriptionLayer.innerHTML = htmlString
			}
		}		
	}
	_configureUIWithWallet__color()
	{
		const self = this
		const fallbackColor = "#00C6FF"
		const colorHexString = self.wallet ?
								self.wallet.swatch ? 
									self.wallet.swatch 
									: fallbackColor 
								: fallbackColor
		self.walletIconLayer.ConfigureWithHexColorString(colorHexString)
	}
	//
	//
	// Internal - Runtime - Imperatives - Wallet operations
	deleteWallet()
	{
		const self = this
		self.context.walletsListController.WhenBooted_DeleteRecordWithId(
			self.wallet._id,
			function(err)
			{
				if (err) {
					console.error("Failed to delete wallet")
					return
				}
				// this change will be picked up by the list change listener
			}
		)
	}
	//
	//
	//
	// Internal - Runtime - Imperatives - Observation
	//
	startObserving_wallet()
	{
		const self = this
		if (!self.wallet) {
			return
		}
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "wallet undefined in start observing"
		}
		// here, we're going to store a bunch of functions as instance properties
		// because if we need to stopObserving we need to have access to the listener fns
		//
		// wallet label
		self.wallet_EventName_walletLabelChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__accountInfo()
		}
		self.wallet.on(
			self.wallet.EventName_walletLabelChanged(),
			self.wallet_EventName_walletLabelChanged_listenerFunction
		)
		// wallet swatch
		self.wallet_EventName_walletSwatchChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__color()
		}
		self.wallet.on(
			self.wallet.EventName_walletSwatchChanged(),
			self.wallet_EventName_walletSwatchChanged_listenerFunction
		)
		// balance
		self.wallet_EventName_balanceChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__accountInfo()
		}
		self.wallet.on(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
	}
}
module.exports = WalletCellContentsView
