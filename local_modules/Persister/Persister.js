"use strict"
//
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class Persister
{
    //
    //
    ////////////////////////////////////////////////////////////////////////////////
    // Lifecycle - Initialization
    //
    constructor(options, context)
    {
        var self = this;
        self.options = options
        self.context = context
        //
        self.setup()
    }
    setup()
    {
        var self = this
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Public
	
	documentsWithQuery(collectionName, query, sort_orNull, skip_orNull, limit_orNull, fn)
	{
		var self = this
		//
		self.__documentsWithQuery(collectionName, query, sort_orNull, skip_orNull, limit_orNull, fn)
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Public

	updateDocuments(collectionName, query, update, options, fn)
	{
		var self = this
		//
		self.__updateDocuments(collectionName, query, update, options, fn)
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Accessors - Private
	
	__documentsWithQuery(collectionName, query, sort_orNull, skip_orNull, limit_orNull, fn)
	{
		var self = this
		//
		console.log("Error: You must override __documentsWithQuery in ", self)
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private

	__updateDocuments(collectionName, query, update, options, fn)
	{
		var self = this
		//
		console.log("Error: You must override __updateDocuments in", self)
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Delegation - Private

}
module.exports = Persister