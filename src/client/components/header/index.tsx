import * as React from 'react';

export type HeaderProps = {
    isConnected: boolean;
    isConnecting: boolean;
    isRateLimited: boolean;
    currentSymbol: string | null;
    onDisconnectionTest: () => void;
}

export class Header extends React.Component<HeaderProps> {
    render() {
        let symbol = this.props.currentSymbol || 'no symbol selected';
        let rl = this.props.isRateLimited
        let connectionState = rl ? 'Rate Limited!' : ( this.props.isConnected ? 'Connected' : this.props.isConnecting? 'Connecting...' : 'Disconnected' );
        return (
            <div id='header'>
                <header>
                    <h1>Bitfinex</h1>
                    <h2>Prototype Client</h2>
                </header>
                <p id="currentSymbol">{symbol}</p>
                <p id='connectionStatus' className={rl? 'error' : ''}>{connectionState}<button disabled={!this.props.isConnected} onClick={ this.props.onDisconnectionTest }>Disconnection Test</button></p>
            </div>
        )
    }
}
