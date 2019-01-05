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
const fs = require('fs')
const path = require('path')
//
function assembleWith(
	doNotCopyOrEnterFilepathsMatching, // e.g. [ /^\.DS_Store$/ ]
	relativePathTo_assembledWWWDirectory, // e.g. "www"
	indexHTMLFileToPutAtRoot_filepathPrefixInWWW // e.g. "MainWindow/Views/index.cordova.html"
)
{
	const numberOf_doNotCopyOrEnterFilepathsMatching = doNotCopyOrEnterFilepathsMatching.length
	const pathTo_localModules = path.join(__dirname, "..", "..", "local_modules")
	const pathTo_assembled_www = path.join(__dirname, "..", "..", relativePathTo_assembledWWWDirectory )
	//
	// (in case www doesn't exist…)
	if (fs.existsSync(pathTo_assembled_www) == false) {
		// console.log(`📁  Creating ${pathTo_assembled_www}`)
		fs.mkdirSync(pathTo_assembled_www)
	}
	//
	// I.
	deleteAll_assembled_www_contents_exceptGitIgnore()
	//
	// II. 
	enumerateAndRecursivelyCopyDirContents("", true)
	//
	// III.
	// bundleAndPackageJS() // NOTE: this is now handled on the command line
	//
	// implementations
	function deleteAll_assembled_www_contents_exceptGitIgnore()
	{
		rmDirContents_recursively(
			pathTo_assembled_www,
			true, // is root lvl, so watch for .gitignore etc
			false // do not delete the www dir itself
		)
	}
	function rmDirContents_recursively(path, isRootLvl, alsoDeleteDir)
	{
		if (!fs.existsSync(path)) {
			throw `${path} does not exist`
		}
		const filenames = fs.readdirSync(path)
		filenames.forEach(
			function(file, index)
			{
				if (isRootLvl) {
					if (file === ".gitignore") { // old support for keeping the root build dir around in the repo
						// console.log(`❎  Skipping deletion of ${file}`)
						return
					}
				}
				var filepath = `${path}/${file}`
				if (fs.lstatSync(filepath).isDirectory()) { // recursely delete contents
					// console.log(`📂  Entering ${file}`)
					rmDirContents_recursively(
						filepath, 
						false,
						true // no longer root-lvl so remove dir too
					)
					return
				}
				// otherwise, simply delete file
				// console.log(`🗑  Deleting ${file}`)
				fs.unlinkSync(filepath)
			}
		)
		// have to wait until all contents are deleted before removing the directory
		if (alsoDeleteDir) {
			fs.rmdirSync(path)
		}
	}
	//
	function enumerateAndRecursivelyCopyDirContents(parentDir_prefix, isRootOf_localModules)
	{
		const parentDir = path.join(pathTo_localModules, parentDir_prefix)
		{
			var shouldNotEnter = false
			for (let j = 0 ; j < numberOf_doNotCopyOrEnterFilepathsMatching ; j++) {
				const regex = doNotCopyOrEnterFilepathsMatching[j]
				if (regex.test(parentDir) == true) {
					shouldNotEnter = true
					break // no need to keep searching if should skip
				}
			}
			if (shouldNotEnter) {
				return // skip this one
			}
		}
		const filenames = fs.readdirSync(parentDir)
		const numberOf_filenames = filenames.length
		for (let i = 0 ; i < numberOf_filenames ; i++) {
			const filename = filenames[i]
			var shouldSkipThisFilename = false
			{
				for (let j = 0 ; j < numberOf_doNotCopyOrEnterFilepathsMatching ; j++) {
					const regex = doNotCopyOrEnterFilepathsMatching[j]
					if (regex.test(filename) == true) {
						shouldSkipThisFilename = true
						break // no need to keep searching if should skip
					}
				}
			}
			if (shouldSkipThisFilename) {
				// console.log(`❎  Skipping copy of ${filename}`)
				continue // skip this one
			}
			const filepath = path.join(parentDir, filename)
			const isSubdirAtPath = fs.lstatSync(filepath).isDirectory() // we're assuming the file at path actually exists by here
			var filepathPrefix = path.join(parentDir_prefix, filename)
			var filepathIn_www = path.join(pathTo_assembled_www, filepathPrefix)
			if (isSubdirAtPath) {
				// first re-create this dir in pathTo_assembled_www/…
				if (fs.existsSync(filepathIn_www) == false) {
					// console.log(`📁  Creating ${filepathPrefix}`)
					fs.mkdirSync(filepathIn_www)
				}
				// now traverse downwards…
				// console.log(`📂  Entering ${filepathPrefix}`)
				enumerateAndRecursivelyCopyDirContents(
					filepathPrefix, // the new parentDir_prefix for recursion
					false
				)
				// console.log(`📂  Exiting ${filepathPrefix}`)
				// finally, after going through the source contents, if no destination contents exist, delete this destination contents container directory
				const filenamesIn_subdir = fs.readdirSync(filepathIn_www)
				if (filenamesIn_subdir.length == 0) {
					// console.log(`🗑  Since empty, actually removing ${filepathPrefix}`)
					fs.rmdirSync(filepathIn_www)
				}
			} else {
				if (filepathPrefix === indexHTMLFileToPutAtRoot_filepathPrefixInWWW) {
					filepathPrefix = "index.html" // this is a special case - put it at the root of www
					filepathIn_www = path.join(pathTo_assembled_www, filepathPrefix)
				}
				console.log(`⤵️  Copying file to ${filepathPrefix}`)
				copyFile(filepath, filepathIn_www)
			}
		}
	}
}
function copyFile(fromPath, toPath)
{
	fs.writeFileSync(
		toPath,
		fs.readFileSync(fromPath)
	)
}
exports.assembleWith = assembleWith