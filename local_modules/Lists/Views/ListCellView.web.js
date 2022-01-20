"use strict"

const View = require('../../Views/View.web')

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
