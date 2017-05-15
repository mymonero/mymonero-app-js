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
const View = require('../Views/View.web')
const Views__cssRules = require('../Views/cssRules.web')
const dom_traversal = require('../Views/dom_traversal.web')
//
const NamespaceName = "customSelect"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`div.customSelect {}`
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
class CustomSelectView extends View
{
	// Lifecycle - Setup
	constructor(options, context)
	{
		super(options, context) // call super() before `this`
		const self = this
		{ // callbacks, extracted from options or defaulted
			// setup
			self.startObserving_fn = self.options.startObserving_fn || function(selectView) {}
			self.didSetUp_fn = self.options.didSetUp_fn || function(selectView) {}
			// teardown
			self.stopObserving_fn = self.options.stopObserving_fn || function(selectView) {}
			// constructing/configuring lists
			self.cellView_createAndReturnOne_fn = self.options.cellView_createAndReturnOne_fn || function(selectView) { throw "You must implement options.cellView_createAndReturnOne_fn in " + self.constructor.name; /*return null;*/ }
			self.cellView_height_fn = self.options.cellView_height_fn || function(selectView, cellView) { throw "You must implement options.cellView_height_fn in " + self.constructor.name; /*return 0;*/ }
			self.cellView_prepareForReuse_fn = self.options.cellView_prepareForReuse_fn || function(selectView, cellView) {}
			self.lookup_uidFromRowItemForRow_fn = self.options.lookup_uidFromRowItemForRow_fn || function(rowItem) {}
			self.cellView_configureWithRowItem_fn = self.options.cellView_configureWithRowItem_fn || function(selectView, cellView, rowItem) {}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		__injectCSSRules_ifNecessary()
		{ // zeroing / initializing
			self.CurrentlySelectedRowItem = null
			self.options_cellViews = []
			self.options_areHidden = true
		}
		self.setup_views()
		self.startObserving()
		self.didSetUp_fn(self)
	}
	setup_views()
	{ // overridable but call on super
		const self = this
		{
			self.layer.style.position = "relative" // for the pos abs arrow
		}
		{
			const view = self.cellView_createAndReturnOne_fn(self)
			view.layer.classList.add("selectionDisplayCellView")
			self.selectionDisplayCellView = view
			const layer = view.layer
			self.addSubview(view)
		}
		{
			const view = new View({}, self.context)
			const layer = view.layer
			layer.style.display = "none"
			layer.style.position = "absolute"
			layer.style.width = "100%"
			layer.style.top = "0"
			layer.style.left = "0"
			layer.style.zIndex = "10"
			layer.classList.add("options_containerView")
			self.options_containerView = view
			self.addSubview(view)
		}
		{
			const view = new View({}, self.context)
			const layer = view.layer
			layer.style.position = "relative"
			layer.style.left = "0"
			layer.style.top = "0"
			layer.style.width = "100%"
			layer.style.height = "100%"
			layer.style.zIndex = "20" // above potential bg view
			layer.style.overflowY = "auto" // this layer is what scrolls
			layer.classList.add("options_cellViews_containerView")
			self.options_cellViews_containerView = view
			self.options_containerView.addSubview(view)
		}
		{
			const layer = document.createElement("div")
			layer.style.border = "none"
			layer.style.position = "absolute"
			const w = 10
			const h = 8
			layer.style.width = w+"px"
			layer.style.height = "100%"
			layer.style.right = "16px"
			layer.style.top = "0"
			layer.style.zIndex = "100" // above options_containerView 
			layer.style.backgroundImage = "url("+self.context.crossPlatform_appBundledAssetsRootPath+"/SelectView/Resources/dropdown-arrow-down@3x.png)"
			layer.style.backgroundRepeat = "no-repeat"
			layer.style.backgroundPosition = "center"
			layer.style.backgroundSize = w+"px "+ h+"px"
			self.layer.appendChild(layer)			
		}
	}
	startObserving()
	{ // overridable but call on super
		const self = this
		self.startObserving_fn(self)
		//
		self.startObserving_interactions()
	}
	startObserving_interactions()
	{
		const self = this
		//
		self.selectionDisplayCellView.layer.addEventListener(
			"click", 
			function(e) 
			{
				e.preventDefault() // not that there would be one
				if (self.isEnabled !== false) {
					self.show__options_containerView()
				}
				return false
			}
		)
		// dismiss if not clicked on selectionDisplayCellView
		self._window_click_fn = function(e)
		{	// Now we must check if we can trigger a 'hide' of the options container layer.
			// We do so by checking if the target of the click is the 'show opens container layer' spawn element or one of its children. If it isn't, we can hide the options.
			// If we don't check, we end up stepping on a the 'show' request on the selectionDisplayCellView click
			const e__target = e.target
			const selectionDisplayCellView__layer = self.selectionDisplayCellView.layer
			if (e__target !== selectionDisplayCellView__layer) { // so, not clicking the selectionDisplayCellView__layer itself…
				const isTargetAChildOf_selectionDisplayCellView = dom_traversal.DoesAnyParentOfElementMatch__sync(
					e__target, 
					function(anAncestorNode)
					{
						if (anAncestorNode === selectionDisplayCellView__layer) {
							return true // a match - an eventual parent is the selectionDisplayCellView__layer
						}
						return false // keep climbing…
					}
				)
				if (isTargetAChildOf_selectionDisplayCellView == false) {
					if (self.options_containerView.layer.style.display !== "none") {
						self.hide__options_containerView()
					}
				}
			}
		}
		//
		window.addEventListener(self._crossPlatform_click_eventName(), self._window_click_fn)
		//
		// user hitting escape
		self._document_keydown_fn = function(e)
		{
			e = e || window.event
			if (e.key === "Escape" || e.key === "Esc" || e.keyCode == 27) {
				self.hide__options_containerView() // if necessary
			}
		}
		document.addEventListener("keydown", self._document_keydown_fn)
	}
	_crossPlatform_click_eventName()
	{ // ^-- window 'click' will not fire on mobile; ontouchstart will be null or non-nil rather than undefined on mobile platforms
		return typeof document.body.ontouchstart === "undefined" ? "click" : "touchstart"
	}
	// Lifecycle - Teardown - Overrides
	TearDown()
	{
		const self = this
		self.stopObserving()
		super.TearDown()
		// calling this here cause it tells them to stopObserving and cause it nils their references:
		self._removeAllOptionLayers()
	}
	stopObserving()
	{
		const self = this
		self.stopObserving_fn(self)
		// TODO: assert self._window_click_fn != nil
		window.removeEventListener(self._crossPlatform_click_eventName(), self._window_click_fn)
		// TODO: assert self._document_keydown_fn != nil
		document.removeEventListener("keydown", self._document_keydown_fn)
	}
	// Interface (Public) - Imperatives - Interactivity
	SetEnabled(isEnabled)
	{
		const self = this
		if (self.isEnabled === isEnabled) {
			return
		}
		self.isEnabled = isEnabled
		self.hide__options_containerView() // if necessary
	}
	// Interface - Imperatives - List config
	ConfigureWithRowItems(rowItems)
	{
		const self = this
		if (!rowItems || typeof rowItems === 'undefined') {
			throw `${self.constructor.name}/ConfigureWithRowItems: requires non-nil rowItems`
		}
		// for now, flush/flash whole UI:
		self.hide__options_containerView()
		self._removeAllOptionLayers() // (and stop observing)
		// reconstruct UI:
		const numberOf_rowItems = rowItems.length
		var heightOfCellsSoFar = 0
		var heightOfACell = null // null for comparison; if still null after iteration, -> 0
		for (let i = 0 ; i < numberOf_rowItems ; i++) {
			const rowItem = rowItems[i]
			const rowItem_cellView = self.cellView_createAndReturnOne_fn(self)
			const cellHeight = self.cellView_height_fn(self, rowItem_cellView)
			{// setting cached properties…
				rowItem_cellView.__customSelect_rowItem = rowItem
				rowItem_cellView.__customSelect_heightOfPrecedingCells = heightOfCellsSoFar
				rowItem_cellView.__customSelect_cellHeight = cellHeight
			}
			const layer = rowItem_cellView.layer
			layer.classList.add("optionCell")
			if (heightOfACell == null) {
				heightOfACell = cellHeight
			}
			layer.style.position = "relative"
			layer.style.boxSizing = "border-box" // in case consumer set any padding
			layer.style.height = cellHeight + "px"
			layer.style.width = "100%"
			heightOfCellsSoFar += cellHeight
			self.cellView_configureWithRowItem_fn(
				self,
				rowItem_cellView,
				rowItem				
			)
			{ // start observing selection clicks on the cell, storing listener for stopObserving
				rowItem_cellView._selection_click_fn = function(e) 
				{
					e.preventDefault() // not that there would be one
					if (self.isEnabled !== false) {
						const clicked__rowItem = rowItem // this scope capture actually appears to work…
						self.CurrentlySelectedRowItem = clicked__rowItem
						self._configureSelectionUIWithSelectedRowItem()
					}
					// … a dismiss will occur due with window.onclick
					return false
				}
				rowItem_cellView.layer.addEventListener(self._crossPlatform_click_eventName(), rowItem_cellView._selection_click_fn)
			}
			self.overridable_setup_cellView(rowItem_cellView, rowItem)
			self.options_cellViews_containerView.addSubview(rowItem_cellView)
			self.options_cellViews.push(rowItem_cellView)
		}
		if (heightOfACell == null) {
			heightOfACell = 0
		}
		//
		// take this chance to style height of options container; maxHeight will kick in
		const maxHeight_number = heightOfACell * self.overridable_maxNumberOfCellsToDisplayAtATime()
		self.options_containerView.layer.style.maxHeight = maxHeight_number + "px"
		self.options_cellViews_containerView.layer.style.maxHeight = maxHeight_number + "px" // so we get the scroll
		//
		const heightOfAllCells = heightOfCellsSoFar
		self.heightOfAllCells = heightOfAllCells
		self.options_containerView.layer.style.height = heightOfAllCells + "px"  // since we won't get the 'relative' height increase from this, set height manually; max-height will kick in.
		//
		// reconstitute selection if any:
		if (numberOf_rowItems > 0) {
			if (self.CurrentlySelectedRowItem !== null) {
				var doesCurrentlySelectedRowItemStillExist = false // to finalize…
				const currentSelectedRowItem_uid = self.lookup_uidFromRowItemForRow_fn(self.CurrentlySelectedRowItem)
				for (let i = 0 ; i < numberOf_rowItems ; i++) {
					const rowItem = rowItems[i]
					const rowItem_uid = self.lookup_uidFromRowItemForRow_fn(rowItem)
					if (rowItem_uid === currentSelectedRowItem_uid) {
						doesCurrentlySelectedRowItemStillExist = true
						break
					}
				}
				if (doesCurrentlySelectedRowItemStillExist !== true) {
					self.CurrentlySelectedRowItem = null // clear so we sample new one just below
				}
			}
			if (self.CurrentlySelectedRowItem === null) { 
				self.CurrentlySelectedRowItem = rowItems[0]
			} else { // just keep existing one as we verified it's still in list
			}
		} else {
			self.CurrentlySelectedRowItem = null // no matter what, if no wallets
		}
		self._configureSelectionUIWithSelectedRowItem()
	}
	overridable_maxNumberOfCellsToDisplayAtATime() { return 3 }
	// Internal (Private) - Imperatives - Selection state configuration
	_removeAllOptionLayers()
	{
		const self = this
		const numberOf__options_cellViews = self.options_cellViews.length
		for (let i = 0 ; i < numberOf__options_cellViews ; i++) {
			const option_cellView = self.options_cellViews[i]
			self.__deInitialize_cellView(option_cellView)
			option_cellView.removeFromSuperview()
		}
		self.options_cellViews = [] // flash as we just freed, above
		// clear selection
		self.__deInitialize_cellView(self.selectionDisplayCellView)
	}
	overridable_setup_cellView(cellView, rowItem) {} // overridable, but call on super if you do
	__deInitialize_cellView(cellView)
	{
		const self = this
		cellView.layer.removeEventListener(self._crossPlatform_click_eventName(), cellView._selection_click_fn)
		self.cellView_prepareForReuse_fn(
			self, 
			cellView
		)
		cellView.__customSelect_rowItem = null
	}
	_configureSelectionUIWithSelectedRowItem()
	{
		const self = this
		self.selectionDisplayCellView.__customSelect_rowItem = self.CurrentlySelectedRowItem
		self.cellView_configureWithRowItem_fn(
			self, 
			self.selectionDisplayCellView, 
			self.CurrentlySelectedRowItem
		)
	}
	// Internal - Imperatives - UI state - Options visibility
	show__options_containerView()
	{
		const self = this
		if (self.options_areHidden === false) {
			console.warn(self.constructor.name + " asked to show__options_containerView but already shown.")
			return
		}
		const cellViews = self.options_cellViews
		const numberOf_cellViews = cellViews.length
		var scrollTop = 0 // to finalize…
		if (numberOf_cellViews !== 0) {
			const selectedRowItem = self.CurrentlySelectedRowItem
			const selectedRowItem_uid = self.lookup_uidFromRowItemForRow_fn(selectedRowItem)
			var selected_cellView = null
			for (let i = 0 ; i < numberOf_cellViews ; i++) {
				const cellView = cellViews[i]
				const rowItem = cellView.__customSelect_rowItem
				// TODO: assert rowItem != nil
				const rowItem_uid = self.lookup_uidFromRowItemForRow_fn(rowItem)
				if (selectedRowItem_uid === rowItem_uid) {
					selected_cellView = cellView
					cellView.layer.classList.add("active") // in case
					// instead of breaking, we'll iterate through the rest to set them as inactive
				} else {
					cellView.layer.classList.remove("active") // in case
				}
			}
			if (selected_cellView == null) {
				throw "No selection found"
			}
			const heightOfPrecedingCells = selected_cellView.__customSelect_heightOfPrecedingCells
			scrollTop = heightOfPrecedingCells
		}
		self.options_areHidden = false
		self.options_containerView.layer.style.display = "block"
		self.options_cellViews_containerView.layer.scrollTop = scrollTop // annoyingly, we have to do this after it becomes visible, or it will be ignored
	}
	hide__options_containerView()
	{
		const self = this
		if (self.options_areHidden === true) {
			// probably just user hitting escape
			// console.warn(self.constructor.name + " asked to hide__options_containerView but already hidden.")
			return
		}
		self.options_areHidden = true
		self.options_containerView.layer.style.display = "none"
	}
}
module.exports = CustomSelectView