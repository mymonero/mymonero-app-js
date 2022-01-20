// This file is here merely to share configuration
//
exports.bridgedFn_names =
[
	"is_subaddress",
	"is_integrated_address",
	"new_payment_id",
	"new__int_addr_from_addr_and_short_pid",
	"decode_address",
	"newly_created_wallet",
	"are_equal_mnemonics",
	"mnemonic_from_seed",
	"seed_and_keys_from_mnemonic",
	"validate_components_for_login",
	"address_and_keys_from_seed",
	"generate_key_image",
	"estimated_tx_network_fee",
	// "async__send_funds", // this is not to be bridged via synch IPC since it requires async bridging
];