// @flow weak
import * as actions from "../actions"
let counter = 0;

module.exports = (state = {}, action) => {
	if (action.type === actions.EXCHANGE_RATES_UPDATED) {
		return {
			...state,
			[action.payload.call]: {...state[action.payload.call], ...action.payload}
		};
	} else return state;
}
