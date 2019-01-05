// Copyright (c) 2014-2019, MyMonero.com
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