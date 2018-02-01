import * as React from 'react';
import { Exchange } from './store'

export class Ticker extends React.Component<Exchange.TickerProps> {
    render() {
        const store = this.props.store;
        const tickers = store.get('tickers');
        const groups = store.get('groups');

        let groupNames = Object.getOwnPropertyNames(groups);
        let tableRows = groupNames.map((symbol) => {
            let group = groups[symbol];
            return (
                <li key={symbol}>
                    <h1>{symbol}</h1>
                    <ul>
                        {group.map(i => (<li key={i.pair}><ul><li>{i.pair}</li><li>{tickers[i.pair].lastPrice}</li><li>{tickers[i.pair].dailyChange}</li><li>{tickers[i.pair].volume}</li></ul></li>))}
                    </ul>
                </li>
            )
        });

        return (
            <div id='ticker'>
                <h2>Ticker</h2>
                <ul><li>symbol<button>{}</button></li><li>last<button>{}</button></li><li>24hr<button>{}</button></li><li>Vol Self<button>{}</button></li></ul>
                <ul>{tableRows}</ul>
            </div>
        )
    }
}

export class Book extends React.Component<Exchange.BookProps> {
    render() {
        return (
            <div id='book'>
                <h2>Order Book</h2>
            </div>
        )
    }
}

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        return (
            <div id='trades'>
                <h2>Trades</h2>
            </div>
        )
    }
}
