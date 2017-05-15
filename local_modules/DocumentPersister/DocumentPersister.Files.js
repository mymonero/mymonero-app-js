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
		{
			options = self.options
			const options_userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
			if (!options_userDataAbsoluteFilepath || typeof options_userDataAbsoluteFilepath === 'undefined') {
				throw "options.userDataAbsoluteFilepath required"
			}
			//
			self.userDataAbsoluteFilepath = options_userDataAbsoluteFilepath
			//
			self.fs = options.fs
			if (!self.fs || typeof self.fs === 'undefined') {
				throw "options.fs required"
			}
		}
		// strip trailing slashes so we can just append path components with string ops internally (join is hairy on android due to it being a url instead of a path)
		var pathTo_dataSubdir = self.userDataAbsoluteFilepath // dirs are annoying in web, so using a file ext for detection instead
		while (pathTo_dataSubdir.endsWith('/')) {
			pathTo_dataSubdir = pathTo_dataSubdir.substring(0, pathTo_dataSubdir.length - 1)
		}
		self.pathTo_dataSubdir = pathTo_dataSubdir
		// console.log("self.pathTo_dataSubdir" , self.pathTo_dataSubdir)
	}
	//
	//
	// Runtime - Accessors - Private - Overrides
	//
	__documentsWithIds(collectionName, _ids, fn)
	{
		const self = this
		async.map(_ids, function(_id, cb)
		{
			const fileDescription = self._new_fileDescriptionWithComponents(
				collectionName,
				_ids
			)
			cb(null, fileDescription)
		}, function(err, fileDescriptions)
		{
			self.___read_dataWithDocumentFileDescriptions(
				fileDescriptions,
				fn
			)
		})
	}
	__idsOfAllDocuments(collectionName, fn)
	{
		const self = this
		self.___read_collection_documentFileDescriptions(
			collectionName,
			function(err, documentFileDescriptions)
			{
				if (err) {
					fn(err)
					return
				}
				async.map(
					documentFileDescriptions,
					function(documentFileDescription, cb)
					{
						cb(null, documentFileDescription._id)
					},
					function(err, results)
					{
						fn(err, results)
					}
				)
			}
		)
	}
	__allDocuments(collectionName, fn)
	{
		const self = this
		self.___read_collection_documentFileDescriptions(
			collectionName,
			function(err, documentFileDescriptions)
			{
				if (err) {
					fn(err)
					return
				}
				self.___read_dataWithDocumentFileDescriptions(
					documentFileDescriptions,
					fn
				)
			}
		)
	}
	//
	//
	// Runtime - Imperatives - Private - Overrides
	//
	__insertDocument(collectionName, documentToInsert, fn)
	{
		const self = this
		var id = documentToInsert._id
		if (!id || typeof id === 'undefined') {
			id = uuidV1() // generate one
			documentToInsert._id = id // now it's actually savable
		}
		const fileDescription = self._new_fileDescriptionWithComponents(
			collectionName,
			id
		)
		self.___write_fileDescriptionDocumentData(fileDescription, documentToInsert, fn)
	}
	__updateDocumentWithId(collectionName, id, update, fn)
	{
		const self = this
		const fileDescription = self._new_fileDescriptionWithComponents(
			collectionName,
			id
		)
		if (typeof update._id === 'undefined' || !update._id) {
			update._id = id // just as a safeguard against consumers submitting a different document
		}
		self.___write_fileDescriptionDocumentData(fileDescription, update, fn)
	}
	__removeDocumentsWithIds(collectionName, ids, fn)
	{ 
		const self = this
		var numRemoved = 0
		async.each(
			ids,
			function(id, cb)
			{
				const fileDescription = self._new_fileDescriptionWithComponents(
					collectionName,
					id
				)
				const fileKey = self.____fileKeyFromFileDescription(fileDescription)
				const filename = self.____filenameWithFileKey(fileKey)
				const filepath = self.pathTo_dataSubdir+"/"+filename
				self.fs.unlink(filepath, function(err)
				{
					if (!err) {
						numRemoved += 1
					}
					cb(err)
				})
			},
			function(err)
			{
				fn(err, numRemoved)
			}
		)
	}
	__removeAllDocuments(collectionName, fn)
	{
		const self = this
		self.__idsOfAllDocuments(
			collectionName,
			function(err, ids)
			{
				if (err) {
					fn(err)
					return
				}
				self.__removeDocumentsWithIds(
					collectionName,
					ids,
					fn
				)
			}
		)
	}
	//
	//
	// Internal - Imperatives - File writing
	//
	___write_fileDescriptionDocumentData(fileDescription, documentToWrite, fn)
	{
		const self = this
		var stringContents = null
		try {
			stringContents = JSON.stringify(documentToWrite)
		} catch (e) {
			fn(e)
			return
		}
		if (!stringContents || typeof stringContents === 'undefined') { // just to be careful
			fn(new Error("Unable to stringify document for write."))
			return
		}
		const fileKey = self.____fileKeyFromFileDescription(fileDescription)
		const filename = self.____filenameWithFileKey(fileKey)
		const filepath = self.pathTo_dataSubdir+"/"+filename
		self.fs.writeFile(filepath, stringContents, function(err)
		{
			fn(err, documentToWrite) // and send back saved document (with id)
		})
	}
	//
	//
	// Internal - Accessors - Shared file descriptions & document data
	//
	_new_fileDescriptionWithComponents(collectionName, _id)
	{
		return {
			_id: _id,
			collectionName: collectionName
		}
	}
	___read_dataWithDocumentFileDescriptions(documentFileDescriptions, fn)
	{
		const self = this
		if (!documentFileDescriptions || documentFileDescriptions.length == 0) {
			fn(null, [])
			return
		}
		async.map(
			documentFileDescriptions,
			function(documentFileDescription, cb)
			{
				self.___read_documentDataWithFileDescription(
					documentFileDescription,
					function(err, documentData)
					{
						if (err) {
							cb(err)
							return
						}
						cb(null, documentData)
					}
				)
			},
			function(err, results)
			{
				if (err) {
					fn(err)
					return
				}
				fn(null, results)
			}
		)
	}	
	____fileKeyFromFileDescription(fileDescription)
	{
		const self = this
		const fileKeyComponentDelimiterString = self.____fileKeyComponentDelimiterString()
		//
		return `${fileDescription.collectionName}${fileKeyComponentDelimiterString}${fileDescription._id}`
	}
	____fileKeyComponentDelimiterString()
	{
		return "__" // not -, because those exist in uuids 
	}
	____filenameExtension()
	{
		return ".MMDBDoc.json" // just trying to pick something fairly unique, and short
	}
	____filenameWithFileKey(fileKey)
	{
		const self = this
		return `${fileKey}${self.____filenameExtension()}`
	}
	___read_documentDataWithFileDescription(
		documentFileDescription,
		fn
	)
	{
		const self = this
		const expected_fileKey = self.____fileKeyFromFileDescription(documentFileDescription)
		const expected_filename = self.____filenameWithFileKey(expected_fileKey)
		const filepath = self.pathTo_dataSubdir+"/"+expected_filename
		self.fs.exists(filepath, function(exists)
		{ // ^-- this is implemented with .exists instead of .open, even though .exists is deprecated, in order to remain compatible with html5-fs for Cordova
			if (!exists) {
				fn(new Error("Document for file description does not exist."))
				return
			}
			self.fs.readFile(filepath, { encoding: 'utf8' }, function(err, stringContents)
			{
				if (err) {
					fn(err)
					return
				}
				var jsonData = null;
				try {
					jsonData = JSON.parse(stringContents)
				} catch (e) {
					fn(e, null)
					return
				}
				fn(null, jsonData)
			})
		})
	}
	___read_collection_documentFileDescriptions(
		collectionName,
		fn
	)
	{
		const self = this
		self.fs.readdir(
			self.pathTo_dataSubdir, 
			function(err, files)
			{ // filtering to what should be JSON doc files
				const fileDescriptions = []
				const extSuffix = self.____filenameExtension()
				const extSuffix_length = extSuffix.length
				async.map(
					files,
					function(file, cb)
					{
						if (file.endsWith(extSuffix) !== true) {
							// we're not going to consider this an error because it could be the .DS_Store file
							cb(null, file)
							return
						}
						const filepath = self.pathTo_dataSubdir+"/"+file
						self.fs.exists(filepath, function(exists)
						{ // going to assume it's not a directory, but only to simplify things under Cordova, and because we are checking the file extension just above
							const filename_sansExt = file.substring(0, file.length - extSuffix_length) // since we already validated that this string ends with extSuffix
							const fileKey = filename_sansExt // assumption/hope
							const fileKeyComponentDelimiterString = self.____fileKeyComponentDelimiterString()
							const fileKey_components = fileKey.split(fileKeyComponentDelimiterString)
							if (fileKey_components.length != 2) {
								cb(new Error("Unrecognized filename format in db data directory."))
								return
							}
							const fileKey_collectionName = fileKey_components[0]
							if (fileKey_collectionName !== collectionName) {
								// console.log("Skipping file named", fileKey, "as it's not in", collectionName)
								cb(null, file) // skip
								return
							}
							const fileKey_id  = fileKey_components[1]
							const fileDescription = self._new_fileDescriptionWithComponents(
								fileKey_collectionName, 
								fileKey_id
							)
							fileDescriptions.push(fileDescription) // ought to be a JSON doc file
							//
							cb(null, file) // returning file but we are not using it
						})
					},
					function(err, results)
					{	// but we're actually going to disregard `results` here
						// cause we filtered out directories above
						fn(err, fileDescriptions)
					}
				)
			}
		)
	}

}
module.exports = DocumentPersister