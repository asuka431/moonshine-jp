/**
Understand what is going on here in this file..
https://rossbulat.medium.com/how-to-use-redux-persist-in-react-native-3b0d912e730a

this file gets loaded by the AppRegistry, it was registered in /index.js

best practices for redux -> https://redux.js.org/style-guide/style-guide
Ducks: Redux Reducer Bundles -> https://github.com/erikras/ducks-modular-redux
**/

import React from "react";
import App from "./src/components/App";

// the local storage we'll be using to persist data
import AsyncStorage from "@react-native-community/async-storage";

// redux boilerplate
import { createStore, applyMiddleware } from "redux";

// the component we'll use to wrap our component tree
import { PersistGate } from "redux-persist/integration/react";

// root reducer - ./src/reducers/index.js
import reducer from "./src/reducers";

import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import LinearGradient from "react-native-linear-gradient";

const middleware = [ thunk ];
const logger = createLogger({collapsed: true});

if(process.env.ENVIRONMENT !== "production") middleware.push(logger);

// redux boilerplate
const Provider = require("react-redux").Provider;

// redux-persist wrappers
const { persistStore, persistReducer } = require("redux-persist");

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

// persist config
const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
};

// wrap persist API around root reducer and store
const persistedReducer = persistReducer(persistConfig, reducer);

export const store = createStoreWithMiddleware(persistedReducer);
const persistor = persistStore(store);

// Root component
const Root = () => {
	return (
		<Provider store={store}>
			<PersistGate
				loading={<LinearGradient 
					style={{ flex: 1 }} 
					colors={["#FF45bf", "#7931ab", "#FF31ab", "#68219b", "#FF1993", "#59158e", "#FFF28b"]} 
					start={{x: 0.0, y: 0.0}} 
					end={{x: 1.0, y: 1.0}} 
				/>}
				onBeforeLift={null}
				persistor={persistor}
			>
				<App />
			</PersistGate>
		</Provider>
	);
};

module.exports = Root;
