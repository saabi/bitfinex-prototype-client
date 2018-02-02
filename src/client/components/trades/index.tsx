import * as React from 'react';
import * as Exchange from '../../stores';

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        return (
            <div id='trades' className='widget'>
                <h3>Trades</h3>
            </div>
        )
    }
}
