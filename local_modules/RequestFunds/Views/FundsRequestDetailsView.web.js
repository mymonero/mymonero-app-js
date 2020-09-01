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
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const FundsRequestCellContentsView = require('./FundsRequestCellContentsView.web')
const FundsRequestQRDisplayView = require('./FundsRequestQRDisplayView.web')
//
class FundsRequestDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		const self = this 
		{
			self.fundsRequest = self.options.record // calling this `record` for now to standardize interface
			if (typeof self.fundsRequest === 'undefined' || !self.fundsRequest) {
				throw self.constructor.name + " requires a self.options.fundsRequest"
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
		self._setup_cellContentsContainerLayer()
		self._setup_URIContainerLayer()
		self._setup_requesteeMessageLayer()
		self._setup_deleteRecordButtonLayer()
		// self.DEBUG_BorderAllLayers()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.overflowY = "auto"
		// layer.style.webkitOverflowScrolling = "touch"
		layer.style.padding = "0 0 40px 0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	__new_flatTable_sectionContainerLayer(isFirst)
	{
		const self = this
		const layer = document.createElement("div")
		{
			layer.style.border = "0.5px solid #494749"
			layer.style.borderRadius = "5px"
			layer.style.margin = `${isFirst ? 16 : 20}px 16px 0px 16px`
			layer.style.padding = "0"
		}
		return layer
	}
	_setup_cellContentsContainerLayer()
	{
		const self = this
		const containerLayer = self.__new_flatTable_sectionContainerLayer(true)
		containerLayer.style.position = "relative" // for pos:abs children
		{
			const view = new FundsRequestCellContentsView({
				margin_right: 16,
				doNotDisplayQRCode: true
			}, self.context)
			self.cellContentsView = view
			view.ConfigureWithRecord(self.fundsRequest)
			// though this `add…` could be deferred til after…
			containerLayer.appendChild(view.layer)
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_URIContainerLayer()
	{
		const self = this
		const containerLayer = self.__new_flatTable_sectionContainerLayer(false)
		containerLayer.style.padding = "0 0 0 15px" // to get separator inset
		{
			const div = commonComponents_tables.New_fieldContainerLayer(self.context)
			div.style.padding = "15px 0 17px 0"
			{
				{ // left
					const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer("QR Code", self.context)
					labelLayer.style.margin = "0 0 0 0"
					labelLayer.style.padding = "0"
					div.appendChild(labelLayer)
				}
				{ // right
					const buttonLayer = commonComponents_tables.New_customButton_aLayer(
						self.context, 
						"SAVE",
						true, // isEnabled, defaulting to true on undef
						function()
						{
							self._userSelectedDownloadButton()
						}
					);
					self.saveQRImage_buttonLayer = buttonLayer
					buttonLayer.style.float = "right"
					buttonLayer.style.marginRight = "18px"
					div.appendChild(buttonLayer)
				}
				div.appendChild(commonComponents_tables.New_clearingBreakLayer())
				{ 
					const qrContainer_div = document.createElement("div")
					let side = 56
					let imageInset = 0
					{
						const layer = qrContainer_div
						layer.style.overflow = "hidden" // we can clip (to get corner radius) b/c no drop shadow here (TODO?: because the actual qr code image that is generated by this app's dependency includes some whitespace padding the qr data content!)
						layer.style.position = "relative"
						layer.style.width = side + "px"
						layer.style.height = side + "px"
						layer.style.padding = "0"
						layer.style.borderRadius = "3px"
						layer.style.backgroundColor = "#fff" // to match the image itself
						layer.style.margin = "10px 15px 0 0"
					}
					div.appendChild(qrContainer_div)
					//
					let imgDataURIString = self.fundsRequest.qrCode_imgDataURIString
					const valueLayer = commonComponents_tables.New_fieldValue_base64DataImageLayer(
						imgDataURIString, 
						self.context
					)
					{
						const layer = valueLayer
						layer.style.margin = "0"
						layer.style.width = side+"px"
						layer.style.height = side+"px"
						layer.style.position = "absolute"
						layer.style.left = "0"
						layer.style.top = "0"
						layer.style.cursor = "pointer"
					}
					valueLayer.addEventListener("click", function(e)
					{
						e.preventDefault()
						{
							const view = new FundsRequestQRDisplayView({
								fundsRequest: self.fundsRequest,
								presentedModally: true
							}, self.context)
							const navigationView = new StackAndModalNavigationView({}, self.context)
							navigationView.SetStackViews([ view ])
							self.navigationController.PresentView(navigationView, true)
						}
						return false
					})
					qrContainer_div.appendChild(valueLayer)
				}
			}
			containerLayer.appendChild(div)
		}
		containerLayer.appendChild(commonComponents_tables.New_separatorLayer(self.context))
		{
			const div = commonComponents_tables.New_fieldContainerLayer(self.context)
			div.style.padding = "15px 0 17px 0"
			{
				const clickableLink_uri = self.fundsRequest.Lazy_URI__addressAsAuthority()
				{ // left
					const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer("Request Link", self.context)
					labelLayer.style.margin = "0 0 0 0"
					labelLayer.style.padding = "0"
					div.appendChild(labelLayer)
				}
				{ // right
					const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
						self.context,
						clickableLink_uri,
						true,
						self.context.pasteboard
					)
					buttonLayer.style.float = "right"
					buttonLayer.style.marginRight = "18px"
					div.appendChild(buttonLayer)
				}
				{
					div.appendChild(commonComponents_tables.New_clearingBreakLayer())
				}
				const value = clickableLink_uri
				const valueLayer = commonComponents_tables.New_fieldValue_labelLayer("" + value, self.context)
				{ // special case
					valueLayer.style.float = "none"
					valueLayer.style.display = "block"
					valueLayer.style.textAlign = "left"
					//
					valueLayer.style.margin = "10px 15px 0 0"
					valueLayer.style.maxWidth = "270px"
				}
				div.appendChild(valueLayer)
			}
			containerLayer.appendChild(div)
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_requesteeMessageLayer()
	{
		const self = this
		const containerLayer = self.__new_flatTable_sectionContainerLayer(false)
		const div = commonComponents_tables.New_fieldContainerLayer(self.context)
		div.style.padding = "15px 0 5px 0" // 5px instead of 17px cause value layer in this special case has p tags with their own padding/margin
		{
			const htmlString = self.new_requesteeMessageHTMLString()
			{ // left
				const labelLayer = commonComponents_tables.New_fieldTitle_labelLayer(
					"Message for Requestee", 
					self.context
				)
				labelLayer.style.margin = "0 0 0 15px"
				labelLayer.style.padding = "0"
				labelLayer.style.color = "#DFDEDF" // design specifies slightly different color
				div.appendChild(labelLayer)
			}
			{ // right
				// copying both html and plaintext
				const plaintextString = self.new_requesteeMessagePlaintextString()
				const CopyContentTypes = self.context.pasteboard.CopyContentTypes()
				const toCopy_valuesByContentType = {}
				if (self.context.pasteboard.IsHTMLCopyingSupported() == true) {
					toCopy_valuesByContentType[CopyContentTypes.HTML] = htmlString
				}
				toCopy_valuesByContentType[CopyContentTypes.Text] = plaintextString
				const buttonLayer = commonComponents_tables.New_copyButton_aLayer(
					self.context,
					toCopy_valuesByContentType,
					true,
					self.context.pasteboard
				)
				buttonLayer.style.float = "right"
				buttonLayer.style.marginTop = "1px"
				buttonLayer.style.marginRight = "18px"
				div.appendChild(buttonLayer)
			}
			{
				div.appendChild(commonComponents_tables.New_clearingBreakLayer())
			}
			{
				const value = htmlString
				const valueLayer = commonComponents_tables.New_fieldValue_labelLayer(value, self.context)
				{ // special case
					valueLayer.style.display = "block"
					valueLayer.style.float = "none"
					valueLayer.style.textAlign = "left"
					//
					valueLayer.style.margin = "16px 15px 0 15px"
				}
				div.appendChild(valueLayer)
			}
		}
		containerLayer.appendChild(div)
		self.layer.appendChild(containerLayer)
	}
	_setup_deleteRecordButtonLayer()
	{
		const self = this
		const view = commonComponents_tables.New_deleteRecordNamedButtonView("request", self.context)
		const layer = view.layer
		layer.style.marginTop = "25px"
		layer.style.marginBottom = "24px"
		function __proceedTo_deleteRecord()
		{
			const record_id = self.fundsRequest._id
			self.context.fundsRequestsListController.WhenBooted_DeleteRecordWithId(
				record_id,
				function(err)
				{
					if (err) {
						throw err
					}
					self._thisRecordWasDeleted()
				}
			)
		}
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (view.isEnabled === false) {
						console.warn("Delete btn not enabled")
						return false
					}
					self.context.windowDialogs.PresentQuestionAlertDialogWith(
						'Delete this request?', 
						'Delete this request?\n\nThis cannot be undone.',
						'Delete', 
						'Cancel',
						function(err, didChooseYes)
						{
							if (err) {
								throw err
							}
							if (didChooseYes) {
								__proceedTo_deleteRecord()
							}
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
	new_requesteeMessagePlaintextString()
	{
		const self = this
		var value = "" // must use \r\n instead of \n for Windows
		let ccy = self.fundsRequest.amountCcySymbol || "XMR"
		{
			value += "Someone has requested a Monero payment"
			if (self.fundsRequest.amount) {
				value += ` of ${self.fundsRequest.amount} ${ccy}`
			}
			value += "."
		}
		if (self.fundsRequest.message && typeof self.fundsRequest.message !== 'undefined') {
			value += `\r\n`
			value += `\r\nMemo: "${self.fundsRequest.message}"`
		}
		if (self.fundsRequest.description && typeof self.fundsRequest.description !== 'undefined') {
			value += `\r\n`
			value += `\r\nDescription: "${self.fundsRequest.description}"`
		}
		value += "\r\n" // spacer
		value += "\r\n---------------------------"
		value += `\r\nIf you have MyMonero installed, use this link to send the funds: ${self.fundsRequest.Lazy_URI__addressAsAuthority()}`
		value += `\r\n`
		value += `\r\nIf you don't have MyMonero installed, download it from ${"https://" + self.context.appDownloadLink_domainAndPath}`
		//
		return value
	}
	new_requesteeMessageHTMLString()
	{
		const self = this
		var value = ""
		//
		let ccy = self.fundsRequest.amountCcySymbol || "XMR"
		value += "<p>"
		{
			value += "Someone has requested a Monero payment"
			if (self.fundsRequest.amount) {
				value += ` of <strong>${self.fundsRequest.amount} ${ccy}</strong>`
			}
			value += "."
		}
		value += "</p>"
		if (self.fundsRequest.message && typeof self.fundsRequest.message !== 'undefined') {
			value += `<p>Memo: "${self.fundsRequest.message}"</p>`
		}
		if (self.fundsRequest.description && typeof self.fundsRequest.description !== 'undefined') {
			value += `<p>Description: "${self.fundsRequest.description}"</p>`
		}
		value += "<p>---------------------------</p>"
		value += `<p>If you have MyMonero installed, <a href="${self.fundsRequest.Lazy_URI__addressAsAuthority()}">press this link to send the funds</a>.</p>`
		const appDownloadLink_domainAndPath = self.context.appDownloadLink_domainAndPath
		value += `<p>If you don't have MyMonero installed, download it from <a href="https://${appDownloadLink_domainAndPath}">${appDownloadLink_domainAndPath}</a>.</p>`
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
		if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
			self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		}
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
	_userSelectedDownloadButton()
	{
		const self = this
		self.saveQRImage_buttonLayer.Component_SetEnabled(false)
		self.context.userIdleInWindowController.TemporarilyDisable_userIdle() // TODO: this is actually probably a bad idea - remove this and ensure that file picker canceled on app teardown
		// ^ so we don't get torn down while dialog open
		function __trampolineFor_didFinish()
		{ // ^ essential we call this from now on if we are going to finish with this codepath / exec control
			self.saveQRImage_buttonLayer.Component_SetEnabled(true)
			self.context.userIdleInWindowController.ReEnable_userIdle()
		}
		self.context.filesystemUI.PresentDialogToSaveBase64ImageStringAsImageFile(
			self.fundsRequest.qrCode_imgDataURIString,
			"Save Monero Request",
			"Monero request",
			function(err)
			{
				if (err) {
					const errString = err.message 
						? err.message 
						: err.toString() 
							? err.toString() 
							: ""+err
					navigator.notification.alert(
						errString, 
						function() {}, // nothing to do 
						"Error", 
						"OK"
					)
					__trampolineFor_didFinish()
					return
				}
				// console.log("Downloaded QR code")
				__trampolineFor_didFinish() // re-enable idle timer
			}
		)
	}
}
module.exports = FundsRequestDetailsView