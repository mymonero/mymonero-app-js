"use strict"

const { Resolver } = require('dns')
const { ipcMain } = require('electron')

const TXTResolver_Interface = require('./TXTResolver_Interface')
const DNSResolverHandle = require('./DNSResolverHandle.node')

class TXTResolver
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.resolversByUUID = {}
		//
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		ipcMain.on(
			"TXTRecords",
			function(event, params)
			{
				self._resolveJob(
					event,
					params.hostname,
					params.uuid // use uuid as resolverUUID
				)
			}
		)
		ipcMain.on(
			"TXTRecords-Abort",
			function(event, params)
			{
				self._abortJob(
					event,
					params.uuid
				)
			}
		)
	}
	//
	// Imperatives
	_resolveJob(
		event,
		hostname,
		resolverUUID
	) {
		const self = this
		const resolver = new Resolver()
		self.resolversByUUID[resolverUUID] = resolver
		resolver.resolveTxt(
			hostname, 
			function(err, arraysOfSplitRecords)
			{
				delete self.resolversByUUID[resolverUUID] // letting this go
				//
				if (err) {
					event.sender.send(
						"TXTRecords-Callback",
						{
							uuid: resolverUUID,
							err: err.toString()
						}
					)
					return
				}
				var records = []
				for (let splitRecords of arraysOfSplitRecords) {
					records.push(
						splitRecords.join(''/*all spaces should already be present */)
					)
				}
				event.sender.send(
					"TXTRecords-Callback",
					{
						uuid: resolverUUID,
						records: records,
						dnssec_used: false,
						secured: false,
						dnssec_fail_reason: null
					}
				)
			}
		)
	}
	_abortJob(
		event,
		resolverUUID
	) {
		const self = this
		const resolver = self.resolversByUUID[resolverUUID]
		if (resolver && typeof resolver !== undefined) {
			resolver.cancel()
			delete self.resolversByUUID[resolverUUID]
		}
	}
}
module.exports = TXTResolver