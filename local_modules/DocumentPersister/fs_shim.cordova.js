// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//  conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//  of conditions and the following disclaimer in the documentation and/or other
//  materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.
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
// Adapted from NeDB's browser storage.js at 
// https://raw.githubusercontent.com/louischatriot/nedb/master/browser-version/browser-specific/lib/storage.js
//
"use strict"
//
const async = require('async')
//
function get_fs(cb)
{
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs)
	{
		cb(fs)
	})
}
function lastPathComponent(filepath) // -> String
{
	return filepath.substring(filepath.lastIndexOf('/') + 1) // filepath 'last path component'
}
//
function exists(path, callback)
{
	get_fs(function(fs)
	{
		// window.resolveLocalFileSystemURL(path, exists, doesntExist) // possible alternative
		const filename = lastPathComponent(path)
		fs.root.getFile( // does this work for directories as well ..?
			filename, // just the filename, here - cause we're not going to concern ourselves with directories 
			{ create: false }, 
			function(fileEntry)
			{
				// console.log(`path ${path} does exist… `, fileEntry)
				callback(true)
			}, 
			function()
			{
				console.warn(`path ${path} does not exist`)
				callback(false)
			}
		)
	})
}
function readdir(filepath, callback)
{ // Note: for now, not going to worry about directories; better way to do this may be with cdv:// urls
	get_fs(function(fs)
	{
		const rootDir_reader = fs.root.createReader()
		rootDir_reader.readEntries(
			function(fileEntries)
			{
				const finalized_filenames = []
				async.map(
					fileEntries,
					function(fileEntry, cb)
					{
						if (fileEntry.isDirectory == false) {
							finalized_filenames.push(fileEntry.name)
						}
						cb(null, "garbage")
					},
					function(err, results)
					{
						callback(err, finalized_filenames) // ignoring results
					}
				)
			},
			function(err)
			{
				console.error(err)
				callback(err)
			}
		)
	})

}
function writeFile(filepath, stringContents, options, callback)
{
	if (typeof options === 'function') {
		callback = options
	}
	get_fs(function(fs)
	{
		const filename = lastPathComponent(filepath)
		fs.root.getFile(
			filename,
			{ create: true, exclusive: false },
			function(fileEntry)
			{
				fileEntry.createWriter(function(fileWriter)
				{
					fileWriter.onwriteend = function()
					{
						// console.log(`Successful file write to ${filename}. Contents: ${stringContents}`)
						callback(null) // success
					}
					fileWriter.onerror = function(err)
					{
						console.log(`Failed file write to ${filename}: ${err.toString()}`)
						callback(err)
					}
					const dataObj = new Blob(
						[ stringContents ],
						{ type: 'text/plain' }
					)
					fileWriter.write(dataObj)
				})

			}, function(err)
			{
				callback(err)
			}
		)
	})
}
function readFile(filepath, options, callback)
{
	if (typeof options === 'function') {
		callback = options
	}
	get_fs(function(fs)
	{
		const filename = lastPathComponent(filepath)
		fs.root.getFile(
			filename, // not messing with directories for now
			{ create: false, exclusive: false }, // what does 'exclusive' do? is it appropriate here on this readFile?
			function(fileEntry)
			{
				fileEntry.file( // PSNote: so i guess files and fileEntries are different things :)
					function(file)
					{
						const reader = new FileReader()
						reader.onloadend = function(e)
						{
							const stringContents = this.result
							// console.log(`Successful file read of ${filename}: '${stringContents}'`)
							callback(null, stringContents)
						}
						reader.readAsText(file)
					},
					function(err)
					{
						console.error("File read error: ", err)
						callback(err)
					}
				)
			}
		)
	})
}
function unlink(filepath, callback)
{
	get_fs(function(fs)
	{
		const filename = lastPathComponent(filepath)
		fs.root.getFile(
			filename, // not messing with directories for now
			{ create: false, exclusive: false }, // what does 'exclusive' do? is it appropriate here on this readFile?
			function(fileEntry)
			{
				fileEntry.remove(
					function()
					{ // the file has been removed succesfully
						callback()
					},function(error)
					{ // error deleting the file
						callback(error)
					},function()
					{ // the file doesn't exist
						callback()
					}
				)
			}
		)
	})
}
//
module.exports.exists = exists
module.exports.writeFile = writeFile
module.exports.readFile = readFile
module.exports.unlink = unlink
module.exports.readdir = readdir