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
/*global cordova */
/*eslint no-undef: "error"*/
//
const FilesystemUI_Abstract = require('./FilesystemUI_Abstract')
//
class FilesytemUI extends FilesystemUI_Abstract
{
	constructor(options, context)
	{
		super(options, context)
		if (!cordova.base64ToGallery || typeof cordova.base64ToGallery === 'undefined') {
			throw `${self.constructor.name} requires a cordova.base64ToGallery`
		}
		if (!window.imagePicker || typeof window.imagePicker === 'undefined') {
			throw `${self.constructor.name} requires a window.imagePicker`
		}
	}	
	//
	// Runtime - Imperatives - Dialogs - Save
	// NOTE: In this mobile-specific implementation, no dialog to save is actually presented.
	// As such, it means the name of the function can probably be improved
	PresentDialogToSaveBase64ImageStringAsImageFile(
		imgDataBase64_URIString,
		saveDialogTitle, // unused in mobile impl
		defaultFilename_sansExt,
		fn // (err?) -> Void
	)
	{
		const self = this
		cordova.base64ToGallery(
			imgDataBase64_URIString,
			{
				prefix: defaultFilename_sansExt, 
				mediaScanner: true
			},
			function(filePath)
			{
				console.log('File saved to ' + filePath)
				navigator.notification.alert(
					"Saved to photo roll", 
					function() {}, // nothing to do 
					"MyMonero", 
					"OK"
				)
				fn() // no need to pass path back
			},
			function(msg)
			{
				console.error(msg)
				fn(new Error(msg))
			}
		)
	}
	//
	// Runtime - Imperatives - Dialogs - Open
	PresentDialogToOpenOneImageFile(
		title, // unused in this impl
		fn // (err?, absoluteFilePath?) -> Void
	)
	{
		const self = this
		const options =
		{
			maximumImagesCount: 1
		}
		window.imagePicker.getPictures(
			function(pictureURIs) {
				const pictureURIs_length = pictureURIs.length
				if (pictureURIs_length == 0) {
					fn() // canceled ?
					return
				}
				// Since this iOS image picker plugin lets you pick more than one image,
				// we must check for this and simply let the user know. Cause it may not make
				// sense to try to pick the 0th img on the assumption ordering is retained 
				// and have it fail confusingly.
				if (pictureURIs_length > 1) {
					fn(new Error("Please select only one image."))
					return
				}
				const pictureURI = pictureURIs[0]
				fn(null, pictureURI)
			}, 
			function (error) 
			{
				console.log('Error: ' + error)
				fn(error)
			},
			options
		)
	}
}
module.exports = FilesytemUI