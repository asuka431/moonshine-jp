// https://en.bitcoin.it/wiki/List_of_address_prefixes
const networks = {
	baricoin: {
		messagePrefix: '\x19BariCoin Signed Message:\n',
		bech32: 'bari',
		bip32: {
			public: 0x0488b21e,
			private: 0x0488ade4
		},
		pubKeyHash: 0x1a,
		scriptHash: 0x15,
		wif: 0x9a
	},
	bitcoin: {
		messagePrefix: '\x18Bitcoin Signed Message:\n',
		bech32: 'bc',
		bip32: {
			public: 0x0488b21e,
			private: 0x0488ade4
		},
		pubKeyHash: 0x00,
		scriptHash: 0x05,
		wif: 0x80
	},
	litecoin: {
		messagePrefix: '\x19Litecoin Signed Message:\n',
		bech32: 'ltc',
		bip32: {
			public: 0x019da462,
			private: 0x019d9cfe
		},
		pubKeyHash: 0x30,
		scriptHash: 0x32,
		wif: 0xb0
	}
};

//Max amount of BTC/LTC.
const maxCoins = {
	baricoin: 1000000000000000000,
	bitcoin: 2100000000000000,
	litecoin: 8400000000000000,
};

//Returns an array of all available coins from the networks object.
const availableCoins = Object.keys(networks).map(coin => coin);

const supportsRbf = {
	bitcoin: true,
	litecoin: false,
	baricoin: true
};

const zeroValueItems = {
	bitcoin: 0,
	litecoin: 0,
	baricoin: 0,
	timestamp: null
};

const arrayTypeItems = {
	bitcoin: [],
	litecoin: [],
	baricoin: [],
	timestamp: null
};

const objectTypeItems = {
	bitcoin: {},
	litecoin: {},
	baricoin: {},
	timestamp: null
};

const defaultWalletShape = {
	id: "",
	name: "",
	type: "default",
	addresses: arrayTypeItems,
	addressIndex: zeroValueItems,
	changeAddresses: arrayTypeItems,
	changeAddressIndex: zeroValueItems,
	utxos: arrayTypeItems,
	transactions: arrayTypeItems,
	blacklistedUtxos: arrayTypeItems,
	confirmedBalance: zeroValueItems,
	unconfirmedBalance: zeroValueItems,
	lastUpdated: zeroValueItems,
	hasBackedUpWallet: false,
	walletBackupTimestamp: "",
	keyDerivationPath: {
		bitcoin: "84",
		bitcoinTestnet: "84",
		litecoin: "44",
		litecoinTestnet: "44",
		baricoin: "44",
	},
	coinTypePath: {
		bitcoin: "0",
		bitcoinTestnet: "1",
		litecoin: "2",
		litecoinTestnet: "1",
		baricoin: "810",
	},
	addressType: { //Accepts bech32, segwit, legacy
		bitcoin: "bech32",
		bitcoinTestnet: "bech32",
		litecoin: "legacy",
		litecoinTestnet: "legacy",
		baricoin: "legacy",
	},
	rbfData: objectTypeItems
};

const getCoinImage = (coin = "bitcoin") => {
	try {
		coin = coin.toLowerCase();
		coin = coin.replace("testnet", "");

		switch (coin) {
			case "bitcoin":
				return require(`../assets/ecoins/bitcoin.png`);
			case "litecoin":
				return require(`../assets/ecoins/litecoin.png`);
			case "baricoin":
				return require(`../assets/ecoins/baricoin.png`);
			default:
				return require(`../assets/ecoins/baricoin.png`);
		}
	} catch (e) {
		return require(`../assets/ecoins/baricoin.png`);
	}
};

const getCoinData = ({ selectedCrypto = "baricoin", cryptoUnit = "BARI" }) => {
	try {
		let acronym = "BARI";
		let satoshi = "bit";
		let oshi = "bits";
		let blockTime = 5; //min
		switch (selectedCrypto) {
			case "bitcoin":
				satoshi = "satoshi";
				acronym = cryptoUnit === "satoshi" ? "sats" : "BTC";
				oshi = "sats";
				blockTime = 10;
				color = "#f7931a";
				return { acronym, label: "Bitcoin", crypto: "BTC", satoshi, oshi, blockTime, color };
			case "litecoin":
				satoshi = "litoshi";
				oshi = "lits";
				acronym = cryptoUnit === "satoshi" ? "lits" : "LTC";
				blockTime = 2.5;
				color = "#444444";
				return { acronym, label: "Litecoin", crypto: "LTC", satoshi, oshi, blockTime, color };
			case "baricoin":
				return {
					acronym: cryptoUnit === "satoshi" ? "bits" : "BARI",
					label: "Bari Coin",
					crypto: "BARI",
					satoshi: "bit",
					oshi: "bits",
					blockTime: 1,
					color: "#90191c"
				};
			default:
				return {
					acronym: cryptoUnit === "satoshi" ? "bits" : "BARI",
					label: "Bari Coin",
					crypto: "BARI",
					satoshi: "bit",
					oshi: "bits",
					blockTime: 1,
					color: "#90191c"
				};
		}
	} catch (e) {
		console.log(e);
	}
};

module.exports = {
	networks,
	availableCoins,
	defaultWalletShape,
	maxCoins,
	supportsRbf,
	zeroValueItems,
	arrayTypeItems,
	getCoinImage,
	getCoinData
};
