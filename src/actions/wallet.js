import "../../shim";
import * as actions from "../actions"

const moment = require("moment");
const bip39 = require("bip39");
const {
	setKeychainValue,
	resetKeychainValue,
	isOnline,
	generateAddresses,
	getAddress,
	getAddressTransactions,
	getAllTransactions,
	getInfoFromAddressPath
} = require("../utils/helpers");
const {
	walletHelpers
} = require("../utils/walletApi");
const {
	availableCoins,
	defaultWalletShape
} = require("../utils/networks");

const updateWallet = (payload) => ({
	type: actions.UPDATE_WALLET,
	payload
});

const deleteWallet = ({ wallet } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({error: true, data});
		};

		await resetKeychainValue({ key: wallet });
		await resetKeychainValue({ key: `${wallet}passphrase` });

		try {
			dispatch({
				type: actions.DELETE_WALLET,
				payload: {
					wallet
				}
			});
			resolve({ error: false, data: "" });
		} catch (e) {
			failure(e);
		}
	});
};

const createWallet = ({ wallet = "wallet0", selectedCrypto = "bitcoin", addressAmount = 2, changeAddressAmount = 2, mnemonic = "", generateAllAddresses = true, keyDerivationPath = "44" } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({error: true, data});
		};
		try {
			//Generate Mnemonic
			let bip39Label = `invalid mnemonic`;
			if (mnemonic === "") {
				mnemonic = bip39.generateMnemonic(256);
			}
			
			if (bip39.validateMnemonic(mnemonic)) {
				await setKeychainValue({ key: wallet, value: mnemonic });

				bip39Label = mnemonic.split(" ");
				bip39Label = `${bip39Label[0]} ${bip39Label[1]}`;
			} else {
				//Invalid Mnemonic
				failure("Invalid Mnemonic");
				return;
			}
			
			const coins = availableCoins;
			
			let allAddresses = {};
			await Promise.all(coins.map(async (coin) => { allAddresses[coin] = { addresses: [], changeAddresses: [] };}));
			
			//Generate receiving and change addresses.
			if (generateAllAddresses) {
				await Promise.all(
					coins.map(async (coin) => {
						let addresses = await generateAddresses({
							addressAmount,
							changeAddressAmount,
							selectedCrypto: coin,
							wallet,
							keyDerivationPath: defaultWalletShape.keyDerivationPath[coin],
							addressType: defaultWalletShape.addressType[coin],
						});
						if (addresses.error) addresses = {data: {addresses: [], changeAddresses: []}};
						allAddresses[coin].addresses = addresses.data.addresses;
						allAddresses[coin].changeAddresses = addresses.data.changeAddresses;
					})
				);
			} else {
				let generatedAddresses = await generateAddresses({ 
					addressAmount, 
					changeAddressAmount, 
					selectedCrypto, 
					wallet, 
					keyDerivationPath: defaultWalletShape.keyDerivationPath[selectedCrypto],
					addressType: defaultWalletShape.addressType[selectedCrypto]

				});
				if (generatedAddresses.error) {
					allAddresses[selectedCrypto].addresses = generatedAddresses.data.addresses;
					allAddresses[selectedCrypto].changeAddresses = generatedAddresses.data.changeAddresses;
				}
			}
			
			let addresses = {}, changeAddresses = {};
			await Promise.all(
				coins.map(coin => {
					try {
						addresses[coin] = allAddresses[coin].addresses || [];
						changeAddresses[coin] = allAddresses[coin].changeAddresses || [];
					} catch (e) {
						addresses[coin] = [];
						changeAddresses[coin] = [];
					}
				})
			);
			
			const payload = {
				[wallet]: {
					...defaultWalletShape,
					addresses,
					changeAddresses,
					label: bip39Label
				}
			};
			
			await dispatch({
				type: actions.CREATE_WALLET,
				payload
			});
			
			resolve({ error: false, data: allAddresses });
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const resetUtxos = ({wallet = "wallet0", addresses = [], changeAddresses = [], currentBlockHeight = 0, selectedCrypto = "bitcoin"} = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({error: true, data});
		};
		try {
			const isConnected = await isOnline();
			if (isConnected === false) return failure();
			
			//Returns { error: false, data: { utxos, balance } }
			const utxoResult = await walletHelpers.utxos.default({ addresses, changeAddresses, currentBlockHeight, selectedCrypto });
			if (utxoResult.error === true) {
				failure(utxoResult);
				return;
			}
			let utxos = [];
			try {
				utxos = utxoResult.data.utxos;
			} catch (e) {
				failure();
				return;
			}
			
			if (isConnected && !utxoResult.error) {
				dispatch({
					type: actions.RESET_UTXOS,
					payload: {
						wallet,
						selectedCrypto,
						utxos,
						timestamp: moment()
					},
				});
				resolve(utxoResult);
				return;
			}
			failure(utxoResult);
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const addTransaction = ({ wallet = "wallet0", transaction = {}, selectedCrypto = "bitcoin", rbfData = {} } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({ error: true, data });
		};
		try {
			dispatch({
				type: actions.ADD_TRANSACTION,
				payload: {
					wallet,
					selectedCrypto,
					transaction,
					rbfData
				},
			});
			resolve({ error: false, data: transaction });
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const updateBalance = ({ wallet = "wallet0", utxos = [], blacklistedUtxos = [], selectedCrypto = "bitcoin" } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({ error: true, data });
		};
		try {
			const isConnected = await isOnline();
			if (isConnected === false) return failure();
			
			let confirmedBalance = 0;
			let unconfirmedBalance = 0;
			try {
				confirmedBalance = utxos.reduce((total, utxo) => {
				//Ensure we're not adding blacklisted utxo values.
				if (!blacklistedUtxos.includes(utxo.tx_hash))  return total + utxo.value;
				return total;
			}, 0);
			} catch (e) {}
			/*
			await Promise.all(utxos.map(async (utxo) => {
				utxo.confirmations >= confirmations ? confirmedBalance+=utxo.value : unconfirmedBalance+=utxo.value;
			}));
			*/
			dispatch({
				type: actions.UPDATE_CONFIRMED_BALANCE,
				payload: {
					wallet,
					selectedCrypto,
					confirmedBalance,
					unconfirmedBalance,
					timestamp: moment()
				},
			});
			resolve({ error: false, data: confirmedBalance });
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const updateBlockHeight = ({ selectedCrypto = "bitcoin" } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({ error: true, data });
		};
		try {
			const response = await walletHelpers.getBlockHeight.default({ selectedCrypto });
			try {
				if (response.error === false && response.data !== undefined && response.data > 0) {
					const blockHeight = response.data;
					dispatch({
						type: actions.UPDATE_BLOCK_HEIGHT,
						payload: {
							selectedCrypto,
							blockHeight,
							timestamp: moment()
						},
					});
					resolve({ error: false, data: response });
				}
				failure("Unable to fetch block height.");
			} catch (e) {
				console.log(e);
				failure("Unable to fetch block height.");
			}
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const addAddresses = ({ wallet = "wallet0", selectedCrypto = "bitcoin", addressAmount = 5, changeAddressAmount = 5, addressIndex = 0, changeAddressIndex = 0, keyDerivationPath = "44" }) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({error: true, data});
		};
		try {
			//Generate receiving and change addresses.
			let addresses = await generateAddresses({ addressAmount, changeAddressAmount, addressIndex, changeAddressIndex, selectedCrypto, wallet, keyDerivationPath });
			if (addresses.error) {
				addresses = { data: { addresses: [], changeAddresses: [] } };
			}
			
			dispatch({
				type: actions.ADD_ADDRESSES,
				payload: {
					wallet,
					selectedCrypto,
					addresses: addresses.data.addresses,
					changeAddresses: addresses.data.changeAddresses,
					timestamp: moment()
				},
			});
			resolve({ error: false, data: addresses.data });
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const toggleUtxoBlacklist = ({ transaction = "", selectedWallet = "wallet0", selectedCrypto = "" } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({error: true, data});
		};
		try {
			
			dispatch({
				type: actions.TOGGLE_UTXO_BLACKLIST,
				payload: {
					transaction,
					wallet: selectedWallet,
					selectedCrypto
				}
			});
			resolve({ error: false, data: transaction, wallet: selectedWallet, selectedCrypto });
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const initialImportSync = ({ wallet = "wallet0", selectedCrypto = "bitcoin", currentBlockHeight = 0, keyDerivationPath = "44" }) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({ error: true, data });
		};
		
		const isConnected = await isOnline();
		if (isConnected === false) return failure("Offline");
		
		try {
			//The threshold dictates how many empty addresses the function should search for before resolving
			//const defaultIndexThreshold = 1;
			//Add all address transactions to transactions array
			let transactions = [];
			let addressIndexes = [];
			let changeAddressIndexes = [];
			
			//Create Addresses
			//Generate receiving and change addresses.
			const newAddresses = await generateAddresses({ addressAmount: 50, changeAddressAmount: 50, addressIndex: 0, selectedCrypto, wallet, keyDerivationPath });
			const addresses = newAddresses.data.addresses;
			const changeAddresses = newAddresses.data.changeAddresses;
			
			await Promise.all(
				addresses.map(async (addr) => {
					try {
						const address = addr.address;
						const addressTransactions = await getAddressTransactions({
							address,
							addresses,
							changeAddresses,
							selectedCrypto,
							currentBlockHeight
						});
						if (addressTransactions.error === false && Array.isArray(addressTransactions.data) && addressTransactions.data.length > 0) {
							const currentAddressIndex = await getInfoFromAddressPath(addr.path);
							addressIndexes = addressIndexes.concat([currentAddressIndex.addressIndex]);
							transactions = transactions.concat(addressTransactions.data);
						}
					} catch (e) {
						console.log(e);
					}
				}),
				changeAddresses.map (async (changeAddr) => {
					const changeAddress = changeAddr.address;
					const changeAddressTransactions = await getAddressTransactions({
						address: changeAddress,
						addresses,
						changeAddresses,
						selectedCrypto,
						currentBlockHeight
					});
					if (changeAddressTransactions.error === false && Array.isArray(changeAddressTransactions.data) && changeAddressTransactions.data.length > 0) {
						const currentAddressIndex = await getInfoFromAddressPath(changeAddr.path);
						changeAddressIndexes = changeAddressIndexes.concat([currentAddressIndex.addressIndex]);
						transactions = transactions.concat(changeAddressTransactions.data);
					}
				})
			);
			
			
			//Filter transactions by timestamp.
			/*
			transactions.sort((obj1, obj2) => {
				const obj1Value = obj1.timestamp;
				const obj2Value = obj2.timestamp;
				return obj2Value - obj1Value || obj2.block - obj1.block || obj1.amount - obj2.amount;
			});
			*/
			let addressIndex = 0;
			try {
				addressIndex = Math.max.apply(Math, addressIndexes) || 0;
				if (isNaN(addressIndex)) addressIndex = 0;
			} catch {}
			let changeAddressIndex = 0;
			try {
				changeAddressIndex = Math.max.apply(Math, changeAddressIndexes) || 0;
				if (isNaN(changeAddressIndex)) changeAddressIndex = 0;
			} catch {}
			
			const payload = {
				wallet,
				selectedCrypto,
				transactions,
				addressIndex,
				changeAddressIndex,
				addresses,
				changeAddresses,
				timestamp: moment()
			};
			
			dispatch({
				type: actions.UPDATE_NEXT_AVAILABLE_ADDRESS,
				payload
			});
			resolve({error: false, data: payload});
		} catch (e) {
			console.log(e);
			failure(e);
		}
	});
};

const updateRbfData = ({ wallet = "wallet0", selectedCrypto = "", rbfData = {} } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		try {
			const payload = {
				wallet,
				selectedCrypto,
				rbfData
			};
			
			dispatch({
				type: actions.UPDATE_RBF_DATA,
				payload
			});
			resolve({error: false, data: payload});
		} catch (e) {resolve({ error: true, data: e });}
	});
};

