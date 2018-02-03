import * as React from 'react';
import * as Exchange from '../../stores';

export class OrderBook extends React.Component<Exchange.OrderBookProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';
        return (
            <div id='orderbook' className='widget'>
                <h3>Order Book{symbol}</h3>
            </div>
        )
    }
}
