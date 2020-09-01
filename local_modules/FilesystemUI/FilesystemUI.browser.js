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
		alert("Code fault: PresentDialogToSaveBase64ImageStringAsImageFile not yet implemented")
	}
	PresentDialogToSaveTextFile(
		contentString, 
		title,
		defaultFilename_sansExt,
		ext,
		fn,
		optl_uriContentPrefix
	) {
		if (typeof optl_uriContentPrefix == 'undefined' || !optl_uriContentPrefix) {
			throw "PresentDialogToSaveTextFile expected optl_uriContentPrefix"
		}
		const uriContent = optl_uriContentPrefix + contentString;
		var encodedUri = encodeURI(uriContent);
		var link = document.createElement("a");
		link.style.visibility = "hidden"
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `${defaultFilename_sansExt}.${ext}`);
		document.body.appendChild(link); // Required for FF
		//
		link.click(); 
		//
		link.parentNode.removeChild(link);
	}
	//
	//
	// Runtime - Imperatives - Dialogs - Open
	//
	PresentDialogToOpenOneImageFile(
		title,
		fn // (err?, absoluteFilePath?) -> Void
	) {
		alert("Code fault: PresentDialogToOpenOneImageFile not yet implemented")
	}
}
module.exports = FilesytemUI