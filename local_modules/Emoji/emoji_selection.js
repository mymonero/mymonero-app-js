// Copyright (c) 2014-2018, MyMonero.com
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
const Emojis = require('./emoji_set').Emojis
const numberOf_Emojis = Emojis.length
//
function randomFloat_unit()
{ // https://stackoverflow.com/questions/34575635/cryptographically-secure-float?answertab=oldest#tab-top
	// I've produced this function to replace Math.random, which we are black-holing to prevent emscripten from ever being able to call it (not that it is)
	let buffer = new ArrayBuffer(8); // A buffer with just the right size to convert to Float64
	let ints = new Int8Array(buffer); // View it as an Int8Array and fill it with 8 random ints
	window.crypto.getRandomValues(ints);
	//
	// Set the sign (ints[7][7]) to 0 and the
	// exponent (ints[7][6]-[6][5]) to just the right size 
	// (all ones except for the highest bit)
	ints[7] = 63;
	ints[6] |= 0xf0;
	//
	// Now view it as a Float64Array, and read the one float from it
	let float = new DataView(buffer).getFloat64(0, true) - 1;
	//
	return float; 
} 
//
function EmojiWhichIsNotAlreadyInUse(inUseEmojis)
{
	inUseEmojis = inUseEmojis || []
	for (let i = 0 ; i < numberOf_Emojis ; i++) { // start looking for a usable emoji
		const this_Emoji = Emojis[i]
		if (inUseEmojis.indexOf(this_Emoji) === -1) { // if not in use
			return this_Emoji
		}
	}
	console.warn("⚠️  Ran out of emojis to select in EmojiWhichIsNotAlreadyInUse")
	const indexOf_random_emoji = Math.floor(randomFloat_unit() * numberOf_Emojis)
	var random_emoji = Emojis[indexOf_random_emoji]
	//
	return random_emoji
}
exports.EmojiWhichIsNotAlreadyInUse = EmojiWhichIsNotAlreadyInUse