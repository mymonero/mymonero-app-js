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
		const table = document.createElement("table")
		table.style.border = "none"
		table.style.padding = "0"
		table.style.margin = "0"
		table.style.width = "100%"
		table.style.maxWidth = "400px"
		const tr = document.createElement("tr")
		table.appendChild(tr)
		layer.appendChild(table)
		//
		tr.appendChild(self._new_linkButtonLayerElement("Home", primaryUtilityLink_colorValue, function(e)
		{
			e.preventDefault()
			window.open('https://www.mymonero.com/', '_blank') // new tab
			return false;
		}))
		tr.appendChild(self._new_linkButtonLayerElement("Privacy", utilityLink_colorValue, function(e)
		{
			e.preventDefault()
			window.open('https://www.mymonero.com/privacy', '_blank') // new tab
			return false;
		}))
		tr.appendChild(self._new_linkButtonLayerElement("Terms", utilityLink_colorValue, function(e)
		{
			e.preventDefault()
			window.open('https://www.mymonero.com/terms', '_blank') // new tab
			return false;
		}))
		tr.appendChild(self._new_linkButtonLayerElement("Support", importantLink_colorValue, function(e)
		{
			e.preventDefault()
			window.open("https://mymonero.com/?open_support=1", "_blank")
			// shift to this when support can be brought directly back in:
			// window.Intercom('show')
			// previous:
			// window.Intercom('update', {
			// 	hide_default_launcher: false
			// })
			return false;
		}))
	}
	_new_linkButtonLayerElement(title, colorValue, click_handler_fn)
	{
		const self = this
		//
		const td = document.createElement("td")
		td.style.maxWdth = "80px"
		td.width = "25%"
		td.align = "center"
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
		a.style.margin = "0"
		a.style.width = "auto"
		a.style.maxWidth = "82px"
		a.style.lineHeight = "28px"
		a.style.height = "32px"
		a.style.display = "inline-block"
		a.style.padding = "0"
		a.addEventListener("click", click_handler_fn)
		td.appendChild(a)
		//
		return td
	}
}
module.exports = RootFooterView
