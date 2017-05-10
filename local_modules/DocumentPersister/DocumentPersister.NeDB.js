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
	
	_new_dbHandle_forCollectionNamed(
		collectionName, 
		fn, // (err?, dbHandle?)
		optl_timesRetried, 
		optl_lastTimeException
	)
	{
		var self = this
		if (typeof optl_timesRetried !== 'undefined' && optl_timesRetried > 4) {
			const err = optl_lastTimeException || new Error(`Unable to load the '${collectionName}' database after ${optl_timesRetried} tries.`)
			fn(err, undefined)
			return 
		}
		var options = self.options
		var userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
		var pathTo_dataFile = path.join(userDataAbsoluteFilepath, '/' + collectionName + '.nedb_datafile')
		var dbHandle = new Datastore({ 
			filename: pathTo_dataFile,
			autoload: true,
			onload: function(err)
			{
				if (err) {
					console.warn(`⚠️  Unable to load the '${collectionName}' database. Retrying.`)
					self._new_dbHandle_forCollectionNamed(
						collectionName,
						fn,
						typeof optl_timesRetried === 'undefined' ? 0 : optl_timesRetried + 1,
						e
					)
					return
				}
				console.log("💬  Loaded database collection named " + collectionName)
				// if we succeeded in loading, set up autocompaction so that idle apps don't build huge DB files
				const autocompactionInterval_s = 1 // setting autocompaction interval from 60s to more like 1s to prevent #91 (https://github.com/mymonero/mymonero-app-js/issues/91)
				const autocompactionInterval_ms = 1000 * autocompactionInterval_s
				dbHandle.persistence.setAutocompactionInterval(autocompactionInterval_ms) // autocompact every N s to prevent #79 (https://github.com/mymonero/mymonero-app-js/issues/79)
				//
				fn(null, dbHandle)
			}
		})
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Lazy Accessors
	
	_dbHandle_forCollectionNamed(collectionName, fn)
	{
		var self = this
		var dbHandle_forCollection = self.dbHandles[collectionName]
		if (dbHandle_forCollection === null || typeof dbHandle_forCollection === 'undefined') {
			self._new_dbHandle_forCollectionNamed(
				collectionName,
				function(err, dbHandle_forCollection)
				{
					if (err) {
						fn(err, null)
						return
					}
					self.dbHandles[collectionName] = dbHandle_forCollection
					fn(null, dbHandle_forCollection)
					return
				}
			)
			return
		}
		//
		fn(null, dbHandle_forCollection)
		return
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Overrides

	__documentsWithQuery(collectionName, query, options, fn)
	{
		const self = this
		self._dbHandle_forCollectionNamed(collectionName, function(err, dbHandle_forCollection)
		{
			if (err) {
				fn(err)
				return
			}		
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
		})
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Overrides
	
	__insertDocuments(collectionName, savableDocument, fn)
	{
		const self = this
		self._dbHandle_forCollectionNamed(collectionName, function(err, dbHandle_forCollection)
		{
			if (err) {
				fn(err)
				return
			}		
			dbHandle_forCollection.insert(savableDocument, function(err, newDocument)
			{
				fn(err, newDocument)
			})
		})
	}
	__updateDocuments(collectionName, query, update, options, fn)
	{
		const self = this
		self._dbHandle_forCollectionNamed(collectionName, function(err, dbHandle_forCollection)
		{
			if (err) {
				fn(err)
				return
			}		
			dbHandle_forCollection.update(query, update, options, function(err, numAffected, affectedDocuments, upsert)
			{
				fn(err, numAffected, affectedDocuments, upsert)	
			})
		})
	}
	__removeDocuments(collectionName, query, options, fn)
	{ 
		const self = this
		self._dbHandle_forCollectionNamed(collectionName, function(err, dbHandle_forCollection)
		{
			if (err) {
				fn(err)
				return
			}		
			options = options || {}
			dbHandle_forCollection.remove(query, options, function(err, numRemoved)
			{
				fn(err, numRemoved)
			})
		})
	}	


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - 

}
module.exports = NeDB_DocumentPersister