"use strict"

const EventEmitter = require('events')

class UserIdleInWindowController extends EventEmitter {
    constructor(options, context) {
        super() // must call before can access `this`
        const self = this
        { // inputs/deps
            self.options = options
            self.context = context
        }
        { // initial state
            self.isUserIdle = false
            self._numberOfSecondsSinceLastUserInteraction = 0
            self._numberOfRequestsToLockUserIdleAsDisabled = 0
        }
        { // begin observing things which break/reset idle
            function __userDidInteract() { // trampoline to maintain `this` and encapsulate _userDidInteract call
                const wasUserIdle = self.isUserIdle
                {
                    self._userDidInteract()
                }
                if (wasUserIdle === true) { // emit after we have set isUserIdle back to false
                    self._userDidComeBackFromIdle()
                }
            }

            document.onclick = __userDidInteract
            document.onmousemove = __userDidInteract
            document.onkeypress = __userDidInteract
        }
        { // begin watching and checking if user considered idle
            self._initiate_userIdle_intervalTimer()
        }
    }

    EventName_userDidBecomeIdle() {
        return "EventName_userDidBecomeIdle"
    }

    EventName_userDidComeBackFromIdle() {
        return "EventName_userDidComeBackFromIdle"
    }

    TemporarilyDisable_userIdle() {
        const self = this
        self._numberOfRequestsToLockUserIdleAsDisabled += 1
        if (self._numberOfRequestsToLockUserIdleAsDisabled == 1) { // if we're requesting to disable without it already having been disabled, i.e. was 0, now 1
            console.log("⏳  Temporarily disabling the user idle timer.")
            self.__disable_userIdle()
        } else {
            console.log("⏳  Requested to temporarily disable user idle but already disabled. Incremented lock.")
        }
    }

    ReEnable_userIdle() {
        const self = this
        if (self._numberOfRequestsToLockUserIdleAsDisabled == 0) {
            console.log("⏳  ReEnable_userIdle, self._numberOfRequestsToLockUserIdleAsDisabled 0")
            return // don't go below 0
        }
        self._numberOfRequestsToLockUserIdleAsDisabled -= 1
        if (self._numberOfRequestsToLockUserIdleAsDisabled == 0) {
            console.log("⏳  Re-enabling the user idle timer.")
            self.__reEnable_userIdle()
        } else {
            console.log("⏳  Requested to re-enable user idle but other locks still exist.")
        }
    }

    //
    __disable_userIdle() {
        const self = this
        if (!self.userIdle_intervalTimer || typeof self.userIdle_intervalTimer === 'undefined') {
            throw "__disable_userIdle called but already have nil self.userIdle_intervalTimer"
        }
        clearInterval(self.userIdle_intervalTimer)
        self.userIdle_intervalTimer = null
    }

    __reEnable_userIdle() {
        const self = this
        if (self.userIdle_intervalTimer && typeof self.userIdle_intervalTimer !== 'undefined') {
            throw "__reEnable_userIdle called but non-nil self.userIdle_intervalTimer"
        }
        self._initiate_userIdle_intervalTimer()
    }

    //
    _initiate_userIdle_intervalTimer() {
        const self = this
        const intervalTimer_interval_ms = 1000
        if (!self._userIdle_intervalTimer_fn || typeof self._userIdle_intervalTimer_fn === 'undefined') {
            self._numberOfSecondsSinceLastUserInteraction = 0 // reset this in case the app disabled user idle at a time at all different from when the last idle breaking action occurred
            self._userIdle_intervalTimer_fn = function () {
                self._numberOfSecondsSinceLastUserInteraction += 1 // count the second
                var appTimeoutAfterS = self.context.settingsController.appTimeoutAfterS
                if (typeof appTimeoutAfterS === 'undefined') {
                    appTimeoutAfterS = 20 // on no pw entered / no settings info yet
                }
                if (appTimeoutAfterS == -1) { // then idle timer is disabled
                    return // do nothing
                }
                if (self._numberOfSecondsSinceLastUserInteraction >= appTimeoutAfterS) {
                    if (self.isUserIdle !== true) { // not already idle (else redundant)
                        self._userDidBecomeIdle()
                    }
                }
            }

        }
        self.userIdle_intervalTimer = setInterval(
            self._userIdle_intervalTimer_fn,
            intervalTimer_interval_ms
        )
    }

    //
    //
    // Runtime - Delegation
    //
    _userDidInteract() {
        const self = this
        self._numberOfSecondsSinceLastUserInteraction = 0 // reset counter
    }

    _userDidComeBackFromIdle() {
        const self = this
        {
            self.isUserIdle = false // in case they were
        }
        console.log("👀  User came back from having been idle.")
        self.emit(self.EventName_userDidComeBackFromIdle())
    }

    _userDidBecomeIdle() {
        const self = this
        {
            self.isUserIdle = true
        }
        console.log("⏲  User became idle.")
        self.emit(self.EventName_userDidBecomeIdle())
    }
}

module.exports = UserIdleInWindowController