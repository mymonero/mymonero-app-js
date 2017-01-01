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
const Swatches =
[
	"#ff0000",
	"#ffff00",
	"#ff00ff",
	"#00ff00",
	"#00ffff",
	"#0000ff"
]
exports.Swatches = Swatches
//
const numberOf_Swatches = Swatches.length
exports.NumberOf_Swatches = numberOf_Swatches
// 
function SwatchWhichIsNotAlreadyInUse(inUseSwatches)
{
	const self = this
	inUseSwatches = inUseSwatches || []
	for (let i = 0 ; i < numberOf_Swatches ; i++) { // start looking for a usable item
		const this_Swatch = Swatches[i]
		if (inUseSwatches.indexOf(this_Swatch) === -1) { // if not in use
			return this_Swatch
		}
	}
	console.warn("⚠️  Ran out of swatches to select in SwatchWhichIsNotAlreadyInUse")
	const indexOf_random_swatch = Math.floor(Math.random() * numberOf_Swatches)
	var random_swatch = Swatches[indexOf_random_swatch]
	//
	return random_swatch
}
exports.SwatchWhichIsNotAlreadyInUse = SwatchWhichIsNotAlreadyInUse