const getNextAvailableAddress = ({ wallet = "wallet0", addresses = [], changeAddresses = [], addressIndex = 0, changeAddressIndex = 0, selectedCrypto = "bitcoin", currentBlockHeight = 0, keyDerivationPath = "44", addressType = "legacy" } = {}) => async (dispatch) => {
	return new Promise(async (resolve) => {
		const failure = (data) => {
			resolve({ error: true, data });
		};
		
		const isConnected = await isOnline();
		if (isConnected === false) return failure("Offline");
		
		try {
			//Create Addresses if none exist
			if (!addresses.length) {
				//Generate receiving and change addresses.
				const newAddresses = await generateAddresses({ addressAmount: 5, changeAddressAmount: 0, addressIndex: 0, selectedCrypto, wallet, keyDerivationPath, addressType });
				if (!newAddresses.error) addresses = newAddresses.data.addresses;
			}
			//Create Change Addresses if none exist
			if (!changeAddresses.length) {
				//Generate receiving and change addresses.
				const newAddresses = await generateAddresses({ addressAmount: 0, changeAddressAmount: 5, addressIndex: 0, selectedCrypto, wallet, keyDerivationPath, addressType });
				if (!newAddresses.error) changeAddresses = newAddresses.data.changeAddresses;
			}
			
			let allAddresses = addresses.slice(addressIndex, addresses.length);
			let allChangeAddresses = changeAddresses.slice(changeAddressIndex, changeAddresses.length);
			allAddresses = allAddresses.concat(allChangeAddresses);
			
			let allTransactions = [];
			let foundLastUsedAddress = false;
			let foundLastUsedChangeAddress = false;
			
			for (let i = 0; i < 10; i++) {
				const transactions = await getAllTransactions({
					allAddresses,
					addresses,
					changeAddresses,
					selectedCrypto,
					currentBlockHeight
				});
				
				if (transactions.error === false && transactions.data.length) allTransactions = allTransactions.concat(transactions.data);
				
				if (transactions.lastUsedAddress !== null) addressIndex = transactions.lastUsedAddress + 1;
				foundLastUsedAddress = transactions.lastUsedAddress === null || transactions.lastUsedAddress < addresses.length - 1;
				
				if (transactions.lastUsedChangeAddress !== null) changeAddressIndex =  transactions.lastUsedChangeAddress + 1;
				foundLastUsedChangeAddress = transactions.lastUsedChangeAddress === null || transactions.lastUsedChangeAddress < changeAddresses.length - 1;
				
				allAddresses = [];
				
				//Create Addresses if none exist
				if (foundLastUsedAddress === false) {
					i = 0;
					//Generate receiving and change addresses.
					const newAddresses = await generateAddresses({ addressAmount: 5, changeAddressAmount: 0, addressIndex, selectedCrypto, wallet, keyDerivationPath, addressType });
					allAddresses = allAddresses.concat(newAddresses.data.addresses);
					addresses = addresses.concat(newAddresses.data.addresses);
				}
				
				//Create Change Addresses if none exist
				if (foundLastUsedChangeAddress === false) {
					i = 0;
					//Generate receiving and change addresses.
					const newChangeAddresses = await generateAddresses({ addressAmount: 0, changeAddressAmount: 5, changeAddressIndex, selectedCrypto, wallet, keyDerivationPath, addressType });
					allAddresses = allAddresses.concat(newChangeAddresses.data.changeAddresses);
					changeAddresses = changeAddresses.concat(newChangeAddresses.data.changeAddresses);
				}
				
				//Ensure that our progress is saved as we go.
				//This is especially important for larger imports that may be interrupted.
				const payload = {
					wallet,
					selectedCrypto,
					transactions: allTransactions,
					addressIndex,
					changeAddressIndex,
					addresses,
					changeAddresses
				};
				
				dispatch({
					type: actions.UPDATE_NEXT_AVAILABLE_ADDRESS,
					payload
				});
				
				if (foundLastUsedAddress && foundLastUsedChangeAddress) {
					i = 10;
					break;
				}
			}
			
			const data = {
				wallet,
				selectedCrypto,
				transactions: allTransactions,
				addressIndex,
				changeAddressIndex,
				addresses,
				changeAddresses
			};
			resolve({ error: false, data });
		} catch (e) {
			console.log(e);
			failure(e);
		}
		
	});
};

module.exports = {
	deleteWallet,
	updateWallet,
	getAddress,
	createWallet,
	updateBalance,
	getNextAvailableAddress,
	resetUtxos,
	updateBlockHeight,
	addTransaction,
	toggleUtxoBlacklist,
	addAddresses,
	initialImportSync,
	updateRbfData
};

