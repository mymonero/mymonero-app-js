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
const TabBarItemButtonView = require('./TabBarItemButtonView.web')
//
class TabBarAndContentView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{ // If you override this, be sure to call on super first ;)
		const self = this
		const context = self.context
		{
			self._tabBarContentViews = []
			self._tabBarItemButtonViews = []
		}
		{
			const layer = self.layer
			layer.style.width = "100%"
			layer.style.height = "100%"
		}
		{
			{
				const options = {}
				const view = new View(options, context)
				{
					const layer = view.layer
					layer.style.webkitAppRegion = "drag" // make draggable
					layer.style.webkitUserSelect = "none"
				}
				self.tabBarView = view
				self.addSubview(view)
			}
			{
				const options = {}
				const view = new View(options, context)
				{
					view.layer.style.overflowY = "scroll"
				}
				self.contentAreaView = view
				self.addSubview(view)
			}
		}
	}
	//
	//
	// Runtime - Accessors - Events
	//
	EventName_triedButAlreadySelectedTabBarItemAtIndex()
	{
		return "EventName_triedButAlreadySelectedTabBarItemAtIndex"
	}	
	//
	//
	// Runtime - Accessors - UI - Metrics - Overridable
	//
	overridable_tabBarView_thickness()
	{
		return 75
	}
	
	//
	//
	// Runtime - Imperatives - View setup
	//
	SetTabBarContentViews(to_tabBarContentViews)
	{
		const self = this
		const context = self.context
		{ // remove and free existing; rebuild arrays
			{ // _tabBarContentViews
				self._tabBarContentViews.forEach(
					function(view, idx)
					{
						if (view.HasASuperview() === true) {
							view.removeFromSuperview()
						}
					}
				)
				self._tabBarContentViews = []
			}
			{ // _tabBarItemButtonViews
				self._tabBarItemButtonViews.forEach(
					function(view, idx)
					{
						view.removeFromSuperview()
					}
				)
				self._tabBarItemButtonViews = []
			}
		}
		{ // add tab bar item button views, and new tabBarContentViews
			const buttonSide_px = self.overridable_tabBarView_thickness()
			to_tabBarContentViews.forEach(
				function(to_tabBarContentView, idx)
				{
					{ // buttonView
						const options = 
						{
							side_px: buttonSide_px
						}
						const buttonView = new TabBarItemButtonView(options, context)
						{
							buttonView.on(
								buttonView.EventName_clicked(),
								function(tabBarItemButtonView)
								{								
									const index = self._tabBarItemButtonViews.indexOf(tabBarItemButtonView)
									if (index === -1) {
										throw "heard tab bar item outside of list clicked"
										return
									}
									self.SelectTabBarItemAtIndex(index)
								}
							)
						}
						{
							self._tabBarItemButtonViews.push(buttonView)
							self.tabBarView.addSubview(buttonView)
						}
					}
					{ // and hang onto the content view itself
						self._tabBarContentViews.push(to_tabBarContentView)
					}
				}
			)
		}
		{ // select first tab bar item
			if (to_tabBarContentViews.length > 0) {
				self.SelectTabBarItemAtIndex(0)
			}
		}
	}
	//
	//
	// Runtime - Imperatives - Item selection
	//
	SelectTabBarItemAtIndex(index)
	{ // throws
		const self = this
		{
			if (typeof index === 'undefined' || index === null) {
				throw "index nil"
			}
			if (index < 0) {
				throw "index too small"
			}
			if (index >= self._tabBarContentViews.length) {
				throw "index too great"
			}
		}
		{
			if (index === self._currentlySelectedTabBarItemIndex) { // we already know index isn't going to be undefined or null here
				const detailView_forCurrentlySelectedItemIndex = self._tabBarContentViews[self._currentlySelectedTabBarItemIndex]
				// ^ so we can assume the existence of a detailView
				// console.warn("Already selected index", index)
				self.emit(self.EventName_triedButAlreadySelectedTabBarItemAtIndex(), index)
				{ // call special / TabBarAndContentView double-tap notification function if detail view implements it
					const TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected_fn = detailView_forCurrentlySelectedItemIndex.TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected
					if (typeof TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected_fn === 'function') {
						// make sure we notify the detail view, so that, e.g. if a StackNavigationView, it can PopToRoot
						detailView_forCurrentlySelectedItemIndex.TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected()
					}
				}
				return
			}
		}
		{ // neutralize existing state
			if (typeof self._currentlySelectedTabBarItemIndex !== 'undefined' && self._currentlySelectedTabBarItemIndex !== null) {
				// deselect currently selected
				{
					const detailView_forCurrentlySelectedItemIndex = self._tabBarContentViews[self._currentlySelectedTabBarItemIndex] // we did the validation when we set the index
					try {
						detailView_forCurrentlySelectedItemIndex.removeFromSuperview()
					} catch (e) {
						console.error("Exception:", e, e.stack)
						console.trace()
						return
					}
				}
				{
					const buttonView_forCurrentlySelectedItemIndex = self._tabBarItemButtonViews[self._currentlySelectedTabBarItemIndex]
					buttonView_forCurrentlySelectedItemIndex.Deselect()
				}
			}
		}
		{ // set state
			self._currentlySelectedTabBarItemIndex = index
		}
		{ // config UI with new state
			{
				const detailView_forIndex = self._tabBarContentViews[index]
				{
					detailView_forIndex.layer.style.width = "100%"
					detailView_forIndex.layer.style.height = "100%"
				}
				self.contentAreaView.addSubview(detailView_forIndex)
			}
			{
				const buttonView_forIndex = self._tabBarItemButtonViews[index]
				buttonView_forIndex.Select()
			}
		}
	}
	//
	//
	// Runtime - Imperatives - Convenience - State management
	//
	ResetAllTabContentViewsToRootState(isAnimated_orFalse)
	{
		const self = this
		var isAnimated
		{
			isAnimated = isAnimated_orFalse === true ? true : false // aka default false unless non-nil and true
		}
		self._tabBarContentViews.forEach(
			function(view, idx)
			{
				const TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState_fn = view.TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState
				if (typeof TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState_fn === 'function') {
					view.TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState(isAnimated)
				}
			}
		)
	}
	//
	//
	// Runtime - Delegation - 
}
module.exports = TabBarAndContentView
