import * as React from 'react';
import * as Exchange from '../../stores';
import { OrderButton } from '../order-button';
import { TickerOrder, OrderDirection } from '../../stores/types';

interface State {
    direction: OrderDirection;
    column: TickerOrder;
}

export class TradeTicker extends React.Component<Exchange.TradeTickerProps, State> {
    constructor(props:Exchange.TradeTickerProps) {
        super(props);
        this.state = {
            direction: OrderDirection.unsorted,
            column: 'symbol'
        }
    }
    render() {
        const handleSorting = (id: string, direction: OrderDirection) => {
        }
        const store = this.props.store;
        const tickers = store.get('tickers');
        const groups = store.get('groups');

        let groupNames = Object.getOwnPropertyNames(groups);
        let tableRows = groupNames.map((symbol) => {
            let group = groups[symbol];
            let c = 0;
            return (
                <tbody key={symbol}>
                    {group.map(gi => {
                        c++;
                        let i = tickers[gi.pair];
                        let lpF = (i.lastPrice).toFixed(6);
                        let lpP = (i.lastPrice).toPrecision(6);
                        return (
                            <tr key={gi.pair} onClick={() => store.set('selectedSymbol')(gi.pair)} className={store.get('selectedSymbol')===gi.pair?'selected':''}>
                                {(c===1) ? <td rowSpan={group.length}>{symbol}</td> : null}
                                <td>{lpF.length < lpP.length ? lpF : lpP}&nbsp;{gi.pair.substr(3,3)}</td>
                                <td className={i.dailyChangePerc>0?'positive':'negative'}>{(100*i.dailyChangePerc).toFixed(2)}%</td>
                                <td>{Math.round(i.volume).toLocaleString()}</td>
                            </tr>)}
                        )}
                </tbody>
            )
        });

        return (
            <div id='tradesticker' className='widget'>
                <h3>Ticker</h3>
                <table className='ticker'>
                    <thead>
                        <tr>
                            <td>symbol<OrderButton id='symbol' onDirection={handleSorting} /></td>
                            <td>last<OrderButton id='last' onDirection={handleSorting} /></td>
                            <td>24hr<OrderButton id='24hr' onDirection={handleSorting} /></td>
                            <td>volume<OrderButton id='volume' onDirection={handleSorting} /></td>
                        </tr>
                    </thead>
                    {tableRows}
                </table>
            </div>
        )
    }
}
