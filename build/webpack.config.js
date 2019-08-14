var path = require('path')

var argv = process.argv.splice(2)
var dev = false

if(argv.indexOf('dev') >= 0) {
    dev = true
}
console.log('dev:', dev)

var babelOptions = {
    presets: [
        '@babel/preset-env'
    ]
}

module.exports = {
    entry: path.join(__dirname, '../src/index.ts'),
    target: 'node',
    mode: dev ? 'development' : 'production',
    output: {
        path: path.join(__dirname, '../out'),
        filename: 'index.js',
        libraryTarget: dev ? 'umd' : 'commonjs',
        library: dev ? 'socket' : '',
        umdNamedDefine: dev,
        globalObject: 'this'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.(str\.js)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                    {
                        loader: 'ts-loader'
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions
                },
                exclude: /node_modules/
            }
        ]
    }
}