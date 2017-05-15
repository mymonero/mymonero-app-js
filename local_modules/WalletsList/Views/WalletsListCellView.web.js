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
const WalletCellContentsView = require('../../Wallets/Views/WalletCellContentsView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')
//
class WalletsListCellView extends ListCellView
{
	// Setup / Configure
	setup_views()
	{
		const self = this
		{ // self.cellContentsView: set this up /before/ calling _cmd on super
			// so that it's avail in overridable_layerToObserveForTaps
			const view = new WalletCellContentsView({}, self.context)
			self.cellContentsView = view
			// though this `add…` could be deferred til after…
			self.addSubview(view)
		}
		// now call on super…
		super.setup_views()
		const margin_h = 16
		{
			const layer = self.layer
			layer.style.position = "relative"
			layer.style.left = `${margin_h}px`
			layer.style.top = "0"
			layer.style.width = `calc(100% - ${2 * margin_h}px)`
			layer.style.height = "80px"
			layer.style.background = "#383638"
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
			} else { // avoiding shadow
				layer.style.boxShadow = "inset 0 0.5px 0 0 #494749"
			}
			layer.style.borderRadius = "5px"
			layer.style.overflow = "hidden" // clip bg in contents escaping corners
			layer.style.margin = "0 0 12px 0" // for cell spacing & scroll bottom inset
			// layer.style.border = "1px solid yellow"
		}
		self.layer.appendChild(commonComponents_tables.New_tableCell_accessoryChevronLayer(self.context))
	}
	overridable_layerToObserveForTaps()
	{
		const self = this
		if (!self.cellContentsView || typeof self.cellContentsView === 'undefined') {
			throw "self.cellContentsView was nil in " + self.constructor.name + " overridable_layerToObserveForTaps"
			// return self.layer
		}
		return self.cellContentsView.layer
	}
	//
	//
	// Lifecycle - Teardown/Recycling
	//
	TearDown()
	{
		super.TearDown()
		const self = this
		self.cellContentsView.TearDown()
	}
	prepareForReuse()
	{
		super.prepareForReuse()
		const self = this
		self.cellContentsView.PrepareForReuse()
	}
	//
	//
	// Runtime - Imperatives - Cell view - Config with record
	//
	overridable_configureUIWithRecord()
	{
		super.overridable_configureUIWithRecord()
		//
		const self = this
		self.cellContentsView.ConfigureWithRecord(self.record)
	}
	overridable_startObserving_record()
	{
		const self = this
		super.overridable_startObserving_record()
		//
		if (typeof self.record === 'undefined' || self.contact === null) {
			throw "self.record undefined in start observing"
			// return
		}
		// TODO? so far, updates on the list lvl
	}
	overridable_stopObserving_record()
	{
		const self = this
		super.overridable_stopObserving_record()
		//
		if (typeof self.record === 'undefined' || !self.record) {
			return
		}
		const emitter = self.record
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		// TODO? so far, updates on the list lvl
	}
}
module.exports = WalletsListCellView
