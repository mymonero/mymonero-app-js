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
const child_ipc = require('../Concurrency/ipc.electron.child')
//
const databaseFileParentDirectory = process.argv[2]
if (typeof databaseFileParentDirectory === 'undefined' || !databaseFileParentDirectory) {
	throw "BackgroundDocumentPersister.Files.child.js requires argv[2] databaseFileParentDirectory"
}
const reporting_appVersion = process.argv[3]
if (typeof reporting_appVersion === 'undefined' || !reporting_appVersion) {
	throw "BackgroundDocumentPersister.Files.child.js requires argv[3] reporting_appVersion"
}
//	
const DocumentPersister_Files = require('./DocumentPersister.Files')
const options =
{
	userDataAbsoluteFilepath: databaseFileParentDirectory,
	fs: require('fs')
}
const persister = new DocumentPersister_Files(options)
//
//
// Declaring tasks:
//
const tasksByName =
{
	DocumentsWithIds: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		ids
	) {
		// console.time("DocumentsWithIds " + taskUUID)
		persister.DocumentsWithIds(
			collectionName, 
			ids,
			function(err, docs)
			{
				// console.timeEnd("DocumentsWithIds " + taskUUID)
				child_ipc.CallBack(taskUUID, err, docs)
			}
		)
	},
	IdsOfAllDocuments: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName
	) {
		// console.time("IdsOfAllDocuments " + taskUUID)
		persister.IdsOfAllDocuments(
			collectionName, 
			function(err, ids)
			{
				// console.timeEnd("IdsOfAllDocuments " + taskUUID)
				child_ipc.CallBack(taskUUID, err, ids)
			}
		)
	},
	AllDocuments: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName
	) {
		// console.time("AllDocuments " + taskUUID)
		persister.AllDocuments(
			collectionName, 
			function(err, docs)
			{
				// console.timeEnd("AllDocuments " + taskUUID)
				child_ipc.CallBack(taskUUID, err, docs)
			}
		)
	},
	InsertDocument: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		id,
		savableDocument
	) {
		// console.time("InsertDocument " + taskUUID)
		persister.InsertDocument(
			collectionName, 
			id,
			savableDocument,
			function(err, newDocument)
			{
				// console.timeEnd("InsertDocument " + taskUUID)
				child_ipc.CallBack(taskUUID, err, newDocument)
			}
		)
	},
	UpdateDocumentWithId: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		id, 
		update
	) {
		// console.time("UpdateDocuments " + taskUUID)
		persister.UpdateDocumentWithId(
			collectionName, 
			id, 
			update,
			function(err, numAffected)
			{
				// console.timeEnd("UpdateDocuments " + taskUUID)
				const returnValuesByKey =
				{
					numAffected: numAffected
				}
				child_ipc.CallBack(taskUUID, err, returnValuesByKey)
			}
		)
	},
	RemoveDocumentsWithIds: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		ids, 
		options
	) {
		// console.time("RemoveDocuments " + taskUUID)
		persister.RemoveDocumentsWithIds(
			collectionName, 
			ids,
			function(err, numRemoved)
			{
				// console.timeEnd("RemoveDocuments " + taskUUID)
				child_ipc.CallBack(taskUUID, err, numRemoved)
			}
		)
	},
	RemoveAllDocuments: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		collectionName, 
		options
	) {
		// console.time("RemoveDocuments " + taskUUID)
		persister.RemoveAllDocuments(
			collectionName, 
			function(err)
			{
				// console.timeEnd("RemoveDocuments " + taskUUID)
				child_ipc.CallBack(taskUUID, err)
			}
		)
	}	
}
//
//
// Kicking off runtime:
//
child_ipc.InitWithTasks_AndStartListening(tasksByName, "BackgroundDocumentPersister.Files.child", reporting_appVersion)