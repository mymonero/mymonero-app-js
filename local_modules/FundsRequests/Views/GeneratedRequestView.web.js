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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
//
class GeneratedRequestView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		const self = this 
		{
			self.fundsRequest = self.options.record // calling this `record` for now to standardize interface
			if (typeof self.fundsRequest === 'undefined' || !self.fundsRequest) {
				throw self.constructor.name + " requires a self.options.fundsRequest"
				return
			}
		}
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
		self._setup_self_layer()
		self._setup_qrCodeContainerLayer()
		self._setup_URIContainerLayer()
		self._setup_requesteeMessageLayer()
		self._setup_deleteRecordButtonLayer()
	}
	_setup_self_layer()
	{
		const self = this
		self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		self.layer.style.width = "calc(100% - 20px)"
		self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		//
		self.layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		self.layer.style.color = "#c0c0c0" // temporary
		//
		self.layer.style.overflowY = "scroll"
		self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_qrCodeContainerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		{
			containerLayer.style.border = "1px solid #888"
			containerLayer.style.borderRadius = "5px"
		}
		{ // QR code field
			const div = commonComponents_tables.New_fieldContainerLayer()
			{ // qrcode div
				const layer = document.createElement("div")
				{
					layer.style.width = "75px"
					layer.style.height = "75px"
					layer.style.display = "inline-block"
					layer.style.float = "left"
				}
				self.qrCode_div = layer
				{
					const QRCode = require('../Vendor/qrcode.min')
		            const qrCode = new QRCode(
						layer,
						{
		                	correctLevel: QRCode.CorrectLevel.L
						}
					)
					qrCode.makeCode(self.fundsRequest.Lazy_URI())
				}
				div.appendChild(layer)
			}
			const qrCode_imgLayer = self.qrCode_div.querySelector("img")
			{ // cache the qrCode_imgLayer reference --^; style --v
				const layer = qrCode_imgLayer
				layer.style.width = "75px"
				layer.style.height = "75px"
			}
			{ // Download button
				const layer = document.createElement("a")
				{
					layer.innerHTML = "DOWNLOAD"
					layer.style.float = "right"
					layer.style.textAlign = "right"
					layer.style.fontSize = "15px"
					layer.style.fontWeight = "bold"
					//
					layer.style.color = "#6666ff" 
					layer.href = "#" // to make it look clickable
				}
				layer.addEventListener(
					"click",
					function(e)
					{
						e.preventDefault()
						{ // this should capture value

							const qrCode_imgData_base64String = qrCode_imgLayer.src // defer grabbing this til here because we want to wait for the QR code to be properly generated
							self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
							// ^ so we don't get torn down while dialog open
							function __trampolineFor_didFinish()
							{ // ^ essential we call this from now on if we are going to finish with this codepath / exec control
								self.context.userIdleInWindowController.ReEnable_userIdle()					
							}							
							self.context.filesystemUI.PresentDialogToSaveBase64ImageStringAsImageFile(
								qrCode_imgData_base64String,
								"Save Monero Request",
								"Monero request",
								function(err)
								{
									if (err) {
										throw err
										__trampolineFor_didFinish()
										return
									}
									// console.log("Downloaded QR code")
									__trampolineFor_didFinish() // re-enable idle timer
								}
							)
						}
						return false
					}
				)
				div.appendChild(layer)
			}
			div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?
			containerLayer.appendChild(div)
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_URIContainerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		{
			containerLayer.style.border = "1px solid #888"
			containerLayer.style.borderRadius = "5px"
		}
		{
			const div = commonComponents_tables.New_fieldContainerLayer()
			{
				const uri = self.fundsRequest.Lazy_URI()
				{ // left
					const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer("Request Link", self.context)
					div.appendChild(labelLayer)
				}
				{ // right
					const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
						uri,
						true,
						self.context.pasteboard
					)
					buttonLayer.style.float = "right"
					div.appendChild(buttonLayer)
				}
				{
					const clearingBreakLayer = document.createElement("br")
					clearingBreakLayer.clear = "both"
					div.appendChild(clearingBreakLayer)
				}
				const value = uri
				const valueLayer = commonComponents_tables.New_fieldValue_labelLayer("" + value)
				{ // special case
					valueLayer.style.float = "left"
					valueLayer.style.textAlign = "left"
					//
					valueLayer.style.width = "270px"
					//
					// valueLayer.style.webkitUserSelect = "all" // commenting for now as we have the COPY button
				}
				div.appendChild(valueLayer)
			}
			div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?
			containerLayer.appendChild(div)
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_requesteeMessageLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		{
			containerLayer.style.border = "1px solid #888"
			containerLayer.style.borderRadius = "5px"
		}
		const div = commonComponents_tables.New_fieldContainerLayer()
		{
			const htmlString = self.new_requesteeMessageHTMLString()
			{ // left
				const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer("Message for Requestee", self.context)
				div.appendChild(labelLayer)
			}
			{ // right
				const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
					htmlString,
					true,
					self.context.pasteboard,
					self.context.pasteboard.CopyContentTypes().HTML
				)
				buttonLayer.style.float = "right"
				div.appendChild(buttonLayer)
			}
			{
				const clearingBreakLayer = document.createElement("br")
				clearingBreakLayer.clear = "both"
				div.appendChild(clearingBreakLayer)
			}
			{
				div.appendChild(commonComponents_tables.New_separatorLayer())
			}
			{
				const value = htmlString
				const valueLayer = commonComponents_tables.New_fieldValue_labelLayer(value)
				div.appendChild(valueLayer)
			}
			div.appendChild(commonComponents_tables.New_clearingBreakLayer()) // preserve height; better way?
		}
		containerLayer.appendChild(div)
		self.layer.appendChild(containerLayer)
	}
	_setup_deleteRecordButtonLayer()
	{
		const self = this
		const view = commonComponents_tables.New_deleteRecordNamedButtonView("request", self.context)
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					const record_id = self.fundsRequest._id
					self.context.fundsRequestsListController.WhenBooted_DeleteRecordWithId(
						record_id,
						function(err)
						{
							if (err) {
								throw err
								return
							}
							self._thisRecordWasDeleted()
						}
					)
				}
				return false
			}
		)
		self.layer.appendChild(layer)
	}
	//
	//
	// Constructor - Accessors
	//
	new_requesteeMessageHTMLString()
	{
		const self = this
		var value = ""
		value += "<p>Someone wants some Monero.</p>"
		value += "<p>---------------------------</p>"
		value += `<p>${self.fundsRequest.amount} XMR`
		{ // within same p tag to get visual grouping/line-height
			if (self.fundsRequest.message && typeof self.fundsRequest.message !== 'undefined') {
				value += `</br>${self.fundsRequest.message}`
			}
			if (self.fundsRequest.description && typeof self.fundsRequest.description !== 'undefined') {
				value += `<br/>${self.fundsRequest.description}`
			}
		}
		value += "</p>"
		value += "<p>---------------------------</p>"
		value += `<p>If you have MyMonero installed, <a href="${self.fundsRequest.Lazy_URI()}">press this link to send the funds</a>.`
		const appDownloadLink_domainAndPath = "mymonero.com/desktop"
		const appDownloadLink_fullURL = "https://" + appDownloadLink_domainAndPath
		value += `<p>If you don't have MyMonero installed, download it from <a href="${appDownloadLink_fullURL}">${appDownloadLink_domainAndPath}</a>.`
		//
		return value
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Monero Request"
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		// teardown any child/referenced stack navigation views if necessary…
	}
	//
	//
	// Runtime - Delegation - Deletion -> navigation handling
	//
	_thisRecordWasDeleted()
	{
		const self = this
		self.navigationController.PopView(true)
	}
}
module.exports = GeneratedRequestView