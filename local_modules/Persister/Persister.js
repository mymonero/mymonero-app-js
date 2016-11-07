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
		var self = this
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
	
	DocumentsWithQuery(collectionName, query, options, fn)
	{
		var self = this
		//
		self.__documentsWithQuery(collectionName, query, options, fn)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public

	InsertDocument(collectionName, savableDocument, fn)
	{
		const self = this
		//
		self.__insertDocuments(collectionName, savableDocument, fn)
	}
	UpdateDocuments(collectionName, query, update, options, fn)
	{
		const self = this
		//
		self.__updateDocuments(collectionName, query, update, options, fn)
	}
	RemoveDocuments(collectionName, query, options, fn)
	{
		const self = this
		//
		self.__removeDocuments(collectionName, query, options, fn)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private
	
	__documentsWithQuery(collectionName, query, options, fn)
	{ // fn: (err, docs) -> Void
		const self = this
		//
		console.log("Error: You must override __documentsWithQuery in ", self)
		console.log(
			"options:\n{"
			+ "\n\tsort: (-1,1) or QueryDict"
			+ "\n\tskip: UInteger "
			+ "\n\tlimit: UInteger"
			+ "\n}"
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	__insertDocuments(collectionName, savableDocument, fn)
	{ // fn: (err, newDocument) -> Void
		const self = this
		//
		console.log("Error: You must override __insertDocuments in", self)
	}
	__updateDocuments(collectionName, query, update, options, fn)
	{ // fn: (err, numAffected, affectedDocuments, upsert) -> Void
		const self = this
		//
		console.log("Error: You must override __updateDocuments in", self)
		console.log(
			"options:\n{"
			+ "\n\tupsert: Boolean(false)"
			+ "\n\tmulti: Boolean(false)"
			+ "\n\treturnUpdatedDocs: Boolean(false)"
			+ "\n}"
		)
	}
	__removeDocuments(collectionName, query, options, fn)
	{ // fn: (err, numRemoved) -> Void
		const self = this
		//
		console.log("Error: You must override __removeDocuments in", self)
		console.log(
			"options:\n{"
			+ "\n\tmulti: Boolean(false)"
			+ "\n}"
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

}
module.exports = Persister