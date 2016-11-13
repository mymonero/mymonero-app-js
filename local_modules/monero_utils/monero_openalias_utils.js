//
const monero_config = require('./monero_config')
const monero_utils = require('./monero_utils_instance')
const openalias_utils = require('../openalias_utils/openalias_utils')
//
const currency_openAliasPrefix = monero_config.openAliasPrefix
//
function CurrencyReadyAddressFromTXTRecords(
	records,
	dnssec_used,
	secured,
	dnssec_fail_reason,
	fn // (err?, currencyReady_address?, oaRecords_0_name?, oaRecords_0_description?, dnssec_used_and_secured?) -> Void
)
{	
	var oaRecords
	try {
		oaRecords = openalias_utils.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
			records, 
			dnssec_used, 
			secured, 
			dnssec_fail_reason, 
			currency_openAliasPrefix
		)
	} catch (e) {
		const err = new Error(e)
		fn(err)
        return
	}
	const sampled_oaRecord = oaRecords[0]
	console.log("OpenAlias record: ", sampled_oaRecord)
	var oaAddress = sampled_oaRecord.address
	try { // verify address is decodable for currency
	    monero_utils.decode_address(oaAddress)
	} catch (e) {
		const errStr = "Failed to decode OpenAlias address: " + oaAddress + ": " + e
		const error = new Error(errStr) // apparently if this is named err, JS will complain. no-semicolon parsing issue?
		fn(error)
	    return
	}
	const currencyReady_address = oaAddress
	const oaRecords_0_name = sampled_oaRecord.name 
	const oaRecords_0_description = sampled_oaRecord.description
    const dnssec_used_and_secured = dnssec_used && secured
	fn(
		null, 
		currencyReady_address,
		oaRecords_0_name,
		oaRecords_0_description,
		dnssec_used_and_secured
	)
}
exports.CurrencyReadyAddressFromTXTRecords = CurrencyReadyAddressFromTXTRecords