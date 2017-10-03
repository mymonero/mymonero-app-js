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
const response_parser_utils = require('../mymonero_core_js/monero_utils/mymonero_response_parser_utils')
//
class APIResponseParser
{
	constructor(options, context)
	{
	}
	setup_worker()
	{ // must be implemented
		const self = this
	}
	//
	// Runtime - Imperatives - Public
	Parsed_AddressInfo(
		data, 
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)
	{
		const self = this
		response_parser_utils.Parsed_AddressInfo(
			data,
			address,
			view_key__private,
			spend_key__public,
			spend_key__private,
			function(err, returnValuesByKey)
			{
				fn(err, returnValuesByKey)
			}
		)
	}
	Parsed_AddressTransactions(
		data, 
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)
	{
		const self = this
		response_parser_utils.Parsed_AddressTransactions(
			data,
			address,
			view_key__private,
			spend_key__public,
			spend_key__private,
			function(err, returnValuesByKey)
			{
				fn(err, returnValuesByKey)
			}
		)
	}
	Parsed_UnspentOuts(
		data, 
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)
	{
		const self = this
		response_parser_utils.Parsed_UnspentOuts(
			data,
			address,
			view_key__private,
			spend_key__public,
			spend_key__private,
			function(err, returnValuesByKey)
			{
				fn(err, returnValuesByKey)
			}
		)
	}
}
module.exports = APIResponseParser