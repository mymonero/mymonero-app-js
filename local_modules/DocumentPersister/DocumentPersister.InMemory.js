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
const async = require('async')
const uuidV1 = require('uuid/v1')
//
//
const DocumentPersister_Interface = require('./DocumentPersister_Interface')
//
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
	___lazy_writable_collectionDocumentsById(collectionName)
	{
		const self = this
		var collectionDocumentsById = self.store[collectionName] || null
		if (typeof collectionDocumentsById == 'undefined' || !collectionDocumentsById) {
			collectionDocumentsById = {}
			self.store[collectionName] = collectionDocumentsById
		}
		if (typeof collectionDocumentsById == 'undefined' || !collectionDocumentsById) {
			throw "expected non-nil collectionDocumentsById"
		}
		return collectionDocumentsById
	}
	//
	//
	// Runtime - Accessors - Interface - Overrides
	//
	__documentsWithIds(collectionName, ids, fn)
	{
		const self = this
		const collectionDocumentsById = self.store[collectionName] || {}
		const ids_length = ids.length
		const documentsWithIds = []
		for (var i = 0 ; i < ids_length ; i++) {
			const id = ids[i]
			const documentWithId = collectionDocumentsById[id] || null
			if (documentWithId != null) {
				documentsWithIds.push(documentWithId)
			}
		}
		setTimeout(function() { // maintain async
			fn(null, documentsWithIds)
		})
	}
	__idsOfAllDocuments(collectionName, fn)
	{
		const self = this
		const collectionDocumentsById = self.store[collectionName] || {}
		const ids = Object.keys(collectionDocumentsById)
		setTimeout(function() { // maintain async
			fn(null, ids)
		})
	}
	__allDocuments(collectionName, fn)
	{
		const self = this
		const collectionDocumentsById = self.store[collectionName] || {}
		const ids = Object.keys(collectionDocumentsById)
		const ids_length = ids.length
		const documents = []
		for (var i = 0 ; i < ids_length ; i++) {
			const id = ids[i]
			const documentWithId = collectionDocumentsById[id] || null
			documents.push(documentWithId)
		}
		setTimeout(function() { // maintain async
			fn(null, documents)
		})
	}
	//
	//
	// Runtime - Imperatives - Interface - Overrides
	//
	__insertDocument(collectionName, documentToInsert, fn)
	{
		const self = this
		var id = documentToInsert._id
		if (!id || typeof id === 'undefined') {
			id = uuidV1() // generate one
			documentToInsert._id = id // now it's actually savable
		}
		const collectionDocumentsById = self.___lazy_writable_collectionDocumentsById(collectionName)
		collectionDocumentsById[id] = documentToInsert
		setTimeout(function() {
			fn(null, documentToInsert)
		})
	}
	__updateDocumentWithId(collectionName, id, update, fn)
	{
		const self = this
		{
			if (typeof update._id === 'undefined' || !update._id) {
				update._id = id // just as a safeguard against consumers submitting a different document
			}
		}
		const collectionDocumentsById = self.___lazy_writable_collectionDocumentsById(collectionName)
		collectionDocumentsById[id] = update
		setTimeout(function() {
			fn(null, update)
		})
	}
	__removeDocumentsWithIds(collectionName, idsToRemove, fn)
	{ 
		const self = this
		const collectionDocumentsById = self.store[collectionName] || {}
		var numRemoved = 0
		const idsToRemove_length = idsToRemove.length
		for (var i = 0 ; i < idsToRemove_length ; i++) {
			const id = idsToRemove[i]
			const valueExistsAtId = (collectionDocumentsById[id] || null) != null
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