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
"use strict"
//
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const sharp = require('sharp')
const async = require('async')
function copyFile(fromPath, toPath)
{
	fs.writeFileSync(
		toPath,
		fs.readFileSync(fromPath)
	)
}
//
const pathTo_sources = path.join(__dirname, "..", "sources")
const pathTo_sources_icon = path.join(pathTo_sources, "icon.png")
const pathTo_sources_default = path.join(pathTo_sources, "default.png")
//
const pathTo_build_ios = path.join(__dirname, "..", "build", "ios")
const pathTo_build_ios_default = path.join(pathTo_build_ios, "Default@2x~universal~anyany.png")
const ios_icon_descriptions = 
[
	{ name: "icon-40", side: 40 },
	{ name: "icon-40@2x", side: 80 },
	{ name: "icon-50", side: 50 },
	{ name: "icon-50@2x", side: 100 },
	{ name: "icon-60@2x", side: 120 },
	{ name: "icon-60@3x", side: 180 },
	{ name: "icon-72", side: 72 },
	{ name: "icon-72@2x", side: 144 },
	{ name: "icon-76", side: 76 },
	{ name: "icon-76@2x", side: 152 },
	{ name: "icon-83.5@2x", side: 167 },
	{ name: "icon-small", side: 29 },
	{ name: "icon-small@2x", side: 58 },
	{ name: "icon-small@3x", side: 87 },
	{ name: "icon", side: 57 },
	{ name: "icon@2x", side: 114 }
]
//
const pathTo_build_android = path.join(__dirname, "..", "build", "android")
const pathTo_build_android_default = path.join(pathTo_build_android, "default.png")
const pathTo_build_android_icon = path.join(pathTo_build_android, "icon.png")
//
//
mkdirp.sync(pathTo_build_ios)
mkdirp.sync(pathTo_build_android)
//
copyFile(
	pathTo_sources_default,
	pathTo_build_ios_default
)
copyFile(
	pathTo_sources_default,
	pathTo_build_android_default
)
//
copyFile(
	pathTo_sources_icon,
	pathTo_build_android_icon
)
//
async.each(
	ios_icon_descriptions,
	function(description, cb)
	{
		const filename = description.name + ".png"
		sharp(
			pathTo_sources_icon
		).resize(
			description.side
		).toFile(
			path.join(pathTo_build_ios, filename),
			function(err, info)
			{
				cb(err)
			}
		)
	},
	function(err)
	{
		if (err) {
			throw err
		}
		console.log("✅  Assembled ./cordova_res/build.")
	}
)