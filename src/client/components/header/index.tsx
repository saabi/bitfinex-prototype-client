import * as React from 'react';

export type HeaderProps = {
    isConnected: boolean;
    isRateLimited: boolean;
    currentSymbol: string | null;
}

export class Header extends React.Component<HeaderProps> {
    render() {
        let symbol = this.props.currentSymbol || 'no symbol selected';
        let rl = this.props.isRateLimited
        let connectionState = rl ? 'Rate Limited!' : ( this.props.isConnected ? 'Connected' : 'Disconnected' );
        return (
            <div id='header'>
                <h1>Bitfinex</h1>
                <h2>Prototype Client</h2>
                <p id="currentSymbol">{symbol}</p>
                <p id='connectionStatus' className={rl? 'error' : ''}>{connectionState}</p>
            </div>
        )
    }
}
