
"use strict"

const BackgroundTaskExecutor = require('../Concurrency/BackgroundTaskExecutor.electron')

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