import * as React from 'react';
import * as Exchange from '../../stores';

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';

        let trades = this.props.store.get('trades');

        let tradeRows = trades.map((t) => {
            return (
                <tr key={t.id} className={t.amount>0? 'bought' : 'sold'}>
                    <td>{new Date(t.mts).toLocaleTimeString()}</td>
                    <td>{t.price.toPrecision(5)}</td>
                    <td>{Math.abs(t.amount).toFixed(4)}</td>
                </tr>
            )
        });

        return (
            <div id='trades' className='widget'>
                <h3>Trades{symbol}</h3>
                <table className='asks'>
                    <thead>
                        <tr>
                            <td>time</td>
                            <td>price</td>
                            <td>amount</td>
                        </tr>
                    </thead>
                    <tbody>
                        {tradeRows}
                    </tbody>
                </table>
            </div>
        )
    }
}
