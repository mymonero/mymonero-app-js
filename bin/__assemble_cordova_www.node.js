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
const packageAssembly_utils = require('./shared/packageAssembly_utils.node')
//
const doNotCopyOrEnterFilepathsMatching =
[
	/^favicon(.*)\.(png|ico)$/,
	/^\.DS_Store$/,
	/^\.git$/,
	/^\.gitignore$/,
	/\.electron\.(.*)\.?(js|html|css)$/, // e.g. electron.js, electron.renderer.js, electron.child.js
	/^electron_/,
	/^tests$/i,
	/LICENSE\.txt/,
	/README\.md/,
	/\.Lite\./, // no need for it - this is full
	/\.child\./, // slightly ambiguous but we don't want these as, in cordova, everything runs in WebCore
	//
	/\.js$/ // funny enough, we can actually just ignore all JS files here - because we're using browserify/webpack to analyze the dependency graph and bundle our JS for us
]
const relativePathTo_assembledWWWDirectory = "www"
const indexHTMLFileToPutAtRoot_filepathPrefixInWWW = "MainWindow/Views/index.cordova.html"
//
packageAssembly_utils.assembleWith(
	doNotCopyOrEnterFilepathsMatching,
	relativePathTo_assembledWWWDirectory,
	indexHTMLFileToPutAtRoot_filepathPrefixInWWW
)