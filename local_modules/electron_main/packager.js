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
const options =
{
	//
	// meta-data
	// appVersion: "",// not specifying because it infers from package.json
	// buildVersion: 1, // maybe specify because it defailts to appVersion
	icon: "./local_modules/electron_main/resources/icons/icon", // note: when no ext provided, completes to ico/icns per platform, given all:true… and we set the icon property of all BrowserWindows for Linux
	// name: "MyMonero", // omitted as inferred from package.json
	appBundleId: "com.mymonero.mymonero", // TODO: why doesn't this get used in the plist?
	appCategoryType: "public.app-category.finance", 
	// Registering URL schemes (MacOS)
	protocols: [
		{
			name: "Monero Funds Request URL",
			schemes: [ "monero" ],
		}
	],
	win32metadata: {
		CompanyName: "MyMonero",
		FileDescription: "MyMonero Wallet App",
		OriginalFilename: "MyMonero.exe",
		ProductName: "MyMonero",
		InternalName: "MyMonero",
		// ProductVersion: // TODO: does electron provide this for us?
	},
	//
	// building
	all: true, // build for all platforms
		// // platform: "win32",//"darwin", // for debug/testing
	dir: ".", // source directory (must this be a parent of node_modules?)
	ignore: 
	// function(file, arg2)
	// {
	// 	console.log("ignore file?", file, arg2)
	// 	return false
	// },
	[ // TODO: this is fragile as new files must be added; can we change `dir` above to be something like "./src"?
		/test_products/,
		/^\./,
		/npm_debug\.log/,
		/README\.md/,
		/LICENSE\.txt/,
		/\/?bin\//
	],
	//
	// pre-packaging
	prune: true, // npm prune --production before packaging
	//
	// packaging
	asar: true,
	// TODO: `osxSign`
	// osxSign: {
	// 	identity: "MyMonero", // TODO // The identity used when signing the package via `codesign`
	// 	entitlements: "", // The path to the 'parent' entitlements
	// 	entitlements-inherit: "" // The path to the 'child' entitlements
	// }
	//
	// output
	out: "./build",
	overwrite: true,
	
}
const packager = require('electron-packager')
packager(
	options, 
	function(err, appPaths)
	{
		if (err) {
			console.error("❌  Error while building. ", err)
			return
		}
		console.log("✅  Successfully built & packaged apps.\n", appPaths)
	}
)
