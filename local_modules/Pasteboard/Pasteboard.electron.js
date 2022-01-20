"use strict"

const PasteboardInterface = require('./PasteboardInterface')
const electron__clipboard = require('electron').clipboard

class Pasteboard extends PasteboardInterface
{
	constructor(options, context)
	{
		super(options, context)
	}
	//
	IsHTMLCopyingSupported()
	{
		return true
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
			electron__clipboard.writeText(string)
		} else if (contentType === contentTypes.HTML) {
			electron__clipboard.writeHTML(string)
		} else {
			throw "Unrecognized content type " + contentType
		}
		console.log(`📋  Copied ${contentType} string to pasteboard: "${string}".`)
	}
	CopyValuesByType(valuesByType)
	{
		electron__clipboard.write(valuesByType)
		console.log(`📋  Copied values of types ${Object.keys(valuesByType)}.`)
	}
}
module.exports = Pasteboard