"use strict";

const globalObject = global;
const globalPromiseKey = "MyMoneroLibAppBridge_Singleton.electron"
if (typeof globalObject[globalPromiseKey] === 'undefined' || !globalObject[globalPromiseKey]) {
	globalObject[globalPromiseKey] = require('@mymonero/mymonero-app-bridge')({asmjs: false})
}

module.exports = globalObject[globalPromiseKey];