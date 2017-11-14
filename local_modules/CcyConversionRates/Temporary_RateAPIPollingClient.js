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

"use strict"
//
let Currencies = require('./Currencies')
//
class Controller 
{
	//
	// Interface - Constants
	domain()
	{
		return "cryptocompare.com"
	}
	//
	// Interface - Lifecycle - Init
	constructor(options, context)
	{
		// must call super before accessing this
		const self = this
		//
		self.options = options
		self.context = context
		//
		self.setup()
	}
	//
	// Internal - Lifecycle - Init
	setup()
	{
		const self = this
		//
		setTimeout(
			function()
			{
				self._set_mockedValues()
			},
			2000
		)
	}
	//
	_set_mockedValues()
	{		
		const self = this
		var mutable_didUpdateAnyValues = false
		{
			let mocked_rateAsNumber = 1.0/0.1 // inverted for direction of conversion
			let rateAsNumber = mocked_rateAsNumber
			let ccySymbols = Object.keys(Currencies.ccySymbolsByCcy)
			let numberOf_ccySymbols = ccySymbols.length
			for (var i = 0 ; i < numberOf_ccySymbols ; i++) {
				let ccySymbol = ccySymbols[i]
				if (ccySymbol == Currencies.ccySymbolsByCcy.XMR) {
					continue; // do not need to mock XMR<->XMR rate
				}
				let _wasSetValueDifferent = self.context.CcyConversionRates_Controller_shared.set(
					rateAsNumber,
					ccySymbol,
					true // isPartOfBatch … defer notify
				)
				if (_wasSetValueDifferent) {
					mutable_didUpdateAnyValues = true
				}
			}
		}
		let didUpdateAnyValues = mutable_didUpdateAnyValues
		if (didUpdateAnyValues) {
			// notify all of update
			self.context.CcyConversionRates_Controller_shared.ifBatched_notifyOf_set_XMRToCurrencyRate()
		} else {
			throw "Unexpected - all exactly same as existing vals - but this is mocked code and that shouldn't happen"
		}
	}
}
module.exports = Controller
