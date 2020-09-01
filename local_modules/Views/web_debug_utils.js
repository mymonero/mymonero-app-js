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
function _borderLayer(layer)
{
	layer.style.border = `1px solid ${RandomColorHexString()}`
}
exports.DEBUG_BorderLayer = _borderLayer
//
function DEBUG_BorderSubviews(ofView)
{
	const self = ofView
	self.subviews.forEach(
		function(subview, i)
		{
			_borderLayer(subview.layer)
			DEBUG_BorderSubviews(subview) // recursive traversal
		}
	)
}
exports.DEBUG_BorderSubviews = DEBUG_BorderSubviews
//
function DEBUG_BorderChildLayers(ofLayer)
{
	const children = ofLayer.children
	const keysOf_children = Object.keys(children)
	keysOf_children.forEach(
		function(key, i)
		{
			const childLayer = children[key]
			//
			_borderLayer(childLayer)
			DEBUG_BorderChildLayers(childLayer)
		}
	)
}
exports.DEBUG_BorderChildLayers = DEBUG_BorderChildLayers
//
function RandomColorHexString()
{
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
exports.RandomColorHexString = RandomColorHexString	