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
//
class ListCellView extends View
{
	//
	//
	// Init
	//
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
	{ // overridable, just call on super
		const self = this
		self.setup_views()
	}
	setup_views()
	{ // overridable, just call on super
		const self = this
		self.overridable_layerToObserveForTaps().addEventListener(
			"click",
			function(e)
			{
				e.preventDefault() // not that there would be any
				self.__cellTapped()
				return false
			}
		)
	}
	overridable_layerToObserveForTaps()
	{
		const self = this
		return self.layer
	}
	//
	//
	// Teardown/Recycling
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.prepareForReuse()
	}
	PrepareForReuse()
	{
		const self = this
		self.prepareForReuse() // just a direct pass-through
	}
	prepareForReuse()
	{
		const self = this
		if (self.record !== null && typeof self.record !== 'undefined') {
			self.overridable_stopObserving_record()
		}
		self.record = null
	}
	//
	//
	// Interface - Runtime - Imperatives - State/UI Configuration
	//
	ConfigureWithRecord(record, isAtEnd)
	{
		const self = this
		if (typeof self.record !== 'undefined') {
			self.prepareForReuse()
		}
		self.record = record
		self.isAtEnd = isAtEnd
		self.configureUI()
		self.overridable_startObserving_record()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	configureUI()
	{
		const self = this
		self.overridable_configureUIWithRecord()
	}
	overridable_configureUIWithRecord()
	{ // if you override this, please call it on super in case of future modification
		const self = this
	}
	//
	//
	// Overridable - Runtime - Imperatives - Observation
	//
	overridable_startObserving_record()
	{ // If you do override these, please make sure to call them on super in case of future modification
		const self = this
		if (typeof self.record === 'undefined' || self.record === null) {
			throw "nil record in start observing"
		}
	}
	overridable_stopObserving_record()
	{ // If you do override these, please make sure to call them on super in case of future modification
		const self = this
		if (typeof self.record === 'undefined' || self.record === null) {
			throw "nil record in stop observing"
		}
	}
	//
	//
	// Internal - Runtime - Delegation - Interactions
	//
	__cellTapped()
	{
		const self = this
		self.overridable_cellTapped(
			function()
			{
				self.cell_tapped_fn(self) // set by init options
			}
		)
	}
	overridable_cellTapped(fn)
	{ // if you override this, make sure to call fn when done so __cellTapped can call self.cell_tapped_fn
		const self = this
		fn()
	}
}
module.exports = ListCellView
