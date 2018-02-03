import * as React from 'react';
import * as Exchange from '../../stores';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';
import { SymbolDetail, Ticks, FundingPairTick } from '../../bitfinex/types';

interface RowProps {
    symbol: string;
    tick: FundingPairTick;
}
class FundingTickerRow extends React.Component<RowProps> {
    shouldComponentUpdate(nextProps: RowProps) {
        return nextProps.tick !== this.props.tick;
    }
    
    render() {
        let tick = this.props.tick;
        let symbol = this.props.symbol;
        return (
            <tr>
                <td>{symbol}</td>
                <td>{(100*tick.lastPrice).toFixed(6)}</td>
                <td className={tick.dailyChangePerc>0?'positive':'negative'}>{(100*tick.dailyChangePerc).toFixed(2)}%</td>
                <td>{Math.round(tick.volume).toLocaleString()}</td>
            </tr>
        )
    }
}

export class FundingTicker extends React.Component<Exchange.FundingTickerProps> {

    
    render() {
        const handleSorting = (id: string, direction: OrderDirection) => {
        }
        const store = this.props.store;
        const tickers = store.get('tickers');

        return (
            <div id='fundingticker' className='widget'>
                <h3>Funding Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<OrderButton id='symbol' onDirection={handleSorting} /></td>
                            <td>last<OrderButton id='last' onDirection={handleSorting} /></td>
                            <td>24hr<OrderButton id='24hr' onDirection={handleSorting} /></td>
                            <td>volume<OrderButton id='volume' onDirection={handleSorting} /></td>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.getOwnPropertyNames(tickers).map(symbol => <FundingTickerRow key={symbol} symbol={symbol} tick={tickers[symbol] as FundingPairTick} />)}
                    </tbody>
                </table>
            </div>
        )
    }
}
