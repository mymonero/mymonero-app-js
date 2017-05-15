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
const EventEmitter = require('events')
const uuidV1 = require('uuid/v1')
//
const web_debug_utils = require('./web_debug_utils')	
//
class View extends EventEmitter
{
	//
	//
	// Lifecycle - Setup
	//
	constructor(options, context)
	{
		super() // must call before can access `this`
		//
		const self = this
		{
			self.options = options
			self.context = context
		}
		{
			const options_tag = options.tag
			if (typeof options_tag === 'string' && options_tag !== null && options_tag.length > 0) {
				self.tag = options_tag
			} else {
				self.tag = "div"
			}
		}
		{
			self.__view_uuid = uuidV1() // set a UUID so we can do equality checks
		}
		{ // proceed to setup for runtime:
			self.__View_setup_views() // namespacing to avoid subclass collision
		}
	}
	__View_setup_views()
	{
		const self = this
		self.isTornDown = false
		self.subviews = []
		self.setup_loadView()
	}
	//
	//
	// Setup - Imperatives - Overridable
	//
	setup_loadView()
	{
		const self = this
		const tagName = self.TagName()
		self.layer = document.createElement(tagName)
	}
	//
	//
	// Setup - Accessors - Overridable
	//
	TagName()
	{
		const self = this
		//
		return self.tag // div is the default; you can either override this method to return what you'd like or pass "tag" in options
	}
	//
	//
	// Lifecycle - Teardown - Overridable
	//
	TearDown()
	{ // IMPORTANT: Please note that you must manually call this function! There is no destructor per se in JS
		const self = this // You can override this function, but be sure to call on super
		if (self.isTornDown == true) {
			console.warn("TearDown called on " + self.constructor.name + " after having already been torn down!")
			return
		}
		// console.log("♻️  Tearing down ", self.Description())
		self.isTornDown = true
		// self.layer = null // so… this is commented because it turns out to race with consumers' usage of it after TearDown is called… really wish we had ARC or dealloc call so TearDown would be rigorously callable! #jssux
	}
	//
	//
	// Runtime - Accessors - Hierarchy
	//
	HasASuperview()
	{
		const self = this
		const hasASuperview = typeof self.superview !== "undefined" && self.superview !== null
		//
		return hasASuperview ? true : false
	}
	//
	//
	// Runtime - Accessors - Identity
	//
	View_UUID()
	{
		const self = this
		//
		return self.__view_uuid
	}
	IsEqualTo(view)
	{
		const self = this
		//
		return self.IsEqualToView(view)
	}
	IsEqualToView(view)
	{
		const self = this
		//
		return view.View_UUID() === self.View_UUID()
	}
	Description()
	{
		const self = this
		const actualClassName = self.constructor.name
		//
		return `${actualClassName} ${self.View_UUID()}`
	}
	//
	//
	// Runtime - Imperatives - View hierarchy
	//
	addSubview(view)
	{
		const self = this
		if (!view || typeof view === 'undefined') {
			throw self.constructor.name + " asked to `addSubview` but passed nil `view`."
		}
		const toLayer = self.layer
		self.addSubview_appendingToLayer(view, toLayer)
	}
	addSubview_appendingToLayer(view, superlayer)
	{ // this is exposed so you can inject subviews into manually created children elements of your choice
		const self = this
		if (!view || typeof view === 'undefined') {
			throw self.constructor.name + " asked to `addSubview` but passed nil `view`."
		}
		view.viewWillAppear()
		{ // state:
			// local:
			self.subviews.push(view)
			// subview:
			self._configureViewStateForInsertionIntoHierarchy(view, superlayer)
		}
		{ // DOM:
			superlayer.appendChild(view.layer)
		}
		view.viewDidAppear()
	}
	_configureViewStateForInsertionIntoHierarchy(view, superlayer)
	{
		const self = this
		// subview's dependency setup:
		view.superview = self
		view.superlayer = superlayer
	}
	insertSubview(view, atIndex)
	{
		const self = this
		const toLayer = self.layer
		const superlayer = toLayer
		//
		view.viewWillAppear()
		{ // state:
			// local:
			self.subviews.splice(atIndex, 0, view)
			// subview:
			self._configureViewStateForInsertionIntoHierarchy(view, superlayer)
		}
		{ // DOM
			const numberOf_subviews = self.subviews.length
			// console.log(`numberOf_subviews (${numberOf_subviews}) > atIndex + 1 (${atIndex + 1})`)
			if (numberOf_subviews > atIndex + 1) { // if we're inserting under a subview
				const subviewAbove_view_atIndex = self.subviews[atIndex + 1]
				// console.log(`insert under subview ${subviewAbove_view_atIndex.Description()}`)
				const layerOf_subviewAbove = subviewAbove_view_atIndex.layer
				// console.log("layerOf_subviewAbove" , layerOf_subviewAbove)
				if (layerOf_subviewAbove.parentNode !== superlayer) {
					throw "View hierarchy error - layerOf_subviewAbove.parentNode !== superlayer"
				}
				superlayer.insertBefore(
					view.layer,
					layerOf_subviewAbove
				)
			} else { // then we're able to just append the view
				superlayer.appendChild(
					view.layer
				)
			}
		}
		view.viewDidAppear()
	}
	removeFromSuperview()
	{ // throws
		const self = this
		if (typeof self.superview === 'undefined' || self.superview === null) {
			throw "no superview"
		}
		if (typeof self.superlayer === 'undefined' || self.superlayer === null) {
			throw "no superlayer"
		}
		//
		self.viewWillDisappear()
		{
			// DOM:
			self.superlayer.removeChild(self.layer)
			// now we can release the superlayer
			self.superlayer = null
			// now before we can release the superview,
			// we must manage the superview's subview list
			const superview_indexOf_self = self.superview.subviews.indexOf(self)
			if (superview_indexOf_self === -1) {
				throw "superview didn't have self as subview"
			}
			// console.log("self.superview.subviews was", self.superview.subviews)
			self.superview.subviews.splice(superview_indexOf_self, 1)
			// console.log("self.superview.subviews is now", self.superview.subviews)
			// and now we can free the superview
			self.superview = null
		}
		self.viewDidDisappear()
	}
	removeAllSubviews()
	{
		const self = this
		self.subviews.forEach(
			function(view, i)
			{
				view.removeFromSuperview()
			}
		)
		self.subviews = []
	}
	//
	//
	// Runtime - Imperatives - Convenience methods
	//
	convenience_removeAllSublayers()
	{ // you should/would probably only use this when you're not using any subviews
		const self = this
		const layer = self.layer
		var firstChild = layer.firstChild
		while (firstChild !== null) {
			layer.removeChild(firstChild)
			firstChild = layer.firstChild
		}
	}
	//
	//
	// Runtime - Imperatives - Debug
	//
	DEBUG_BorderAllLayers()
	{
		const self = this
		web_debug_utils.DEBUG_BorderLayer(self.layer)
		web_debug_utils.DEBUG_BorderChildLayers(self.layer)
	}
	DEBUG_GiveBorder()
	{
		const self = this
		web_debug_utils.DEBUG_BorderLayer(self.layer)
	}
	DEBUG_BorderSubviews()
	{
		const self = this
		web_debug_utils.DEBUG_BorderSubviews(self)
	}
	DEBUG_BorderChildLayers()
	{
		const self = this
		web_debug_utils.DEBUG_BorderChildLayers(self.layer)
	}
	//
	//
	// Runtime - Delegation - View visibility - Overridable - Be sure to call on super
	//
	viewWillAppear()
	{
		const self = this
		// console.log(self.constructor.name + " viewWillAppear")
		for (var i in self.subviews) {
			const subview = self.subviews[i]
			subview.viewWillAppear()
		}
	}
	viewDidAppear()
	{
		const self = this
		self._restoreAnyCachedUIStateFromHavingBeenRemovedFromHierarchy()
		// console.log(self.constructor.name + " viewDidAppear")
		for (var i in self.subviews) {
			const subview = self.subviews[i]
			subview.viewDidAppear()
		}
	}
	viewWillDisappear()
	{		
		const self = this
		// console.log(self.constructor.name + " viewWillDisappear")
		self._recordUIStateUponBeingRemovedFromDOM()
		for (var i in self.subviews) {
			const subview = self.subviews[i]
			subview.viewWillDisappear()
		}
	}
	viewDidDisappear()
	{		
		const self = this
		// console.log(self.constructor.name + " viewDidDisappear")
		for (var i in self.subviews) {
			const subview = self.subviews[i]
			subview.viewDidDisappear()
		}
	}
	// Runtime - Imperatives -
	// To preserve scroll offset on add/remove from DOM as that doesn't persist
	// To solve bugs seen in Nav & TabBar View Controllers
	_recordUIStateUponBeingRemovedFromDOM()
	{
		const self = this
		const layer = self.layer
		self.scrollOffsetsUponTransitionedFrom =
		{
			Left: layer.scrollLeft,
			Top: layer.scrollTop
		}
	}
	_restoreAnyCachedUIStateFromHavingBeenRemovedFromHierarchy()
	{
		const self = this
		const scrollOffsets = self.scrollOffsetsUponTransitionedFrom
		if (typeof scrollOffsets === 'undefined' || scrollOffsets === null) {
			return
		}
		const layer = self.layer
		layer.scrollLeft = scrollOffsets.Left
		layer.scrollTop = scrollOffsets.Top
	}	
}
module.exports = View
