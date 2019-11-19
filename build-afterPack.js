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
const fs = require('fs-extra')
const path = require('path')
const { chdir } = require('process')
const { exec } = require('./build-util')

exports.default = async function(context)
{
  const isLinux = context.targets.find(target => target.name === 'appImage')
  if (!isLinux) {
    return
  }

  const originalDir = process.cwd()
  const dirname = context.appOutDir
  chdir(dirname)

  const appname_lc = "mymonero"
  console.log("~~~~~> WARNING: Applying customization to wrap actual "+appname_lc+".bin in a call with arg '--no-sandbox' to https://github.com/electron-userland/electron-builder/issues/3872")

  await exec('mv', [appname_lc, `${appname_lc}.bin`])
  const wrapperScript = `#!/bin/bash
    "\${BASH_SOURCE%/*}"/${appname_lc}.bin "$@" --no-sandbox
  `
  fs.writeFileSync(appname_lc, wrapperScript)
  await exec('chmod', ['+x', appname_lc])

  chdir(originalDir)
}