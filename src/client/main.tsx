import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { connect } from 'undux';

import { Backend } from './effects';
import * as Exchange from './stores';
import * as Components from './components';

/** 
 * Binds the different stores to the backend data
 * so that incoming data from the Bitfinex backend
 * will update the stores.
 * 
 * Everything is maximally decoupled. Theoretically,
 * one could support another backend without touching
 * either the Stores or the React components and only
 * replacing the binding code.
 */
function bindStoresToBackend() {
    Backend.bindAppStore(Exchange.AppStore);
    Backend.bindTickerStore(Exchange.TradeTickerStore);
    Backend.bindBookStore(Exchange.OrderBookStore);
    Backend.bindTradesStore(Exchange.TradesStore);
}

/**
 * Connects the react components to the stores so that changes 
 * in the stores update the components and vice versa.
 * 
 * This is done in here so as to support hot module replacement
 * with Unduxed React components while developing.
 * 
 * @param module The module containing the React components.
 */
function connectComponentsToStores(module: typeof Components) {
    let ConnectedTradesTicker = connect (Exchange.TradeTickerStore) ('tickers', 'groups') (module.TradeTicker);
    let ConnectedFundingTicker = connect (Exchange.TradeTickerStore) ('tickers', 'groups') (module.TradeTicker);
    let ConnectedBook = connect (Exchange.OrderBookStore) () (module.OrderBook);
    let ConnectedTrades = connect (Exchange.TradesStore) () (module.Trades);
    let ConnectedCandles = connect (Exchange.TradesStore) () (module.Candles);

    let ConnectedApp = connect (Exchange.AppStore) ('currentSymbol') (class extends React.Component<Exchange.AppProps> {
        render() {
            return (
                <>
                <Components.Header />
                <ConnectedTradesTicker />
                <ConnectedFundingTicker />
                <ConnectedBook />
                <ConnectedTrades />
                <ConnectedCandles />
                <Components.Footer />
                </>)
        }
    });

    return ConnectedApp;
}

/**
 * Launches the system.
 */
async function launch() {
    const App = connectComponentsToStores(Components);
    render(App);

    // connects to backend server and then binds the stores.
    await Backend.init();
    bindStoresToBackend();
}

launch();

//#region Hot Module Reloading
import { AppContainer } from 'react-hot-loader';

async function render(Component: React.ComponentClass<{}>) {
    ReactDOM.render(<AppContainer><Component /></AppContainer>, document.getElementById('app-root'));
}
async function loadAndRender() {
    const reloadedComponents = await import('./components');
    const NextApp = connectComponentsToStores( reloadedComponents );
    render(NextApp);
}

if (module.hot) {
    module.hot.accept(['./components'], loadAndRender);
}
//#endregion
