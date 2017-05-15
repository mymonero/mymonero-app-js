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
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
const FundsRequestCellContentsView = require('./FundsRequestCellContentsView.web')
//
class FundsRequestsListCellView extends ListCellView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup_views()
	{
		const self = this
		{ // self.cellContentsView: set this up /before/ calling _cmd on super
			// so that it's avail in overridable_layerToObserveForTaps
			const view = new FundsRequestCellContentsView({}, self.context)
			self.cellContentsView = view
			// though this `add…` could be deferred til after…
			self.addSubview(view)
		}
		super.setup_views()
		{
			const layer = self.layer
			layer.style.position = "relative"
			// hover effects/classes
			self.layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
			self.layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
		}
		{ 
			const layer = commonComponents_tables.New_tableCell_accessoryChevronLayer(self.context)
			layer.style.top = "26px" // instead of halfway down
			self.layer.appendChild(layer)
		}
		self.__setup_cellSeparatorLayer()
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
	__setup_cellSeparatorLayer()
	{
		const self = this
		const layer = commonComponents_tables.New_tableCell_separatorLayer()
		self.cellSeparatorLayer = layer
		self.layer.appendChild(layer)
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
		{
			if (self.isAtEnd == true) {
				self.cellSeparatorLayer.style.visibility = "hidden"
			} else {
				self.cellSeparatorLayer.style.visibility = "visible"
			}
		}
		self.cellContentsView.ConfigureWithRecord(self.record)
	}
}
module.exports = FundsRequestsListCellView