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
const TabBarAndContentView = require('./TabBarAndContentView.web')
//
class LeftSideTabBarAndContentView extends TabBarAndContentView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{ // ^ called automatically by super, so
		const self = this
		super.setup() // must call this
		{
			const layer = self.layer
			layer.style.position = "relative"
			layer.style.left = "0px"
			layer.style.right = "0px"
			layer.style.width = "100%"
			layer.style.height = "100%"
		}
		const tabBarView_thickness = self.overridable_tabBarView_thickness()
		{
			const layer = self.tabBarView.layer
			layer.style.position = "absolute"
			layer.style.top = "0px"
			layer.style.left = "0px"
			layer.style.width = `${tabBarView_thickness}px`
			layer.style.height = "100%"
		}
		{
			const layer = self.contentAreaView.layer
			layer.style.position = "absolute"
			layer.style.top = "0px"
			layer.style.left = `${tabBarView_thickness}px`
			layer.style.width = `calc(100% - ${tabBarView_thickness}px)`
			layer.style.height = "100%"
		}
	}
	//
	//
	// Accessors - UI - Metrics - Overridable
	//
	overridable_tabBarView_thickness()
	{
		return 75
	}
}
module.exports = LeftSideTabBarAndContentView
