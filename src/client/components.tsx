import * as React from 'react';
import { Exchange } from './store'

class Ticker extends React.Component<Exchange.TickerProps> {
    render() {
        const tickers = this.props.tickers;
        const groups = this.props.groups;

        let groupNames = Object.getOwnPropertyNames(groups);
        let tableRows = groupNames.map((symbol) => {
            let group = groups[symbol];
            return (
                <li key={symbol}>
                    <h1>{symbol}</h1>
                    <ul>
                        {group.map(i => (<li key={i.pair}><ul><li>{i.pair}</li><li>{tickers[i.pair].dailyChange}</li><li>{tickers[i.pair].volume}</li></ul></li>))}
                    </ul>
                </li >
            )
        });

        return(
            <div id = 'ticker' >
                <ul><li>symbol<button>{}</button></li><li>last<button>{}</button></li><li>24hr<button>{}</button></li><li>Vol Self<button>{}</button></li></ul>
                <ul>{tableRows}</ul>
            </div>
        )
    }
}

class Book extends React.Component<Exchange.BookProps> {
    render() {
        return (
            <div id='book'>
                Order Book
            </div>
        )
    }
}

class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        return (
            <div id='trades'>
                Trades
            </div>
        )
    }
}

export class ExchangeApp extends React.Component<Exchange.AppProps> {
    render() {
        let tickers = this.props.store.get('tickers');
        let groups = this.props.store.get('groups');
        return (
            <>
            <Ticker tickers={tickers} groups={groups} orderColumn='symbol' orderDirection='unsorted'/>
            <Book />
            <Trades />
            </>)
    }
}
