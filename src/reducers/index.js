// WTF is redux?  YT vids by unsure programmer explain it very nicely
// https://www.youtube.com/watch?v=KcC8KZ_Ga2M&list=PLy9JCsy2u97m3nSbw0xzo-X4EEoZiikd8
// https://www.youtube.com/watch?v=KcC8KZ_Ga2M

import { combineReducers } from "redux";

const appReducers = combineReducers({
	user: require("./user"),
	wallet: require("./wallet"),
	transaction: require("./transaction"),
	settings: require("./settings"),
	rates: require("./rates")
});

export default appReducers;
