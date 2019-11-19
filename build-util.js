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
const { spawn, ChildProcess } = require('child_process')
//
function redirectOutputFor(child/*: ChildProcess*/)
{
  const printStdout = (data/*: Buffer*/) => {
    process.stdout.write(data.toString())
  }
  const printStderr = (data/*: Buffer*/) => {
    process.stderr.write(data.toString())
  }
  child.stdout && child.stdout.on('data', printStdout)
  child.stderr && child.stderr.on('data', printStderr)

  child.once('close', () => {
    child.stdout && child.stdout.off('data', printStdout)
    child.stderr && child.stderr.off('data', printStderr)
  })
}
async function waitFor(child/*: ChildProcess*/)
{
  return new Promise(resolve => {
    child.once('close', () => resolve())
  })
}
//
exports.exec = async function(cmd_string, args)
{
  args = args || []
  const child = spawn(cmd_string, args, { shell: true })
  redirectOutputFor(child)
  await waitFor(child)
}
