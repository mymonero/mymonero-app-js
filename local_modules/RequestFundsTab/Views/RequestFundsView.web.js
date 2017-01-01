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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web.js')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web.js')
//
class RequestFundsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
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
		{ // inputs
			const containerLayer = document.createElement("div")
			{ // parameters
				containerLayer.style.border = "1px solid #888"
				containerLayer.style.borderRadius = "5px"
			}
			{ // hierarchy
				{
					const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
					{
						const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("To Wallet")
						div.appendChild(labelLayer)
						//
						const valueLayer = commonComponents_forms.New_fieldValue_walletSelectLayer({
							walletsListController: self.context.walletsListController,
							didChangeWalletSelection_fn: function(selectedWallet)
							{
								self.wallet = selectedWallet
								self._tryToRegenerateRequest()
							}
						})
						div.appendChild(valueLayer)
						//
						valueLayer.ExecuteWhenBooted(
							function()
							{
								self.wallet = valueLayer.CurrentlySelectedWallet
								self._tryToRegenerateRequest() // technically, this is not necessary since we don't have an address
							}
						)
					}
					{ // to get the height
						div.appendChild(commonComponents_tables.New_clearingBreakLayer())
					}
					containerLayer.appendChild(div)
				}
				{
					containerLayer.appendChild(commonComponents_tables.New_separatorLayer())
				}
				{ // Request funds from sender
					const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
					{
						const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("From") // note use of _forms.
						div.appendChild(labelLayer)
						//
						const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
							placeholderText: "Contact, OpenAlias, or address"
						})
						{
							var __valueLayer_debounceTimeout = null
							valueLayer.addEventListener(
								"keyup",
								function(event)
								{
									{ // (re)set state
										self.address = valueLayer.value
										self.hasAnalyzedAndResolveAddressInfo = false
									}									
									if (__valueLayer_debounceTimeout !== null) {
										clearTimeout(__valueLayer_debounceTimeout)
										__valueLayer_debounceTimeout = null
									}
									if (event.keyCode === 13) {
										self._tryToRegenerateRequest()
										return
									}
									__valueLayer_debounceTimeout = setTimeout(
										function()
										{
											__valueLayer_debounceTimeout = null
											self._tryToRegenerateRequest()
										},
										500
									)
								}
							)
						}
						div.appendChild(valueLayer)
					}
					{ // to get the height
						div.appendChild(commonComponents_tables.New_clearingBreakLayer())
					}
					containerLayer.appendChild(div)
				}
			}
			self.layer.appendChild(containerLayer)
		}
		{
			self.layer.appendChild(commonComponents_tables.New_separatorLayer())
		}
		{ // generatedRequest_layer
			const containerLayer = document.createElement("div")
			{
			}
			self.generatedRequest_layer = containerLayer
			self.layer.appendChild(containerLayer)
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Request Monero"
	}
	//
	//
	// Runtime - Imperatives - Request generation
	//
	_tryToRegenerateRequest()
	{
		const self = this
		console.log("_tryToRegenerateRequest")
		if (typeof self.wallet === 'undefined' || !self.wallet) {
			self._clearRequestResultUI()
			return
		}
		if (typeof self.address === 'undefined' || !self.address) {
			self._clearRequestResultUI()
			return
		}
		if (self.hasAnalyzedAndResolveAddressInfo === false) {
			// mark as "currently resolving" and configure the 'resolving…' activity indicator
			console.log("TODO: now check if the address has been looked up. if it hasn't, look it up, and then try to re-enter")
			// I. Resolve/validate payment ID
			// II. mark hasAnalyzedAndResolveAddressInfo true
			// III. re-enter self._tryToRegenerateRequest()
			return
		}
		if (self.payment_id === 'undefined' || !self.payment_id) {
			throw "true self.hasAnalyzedAndResolveAddressInfo but no self.payment_id"
		}
		{
			self.uri = `monero:`
			// TODO: generate QR code image ... store in mem as base64 / buffer to avoid disk storage?
		}
		self.__givenRequest_configureRequestUI()
	}
	_clearRequestResultUI()
	{
		const self = this
		self.__removeAllRequestUIChildren()
	}
	__removeAllRequestUIChildren()
	{
		const self = this
		var firstChild = self.generatedRequest_layer.firstChild
		while (firstChild !== null) {
			self.generatedRequest_layer.removeChild(firstChild)
			firstChild = self.generatedRequest_layer.firstChild
		}
	}
	__givenRequest_configureRequestUI()
	{
		const self = this
		{ // clear
			var firstChild = self.generatedRequest_layer.firstChild
			while (firstChild !== null) {
				self.generatedRequest_layer.removeChild(firstChild)
				firstChild = self.generatedRequest_layer.firstChild
			}
		}
		{ // build
			{ // URI
				const layer = document.createElement("p")
				{
					layer.innerHTML = self.uri 
				}
				self.generatedRequest_layer.appendChild(layer)
			}
			{ // QR code
				const layer = document.createElement("img")
				{
					layer.alt = self.uri
					// layer.src = ""
				}
				self.generatedRequest_layer.appendChild(layer)
			}
		}
	}
	
	
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		// teardown any child/referenced stack navigation views if necessary…
	}
}
module.exports = RequestFundsView