import * as webpack from "webpack";
import * as path from "path";
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

console.log(__dirname);
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
        contentBase: 'public/'
    }
}

export default config;
