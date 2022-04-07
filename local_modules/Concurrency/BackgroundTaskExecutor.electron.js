'use strict'

const BackgroundTaskExecutor_Interface = require('./BackgroundTaskExecutor_Interface')
const child_process = require('child_process')
const fork = child_process.fork

class BackgroundTaskExecutor extends BackgroundTaskExecutor_Interface {
  setup () {
    const self = this
    { // before calling on super - which will call setup_worker
      self.absolutePathToChildProcessSourceFile = self.options.absolutePathToChildProcessSourceFile
      if (typeof self.absolutePathToChildProcessSourceFile === 'undefined' || !self.absolutePathToChildProcessSourceFile) {
        throw Error(`absolutePathToChildProcessSourceFile required in ${self.constructor.name}`)
      }
      //
      self.argsForChild = self.options.argsForChild || []
    }
    super.setup()
  }

  setup_worker () {
    const self = this
    const child = fork( // fork will set up electron properly in the child process for us (e.g. env)
      self.absolutePathToChildProcessSourceFile,
      self.argsForChild,
      {
        stdio: [
          0, 1, 2, // equivalent to process.stdin, process.stdout, process.stderr
          'ipc'
        ]
      }
    )
    self.worker = child // so that super is satisfied with existence of self.worker - we will translate internally
  }

  startObserving_worker () {
    const self = this
    super.startObserving_worker() // to get the boot timeout going
    const child = self.worker // semantics translation
    child.on('message', function (message) {
      if (message === 'child is up') {
        self._receivedBootAckFromWorker()
        return
      }
      let payload = null
      if (typeof message === 'string') {
        try {
          payload = JSON.parse(message)
        } catch (e) {
          console.error("JSON couldn't be parsed in " + self.constructor.name, e)
          throw e
        }
      } else if (typeof message === 'object') {
        payload = message
      } else {
        throw Error('unrecognized typeof message received from child')
      }
      self._receivedPayloadFromWorker(payload)
    })
  }

  _concrete_sendPayloadToWorker (payload) {
    const self = this
    const child = self.worker // semantics translation
    child.send(payload)
  }
}

module.exports = BackgroundTaskExecutor
