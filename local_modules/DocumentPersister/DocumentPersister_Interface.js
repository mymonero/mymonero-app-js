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
class DocumentPersister_Interface
{
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
module.exports = DocumentPersister_Interface