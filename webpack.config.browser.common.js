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
const webpack = require('webpack')
const path = require('path')
//
module.exports = 
{
	devtool: "source-map",
	context: __dirname,
	entry: "./local_modules/MainWindow/Views/index.browser.js",
	output: {
		path: path.resolve(__dirname, "browser_build"),
		filename: "mymonero-app-bundle.js"
	},
	cache: false,
	resolve: {
		alias: {
			"fs": "html5-fs"
		},
		extensions: ['.js', '.jsx', '.css', '.json', 'otf', 'ttf', 'eot', 'svg'],
		modules: [
			'node_modules'
		]
	},
	externals: {
	},
	stats: {
		colors: true
	},
	plugins: [
		// to fix warning from locales require in moment, "Module not found: Error: Can't resolve './locale/"
		new webpack.IgnorePlugin(/\.\/locale$/)
    ],
	module: {
		rules: [
			{
				test: /\.(otf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{ loader: 'file-loader' }
				]
			},
			{
				test: /\.css$/,
				use: [
					{ loader: 'style!css!postcss' }
				]
			},
			{
				test: /\.styl$/,
				use: [
					{ loader: 'style!css!postcss!stylus?paths=node_modules' }
				]
			},
			{
				test: /\.js$/,
				exclude: {
					test: [
						path.join(__dirname, 'node_modules'),
						/MyMoneroCoreCpp_ASMJS\.asm\.js/,
						/MyMoneroCoreCpp_ASMJS\.wasm/,
						/MyMoneroCoreCpp_WASM\.js/,
						/MyMoneroCoreCpp_WASM\.wasm/,
						/MyMoneroCoreBridge\.js/,
						/MyMoneroCoreBridgeClass\.js/
					],
					exclude: [
						path.resolve(__dirname, 'mymonero-core-js/tests'),
						path.resolve(__dirname, 'mymonero_libapp_js/tests'),
					]
				},
				use: [
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: false
							// ,
							// presets: [ "es2015" ],
							// plugins: ["transform-runtime"]
						}
					}
				]
			}
		]
	}
}