import { connect } from 'undux';
import { Exchange } from './store';
import { ExchangeApp } from './components';
import { Bindings } from './effects';

Bindings.bindStore(Exchange.AppStore);
export const BitfinexApp = connect (Exchange.AppStore) ('tickers', 'groups') (ExchangeApp);

