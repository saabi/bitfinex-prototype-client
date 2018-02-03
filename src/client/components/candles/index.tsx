import * as React from 'react';
import * as Exchange from '../../stores';

export class Candles extends React.Component<Exchange.CandlesProps> {
    render() {
        let symbol = this.props.store.get('symbol');
        symbol = symbol ? ' - ' + symbol : '';
        return (
            <div id='candles' className='widget'>
                <h3>Candles{symbol}</h3>
            </div>
        )
    }
}
