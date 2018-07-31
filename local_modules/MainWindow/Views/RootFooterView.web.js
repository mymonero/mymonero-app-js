// Copyright (c) 2014-2018, MyMonero.com
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
class RootFooterView extends View
{
	constructor(options, context)
	{
		super(options, context)

		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		const layer = self.layer
		layer.style.height = `${self.context.rootViewFooterHeight}px`
		layer.style.backgroundColor = "#171416"
		//
		const primaryUtilityLink_colorValue = "rgb(250, 246, 250)"
		const utilityLink_colorValue = "rgb(140, 136, 140)"
		const importantLink_colorValue = "#11bbec"

		//
		self.layer.appendChild(self._new_linkButtonLayerElement("Home", primaryUtilityLink_colorValue, function()
		{
			window.open('https://www.mymonero.com/', '_blank') // new tab
		}))
		self.layer.appendChild(self._new_linkButtonLayerElement("Privacy", utilityLink_colorValue, function()
		{
			window.open('https://www.mymonero.com/#/privacy-policy', '_blank') // new tab
		}))
		self.layer.appendChild(self._new_linkButtonLayerElement("Terms", utilityLink_colorValue, function()
		{
			window.open('https://www.mymonero.com/#/terms', '_blank') // new tab
		}))
		//
		{
			const buttonLayer = self._new_linkButtonLayerElement("Support", importantLink_colorValue, function()
			{
				window.Intercom('show')
				// window.Intercom('update', {
				// 	hide_default_launcher: false
				// })
			})
			buttonLayer.style.float = "right"
			buttonLayer.style.marginRight = "24px"
			self.layer.appendChild(buttonLayer)
		}
	}
	_new_linkButtonLayerElement(title, colorValue, action_fn)
	{
		const self = this
		//
		const a = document.createElement("a")
		a.innerHTML = `<span>${title}</span>`
		a.style.color = colorValue
		a.style.cursor = "pointer"
		a.style.webkitUserSelect = "none" // disable selection
		a.style.MozUserSelect = "none"
		a.style.msUserSelect = "none"
		a.style.userSelect = "none"
		self.context.themeController.StyleLayer_FontAsSmallRegularSansSerif(a)
		a.style.webkitTapHighlightColor = "rgba(0,0,0,0)" 
		a.style.margin = "0 8px 0 24px"
		a.style.lineHeight = self.layer.style.height 
		a.style.height = self.layer.style.height 
		a.style.display = "inline-block"
		// a.style.width = "auto"
		// a.style.display = "block"
		// a.style.clear = "both"

		// a.addEventListener("mouseenter", function()
		// {
		// 	if (view.isEnabled !== false) {
		// 		a.style.textDecoration = "underline"
		// 	} else {
		// 		a.style.textDecoration = "none"
		// 	}
		// 	if (view.isEnabled !== false) {
		// 		mouseEnter_fn()
		// 	}
		// })
		// a.addEventListener("mouseleave", function()
		// {	// note going to check enabled here cause mouseleave may be needed
		// 	// to reset element to its neutral state after having been deactivated
		// 	a.style.textDecoration = "none"
		// 	mouseLeave_fn()
		// })
		a.addEventListener("click", function(e)
		{
			e.preventDefault()
			action_fn()
			return false
		})
		//
		return a
	}
}
module.exports = RootFooterView
