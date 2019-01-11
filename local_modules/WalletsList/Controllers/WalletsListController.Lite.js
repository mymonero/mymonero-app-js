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
//
const WalletsListController_Base = require('./WalletsListController_Base')
//
class WalletsListController extends WalletsListController_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	//
	//
	LiteAppWalletName()
	{
		return "My Monero Wallet"
	}
	LiteAppWalletSwatchColor() // possibly change this to random color at some point
	{
		const self = this
		return self.BlueSwatchHexColorString()
	}
	//
	//
	CreateNewWallet_NoBootNoListAdd(
		fn, // fn: (err: Error?, walletInstance: Wallet) -> Void
		optl_locale_code
	) {
		const self = this
		if (self.records.length > 0) {
			fn(new Error("Browser app only supports one wallet at a time"))
			return
		}
		super.CreateNewWallet_NoBootNoListAdd(fn, optl_locale_code)
	}	
	WhenBooted_ObtainPW_AddNewlyGeneratedWallet(
		walletInstance,
		walletLabel,
		swatch,
		fn, // fn: (err: Error?, walletInstance: Wallet) -> Void
		optl__userCanceledPasswordEntry_fn
	) {
		const self = this
		if (self.records.length > 0) {
			fn(new Error("Browser app only supports one wallet at a time"))
			return
		}
		super.WhenBooted_ObtainPW_AddNewlyGeneratedWallet(
			walletInstance,
			walletLabel,
			swatch,
			fn,
			optl__userCanceledPasswordEntry_fn
		)
	}
	WhenBooted_ObtainPW_AddExtantWalletWith_MnemonicString(
		walletLabel,
		swatch,
		mnemonicString,
		fn, // fn: (err: Error?, walletInstance: Wallet, wasWalletAlreadyInserted: Bool?) -> Void
		optl__userCanceledPasswordEntry_fn
	)
	{
		const self = this
		if (self.records.length > 0) {
			fn(new Error("Browser app only supports one wallet at a time"))
			return
		}
		super.WhenBooted_ObtainPW_AddExtantWalletWith_MnemonicString(
			walletLabel,
			swatch,
			mnemonicString,
			fn,
			optl__userCanceledPasswordEntry_fn
		)
	}
	WhenBooted_ObtainPW_AddExtantWalletWith_AddressAndKeys(
		walletLabel,
		swatch,
		address,
		view_key__private,
		spend_key__private,
		fn, // fn: (err: Error?, walletInstance: Wallet, wasWalletAlreadyInserted: Bool?) -> Void
		optl__userCanceledPasswordEntry_fn
	)
	{
		const self = this
		if (self.records.length > 0) {
			fn(new Error("Browser app only supports one wallet at a time"))
			return
		}
		super.WhenBooted_ObtainPW_AddExtantWalletWith_AddressAndKeys(
			walletLabel,
			swatch,
			address,
			view_key__private,
			spend_key__private,
			fn,
			optl__userCanceledPasswordEntry_fn
		)
	}
}
module.exports = WalletsListController
