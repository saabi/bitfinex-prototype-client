import * as React from 'react';
import * as Exchange from '../../stores';

export class FundingTicker extends React.Component<Exchange.FundingTickerProps> {
    render() {
        const store = this.props.store;
        const tickers = store.get('tickers');

        let tableRows = Object.getOwnPropertyNames(tickers).map((symbol) => {
            let i = tickers[symbol];
            return (
                <tr key={symbol}>
                    <td>{symbol}</td>
                    <td>{(100*i.lastPrice).toFixed(6)}</td>
                    <td className={i.dailyChangePerc>0?'positive':'negative'}>{(100*i.dailyChangePerc).toFixed(2)}%</td>
                    <td>{Math.round(i.volume).toLocaleString()}</td>
                </tr>
            )
        });

        return (
            <div id='fundingticker' className='widget'>
                <h3>Funding Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<button>{}</button></td>
                            <td>last<button>{}</button></td>
                            <td>24hr<button>{}</button></td>
                            <td>Vol Self<button>{}</button></td>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        )
    }
}
