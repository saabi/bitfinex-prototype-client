import * as React from 'react';
import * as Exchange from '../../stores';

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        return (
            <div id='trades'>
                <h2>Trades</h2>
            </div>
        )
    }
}
