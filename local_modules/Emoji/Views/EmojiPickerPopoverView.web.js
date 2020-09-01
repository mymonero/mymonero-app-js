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
const View = require('../../Views/View.web')
const EmojiPickerPopoverContentView = require('./EmojiPickerPopoverContentView.web')
//
class EmojiPickerPopoverView extends View
{
	// Lifecycle - Init
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.didPickEmoji_fn = options.didPickEmoji_fn || function(emoji) {}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		const bg_w = self.Width()
		const bg_h = self.Height()
		{
			const layer = self.layer
			layer.style.position = "absolute"
			layer.style.width = bg_w+"px"
			layer.style.height = bg_h+"px"
			layer.style.boxSizing = "border-box"
			// using a whole image instead of css for this due to more complex styling
			layer.style.backgroundImage = "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Emoji/Resources/popoverBG@3x.png)"
			layer.style.backgroundPosition = "0px 0px"
			layer.style.backgroundRepeat = "no-repeat"
			layer.style.backgroundSize = `${bg_w}px ${bg_h}px`
			layer.style.pointerEvents = "none" // otherwise the transparent part of the bg img interferes with clicking on the control, itself
			layer.style.zIndex = "10000" 
		}
		{
			const view = new EmojiPickerPopoverContentView({
				didPickEmoji_fn: function(emoji)
				{
					self.value = emoji
					self.didPickEmoji_fn(emoji)
				}
			}, self.context)
			view.layer.style.pointerEvents = "all" // must offset self.layer.style.pointerEvents
			self.emojiPickerPopoverContentView = view
			self.addSubview(view)
		}
	}
	// Lifecycle - Teardown
	TearDown()
	{
		super.TearDown()
		//
		const self = this
	}
	// Accessors
	Width()
	{
		return 341
	}
	Height()
	{
		return 264
	}
	// Runtime - Imperatives
	SetPreVisibleSelectedEmoji(emoji)
	{
		const self = this
		self.emojiPickerPopoverContentView.SetPreVisibleSelectedEmoji(emoji)
	}
}
module.exports = EmojiPickerPopoverView