class Clients {
	constructor() {
		this.coin = "baricoin";
		this.mainClient = {
			baricoin: false,
			auroracoin: false,
			egulden: false,
			bitcoin: false,
			litecoin: false

		};
		this.peer = {
			baricoin: { port: 0, host: "", protocol: "" },
			auroracoin: { port: 0, host: "", protocol: "" },
			egulden: { port: 0, host: "", protocol: "" },
			bitcoin: { port: 0, host: "", protocol: "" },
			litecoin: { port: 0, host: "", protocol: "" }
		};
		this.peers = {
			baricoin: [],
			auroracoin: [],
			egulden: [],
			bitcoin: [],
			litecoin: []
		};
	}
	
	updateCoin(coin) {
		this.coin = coin;
	}
	
	updateMainClient(mainClient) {
		this.mainClient = mainClient;
	}
	
	updatePeer(peer) {
		this.peer = peer;
	}
	
}

module.exports = new Clients();
