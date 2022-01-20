"use strict"

class URLBrowser_Abstract
{
	//
	// Lifecycle - Init
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		self.setup()
	}
	setup()
	{
		const self = this
	}
	//
	// Imperatives - Override these
	OpenURLInSystemBrowser(urlString)
	{
		const self = this
		throw `Implement OpenURLInSystemBrowser(url) in ${self.constructor.name}`
	}
}
module.exports = URLBrowser_Abstract