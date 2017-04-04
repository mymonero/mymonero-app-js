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
const child_ipc = require('../electron_background/child_ipc.electron')
//
const databaseFileParentDirectory = process.argv[2]
if (typeof databaseFileParentDirectory === 'undefined' || !databaseFileParentDirectory) {
	throw "BackgroundDocumentPersister.NeDB.child.js requires argv[2] databaseFileParentDirectory"
}
const reporting_appVersion = process.argv[3]
if (typeof reporting_appVersion === 'undefined' || !reporting_appVersion) {
	throw "BackgroundDocumentPersister.NeDB.child.js requires argv[3] reporting_appVersion"
}
//	
const DocumentPersister_NeDB = require('./DocumentPersister.NeDB')
const options =
{
	userDataAbsoluteFilepath: databaseFileParentDirectory
}
const persister = new DocumentPersister_NeDB(options)
//
//
// Declaring tasks:
//
const tasksByName =
{
	DocumentsWithQuery: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		query, 
		options
	)
	{
		// console.time("DocumentsWithQuery " + taskUUID)
		persister.DocumentsWithQuery(
			collectionName, 
			query, 
			options,
			function(err, docs)
			{
				// console.timeEnd("DocumentsWithQuery " + taskUUID)
				child_ipc.CallBack(taskUUID, err, docs)
			}
		)
	},
	InsertDocument: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		savableDocument
	)
	{
		// console.time("InsertDocument " + taskUUID)
		persister.InsertDocument(
			collectionName, 
			savableDocument,
			function(err, newDocument)
			{
				// console.timeEnd("InsertDocument " + taskUUID)
				child_ipc.CallBack(taskUUID, err, newDocument)
			}
		)
	},
	UpdateDocuments: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		query, 
		update,
		options
	)
	{
		// console.time("UpdateDocuments " + taskUUID)
		persister.UpdateDocuments(
			collectionName, 
			query, 
			update,
			options,
			function(err, numAffected, affectedDocuments, upsert)
			{
				// console.timeEnd("UpdateDocuments " + taskUUID)
				const returnValuesByKey =
				{
					numAffected: numAffected,
					affectedDocuments: affectedDocuments, 
					upsert: upsert
				}
				child_ipc.CallBack(taskUUID, err, returnValuesByKey)
			}
		)
	},
	RemoveDocuments: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		query, 
		options
	)
	{
		// console.time("RemoveDocuments " + taskUUID)
		persister.RemoveDocuments(
			collectionName, 
			query, 
			options,
			function(err, numRemoved)
			{
				// console.timeEnd("RemoveDocuments " + taskUUID)
				child_ipc.CallBack(taskUUID, err, numRemoved)
			}
		)
	},
}
//
//
// Kicking off runtime:
//
child_ipc.InitWithTasks_AndStartListening(tasksByName, "BackgroundDocumentPersister.NeDB.child", reporting_appVersion)