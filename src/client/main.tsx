import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { connect } from 'undux';

import { Backend } from './effects';
import * as Exchange from './stores';
import * as Components from './components';

//#region Accesory Functions

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
    let ConnectedTradesTicker = connect (Exchange.TradeTickerStore) ('tickers', 'groups', 'selectedSymbol') (module.TradeTicker);
    let ConnectedFundingTicker = connect (Exchange.FundingTickerStore) ('tickers') (module.FundingTicker);
    let ConnectedBook = connect (Exchange.OrderBookStore) ('symbol','book') (module.OrderBook);
    let ConnectedTrades = connect (Exchange.TradesStore) ('symbol', 'trades') (module.Trades);
    let ConnectedCandles = connect (Exchange.CandlesStore) ('symbol') (module.Candles);

    let ConnectedApp = connect (Exchange.AppStore) ('currentSymbol','isConnected', 'isRateLimited') (class extends React.Component<Exchange.AppProps> {
        render() {
            let store = this.props.store;
            return (
                <>
                <Components.Header currentSymbol={store.get('currentSymbol')} isConnected={store.get('isConnected')} isRateLimited={store.get('isRateLimited')}/>
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
 * Binds state changes between different stores.
 */
function bindStoresToStores() {
    Exchange.TradeTickerStore.on('selectedSymbol')
        .subscribe( symbol => 
            Exchange.AppStore.set('currentSymbol')(symbol) 
        );
    Exchange.AppStore.on('currentSymbol')
        .subscribe( symbol => {
            Exchange.OrderBookStore.set('symbol')(symbol);
            Exchange.TradesStore.set('symbol')(symbol);
            Exchange.CandlesStore.set('symbol')(symbol);
        });    
}

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
    Backend.bindTradeTickerStore(Exchange.TradeTickerStore);
    Backend.bindFundingTickerStore(Exchange.FundingTickerStore);
    Backend.bindOrderBookStore(Exchange.OrderBookStore);
    Backend.bindTradesStore(Exchange.TradesStore);
    Backend.bindCandlesStore(Exchange.CandlesStore);
}

//#endregion
       
/**
 * Ties everything together, launching the system.
 */
async function launch() {
    bindStoresToStores();

    const App = connectComponentsToStores(Components);
    render(App);

    // connects to backend server and then binds the stores.
    try {
        await Backend.init();
        bindStoresToBackend();
    }
    catch (e) {
        if (e.error && e.error === 'ERR_RATE_LIMIT') {
            Exchange.AppStore.set('isRateLimited')(true);
        }
    }
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
