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
const uuidV1 = require('uuid/v1')
//
const View = require('../../Views/View.web')
//
class NavigationBarView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.navigationController = options.navigationController
			if (typeof self.navigationController === 'undefined' || self.navigationController === null) {
				throw "NavigationBarView self.navigationController nil"
				return
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // initial state
		}
		{ // self.layer
			const layer = self.layer
			{
				layer.style.position = "absolute" // https://developers.google.com/web/updates/2016/12/position-sticky
				layer.style.top = "0%"
				layer.style.zIndex = "9"
			}
			{
				layer.style.width = "100%"
				layer.style.height = `${self.NavigationBarHeight()}px`
			}
			{
				layer.style.webkitAppRegion = "drag" // make draggable
				layer.style.webkitUserSelect = "none"
			}
		}
		{ // background decoration view
			const view = new View({}, self.context)
			{
				const layer = self.layer
				{
					layer.style.position = "absolute"
					layer.style.width = "100%"
					layer.style.height = `${self.NavigationBarHeight()}px`
				}
				layer.style.backgroundColor = "#282527"
			}
			self.backgroundView = view
			self.addSubview(view)
		}
		{
			const layer = document.createElement("span")
			{
				layer.style.color = "#F8F7F8"
				layer.style.fontSize = "16px"
				layer.style.position = "absolute"
				layer.style.fontFamily = `"Helvetica Neue", Helvetica, Arial, sans-serif`
				layer.style.top = "0%"
				layer.style.left = "calc(15% + 16px)"
				layer.style.width = `calc(${ 100 - 2*15 }% - ${2 * 16}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				layer.style.textAlign = "center"
				layer.style.lineHeight = `${self.NavigationBarHeight()}px`
			}
			self.layer.appendChild(layer)
			self.titleLayer = layer
		}
		{ // leftBarButtonHolderView
			const view = new View({}, self.context)
			const layer = view.layer
			{
				layer.style.position = "absolute"
				layer.style.left = "16px"
				layer.style.width = "15%"
				layer.style.minWidth = `${self.NavigationBarHeight()}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				//
				// layer.style.border = "1px solid green"
			}
			self.addSubview(view)
			self.leftBarButtonHolderView = view
		}
		{ // rightBarButtonHolderView
			const view = new View({}, self.context)
			const layer = view.layer
			{
				layer.style.position = "absolute"
				layer.style.right = "16px"
				layer.style.width = "15%"
				layer.style.minWidth = `${self.NavigationBarHeight()}px`
				layer.style.height = `${self.NavigationBarHeight()}px`
				//
				// layer.style.border = "1px solid red"
			}
			self.addSubview(view)
			self.rightBarButtonHolderView = view
		}
	}
	//
	//
	// Runtime - Accessors - Public - Events
	//

	//
	//
	// Runtime - Accessors - Public - UI Metrics
	//
	NavigationBarHeight()
	{
		return 44
	}
	//
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	idPrefix()
	{
		const self = this
		//
		return "NavigationBarView" + "-of-" + self.navigationController.idPrefix() // borrow its uuid namespacing
	}
	//
	//
	// Runtime - Imperatives 
	//
	SetTopStackView(
		stackView, 
		isAnimated, 
		ifAnimated_isFromRightNotLeft
	)
	{
		const self = this
		//
		self.SetTitleFromTopStackView(stackView, isAnimated, ifAnimated_isFromRightNotLeft)
		self.SetBarButtonsFromTopStackView(stackView, isAnimated)
	}
	SetTitleFromTopStackView(
		stackView,
		isAnimated, 
		ifAnimated_isFromRightNotLeft
	)
	{
		const self = this
		if (typeof stackView !== 'undefined' && stackView !== null) {
			if (typeof stackView.Navigation_Title !== 'function') {
				console.error("Error: stackView didn't define Navigation_Title()", stackView)
				throw "stackView.Navigation_Title() not a function"
			}
			if (isAnimated) {
				// TODO: transition/fade
			} else {
			}
			
			const titleString = stackView.Navigation_Title()
			self.titleLayer.innerHTML = titleString
			
			
		} else {
			self.titleLayer.innerHTML = "" // clear
		}
	}
	SetBarButtonsFromTopStackView(
		stackView, 
		isAnimated
	)
	{
		const self = this
		{ // remove existing
			{ // left btn
				const view = self.leftBarButtonView
				self.leftBarButtonView = null // free
				if (typeof view !== 'undefined' && view !== null) {
					if (isAnimated) {
						// TODO: fade out then remove
					}
					view.removeFromSuperview()
				}
			}
			{ // right btn
				const view = self.rightBarButtonView
				self.rightBarButtonView = null // free
				if (typeof view !== 'undefined' && view !== null) {
					if (isAnimated) {
						// TODO: fade out then remove
					}
					view.removeFromSuperview()
				}
			}
		}
		{ // add new
			if (typeof stackView !== 'undefined' && stackView !== null) {
				{ // left btn
					const factoryFn = stackView.Navigation_New_LeftBarButtonView
					if (typeof factoryFn === 'function') {
						const buttonView = factoryFn.apply(stackView) // use .apply to maintain stackView as this
						console.log("left buttonView" , buttonView)
						if (typeof buttonView !== 'undefined' && buttonView !== null) {
							{
								buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
							}
							self.leftBarButtonView = buttonView
							if (isAnimated) {
								// TODO: opacity->0, add, fade in
							}
							self.leftBarButtonHolderView.addSubview(buttonView)
						}
					}
				}
				{ // right btn
					const factoryFn = stackView.Navigation_New_RightBarButtonView
					if (typeof factoryFn === 'function') {
						const buttonView = factoryFn.apply(stackView) // use .apply to maintain stackView as this
						if (typeof buttonView !== 'undefined' && buttonView !== null) {
							{
								buttonView.layer.style.webkitAppRegion = "no-drag" // make clickable
							}
							self.rightBarButtonView = buttonView
							if (isAnimated) {
								// TODO: opacity->0, add, fade in
							}
							self.rightBarButtonHolderView.addSubview(buttonView)
						}
					}
				}
			}
		}
	}
}
module.exports = NavigationBarView