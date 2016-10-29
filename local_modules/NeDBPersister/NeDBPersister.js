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
		var app = context.app
		var pathTo_dataFile = path.join(app.getPath('userData'), '/' + collectionName + '.nedb_datafile')
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

	__documentsWithQuery(collectionName, query, fn)
	{
		var self = this
		var dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		dbHandle_forCollection.find(query, function(err, docs)
		{
			fn(err, docs)
		})
	}


    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Imperatives - Private - Overrides
	
	__updateDocuments(collectionName, query, update, options, fn)
	{
		var self = this
		var dbHandle_forCollection = self._dbHandle_forCollectionNamed(collectionName)
		console.log("dbHandle_forCollection" , dbHandle_forCollection)
		dbHandle_forCollection.update(query, update, options, function(err, numAffected, affectedDocuments, upsert)
		{
			fn(err, numAffected, affectedDocuments, upsert)
		})
	}
	

    ////////////////////////////////////////////////////////////////////////////////
    // Runtime - Delegation - 

}
module.exports = NeDBPersister