# CryptFind

Crypto-Currency Exchange Rate Tracker

### Get the server running

1. Clone the Repo
2. `npm install`
3. `npm test`
4. edit `cfserverconfig.json` as desired
5. `npm start`
6. Browse to http://127.0.0.1:18080 (unless you change the config)

### Using the REST API

#### /api/v1/historyforpair

 - QueryString - Any number of `q=keyA-keyB` entries where `keyA` and `keyB` are coin names in a valid trading pair

Example:
 - `http://127.0.0.1:18080/api/v1/historyforpair?q=btc-eth&q=btc-ltc`
 
Results:
```
[{
	"bleutrade.com": [{
		"time": 1486767017060,
		"last": 88.57364544324024
	}, {
		"time": 1486767076985,
		"last": 88.57364544324024
	}, {
		"time": 1486767793219,
		"last": 88.57364544324024
	}],
	"bittrex.com": [{
		"time": 1486767017060,
		"last": 88.6909307314962
	}, ...
```
