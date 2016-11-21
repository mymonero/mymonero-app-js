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

const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
//
module.exports =
{
	//
	// shared - persistence
	//
	persistencePassword: "a much stronger password than before",
	//
	//
	deleteWalletWith_id: "Vi3XO7lz73lbKOcP",
	unlockWalletWith_id: "CaaTGULvdHzttrKu",
	//
	// importing wallets
	// I
	initWithMnemonic__mnemonicString: "phone etiquette twice oars bounced left wonders aglow fleet avidly ramped fuzzy height nodes fever radar soapy fading boyfriend vortex wizard slug mowing occur soapy", 
	initWithMnemonic__wordsetName: monero_wallet_utils.wordsetNames.english,
	//
	// II
	initWithKeys__address: "42S6txwM9RA53BL2Uf46CeM5WMJHTj6jWKgmSMLiLeb6A8QwXiWTK51PxF7wR8wNdgLJkWCM3NaiTfhWJnhskk7A7S5bEfp",
	initWithKeys__view_key__private: "883ada1a057f177e5edcc8a85ab732e2c30e52ab2d4708ecadc6bd2338bcac08",
	initWithKeys__spend_key__private: "d5d5789e274f965c3edd72464512f29e0c1934b6e6c0b87bfff86007b0775b0d",
	
}