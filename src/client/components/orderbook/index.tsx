import * as React from 'react';
import * as Exchange from '../../stores';
import * as style from './style.css';

interface BookRow {
    count: number;
    amount: number;
    price: number;
}

export class OrderBook extends React.Component<Exchange.OrderBookProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';

        let book = this.props.store.get('book');
        let bids: BookRow[] = [];
        let asks: BookRow[] = [];

        Object.getOwnPropertyNames(book).forEach( e => {
            let bt = book[e];
            if (bt.amount>0)
                bids.push(bt);
            else
                asks.push(bt);
        });
        bids.sort( (a,b) => b.price - a.price );
        asks.sort( (a,b) => a.price - b.price );

        let totals = 0;
        let bidTableRows = bids.map((bt) => {
            totals += bt.amount;
            return (
                <tr key={bt.price}>
                    <td>{bt.count}</td>
                    <td>{bt.amount.toFixed(1)}</td>
                    <td>{totals.toFixed(1)}</td>
                    <td>{bt.price}</td>
                </tr>
            )
        });
        totals = 0;
        let askTableRows = asks.map((bt) => {
            totals += bt.amount;
            return (
                <tr key={bt.price}>
                    <td>{bt.price}</td>
                    <td>{(-totals).toFixed(1)}</td>
                    <td>{(-bt.amount).toFixed(1)}</td>
                    <td>{bt.count}</td>
                </tr>
            )
        });

        return (
            <div id={style.orderBook} className='widget'>
                <h3>Order Book{symbol}</h3>
                <table className={style.asks}>
                    <thead>
                        <tr>
                            <td>count</td>
                            <td>amount</td>
                            <td>total</td>
                            <td>price</td>
                        </tr>
                    </thead>
                    <tbody>
                        {bidTableRows}
                    </tbody>
                </table>
                <table className={style.bids}>
                    <thead>
                        <tr>
                            <td>price</td>
                            <td>total</td>
                            <td>amount</td>
                            <td>count</td>
                        </tr>
                    </thead>
                    <tbody>
                        {askTableRows}
                    </tbody>
                </table>
            </div>
        )
    }
}
