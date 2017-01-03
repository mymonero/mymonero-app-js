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
	// Runtime - Imperatives - Dialogs - Save
	// 
	OpenDialogToSaveBase64ImageStringAsImageFile(
		imgData_base64String,
		fn // (err?) -> Void
	)
	{
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
		const fs = require('fs')
		const dialog = require('electron').remote.dialog
		const options = 
		{
			title: "Save Monero Request",
			defaultPath: "Monero request." + ext,
			filters: [
				{ name: 'Images', extensions: [ ext ] },
			]
		}
		dialog.showSaveDialog(
			options,
			function (path)
			{
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
		)
	}
}
module.exports = FilesytemUI