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
const BackgroundTaskExecutor = require('../Concurrency/BackgroundTaskExecutor.electron')
//
class BackgroundDocumentPersister extends BackgroundTaskExecutor
{
	constructor(options, context)
	{
		options = options || {}
		options.absolutePathToChildProcessSourceFile = __dirname + '/./BackgroundDocumentPersister.Files.child.js'
		//
		const databaseFileParentDirectory = context.userDataAbsoluteFilepath
		if (!databaseFileParentDirectory) {
			throw self.constructor.name + " requires a databaseFileParentDirectory"
		}
		const electron = require('electron')
		const app = electron.app || electron.remote.app
		const forReporting_appVersion = app.getVersion()
		options.argsForChild = [ databaseFileParentDirectory, forReporting_appVersion ]
		//
		super(options, context)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public
	
	DocumentsWithIds(collectionName, ids, fn)
	{
		var self = this
		self.executeBackgroundTaskNamed(
			'DocumentsWithIds',
			fn, // fn goes as second arg
			[
				collectionName, 
				ids
			]
		)
	}
	IdsOfAllDocuments(collectionName, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'IdsOfAllDocuments',
			fn, // fn goes as second arg
			[
				collectionName
			]
		)
	}
	AllDocuments(collectionName, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'AllDocuments',
			fn, // fn goes as second arg
			[
				collectionName
			]
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public

	InsertDocument(collectionName, id, savableDocument, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'InsertDocument',
			function(err, newDocument) // fn goes as second arg
			{
				fn(err, newDocument)
			},
			[
				collectionName, 
				id,
				savableDocument
			]
		)
	}
	UpdateDocumentWithId(collectionName, id, update, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'UpdateDocumentWithId',
			function(err, returnValuesByKey) // fn goes as second arg
			{
				if (err) {
					fn(err)
					return
				}
				// unpack returnValuesByKey to maintain DBPersister_Interface interface
				const numAffected = returnValuesByKey.numAffected
				const affectedDocuments = returnValuesByKey.affectedDocuments
				const upsert = returnValuesByKey.upsert
				fn(err, numAffected, affectedDocuments, upsert)
			},
			[
				collectionName, 
				id, 
				update
			]
		)
	}
	RemoveDocumentsWithIds(collectionName, ids, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'RemoveDocumentsWithIds',
			function(err, numRemoved) // fn goes as second arg
			{
				fn(err, numRemoved)
			},
			[
				collectionName, 
				ids
			]
		)
	}
	RemoveAllDocuments(collectionName, fn)
	{
		const self = this
		self.executeBackgroundTaskNamed(
			'RemoveAllDocuments',
			function(err, numRemoved) // fn goes as second arg
			{
				fn(err, numRemoved)
			},
			[
				collectionName
			]
		)
	}
}
module.exports = BackgroundDocumentPersister