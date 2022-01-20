"use strict"

class DocumentPersister_Interface
{
	constructor(options)
	{
		var self = this
		{
			self.options = options
		}
	}

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public
	
	DocumentsWithIds(collectionName, ids, fn)
	{
		var self = this
		self.__documentContentStringsWithIds(collectionName, ids, fn)
	}
	IdsOfAllDocuments(collectionName, fn)
	{
		const self = this
		self.__idsOfAllDocuments(collectionName, fn)
	}
	AllDocuments(collectionName, fn)
	{
		const self = this
		self.__allDocuments(collectionName, fn)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public

	InsertDocument(collectionName, id, documentToInsert, fn)
	{
		const self = this
		//
		self.__insertDocument(collectionName, id, documentToInsert, fn)
	}
	UpdateDocumentWithId(collectionName, id, update, fn)
	{
		const self = this
		self.__updateDocumentWithId(collectionName, id, update, fn)
	}
	RemoveDocumentsWithIds(collectionName, ids, fn)
	{
		const self = this
		self.__removeDocumentsWithIds(collectionName, ids, fn)
	}
	RemoveAllDocuments(collectionName, fn)
	{
		const self = this
		self.__removeAllDocuments(collectionName, fn)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private
	
	__documentContentStringsWithIds(collectionName, ids, fn)
	{ // fn: (err, docs) -> Void
		const self = this
		//
		console.log("Error: You must override __documentContentStringsWithIds in ", self)
	}
	__idsOfAllDocuments(collectionName, fn)
	{
		const self = this
		console.log("Error: You must override __idsOfAllDocuments in ", self)
	}
	__allDocuments(collectionName, fn)
	{
		const self = this
		console.log("Error: You must override __allDocuments in ", self)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	__insertDocument(collectionName, id, documentToInsert, fn)
	{ // fn: (err, newDocument) -> Void
		const self = this
		console.log("Error: You must override __insertDocument in", self)
	}
	__updateDocumentWithId(collectionName, id, update, fn)
	{ // fn: (err) -> Void
		const self = this
		console.log("Error: You must override __updateDocumentWithId in", self)
	}
	__removeDocumentsWithIds(collectionName, ids, fn)
	{ // fn: (err, numRemoved) -> Void
		const self = this
		console.log("Error: You must override __removeDocumentsWithIds in", self)
	}
	__removeAllDocuments(collectionName, fn)
	{
		const self = this
		console.log("Error: You must override __removeAllDocuments in", self)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

}
module.exports = DocumentPersister_Interface