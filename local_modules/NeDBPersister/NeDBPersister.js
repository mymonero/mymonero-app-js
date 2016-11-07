"use strict"

const Persister = require('../persister/Persister')
const Datastore = require('nedb')
const path = require('path')


////////////////////////////////////////////////////////////////////////////////
// Principal class

class NeDBPersister extends Persister
{

	setup()
	{
		var self = this
		//
		super.setup()
		//
		var dbHandles = {}
		self.dbHandles = dbHandles
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private
	
	_new_dbHandle_forCollectionNamed(collectionName)
	{
		var self = this
		var context = self.context
		var userDataAbsoluteFilepath = context.userDataAbsoluteFilepath
		var pathTo_dataFile = path.join(userDataAbsoluteFilepath, '/' + collectionName + '.nedb_datafile')
		var dbHandle = new Datastore({ 
			filename: pathTo_dataFile,
			autoload: true
		})
		//
		return dbHandle
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Lazy Accessors
	
	_dbHandle_forCollectionNamed(collectionName)
	{
		var self = this
		var dbHandle_forCollection = self.dbHandles[collectionName]
		if (dbHandle_forCollection === null || typeof dbHandle_forCollection === 'undefined') {
			dbHandle_forCollection = self._new_dbHandle_forCollectionNamed(collectionName)
			self.dbHandles[collectionName] = dbHandle_forCollection
		}
		//
		return dbHandle_forCollection
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Overrides

	__documentsWithQuery(collectionName, query, options, fn)
	{
		const self = this
		const dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		const operation = dbHandle_forCollection.find(query)
		//
		options = options || {}
		if (typeof options.sort !== 'undefined' && options.sort !== null) {
			operation.sort(options.sort)
		}
		if (typeof options.skip !== 'undefined' && options.skip !== null) {
			operation.skip(options.skip)
		}
		if (typeof options.limit !== 'undefined' && options.limit !== null) {
			operation.limit(options.limit)
		}
		//
		operation.exec(function(err, docs)
		{
			fn(err, docs)
		})
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Overrides
	
	__insertDocuments(collectionName, savableDocument, fn)
	{
		const self = this
		const dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		dbHandle_forCollection.insert(savableDocument, function(err, newDocument)
		{
			fn(err, newDocument)
		})
	}
	__updateDocuments(collectionName, query, update, options, fn)
	{
		const self = this
		const dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		dbHandle_forCollection.update(query, update, options, function(err, numAffected, affectedDocuments, upsert)
		{
			fn(err, numAffected, affectedDocuments, upsert)	
		})
	}
	__removeDocuments(collectionName, query, options, fn)
	{ 
		const self = this
		const dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		options = options || {}
		dbHandle_forCollection.remove(query, options, function(err, numRemoved)
		{
			fn(err, numRemoved)
		})	
	}	


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - 

}
module.exports = NeDBPersister