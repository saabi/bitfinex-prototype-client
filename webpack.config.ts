import * as webpack from "webpack";
import * as path from "path";
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

import * as express from 'express';
import fetch from 'node-fetch';

// Bitfinex v1 API is CORS restricted. This proxies calls through the wbepack-dev-server to bypass restriction.
function setupBitfinexProxy(app: express.Application) {
    app.get('/v1/*', async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            console.log('https://api.bitfinex.com' + req.path);
            let response = await fetch('https://api.bitfinex.com' + req.path);
            let json = await response.json();
            res.json(json);
        } catch (e) {
            next(e)
        }
    });
}

namespace Configurations {
    export const production: webpack.Configuration = {
        entry: "./src/client/main.tsx",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: ["ts-loader"],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"]
        },
        plugins: [
            new UglifyJSPlugin()
        ],
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'public/js/dist'),
            publicPath: '/js/dist/'
        },
        devServer: {
            contentBase: 'public/',
            before: setupBitfinexProxy,
            disableHostCheck: true
        }
    }
    export const development: webpack.Configuration = {
        entry: [
            'react-hot-loader/patch',
            "./src/client/main.tsx"
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: ["react-hot-loader/webpack", "ts-loader"],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"]
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin()],
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'public/js/dist'),
            publicPath: '/js/dist/'
        },
        devtool: 'source-map',
        devServer: {
            hotOnly: true,
            inline: true,
            contentBase: 'public/',
            before: setupBitfinexProxy,
            allowedHosts: ['.lan']
        }
    }    
}

export default function config(env: any, argv: any) {
    if (!env)
        env = 'production';
    if (!(env in Configurations)) {
        console.log('No configuration with that name.')
        return;
    }
    return Configurations[env];
};
