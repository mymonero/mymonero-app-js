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
const packageAssembly_utils = require('./shared/packageAssembly_utils.node')
//
const doNotCopyOrEnterFilepathsMatching =
[
	/actionButton_iconImage__(useCamera|chooseFile)/,
	//
	/^\.DS_Store$/,
	/^\.git$/,
	/^\.gitignore$/,
	/^\.gitmodules$/,
	/^\.eslint/,
	/\.electron\.(.*)\.?(js|html|css)$/, // e.g. electron.js, electron.renderer.js, electron.child.js
	/^electron_/,
	/mymonero-core-js\/build/, // obviously do not want anything within this
	/mymonero-core-js\/node_modules/, // all of these are dev dependencies, so we don't want them
	/mymonero_libapp_js\/build/, // obviously do not want anything within this
	/mymonero_libapp_js\/node_modules/, // all of these are dev dependencies, so we don't want them
	/mymonero_libapp_js\/tests/,
	/mymonero_libapp_js\/src/,
	/mymonero-core-js\/index\.js/,
	/MyMoneroCoreCpp_ASMJS\.js/,
	/MyMoneroCoreCpp_ASMJS\.asm\.js/,
	/MyMoneroCoreCpp_WASM\.js/,
	/MyMoneroCoreCpp_WASM\.wasm/,
	/MyMoneroCoreBridge\.js/,
	/MyMoneroCoreBridgeClass\.js/,
	/mymonero-core-js\/tests/,
	/mymonero-core-js\/wallaby/,
	/mymonero-core-js\/src/,
	/node_modules\/electron/, // no reason we'd want this
	/LICENSE\.txt/,
	/README\.md/,
	/CMakeLists\.txt/, 
	/package\.json/, 
	/package-lock\.json/, 
	/^\.prettier*/, 
	/yarn\.lock/, 
	/^tests$/i,
	/^bin$/,
	/^src$/, // no CPP!!
	/^(.*)\.jam$/,
	/\.child\./, // slightly ambiguous but we don't want these as they're for electron child processes
	//
	// v----- This is in fact a valid regex to node.js - eslint has trouble parsing the negative lookbehind to match paths which don't end in .asm.js
	/^.*(?<!\.asm)\.js$/ // funny enough, we can actually just ignore all JS files here (except the .asm.js file which gets loaded by the JS similar to the wasm) - because we're using browserify/webpack to analyze the dependency graph and bundle our JS for us
]
const relativePathTo_assembledWWWDirectory = "browser_build"
const indexHTMLFileToPutAtRoot_filepathPrefixInWWW = "MainWindow/Views/index.browser.html"
//
packageAssembly_utils.assembleWith(
	doNotCopyOrEnterFilepathsMatching,
	relativePathTo_assembledWWWDirectory,
	indexHTMLFileToPutAtRoot_filepathPrefixInWWW
)