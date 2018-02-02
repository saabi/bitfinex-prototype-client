import * as React from 'react';
import * as Exchange from '../../stores';

export class FundingTicker extends React.Component<Exchange.FundingTickerProps> {
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
