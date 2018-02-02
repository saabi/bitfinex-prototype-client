import * as React from 'react';
import * as Exchange from '../../stores';

export class Candles extends React.Component<Exchange.CandlesProps> {
    render() {
        return (
            <div id='candles' className='widget'>
                <h3>Candles</h3>
            </div>
        )
    }
}
