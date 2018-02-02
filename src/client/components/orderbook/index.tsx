import * as React from 'react';
import { Exchange } from '../../store';

export class OrderBook extends React.Component<Exchange.OrderBookProps> {
    render() {
        return (
            <div id='book'>
                <h2>Order Book</h2>
            </div>
        )
    }
}
