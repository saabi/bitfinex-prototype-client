import * as React from 'react';
import * as Exchange from '../../stores';

export class Trades extends React.Component<Exchange.TradesProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';
        return (
            <div id='trades' className='widget'>
                <h3>Trades{symbol}</h3>
            </div>
        )
    }
}
