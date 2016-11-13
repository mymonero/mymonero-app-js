
function ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
	records,
	dnssec_used,
	secured,
	dnssec_fail_reason,
	openAliasPrefix
) // throws; returns validatedOARecords
{
	var oaRecords = [];
	if (dnssec_used) {
	    if (secured) {
	        console.log("DNSSEC validation successful")
	    } else {
			throw "DNSSEC validation failed for " + domain + ": " + dnssec_fail_reason
	    }
	} else {
	    console.log("DNSSEC Not used");
	}
	for (var i = 0; i < records.length; i++) {
	    var record = records[i];
	    console.log("Found OpenAlias record: " + record);
		var parsedDescription;
		try {
			parsedDescription = New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix(record, openAliasPrefix)
		} catch (e) {
			// throw "Invalid OpenAlias record:", record, e
			continue // instaed of throwing, i.e. if records contains another (btc) address before the openAliasPrefix (xmr) address we're looking for
		}
	    oaRecords.push(parsedDescription)
	}
	if (oaRecords.length === 0) {
		throw "No valid OpenAlias records with prefix " + openAliasPrefix + " found for: " + domain
	}
	if (oaRecords.length !== 1) {
		throw "Multiple addresses found for given domain: " + domain
	}
	const validated_oaRecords = oaRecords
	//
	return validated_oaRecords
}
exports.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix = ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix
//
//
function New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix(
	record, 
	openAliasPrefix
) // throws on validation error
{
    var parsedDescription = {}
    if (DoesRecordHaveValidOpenAliasPrefix(record, openAliasPrefix) == false) {
        throw "Invalid OpenAlias prefix"
    }
    function parsed_paramValueWithName(valueName)
	{
        var pos = record.indexOf(valueName + "=")
        if (pos === -1) { // Record does not contain param
            return undefined
        }
        pos += valueName.length + 1
        var pos2 = record.indexOf(";", pos)
		//
        return record.substr(pos, pos2 - pos)
    }
    parsedDescription.address = parsed_paramValueWithName("recipient_address")
    parsedDescription.name = parsed_paramValueWithName("recipient_name")
    parsedDescription.description = parsed_paramValueWithName("tx_description")
	//
    return parsedDescription
}
exports.New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix = New_ParsedDescriptionFromOpenAliasRecordWithOpenAliasPrefix
//
//
function DoesRecordHaveValidOpenAliasPrefix(
	record, 
	openAliasPrefix
)
{
    if (record.slice(0, 4 + openAliasPrefix.length + 1) !== "oa1:" + openAliasPrefix + " ") {
		return false
	}
	return true
}
exports.DoesRecordHaveValidOpenAliasPrefix = DoesRecordHaveValidOpenAliasPrefix