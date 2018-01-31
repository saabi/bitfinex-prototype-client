import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Bitfinex from './bitfinex';
import * as BF from './bitfinex/types';

import { BitfinexApp } from './components';

let symbols: string[];
let symbolsDetails: BF.SymbolDetail[];
let baseCoinGroups: {[name:string]: typeof symbolsDetails};

let temp = false;

function onBitfinexConnection() {    
    console.log('Subscribing...');
    Bitfinex.Stream.subscribeTicker('btcusd', () => undefined );
}

async function init() {
    let status = await Bitfinex.V2.getStatus();
    if (status === 'maintenance') {
        throw new Error('Bitfinex is in maintenance right now. Please try again later.');
    }

    symbols = await Bitfinex.V1.getSymbols();
    symbolsDetails = await Bitfinex.V1.getSymbolsDetails();
    //#region Group symbols by base coin.
    baseCoinGroups = {};
    for (let i = 0; i < symbolsDetails.length; i++) {
        let s = symbolsDetails[i];
        let baseCoinName = s.pair.substr(0, 3);
        let baseCoin = baseCoinGroups[baseCoinName];
        if ( !baseCoin ) {
            baseCoinGroups[baseCoinName] = baseCoin = [];
        }
        baseCoin.push(s);
    }
    //#endregion

    let symbols2: string[] = [];
    symbols.forEach( (s) => {
        symbols2.push('t'+s.toUpperCase());
        symbols2.push('f'+s.toUpperCase());
    })
    let tickers = await Bitfinex.V2.getTickers(symbols2);

    console.log(tickers);

    Bitfinex.Stream.addConnectionHandler(onBitfinexConnection)
    Bitfinex.Stream.connect();

    //renderApp();
}

init();


//#region Hot Module Reloading
async function renderApp() {
    ReactDOM.render(<AppContainer><BitfinexApp/></AppContainer>, document.getElementById('app-root'));
}
async function loadAndRender() {
    const NextApp = require<{BitfinexApp: typeof BitfinexApp}>('./components').BitfinexApp;
    ReactDOM.render(<AppContainer><NextApp/></AppContainer>, document.getElementById('app-root'));
}

if (module.hot) {
    module.hot.accept(['./components.tsx'], loadAndRender);
}
//#endregion
