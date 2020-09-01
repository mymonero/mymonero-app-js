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
const fs = require('fs')
//
const FilesystemUI_Abstract = require('./FilesystemUI_Abstract')
//
class FilesytemUI extends FilesystemUI_Abstract
{
	constructor(options, context)
	{
		super(options, context)
	}
	//
	//
	// Runtime - Accessors - Lookups - IPC - Main window
	//
	
	//
	//
	// Runtime - Imperatives - Dialogs - Save
	PresentDialogToSaveBase64ImageStringAsImageFile(
		imgData_base64String,
		title,
		defaultFilename_sansExt,
		fn // (err?) -> Void
	) {
		const self = this
		//
		var ext = imgData_base64String.split(';')[0].match(/jpeg|png|gif/)[0]
		var data_base64String = imgData_base64String.replace(/^data:image\/\w+;base64,/, "") // strip off the data: url prefix to get just the base64-encoded bytes
		var buffer = new Buffer(data_base64String, 'base64')
		//
		const extensions = [ ext ]
		if (ext === 'jpg') {
			extensions.push('jpeg')
		}
		const remote = require('electron').remote
		const dialog = remote.dialog
		const electronWindow = remote.getCurrentWindow()
		const options = 
		{
			title: title || "Save File",
			defaultPath: `${defaultFilename_sansExt || "image"}.${ext}`,
			filters: [
				{ name: 'Images', extensions: [ ext ] },
			]
		}
		const path = dialog.showSaveDialogSync(
			electronWindow,
			options
		)
		if (path === undefined){
			console.log("No path. Canceled?")
			fn(null)
			return
		}
		console.log("Saving to path", path)
		fs.writeFile(
			path,
			buffer,
			function(err)
			{
				fn(err)
			}
		)

	}
	PresentDialogToSaveTextFile(
		contentString, 
		title,
		defaultFilename_sansExt,
		ext,
		fn,
		optl_uriContentPrefix // this can be undefined for electron since we're saving the file directly
	) {
		var buffer = new Buffer(contentString, 'utf8')
		const extensions = [ ext ]
		const remote = require('electron').remote
		const dialog = remote.dialog
		const electronWindow = remote.getCurrentWindow()
		const options = 
		{
			title: title || "Save File",
			defaultPath: `${defaultFilename_sansExt || "file"}.${ext}`,
			filters: [
				{ name: 'CSVs', extensions: [ ext ] },
			]
		}
		const path = dialog.showSaveDialogSync(
			electronWindow,
			options
		)
		if (path === undefined){
			console.log("No path. Canceled?")
			fn(null)
			return
		}
		console.log("Saving to path", path)
		fs.writeFile(
			path,
			buffer,
			function(err)
			{
				fn(err)
			}
		)

	}
	//
	//
	// Runtime - Imperatives - Dialogs - Open
	//
	PresentDialogToOpenOneImageFile(
		title,
		fn // (err?, absoluteFilePath?) -> Void
	) {
		const self = this
		//
		const remote = require('electron').remote
		const dialog = remote.dialog
		const electronWindow = remote.getCurrentWindow()
		const options = 
		{
			title: title || "Open File",
			filters: [
				{ name: 'Images', extensions: [ "png", "jpg", "jpeg" ] },
			]
		}
		const path = dialog.showOpenDialogSync(
			electronWindow,
			options
		)
		if (path === undefined){
			console.log("No path. Canceled?")
			fn(null)
			return
		}
		if (typeof path !== 'string') {
			if (Array.isArray(path)) {
				path = path[0] // select first
			} else {
				throw "Unknown `path` return type " + typeof path + " from showOpenDialog"
			}
		}
		console.log("Open file at path", path)
		fn(null, path)
	}
}
module.exports = FilesytemUI