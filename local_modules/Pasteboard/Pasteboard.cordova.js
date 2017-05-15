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
const PasteboardInterface = require('./PasteboardInterface')
//
class Pasteboard extends PasteboardInterface
{
	constructor(options, context)
	{
		super(options, context)
		if (!cordova.plugins.clipboard || typeof cordova.plugins.clipboard === 'undefined') {
			throw `${self.constructor.name} requires cordova.plugins.clipboard`
		}
	}
	//
	IsHTMLCopyingSupported()
	{
		return false
	}
	//
	CopyString(string, contentType_orText)
	{
		const self = this
		const contentTypes = self.CopyContentTypes()
		var contentType;
		if (typeof contentType_orText === 'undefined' || !contentType_orText) {
			contentType = contentTypes.Text
		} else {
			contentType = contentType_orText
		}
		if (contentType === contentTypes.Text) {
			if (self.context.Cordova_isMobile !== true) {
				throw `cordova.plugins.clipboard doesn't support non-mobile`
			}
			cordova.plugins.clipboard.copy(string)
		} else if (contentType === contentTypes.HTML) {
			throw `Cordova does not apparently support copying HTML. Disallow HTML variant copying in consumer when on Cordova by checking IsHTMLCopyingSupported().`
		} else {
			throw "Unrecognized content type " + contentType
		}
		console.log(`📋  Copied ${contentType} string to pasteboard: "${string}".`)
	}
	CopyValuesByType(valuesByType)
	{
		const self = this
		const types = Object.keys(valuesByType)
		for (let i in types) {
			const type = types[i]
			const value = valuesByType[type]
			self.CopyString(value, type)
		}
	}
}
module.exports = Pasteboard