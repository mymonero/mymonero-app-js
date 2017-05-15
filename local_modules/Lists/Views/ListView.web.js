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
const ListCellView = require('./ListCellView.web')
//
class ListView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		{
			self.listController = self.options.listController
			if (!self.listController || typeof self.listController == 'undefined') {
				throw self.constructor.name + " requires an options.listController"
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{
			self.current_recordDetailsView = null // zeroing for comparison
		}
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		self._setup_views()
		self._setup_startObserving()
		self.reloadData()
	}
	_setup_views()
	{
		const self = this
		self.recordCellViews = [] // initialize container
		self._setup_layer()
	}
	_setup_layer()
	{
		const self = this
		const padding_h = self.overridable_padding_h()
		//
		const layer = self.layer
		layer.style.overflowY = "hidden" // here, anyway. the cell container is what scrolls
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%" 
		layer.style.height = "100%"
		layer.style.padding = `0 ${padding_h}px 0px ${padding_h}px`
		// we wait til viewWillAppear is called by the nav controller to set height
		//
		layer.style.webkitUserSelect = "none"
		layer.style.wordBreak = "break-all" // to get the text to wrap
		//
		layer.style.backgroundColor = "#272527"
		layer.style.color = "#c0c0c0" // temporary
	}
	overridable_padding_h()
	{
		return 0
	}
	_setup_startObserving()
	{
		const self = this
		const emitter = self.listController
		emitter.on(
			emitter.EventName_listUpdated(),
			function()
			{
				self.reloadData({
					isFrom_EventName_listUpdated: true
				})
			}
		)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	tearDownAnySpawnedReferencedPresentedViews()
	{ // provided for convenience as well - subclassers can override - but make sure to call on super!
		const self = this
		self.teardown_current_recordDetailsView()
	}
	teardown_current_recordDetailsView()
	{
		const self = this
		if (self.current_recordDetailsView !== null) {
			self.current_recordDetailsView.TearDown()
			self.current_recordDetailsView = null // must zero again (ref checked in VDA) and should free
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		throw "Override Navigation_Title in " + self.constructor.name
	}
	//
	//
	// Runtime - Imperatives - View Configuration
	//
	reloadData(params)
	{
		params = params || {}
		const isFrom_EventName_listUpdated = params.isFrom_EventName_listUpdated === true ? true : false
		//
		const self = this
		if (isFrom_EventName_listUpdated) { // because if we're told we can update we can update immediately w/o re-requesting Boot and… we have to update immediately, because sometimes listUpdated is going to be called after we deconstruct the booted listController, i.e., on user idle. meaning… this solves the user idle bug where the list doesn't get emptied behind the scenes (security vuln)
			self._configureWith_records(self.listController.records) // since it will be immediately available
			return
		}
		if (self.isAlreadyWaitingForRecords === true) { // because accessing records is async
			console.warn("⚠️  Asked to " + self.constructor.name + "/reloadData while already waiting on WhenBooted.")
			return // prevent redundant calls
		}
		self.isAlreadyWaitingForRecords = true
		self.listController.WhenBooted_Records(
			function(records)
			{
				self.isAlreadyWaitingForRecords = false // unlock
				self._configureWith_records(records)
			}
		)
	}
	overridable_listCellViewClass()
	{ // override and return youir 
		return ListCellView
	}
	overridable_finalizeListCellViewOptions(options) {}
	overridable_willTearDownUIWithRecords(records) {}
	overridable_willBuildUIWithRecords(records) {}
	_configureWith_records(records)
	{
		const self = this
		self.overridable_willTearDownUIWithRecords(records)
		{
			if (typeof self.cellsContainerView !== 'undefined' && self.cellsContainerView) {
				self.cellsContainerView.removeFromSuperview()
				self.cellsContainerView.TearDown()
				self.cellsContainerView = null
			}
			if (self.recordCellViews.length !== 0) {
				// for now, just flash list:
				self.recordCellViews.forEach(
					function(view, i)
					{
						view.removeFromSuperview()
						view.TearDown() // after we call remove, not before
					}
				)
				self.recordCellViews = []
			}
		}
		{
			const view = new View({}, self.context)
			self.cellsContainerView = view
			self.addSubview(self.cellsContainerView)
		}
		self.overridable_willBuildUIWithRecords(records)
		{ // now add cells - TODO: recycle cell views and simply call `ConfigureWithRecord`
			const context = self.context
			const numberOf_records = records.length
			if (numberOf_records == 0) { // TODO: expose this so subclassers can override
				self.layer.style.overflowY = "hidden"
				self.layer.style.webkitOverflowScrolling = "auto"
			} else {
				self.layer.style.overflowY = "auto"
				// self.layer.style.webkitOverflowScrolling = "touch"
			}
			records.forEach(
				function(record, i)
				{
					const isAtEnd = i == numberOf_records - 1
					const options = 
					{
						cell_tapped_fn: function(cellView)
						{
							self.cellWasTapped(cellView)
						}
					}
					self.overridable_finalizeListCellViewOptions(options)
					const ListCellViewClass = self.overridable_listCellViewClass()
					const view = new ListCellViewClass(options, context)
					self.recordCellViews.push(view)
					view.ConfigureWithRecord(record, isAtEnd)
					self.cellsContainerView.addSubview(view)
				}
			)
		}
	}
	//
	//
	// Runtime - Internal - Imperatives - Navigation/presentation
	//
	overridable_pushesDetailsViewOnCellTap()
	{
		return false // default behavior no, but you can override and return true to get this
	}
	overridable_recordDetailsViewClass()
	{
		return View
	}
	pushRecordDetailsView(record)
	{
		const self = this
		if (self.current_recordDetailsView !== null) {
			// Commenting this throw as we are going to use this as the official way to lock this function,
			// e.g. if the user is double-clicking on a cell to push a details view
			// throw "Asked to pushRecordDetailsView while self.current_recordDetailsView !== null"
			return
		}
		{ // check record
			if (typeof record === 'undefined' || record === null) {
				throw self.constructor.name + " requires record to pushRecordDetailsView"
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to pushRecordDetailsView"
		}
		{
			const options = 
			{
				record: record
			}
			const DetailsViewClass = self.overridable_recordDetailsViewClass()
			const view = new DetailsViewClass(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// PS: AFAIK, since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown() (although since this is so far only used as a root stackView in tabs, the latter, TearDown(), ought not to happen)
			self.current_recordDetailsView = view
		}
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	cellWasTapped(cellView)
	{
		const self = this
		self.overridable_cellWasTapped(cellView)
		//
		// v-- default behavior on this is to not do it, so putting it here makes it slightly less fragile than in overridable_cellWasTapped as user could opt not to call it on super, inadvertently breaking this
		if (self.overridable_pushesDetailsViewOnCellTap() == true) {
			self.pushRecordDetailsView(cellView.record)
		}
	}
	overridable_cellWasTapped(cellView) {}
	//
	//
	// Overrides - Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		//
		if (self.navigationController && typeof self.navigationController !== 'undefined') {
			const layer = self.layer // TODO: this can probably be done only once rather than every time
			layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		}
	}
	// Runtime - Protocol / Delegation - Stack & modal navigation 
	// We don't want to naively do this on VDA as else tab switching may trigger it - which is bad
	navigationView_didDismissModalToRevealView()
	{
		const self = this
		if (super.navigationView_didDismissModalToRevealView) {
			super.navigationView_didDismissModalToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	navigationView_didPopToRevealView()
	{
		const self = this
		if (super.navigationView_didPopToRevealView) {
			super.navigationView_didPopToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
}
module.exports = ListView
