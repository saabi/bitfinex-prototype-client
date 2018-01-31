import * as webpack from "webpack";
import * as path from "path";
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

import * as express from 'express';
import fetch from 'node-fetch';

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

const config: webpack.Configuration = {
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
        //new UglifyJSPlugin(),
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
        before: setupBitfinexProxy
    }
}

export default config;
