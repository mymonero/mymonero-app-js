// Copyright (c) 2014-2017, MyMonero.com
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const path = require('path')
const Datastore = require('nedb')
//
const DocumentPersister_Interface = require('./DocumentPersister_Interface')
//
class NeDB_DocumentPersister extends DocumentPersister_Interface
{
	constructor(options)
	{
		super(options) // must call on super before accessing options
		//
		var self = this
		{
			var options = self.options
			self.userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
			if (!self.userDataAbsoluteFilepath || typeof self.userDataAbsoluteFilepath === 'undefined') {
				throw "options.userDataAbsoluteFilepath required"
			}
		}
		{
			var dbHandles = {}
			self.dbHandles = dbHandles
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private
	
	_new_dbHandle_forCollectionNamed(collectionName)
	{
		var self = this
		var options = self.options
		var userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
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
module.exports = NeDB_DocumentPersister