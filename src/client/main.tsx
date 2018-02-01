import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { BitfinexApp } from './bitfinex-app';

async function init() {
    renderApp();
}

init();

//#region Hot Module Reloading
async function renderApp() {
    ReactDOM.render(<AppContainer><BitfinexApp /></AppContainer>, document.getElementById('app-root'));
}
async function loadAndRender() {
    const NextApp = require<{ BitfinexApp: typeof BitfinexApp }>('./components').BitfinexApp;
    ReactDOM.render(<AppContainer><NextApp /></AppContainer>, document.getElementById('app-root'));
}

if (module.hot) {
    module.hot.accept(['./components.tsx'], loadAndRender);
}
//#endregion
