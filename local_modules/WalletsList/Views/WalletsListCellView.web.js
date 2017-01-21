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
const WalletCellContentsView = require('../../Wallets/Views/WalletCellContentsView.web')
//
class WalletsListCellView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.cell_tapped_fn = options.cell_tapped_fn || function(cellView) {}
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
		{
			self.layer.style.cursor = "pointer"
			self.layer.style.border = "1px solid #eee"
			self.layer.style.borderRadius = "5px"
			self.layer.style.marginBottom = "5px" // for cell spacing & scroll bottom inset
		}
		{
			const options = 
			{
				cell_tapped_fn: self.cell_tapped_fn
			}
			const view = new WalletCellContentsView(options, self.context)
			self.cellContentsView = view
			self.addSubview(view)
		}
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
		self.cellContentsView.TearDown()
		self.wallet = null
	}
	//
	//
	// Internal - Teardown/Recycling
	//
	PrepareForReuse()
	{
		const self = this
		self.cellContentsView.PrepareForReuse()
		self.wallet = null
	}
	//
	// Interface - Runtime - Imperatives - State/UI Configuration
	//
	ConfigureWith_wallet(wallet)
	{
		const self = this
		if (typeof self.wallet !== 'undefined') {
			self.PrepareForReuse()
		}
		self.wallet = wallet
		self.cellContentsView.ConfigureWith_wallet(self.wallet)
	}
}
module.exports = WalletsListCellView
