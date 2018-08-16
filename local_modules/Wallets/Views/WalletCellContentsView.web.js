// Copyright (c) 2014-2018, MyMonero.com
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
let Currencies = require('../../CcyConversionRates/Currencies')
let monero_amount_format_utils = require('../../mymonero_core_js/monero_utils/monero_amount_format_utils')
//
class WalletCellContentsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.wantsHoverable = self.options.wantsHoverable === false ? false : true; // default true
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
		if (self.wantsHoverable) {
			// hover effects/classes
			self.layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
			self.layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
		}
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
		layer.style.padding = paddingTop + "px 38px 4px "+paddingLeft+"px"
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
		layer.classList.add("description-label")
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		const paddingLeft = self._lookup_labelsPaddingLeft()
		layer.style.padding = "0px 38px 4px "+paddingLeft+"px"
		layer.style.fontSize = "13px"
		layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
		layer.style.fontWeight = "100"
		layer.style.webkitFontSmoothing = "subpixel-antialiased"
		layer.style.maxHeight = "32px"
		layer.style.color = "#9e9c9e"
		layer.style.wordBreak = "normal" // ensure we don't break words now that we support two lines
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
		if (doesListenerFunctionExist(self.wallet_EventName_booted_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_booted(),
				self.wallet_EventName_booted_listenerFunction
			)
			self.wallet_EventName_booted_listenerFunction = null
		}
		if (doesListenerFunctionExist(self.wallet_EventName_errorWhileBooting_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_errorWhileBooting(),
				self.wallet_EventName_errorWhileBooting_listenerFunction
			)
			self.wallet_EventName_errorWhileBooting_listenerFunction = null
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletLabelChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletLabelChanged(),
				self.wallet_EventName_walletLabelChanged_listenerFunction
			)
			self.wallet_EventName_walletLabelChanged_listenerFunction = null
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletSwatchChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletSwatchChanged(),
				self.wallet_EventName_walletSwatchChanged_listenerFunction
			)
			self.wallet_EventName_walletSwatchChanged_listenerFunction = null
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
			)
			self.wallet_EventName_balanceChanged_listenerFunction = null
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
			)
			self.wallet_EventName_balanceChanged_listenerFunction = null
		}
		if (doesListenerFunctionExist(self._CcyConversionRates_didUpdateAvailabilityOfRates_fn) === true) {
			let emitter = self.context.CcyConversionRates_Controller_shared
			emitter.removeListener(
				emitter.eventName_didUpdateAvailabilityOfRates(),
				self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
			)
			self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = null
		}
		if (doesListenerFunctionExist(self._settingsController__EventName_settingsChanged_displayCcySymbol__fn) === true) {
			let emitter = self.context.settingsController
			emitter.removeListener(
				emitter.EventName_settingsChanged_displayCcySymbol(),
				self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
			)
			self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = null
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
		self._configureUIWithWallet__labels()
		self._configureUIWithWallet__color()
	}
	_configureUIWithWallet__labels()
	{
		const self = this
		const wallet = self.wallet
		if (!wallet) {
			self.titleLayer.innerHTML = ""
			self.descriptionLayer.innerHTML = ""
			return
		}
		self.titleLayer.innerHTML = wallet.walletLabel
		var descriptionLayer_innerHTML;
		{
			if (wallet.isLoggingIn == true) {
				descriptionLayer_innerHTML = "Logging in…"
			} else if (wallet.didFailToInitialize_flag == true) { // unlikely but possible
				descriptionLayer_innerHTML = "Load error"
			} else if (wallet.didFailToBoot_flag == true) { // possible when server incorrect
				descriptionLayer_innerHTML = "Login error"
			} else if (wallet.HasEverFetched_accountInfo() === false) {
				descriptionLayer_innerHTML = "Loading…"
			} else {
				let hasLockedFunds = wallet.HasLockedFunds()
				//
				var finalizable_displayCurrency = self.context.settingsController.displayCcySymbol
				var finalizable_balanceAmountDouble = wallet.Balance_DoubleNumber() // to finalize…
				var finalizable_lockedBalanceAmountDouble_orNull = hasLockedFunds ? wallet.LockedBalance_DoubleNumber() : null // to finalize…
				//
				let XMR = Currencies.ccySymbolsByCcy.XMR
				if (finalizable_displayCurrency != XMR) {
					if (finalizable_displayCurrency == XMR) {
						throw "Unexpected displayCurrency=.XMR"
					}
					let converted_balanceAmountDouble_orNull = Currencies.displayUnitsRounded_amountInCurrency( 
						self.context.CcyConversionRates_Controller_shared,
						finalizable_displayCurrency,
						finalizable_balanceAmountDouble
					)
					let converted_lockedBalanceAmountDouble_orNull = hasLockedFunds ? Currencies.displayUnitsRounded_amountInCurrency(
						self.context.CcyConversionRates_Controller_shared,
						finalizable_displayCurrency,
						finalizable_lockedBalanceAmountDouble_orNull // we'll say this is non-nil here bc hasLockedFunds=true
					) : null
					if (converted_balanceAmountDouble_orNull != null) {
						finalizable_balanceAmountDouble = converted_balanceAmountDouble_orNull // use converted, non-xmr amount
						finalizable_lockedBalanceAmountDouble_orNull = converted_lockedBalanceAmountDouble_orNull // use converted, non-xmr amount
					} else {
						finalizable_displayCurrency = XMR // and - special case - revert currency to .xmr while waiting on ccyConversion rate
					}
				}
				//
				let final_balanceAmountDouble = finalizable_balanceAmountDouble
				let final_lockedBalanceAmountDouble = finalizable_lockedBalanceAmountDouble_orNull
				let final_displayCcySymbol = finalizable_displayCurrency
				//
				var final_balanceAmountString;
				var final_lockedBalanceAmountString_orNull;
				if (final_displayCcySymbol == XMR) {
					var final_balance_moneroAmount = monero_amount_format_utils.parseMoney(
						""+final_balanceAmountDouble // Double -> String - display formatting not required
					) 
					final_balanceAmountString = monero_amount_format_utils.formatMoney(final_balance_moneroAmount)
					if (hasLockedFunds) {
						var final_lockedBalance_moneroAmount = monero_amount_format_utils.parseMoney(
							""+final_lockedBalanceAmountDouble // Double -> String
						)
						final_lockedBalanceAmountString_orNull = monero_amount_format_utils.formatMoney(final_lockedBalance_moneroAmount)
					}
				} else {
					final_balanceAmountString = Currencies.nonAtomicCurrency_formattedString(
						final_balanceAmountDouble,
						final_displayCcySymbol
					)
					if (hasLockedFunds) {
						final_lockedBalanceAmountString_orNull = Currencies.nonAtomicCurrency_formattedString(
							final_lockedBalanceAmountDouble,
							final_displayCcySymbol
						)
					}
				}
				//
				descriptionLayer_innerHTML = final_balanceAmountString+" "+final_displayCcySymbol
				var isOnNewLine = false
				if (hasLockedFunds) {
					isOnNewLine = true
					descriptionLayer_innerHTML += ` (${final_lockedBalanceAmountString_orNull} locked)`
				}
				// TODO: pending amount
			}
		}
		self.descriptionLayer.innerHTML = descriptionLayer_innerHTML
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
	// Internal - Runtime - Imperatives - Observation
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
		// login success/fail
		self.wallet_EventName_booted_listenerFunction = function()
		{
			self._configureUIWithWallet__labels()
		}
		self.wallet.on(
			self.wallet.EventName_booted(),
			self.wallet_EventName_booted_listenerFunction
		)
		//
		self.wallet_EventName_errorWhileBooting_listenerFunction = function(err)
		{
			self._configureUIWithWallet__labels()
		}
		self.wallet.on(
			self.wallet.EventName_errorWhileBooting(),
			self.wallet_EventName_errorWhileBooting_listenerFunction
		)
		//
		// wallet label
		self.wallet_EventName_walletLabelChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__labels()
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
			self._configureUIWithWallet__labels()
		}
		self.wallet.on(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
		{
			let emitter = self.context.CcyConversionRates_Controller_shared
			self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = function()
			{
				self._configureUIWithWallet__labels()
			}
			emitter.on(
				emitter.eventName_didUpdateAvailabilityOfRates(),
				self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
			)
		}
		{
			let emitter = self.context.settingsController
			self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = function()
			{
				self._configureUIWithWallet__labels()
			}
			emitter.on(
				emitter.EventName_settingsChanged_displayCcySymbol(),
				self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
			)
		}
	}
}
module.exports = WalletCellContentsView
