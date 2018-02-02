import * as React from 'react';
import * as Exchange from '../../stores';

export class TradeTicker extends React.Component<Exchange.TradeTickerProps> {
    render() {
        const store = this.props.store;
        const tickers = store.get('tickers');
        const groups = store.get('groups');

        let groupNames = Object.getOwnPropertyNames(groups);
        let tableRows = groupNames.map((symbol) => {
            let group = groups[symbol];
            let c = 0;
            return (
                <tbody key={symbol}>
                    {group.map(gi => {
                        c++;
                        let i = tickers[gi.pair];
                        return (
                            <tr key={gi.pair}>
                                {(c===1) ? <td rowSpan={group.length}>{symbol}</td> : null}
                                <td>{(i.lastPrice).toLocaleString()}&nbsp;{gi.pair.substr(3,3)}</td>
                                <td className={i.dailyChangePerc>0?'positive':'negative'}>{(100*i.dailyChangePerc).toFixed(2)}%</td>
                                <td>{Math.round(i.volume).toLocaleString()}</td>
                            </tr>)}
                        )}
                </tbody>
            )
        });

        return (
            <div id='tradesticker' className='widget'>
                <h3>Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<button>{}</button></td>
                            <td>last<button>{}</button></td>
                            <td>24hr<button>{}</button></td>
                            <td>Vol Self<button>{}</button></td>
                        </tr>
                    </thead>
                    {tableRows}
                </table>
            </div>
        )
    }
}
