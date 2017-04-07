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
const fs = require('fs')
const path = require('path')
//
const doNotCopyOrEnterFilepathsMatching =
[
	/^\.DS_Store$/,
	/\.electron\.(.*)\.?(js|html|css)$/, // e.g. electron.js, electron.renderer.js, electron.child.js
	/^electron_/,
	/^tests$/i,
	/\.child\./, // slightly ambiguous but we don't want these as, in cordova, everything runs in WebCore
	//
	/\.js$/ // funny enough, we can actually just ignore all JS files here - because we're using browserify to analyze the dependency graph and bundle our JS for us
]
const numberOf_doNotCopyOrEnterFilepathsMatching = doNotCopyOrEnterFilepathsMatching.length
//
const pathTo_localModules = path.join(__dirname, "..", "local_modules")
const pathTo_assembled_www = path.join(__dirname, "..", "www")
//
// (in case www doesn't exist…)
if (fs.existsSync(pathTo_assembled_www) == false) {
	console.log(`📁  Creating ${pathTo_assembled_www}`)
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
bundleAndPackageJS()
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
				if (file === ".gitignore") {
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
			console.log(`🗑  Deleting ${file}`)
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
	const filenames = fs.readdirSync(parentDir)
	const numberOf_filenames = filenames.length
	for (let i = 0 ; i < numberOf_filenames ; i++) {
		const filename = filenames[i]
		var shouldSkipThisFilename = false
		for (let j = 0 ; j < numberOf_doNotCopyOrEnterFilepathsMatching ; j++) {
			const regex = doNotCopyOrEnterFilepathsMatching[j]
			if (regex.test(filename) == true) {
				shouldSkipThisFilename = true
				break // no need to keep searching if should skip
			}
		}
		if (shouldSkipThisFilename) {
			console.log(`❎  Skipping copy of ${filename}`)
			continue // skip this one
		}
		const filepath = path.join(parentDir, filename)
		const isSubdirAtPath = fs.lstatSync(filepath).isDirectory() // we're assuming the file at path actually exists by here
		var filepathPrefix = path.join(parentDir_prefix, filename)
		var filepathIn_www = path.join(pathTo_assembled_www, filepathPrefix)
		if (isSubdirAtPath) {
			// first re-create this dir in pathTo_assembled_www/…
			if (fs.existsSync(filepathIn_www) == false) {
				console.log(`📁  Creating ${filepathPrefix}`)
				fs.mkdirSync(filepathIn_www)
			}
			// now traverse downwards…
			console.log(`📂  Entering ${filepathPrefix}`)
			enumerateAndRecursivelyCopyDirContents(
				filepathPrefix, // the new parentDir_prefix for recursion
				false
			)
			console.log(`📂  Exiting ${filepathPrefix}`)
			// finally, after going through the source contents, if no destination contents exist, delete this destination contents container directory
			const filenamesIn_subdir = fs.readdirSync(filepathIn_www)
			if (filenamesIn_subdir.length == 0) {
				console.log(`🗑  Since empty, actually removing ${filepathPrefix}`)
				fs.rmdirSync(filepathIn_www)
			}
		} else {
			if (filepathPrefix === "MainWindow/Views/index.cordova.html") {
				filepathPrefix = "index.html" // this is a special case - put it at the root of www
				filepathIn_www = path.join(pathTo_assembled_www, filepathPrefix)
			}
			console.log(`⤵️  Copying file to ${filepathPrefix}`)
			copyFile(filepath, filepathIn_www)
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
//
function bundleAndPackageJS()
{
	const cordovaIndexJS_relativeFilepath = "local_modules/MainWindow/Views/index.cordova.js"
	const bundledFinalJS_relativeFilepath = "www/final_bundle.js"
	/* So, for some reason, the harmony branch (to support es6) of UglifyJS outputs an
		empty string when used via API like this. So just dropping down to cmd line, which
		works for now. Since using CLI, may as well browserify via it too. */
	var exec = require('child_process').exec
	var cmd = `node_modules/.bin/browserify ${cordovaIndexJS_relativeFilepath} | node_modules/.bin/uglifyjs > ${bundledFinalJS_relativeFilepath}`
	// var cmd = `node_modules/.bin/browserify ${cordovaIndexJS_relativeFilepath} > ${bundledFinalJS_relativeFilepath}`
	console.log(`🔁  ${cmd}`)
	exec(cmd, function(error, stdout, stderr)
	{
		if (error) {
			throw error
		}
		if (stderr) {
			console.error(stderr)
		}
		if (stdout) {
			console.log(stdout)
		}
	});
	
	// browserify:
	// const browserify = require('browserify')
	// const browserifiedJS_relativeFilepath = "www/_temp_browserified_bundle.js"
	// console.log(`🎩  browserify ${cordovaIndexJS_relativeFilepath} > ${browserifiedJS_relativeFilepath}`)
	// const browserifiedJS_readStream = browserify(cordovaIndexJS_relativeFilepath).bundle()
	// // now we must write to file before we can uglify (stream method would be nice - note we're currently using harmony branch)
	// const browserifiedJS_writeStream = fs.createWriteStream(browserifiedJS_relativeFilepath)
	// browserifiedJS_readStream.pipe(
	// 	browserifiedJS_writeStream
	// )
	// // now uglify:
	// console.log(`📦  uglify ${browserifiedJS_relativeFilepath} > ${bundledFinalJS_relativeFilepath}`)
	// const UglifyJS = require('uglify-js')
	// const minificationResult = UglifyJS.minify(
	// 	[ browserifiedJS_relativeFilepath ],
	// 	{
	// 		verbose: true,
	// 		debug: true
	// 	}
	// )
	// console.log("minificationResult" , minificationResult)
	// const minifiedCodeString = minificationResult.code
	// // now (over-)write:
	// fs.writeFileSync(bundledFinalJS_relativeFilepath, minifiedCodeString)
}