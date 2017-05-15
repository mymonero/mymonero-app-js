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
//
class TabBarItemButtonView extends View
{
	constructor(options, context)
	{
		options.tag = "a"
		//
		super(options, context)
		const self = this
		{
			self.isHorizontalBar = typeof options.isHorizontalBar !== 'undefined' ? options.isHorizontalBar : true
			self.tabBarView_thickness = options.tabBarView_thickness
			//
			self.layer_baseStyleTemplate = options.layer_baseStyleTemplate || {}
			self.icon_baseStyleTemplate = options.icon_baseStyleTemplate || {}
			self.icon_selected_baseStyleTemplate = options.icon_selected_baseStyleTemplate || self.icon_baseStyleTemplate // fall back to non-selected
			self.numberOf_tabs = options.numberOf_tabs
			if (!self.numberOf_tabs) {
				throw `${self.constructor.name} requires options.numberOf_tabs`
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // state defaults
			self.isEnabled = true
		}
		self.setup__preloadStateImages()
		self.setup_views()
		self.Deselect() // also sets selected state
	}
	setup_views()
	{
		const self = this
		{
			const layer = self.layer
			layer.style.display = "inline-block"
			layer.style.position = "relative"
			layer.style.webkitAppRegion = "no-drag" // make clickable
			layer.style.webkitTapHighlightColor = "rgba(0,0,0,0)" // disable highlight under Cordova/MobileSafari
			const stackedThickness = 56
			if (self.isHorizontalBar) {
				layer.style.width = `${100/self.numberOf_tabs}%`
				layer.style.height = `${self.tabBarView_thickness}px`
			} else {
				layer.style.width = `${self.tabBarView_thickness}px`
				layer.style.height = `${stackedThickness}px`
			}
			self.__applyStylesToLayer(self.layer_baseStyleTemplate, self.layer)
		}
		{ // icon
			const layer = document.createElement("div")
			layer.style.webkitAppRegion = "no-drag" // make clickable
			layer.style.width = `100%`
			layer.style.height = `100%`
			layer.style.border = "none"
			self.iconImageLayer = layer
			self.layer.appendChild(self.iconImageLayer)
			self.__applyStylesToLayer(self.icon_baseStyleTemplate, self.iconImageLayer)
		}
		{ // observation
			self.layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					if (self.isEnabled !== false) {
						self.emit(self.EventName_clicked(), self)
					}
					return false
				}
			)
		}
	}
	setup__preloadStateImages()
	{
		const self = this
		function _new_lookup_imageURLsForAllStates()
		{
			const urls = []
			function _backgroundImageURLFrom_baseStyleTemplate(baseStyleTemplate)
			{
				const value__backgroundImage = baseStyleTemplate.backgroundImage
				if (!value__backgroundImage) {
					throw "!value__backgroundImage"
				}
				var str = value__backgroundImage
				str = str.replace(/^url\(/, '')
				str = str.replace(/\)$/, '')
				return str
			}
			const base__url__orNil = _backgroundImageURLFrom_baseStyleTemplate(self.icon_selected_baseStyleTemplate)
			const selected__url__orNil = _backgroundImageURLFrom_baseStyleTemplate(self.icon_baseStyleTemplate)
			if (base__url__orNil) {
				urls.push(base__url__orNil)
			}
			if (selected__url__orNil) {
				urls.push(selected__url__orNil)
			}
			return urls
		}
		self.preloadedImages = []
		const imageURLs = _new_lookup_imageURLsForAllStates()
		for (let i = 0; i < imageURLs.length; i++) {
			const imageURL = imageURLs[i]
			const image = new Image()
			image.src = imageURL
			self.preloadedImages.push(image)
		}
	}
	// Runtime - Accessors - Events
	EventName_clicked()
	{
		return "EventName_clicked"
	}
	// Runtime - Accessors - State
	IsSelected()
	{
		const self = this
		return self.isSelected === true
	}
	IsEnabled()
	{
		const self = this
		return self.isEnabled === true
	}
	// Runtime - Accessors - 

	// Runtime - Imperatives - UI config - Shared
	__applyStylesToLayer(styles, layer)
	{
		const styles_keys = Object.keys(styles)
		const numberOf_styles_keys = styles_keys.length
		for (let i = 0 ; i < numberOf_styles_keys ; i++) {
			const key = styles_keys[i]
			const value = styles[key]
			layer.style[key] = value
		}
	}
	// Runtime - Imperatives - Selection
	Select()
	{
		const self = this
		if (self.isEnabled == false) {
			return
		}
		self.isSelected = true
		self.__applyStylesToLayer(self.icon_selected_baseStyleTemplate, self.iconImageLayer)
	}
	Deselect()
	{
		const self = this
		self.isSelected = false
		self.__applyStylesToLayer(self.icon_baseStyleTemplate, self.iconImageLayer)
	}	
	// Runtime - Imperatives - Selection
	Enable()
	{
		const self = this
		self.isEnabled = true
		self.iconImageLayer.style.opacity = "1.0"
	}
	Disable()
	{
		const self = this
		self.isEnabled = false
		self.iconImageLayer.style.opacity = "0.3"
	}
}
module.exports = TabBarItemButtonView
