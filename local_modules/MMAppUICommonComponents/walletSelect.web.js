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
const commonComponents_cssRules = require('./cssRules.web')
//
const NamespaceName = "walletSelect"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`select.walletSelect {
		display: block; /* own line */
		outline: none; /* no focus ring */

		height: 57px;
		width: 100%;
		padding: 10px 10px;
		box-sizing: border-box;

		appearance: none;
		background: #383638;
		border: none;
		box-shadow: 0 0 1px 0 #161416, inset 0 0 0 0 #494749;
		border-radius: 5px;

		text-align: left;
		font-size: 14px;
		color: #FCFBFC;
	}`,
	`select.walletSelect option {
		background: #383638;
		color: #FCFBFC;
	}`
]
function __injectCSSRules_ifNecessary()
{
	commonComponents_cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_fieldValue_walletSelectLayer(params)
{
	__injectCSSRules_ifNecessary()
	//
	const didChangeWalletSelection_fn = params.didChangeWalletSelection_fn || function(selectedWallet) {}
	const walletsListController = params.walletsListController
	if (!walletsListController || typeof walletsListController === 'undefined') {
		throw "_new_fieldValue_walletSelectLayer requires params.walletsListController"
		return null
	}
	const themeController = params.themeController
	if (!themeController || typeof themeController === 'undefined') {
		throw "_new_fieldValue_walletSelectLayer requires params.themeController"
		return null
	}
	const layer = document.createElement("select")
	{
		layer.className = "walletSelect"
		layer.style.fontFamily = themeController.FontFamily_monospace()
	}
	{ // NOTES:
		// layer.CurrentlySelectedWallet and layer.Lookup_CurrentlySelectedWallet() are defined after walletsListController booted. Use the following function to defer execution til they're ready
		layer.isBooted = false
		layer.CurrentlySelectedWallet = null // zeroing
		layer.ExecuteWhenBooted = function(fn)
		{
			if (layer.isBooted === false) {
				setTimeout(
					function()
					{
						layer.ExecuteWhenBooted(fn)
					},
					100 // ms -- small delay should be ok here
				)
				return false
			}
			fn()
			return true
		}
	}
	layer.__givenBooted_lookup_currentlySelectedWallet = function()
	{ // Not to be called until isBooted = true
		const selectedIndex = layer.selectedIndex
		const layer_options = layer.options
		const numberOf_layer_options = layer_options.length
		if (numberOf_layer_options == 0) {
			// no wallets from which to choose
			return null // so nothing selected
		}
		const selectedOption = layer.options[selectedIndex]
		if (typeof selectedOption === 'undefined' || selectedOption == null) {
			throw "nil selectedOption in __givenBooted_lookup_currentlySelectedWallet while layer.options.length != 0"
		}
		const selectedValue = selectedOption.value
		const selectedWallet_id = selectedValue;
		var selectedWallet = null;
		const wallets = walletsListController.records
		const numberOf_wallets = wallets.length
		for (let i = 0 ; i < numberOf_wallets ; i++) {
			const wallet = wallets[i]
			if (wallet._id === selectedWallet_id) {
				selectedWallet = wallet
				break
			}
		}
		//
		return selectedWallet
	}
	layer.__removeAllOptionLayers = function()
	{
		var firstChild = layer.firstChild
		while (firstChild !== null) {
			const optionLayer = firstChild
			{
				layer.___removeListenersForOptionLayer(optionLayer)
				optionLayer.wallet = null // not strictly necessary
			}
			//
		    layer.removeChild(firstChild)
			//
			firstChild = layer.firstChild
		}
	}
	layer.___removeListenersForOptionLayer = function(optionLayer)
	{
		const wallet = optionLayer.wallet
		{
			if (typeof wallet === 'undefined' || wallet === null) {
				throw "nil wallet"
			}
			{
				if (typeof optionLayer._wallet_EventName_walletLabelChanged === 'undefined' || optionLayer._wallet_EventName_walletLabelChanged === null) {
					throw "nil optionLayer._wallet_EventName_walletLabelChanged"
				}
				wallet.removeListener(
					wallet.EventName_walletLabelChanged(),
					optionLayer._wallet_EventName_walletLabelChanged
				)
			}
			{
				if (typeof optionLayer._wallet_EventName_walletSwatchChanged === 'undefined' || optionLayer._wallet_EventName_walletSwatchChanged === null) {
					throw "nil optionLayer._wallet_EventName_walletSwatchChanged"
				}
				wallet.removeListener(
					wallet.EventName_walletSwatchChanged(),
					optionLayer._wallet_EventName_walletSwatchChanged
				)
			}			
			{
				if (typeof optionLayer._wallet_EventName_balanceChanged === 'undefined' || optionLayer._wallet_EventName_balanceChanged === null) {
					throw "nil optionLayer._wallet_EventName_balanceChanged"
				}
				wallet.removeListener(
					wallet.EventName_balanceChanged(),
					optionLayer._wallet_EventName_balanceChanged
				)
			}
		}
	}
	layer.__givenBooted_configureWithWallets = function(fn)
	{
		fn = fn || function() {}
		//
		layer.__removeAllOptionLayers() // (and stop observing)
		//
		const wallets = walletsListController.records
		const numberOf_wallets = wallets.length
		{
			for (let i = 0 ; i < numberOf_wallets ; i++) {
				const wallet = wallets[i]
				const optionLayer = document.createElement("option")
				optionLayer.wallet = wallet // for later access
				function _configureOptionLayerText()
				{
					var text = `${wallet.walletLabel} (${wallet.Balance_FormattedString()} ${wallet.HumanReadable_walletCurrency()})`
					if (wallet.HasLockedFunds() === true) {
						text += ` (${wallet.LockedBalance_FormattedString()} ${wallet.HumanReadable_walletCurrency()} 🔒)`
					}
					optionLayer.text = text
				}
				function _configureOptionLayerColor(toColor)
				{
					console.log("TODO: reconfigure wallet icon as color has changed to…", toColor)
				}
				{
					_configureOptionLayerText()
					optionLayer.value = wallet._id
				}
				layer.appendChild(optionLayer)
				{ // observe wallet changes
					optionLayer._wallet_EventName_walletLabelChanged = function()
					{
						_configureOptionLayerText()
					}
					wallet.on(
						wallet.EventName_walletLabelChanged(),
						optionLayer._wallet_EventName_walletLabelChanged
					)
					//
					optionLayer._wallet_EventName_walletSwatchChanged = function(colorHexString)
					{
						_configureOptionLayerColor(colorHexString)
					}
					wallet.on(
						wallet.EventName_walletSwatchChanged(),
						optionLayer._wallet_EventName_walletSwatchChanged
					)
					//
					optionLayer._wallet_EventName_balanceChanged = function()
					{
						_configureOptionLayerText()
					}
					wallet.on(
						wallet.EventName_balanceChanged(),
						optionLayer._wallet_EventName_balanceChanged
					)
				}
			}
		}
		{
			if (layer.CurrentlySelectedWallet !== null) { // reconstitute selection if possible
				layer.value = layer.CurrentlySelectedWallet._id
			}
			setTimeout(function() {
				// cache/update selection state - and on next tick because it races
				layer.CurrentlySelectedWallet = layer.__givenBooted_lookup_currentlySelectedWallet() // trailing tracker for diff
				fn()
			})
		}
	}
	{ // Initiate or wait for boot
		walletsListController.ExecuteWhenBooted(
			function()
			{
				layer.__givenBooted_configureWithWallets(function()
				{
					layer.isBooted = true // now we can finally set this to true
				})
			}
		)
	}
	{ // Observe interactions
		layer.addEventListener(
			"change",
			function(e)
			{
				e.preventDefault()
				{
					var selectedWallet = layer.__givenBooted_lookup_currentlySelectedWallet()
					if (selectedWallet === null) {
						throw "couldn't find selectedWallet wallet select onchange"
						layer.CurrentlySelectedWallet = null
						didChangeWalletSelection_fn(layer.CurrentlySelectedWallet)
						return
					}
					if (
						layer.CurrentlySelectedWallet === null // no prev selection
						|| layer.CurrentlySelectedWallet._id !== selectedWallet._id // or different selection
					) {
						layer.CurrentlySelectedWallet = selectedWallet
						didChangeWalletSelection_fn(layer.CurrentlySelectedWallet)
					}
				}
				return false
			}
		)
	}
	{ // Observe list changes
		// List changes
		layer._walletsListController_EventName_listUpdated = function()
		{
			layer.__givenBooted_configureWithWallets()
		}
		walletsListController.on(
			walletsListController.EventName_listUpdated(),
			layer._walletsListController_EventName_listUpdated
		)
	}
	{
		layer.Component_TearDown = function()
		{ // You can call this function if you need to remove the layer from the DOM. You should call
			// it so that it stops observing
			console.log("♻️  Tearing down wallet select layer.")
			walletsListController.removeListener(
				walletsListController.EventName_listUpdated(),
				layer._walletsListController_EventName_listUpdated
			)
			layer._walletsListController_EventName_listUpdated = null
		}
	}
	return layer
}
exports.New_fieldValue_walletSelectLayer = New_fieldValue_walletSelectLayer