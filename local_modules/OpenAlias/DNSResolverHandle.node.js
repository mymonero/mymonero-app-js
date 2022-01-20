"use strict"

const DNSResolverHandle_Interface = require('./DNSResolverHandle_Interface')

class DNSResolverHandle extends DNSResolverHandle_Interface
{
	constructor(options)
	{
		super(options)
		self.abort_called_fn = options.abort_called_fn
		self.dnsResolver = options.dnsResolver // from node 'dns'
	}
	//
	// Imperatives - Overrides
	abort()
	{
		self.abort_called_fn()
	}

}
module.exports = DNSResolverHandle