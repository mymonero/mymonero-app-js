"use strict"

const async = require('async')
const DocumentPersister_Interface = require('./DocumentPersister_Interface')

class DocumentPersister extends DocumentPersister_Interface
{
	constructor(options)
	{
		super(options) // must call on super before accessing options
		//
		const self = this
		options = self.options
		//
		self.store = {}
	}
	//
	// Runtime - InMemory - Accessors
	___lazy_writable_collectionStringsById(collectionName)
	{
		const self = this
		var collectionStringsById = self.store[collectionName] || null
		if (typeof collectionStringsById == 'undefined' || !collectionStringsById) {
			collectionStringsById = {}
			self.store[collectionName] = collectionStringsById
		}
		if (typeof collectionStringsById == 'undefined' || !collectionStringsById) {
			throw "expected non-nil collectionStringsById"
		}
		return collectionStringsById
	}
	//
	//
	// Runtime - Accessors - Interface - Overrides
	//
	__documentContentStringsWithIds(collectionName, ids, fn)
	{
		const self = this
		const collectionStringsById = self.store[collectionName] || {}
		const ids_length = ids.length
		const stringsWithIds = []
		for (var i = 0 ; i < ids_length ; i++) {
			const id = ids[i]
			const stringWithId = collectionStringsById[id] || null
			if (stringWithId != null) {
				stringsWithIds.push(stringWithId)
			}
		}
		setTimeout(function() { // maintain async
			fn(null, stringsWithIds)
		})
	}
	__idsOfAllDocuments(collectionName, fn)
	{
		const self = this
		const collectionStringsById = self.store[collectionName] || {}
		const ids = Object.keys(collectionStringsById)
		setTimeout(function() { // maintain async
			fn(null, ids)
		})
	}
	__allDocuments(collectionName, fn)
	{
		const self = this
		const collectionStringsById = self.store[collectionName] || {}
		const ids = Object.keys(collectionStringsById)
		const ids_length = ids.length
		const strings = []
		for (var i = 0 ; i < ids_length ; i++) {
			const id = ids[i]
			const stringWithId = collectionStringsById[id] || null
			strings.push(stringWithId)
		}
		setTimeout(function() { // maintain async
			fn(null, strings)
		})
	}
	//
	//
	// Runtime - Imperatives - Interface - Overrides
	//
	__insertDocument(collectionName, id, documentToInsert, fn)
	{
		const self = this
		const collectionStringsById = self.___lazy_writable_collectionStringsById(collectionName)
		collectionStringsById[id] = documentToInsert
		setTimeout(function() {
			fn(null, documentToInsert)
		})
	}
	__updateDocumentWithId(collectionName, id, updateString, fn)
	{
		const self = this
		const collectionStringsById = self.___lazy_writable_collectionStringsById(collectionName)
		collectionStringsById[id] = updateString
		setTimeout(function() {
			fn(null, updateString)
		})
	}
	__removeDocumentsWithIds(collectionName, idsToRemove, fn)
	{ 
		const self = this
		const collectionStringsById = self.store[collectionName] || {}
		var numRemoved = 0
		const idsToRemove_length = idsToRemove.length
		for (var i = 0 ; i < idsToRemove_length ; i++) {
			const id = idsToRemove[i]
			const valueExistsAtId = (collectionStringsById[id] || null) != null
			if (valueExistsAtId) {
				delete self.store[collectionName][id]
				numRemoved += 1
			}
		}
		setTimeout(function() {
			fn(null, numRemoved)
		})
	}
	__removeAllDocuments(collectionName, fn)
	{
		const self = this
		const numberOfDocuments = Object.keys(self.store[collectionName] || {}).length
		self.store[collectionName] = {}
		setTimeout(function() {
			fn(null, numberOfDocuments)
		})
	}
}
module.exports = DocumentPersister