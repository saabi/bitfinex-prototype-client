import * as React from 'react';
import * as Exchange from '../../stores';

export class Candles extends React.Component<Exchange.CandlesProps> {
    render() {
        return (
            <div id='candles' className='widget'>
                <h2>Candles</h2>
            </div>
        )
    }
}
