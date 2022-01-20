"use strict"

const URLBrowser_Abstract = require('./URLBrowser_Abstract')
const shell = require('electron').shell

class URLBrowser extends URLBrowser_Abstract
{
	constructor(options, context)
	{
		super(options, context)
	}
	OpenURLInSystemBrowser(urlString)
	{
		const self = this
		shell.openExternal(urlString)
	}
}
module.exports = URLBrowser