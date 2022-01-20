"use strict"

const TXTResolver_Interface = require('./TXTResolver_Interface')
const request = require('xhr')

class TXTResolver extends TXTResolver_Interface
{
	constructor(options)
	{
		super(options)
		const self = this
	}
	//
	// Accessors
	TXTRecords(
		name, 
		fn // (err, records, dnssec_used, secured, dnssec_fail_reason) -> Void
	) {
		const completeURL = "https://cloudflare-dns.com/dns-query?ct=application/dns-json&name="+encodeURIComponent(name)+"&type=TXT"
		const requestHandle = request(
			completeURL,
			function(err, response, body)
			{
				if (err) {
					fn(err)
					return
				}
				var json;
				try {
					json = JSON.parse(body)
				} catch (e) {
					fn(e.toString())
					return
				}
				const answerEntries = json.Answer
				if (!answerEntries || typeof answerEntries == 'undefined') {
					fn("Unrecognized DNS response")
					return
				}
				const records = []
				for (let answerEntry of answerEntries) {
					var entryData = answerEntry.data
					if (!entryData || typeof entryData == 'undefined') {
						fn("Unrecognized DNS response entry format")
						return
					}
					{ // remove wrapping escaped "s
						if (entryData.charAt(0) == "\"") { // remove 
							entryData = entryData.substring(1)
						}
						if (entryData.charAt(entryData.length-1) == "\"") {
							entryData = entryData.slice(0,entryData.length-1) // remove last char
						}
					}
					records.push(entryData)
				}
				fn(null, records, false, false, null) // TODO: add DNSSEC support
			}
		)
		return requestHandle
	}

}
module.exports = TXTResolver