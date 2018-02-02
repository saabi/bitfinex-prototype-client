import * as React from 'react';
import * as Exchange from '../../stores';

export class OrderBook extends React.Component<Exchange.OrderBookProps> {
    render() {
        return (
            <div id='orderbook' className='widget'>
                <h3>Order Book</h3>
            </div>
        )
    }
}
