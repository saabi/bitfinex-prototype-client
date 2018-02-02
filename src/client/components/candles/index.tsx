import * as React from 'react';
import { Exchange } from '../../store';

export class Candles extends React.Component<Exchange.CandlesProps> {
    render() {
        return (
            <div id='trades'>
                <h2>Candles</h2>
            </div>
        )
    }
}
