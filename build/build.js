var webpack = require('webpack')
var webpackConfig = require('./webpack.config')

webpack(webpackConfig, (err, stats) => {
    if(err) {
        console.error('build error')
    } else {
        console.log('build success')
    }
})