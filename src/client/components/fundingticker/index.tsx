import * as React from 'react';
import * as Exchange from '../../stores';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';

export class FundingTicker extends React.Component<Exchange.FundingTickerProps> {
    render() {
        const handleSorting = (id: string, direction: OrderDirection) => {
        }
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
                            <td>symbol<OrderButton id='symbol' onDirection={handleSorting} /></td>
                            <td>last<OrderButton id='last' onDirection={handleSorting} /></td>
                            <td>24hr<OrderButton id='24hr' onDirection={handleSorting} /></td>
                            <td>volume<OrderButton id='volume' onDirection={handleSorting} /></td>
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
