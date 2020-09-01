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
const Views__cssRules = require('../../Views/cssRules.web')
const CustomSelectView = require('../../SelectView/CustomSelectView.web')
//
const NamespaceName = "ListCustomSelectView"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules = []
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
class ListCustomSelectView extends CustomSelectView
{
	// Lifecycle - Setup - Overrides
	constructor(options, context)
	{
		options = options || {}
		{ // validating options
			if (!options.listController || typeof options.listController === 'undefined') {
				throw `${self.constructor.name} requires options.listController`
			}
			if (!options.cellContentsViewClass || typeof options.cellContentsViewClass === 'undefined') {
				throw `${self.constructor.name} requires options.cellContentsViewClass`
			}
			if (!options.cellView_height_fn || typeof options.cellView_height_fn === 'undefined') {
				throw `${self.constructor.name} requires options.cellView_height_fn`
			}
		}
		const cellContentsViewClass = options.cellContentsViewClass
		// setting initial parameters
		options.cellView_createAndReturnOne_fn = function(selectView)
		{
			const base__options = options.cellContentsView_init_baseOptions || {}
			const finalized__options = base__options
			const cellView = new cellContentsViewClass(finalized__options, selectView.context)
			return cellView
		}
		options.cellView_prepareForReuse_fn = function(selectView, cellView)
		{
			cellView.PrepareForReuse()
		}
		options.lookup_uidFromRowItemForRow_fn = function(rowItem)
		{
			return rowItem._id // using the record _id as a uid
		}
		options.cellView_configureWithRowItem_fn = function(selectView, cellView, rowItem)
		{
			cellView.ConfigureWithRecord(rowItem)
		}
		// then requisite call of super()
		super(options, context) // but this calls `setup` so put setup in override
	}
	setup()
	{		
		const self = this
		// pre-super.setup()
		const listController = self.options.listController
		self.listController = listController 
		//
		super.setup()
		// post-super.setup()
		__injectCSSRules_ifNecessary() // may as well do this here
		self.layer.classList.add(NamespaceName) // must add class for css rules
		// then hydrate UI
		listController.ExecuteWhenBooted(function()
		{ 
			self._givenListControllerBooted_configureWithRecords()
		})
	}
	startObserving()
	{
		const self = this
		super.startObserving()
		self._listController_EventName_listUpdated = function() { 
			self._givenListControllerBooted_configureWithRecords() 
		}
		const listController = self.listController
		listController.on(
			listController.EventName_listUpdated(),
			self._listController_EventName_listUpdated
		)
	}
	// Lifecycle - Teardown - Overrides
	TearDown()
	{
		const self = this
		super.TearDown() // calls stopObserving for us
		//
		self.listController = null  // after super as stopObserving needs it
	}
	stopObserving()
	{
		const self = this
		super.stopObserving()
		//
		const listController = self.listController
		listController.removeListener(
			listController.EventName_listUpdated(),
			self._listController_EventName_listUpdated
		)
		self._listController_EventName_listUpdated = null			
		
	}
	// Runtime - Imperatives
	_givenListControllerBooted_configureWithRecords()
	{
		const self = this
		const rowItems = self.listController.records // as we know it's booted now
		self.ConfigureWithRowItems(rowItems) // on super
	}
}
module.exports = ListCustomSelectView