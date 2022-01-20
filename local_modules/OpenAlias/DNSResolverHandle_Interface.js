"use strict"

class DNSResolverHandle_Interface
{
	constructor() {}
	//
	// Accessors
	abort()
	{
		throw "Object must implement .abort()"
	}

}
module.exports = DNSResolverHandle_Interface