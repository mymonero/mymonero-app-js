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
/*global cordova, QRScanner */
/*eslint no-undef: "error"*/
//
const QRScanningUI_Abstract = require('./QRScanningUI_Abstract')
//
class QRScanningUI extends QRScanningUI_Abstract
{
	constructor(options, context)
	{
		super(options, context)
		if (!QRScanner || typeof QRScanner === 'undefined') {
			throw `${self.constructor.name} requires a 'QRScanner'`
		}
	}
	//
	// Runtime - Imperatives - Scanning
	PresentUIToScanOneQRCodeString(
		fn // (err?, string) -> Void
	)
	{
		const self = this
		console.log("~~~~~~~~~~~> pick qr code with ", QRScanner)
		QRScanner.prepare( // show the prompt (if necessary(?))
			function(err, status)
			{
				if (err) { // here we can handle errors and clean up any loose ends.
					fn(err)
					return // must exit
				}
				if (status.authorized) {
					__qrScanner_wasAuthorized()
					return
				}
				if (status.denied) {
					fn(new Error("QR scanning requires camera access. Please enable MyMonero in your system Settings."))
					// TODO: ? give use the option to open up settings with some sort of prompt in the validation msg? may be possible via `QRScanner.openSettings()`
					return
				}
				fn(new Error("Couldn't gain camera access for QR scanning. Please try again."))
			}
		)		
		function __qrScanner_wasAuthorized()
		{
			// let mainDiv = document.body.childNodes[5]
			// let oldStyle = JSON.parse(JSON.stringify(mainDiv.style));

			// mainDiv.style = {}
			console.log("~~~~~~~~~~~> was authorized")

			QRScanner.show(function(status)
			{
				console.log("~~~~~~~~~~~> status" , status)
				QRScanner.scan(function (err, text)
				{
					if (err) {
						fn(err)
						return 
					}
					console.log("~~~~~~~~~~~>  scan text", text)
					// The scan completed, display the contents of the QR code:
					QRScanner.destroy(function (status)
					{
						console.log("~~~~~~~~~~~>  destroy", status)
						// mainDiv.style.background = "#272527"
						// mainDiv.style.position = "absolute"
						// mainDiv.style.width = "100%"
						// mainDiv.style.height = "100%"
						// mainDiv.style.left = "0px"
						// mainDiv.style.top = "0px"
						// mainDiv.style.overflow = "hidden" // prevent scroll bar
						// document.body.style = {}
						fn(null, text) 
					})
				})
			})
		}
	}
}
module.exports = QRScanningUI