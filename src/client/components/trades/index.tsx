import * as React from 'react';
import * as Exchange from '../../stores';
import { TradeTick } from '../../bitfinex/types';

interface RowProps {
    trade: TradeTick;
}
export class TradeRow extends React.Component<RowProps> {
    shouldComponentUpdate(nextProps: RowProps) {
        return nextProps.trade !== this.props.trade;
    }
    render() {
        let trade = this.props.trade;
        return (
            <tr className={trade.amount>0? 'bought' : 'sold'}>
                <td>{new Date(trade.mts).toLocaleTimeString()}</td>
                <td>{trade.price.toPrecision(5)}</td>
                <td>{Math.abs(trade.amount).toFixed(4)}</td>
            </tr>
        )
    }
}

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';

        let trades = this.props.store.get('trades');
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
                        { trades.map( t => <TradeRow key={t.id} trade={t} /> ) }
                    </tbody>
                </table>
            </div>
        )
    }
}
