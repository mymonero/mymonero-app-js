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
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web.js')
//
class GeneratedRequestView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		const self = this 
		{
			self.fundsRequest = self.options.fundsRequest
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
		{
			self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
			//
			self.layer.style.width = "calc(100% - 20px)"
			self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
			//
			self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
			//
			self.layer.style.color = "#c0c0c0" // temporary
			//
			self.layer.style.overflowY = "scroll"
			self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
			//
			self.layer.style.wordBreak = "break-all" // to get the text to wrap
		}
		{ // table container (needed?)
			const containerLayer = document.createElement("div")
			{
				containerLayer.style.border = "1px solid #888"
				containerLayer.style.borderRadius = "5px"
			}
			{
				{ // QR code
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
					{
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
									self.context.filesystemUI.OpenDialogToSaveBase64ImageStringAsImageFile(
										qrCode_imgData_base64String,
										function(err)
										{
											if (err) {
												throw err
											}
											// console.log("Downloaded QR code")
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
			}
			{ // URI
				const layer = document.createElement("p")
				{
					layer.innerHTML = self.fundsRequest.Lazy_URI() 
				}
				containerLayer.appendChild(layer)
			}
			self.layer.appendChild(containerLayer)
		}
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
}
module.exports = GeneratedRequestView