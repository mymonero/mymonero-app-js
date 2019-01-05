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
class RootView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		{
			const layer = self.layer
			layer.style.background = "#272527"
			layer.style.position = "absolute"
			layer.style.width = "100%"
			layer.style.height = "100%"
			layer.style.left = "0px"
			layer.style.top = "0px"
			layer.style.webkitAppRegion = "drag" // make draggable
			layer.style.webkitUserSelect = "none"
			layer.style.MozUserSelect = "none"
			layer.style.msUserSelect = "none"
			layer.style.cursor = "default"
		}
		{
			const layer = document.createElement("a")
			const w = 50
			const h = 50
			layer.style.width = 50+"px"
			layer.style.height = 50+"px"
			layer.style.display = "block"
			layer.style.outline = "none"
			layer.style.backgroundSize = `${w}px ${h}px`
			layer.style.backgroundImage = "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"AboutWindow/Resources/logo_solid_light@3x.png)"
			layer.style.backgroundPosition = "center"
			layer.style.backgroundRepeat = "no-repeat"
			layer.style.margin = "66px auto 14px auto"
			layer.style.cursor = "pointer"
			layer.href = "https://" + self.context.appDownloadLink_domainAndPath
			layer.addEventListener("click", function(e)
			{
				e.preventDefault()
				self.context.urlBrowser.OpenURLInSystemBrowser(this.href)
				return false
			})

			self.layer.appendChild(layer)
		}
		{
			const layer = document.createElement("div")
			layer.style.width = "100%"
			layer.style.textAlign = "center"
			layer.style.fontSize = "13px"
			layer.style.fontWeight = "400"
			layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
			layer.style.color = "#FCFBFC"
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.innerHTML = `Version ${self.context.app.getVersion()}`
			self.layer.appendChild(layer)
		}
		{
			const layer = document.createElement("a")
			layer.style.display = "block" // to get width as 'a' tag
			layer.style.width = "100%"
			layer.style.textAlign = "center"
			layer.style.textDecoration = "none"
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "400"
			layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
			layer.style.marginTop = "3px"
			layer.style.color = "#8D8B8D"
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.style.cursor = "pointer"
			layer.innerHTML = "View on GitHub"
			layer.href = "https://www.github.com/mymonero/mymonero-app-js/releases/latest"
			layer.addEventListener("mouseenter", function(e) 
			{
				layer.style.textDecoration = "underline"
			})
			layer.addEventListener("mouseleave", function(e)
			{
				layer.style.textDecoration = "none"
			})
			layer.addEventListener("click", function(e)
			{
				e.preventDefault()
				self.context.urlBrowser.OpenURLInSystemBrowser(this.href)
				return false
			})
			self.layer.appendChild(layer)
		}
	}
}
module.exports = RootView
