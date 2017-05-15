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
const images_filenames =
[
	"addButtonIcon_10@3x.png",
	"backButtonIcon@3x.png",
	"contactPicker_xBtnIcn@3x.png",
	"detectedCheckmark@3x.png",
	"inlineMessageDialog_closeBtn@3x.png",
	"list_rightside_chevron@3x.png",
	"wallet-00C6FF@3x.png",
	"wallet-00F4CD@3x.png",
	"wallet-6B696B@3x.png",
	"wallet-CFCECF@3x.png",
	"wallet-D975E1@3x.png",
	"wallet-EACF12@3x.png",
	"wallet-EB8316@3x.png",
	"wallet-F97777@3x.png"
]
const cached_preloadedImages = []
function PreLoadImages(context)
{
	const assetsPath = context.crossPlatform_appBundledAssetsRootPath
	for (let i = 0; i < images_filenames.length; i++) {
		const filename = images_filenames[i]
		const imageURL = `${assetsPath}/MMAppUICommonComponents/Resources/${filename}`
		const image = new Image()
		image.src = imageURL
		cached_preloadedImages.push(image)
	}
}
exports.PreLoadImages = PreLoadImages