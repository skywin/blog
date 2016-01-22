/**
 * Created by czzou on 2016/1/20.
 */
var webpack = require('webpack');
var path=require('path');
module.exports={
    entry: [
            'webpack/hot/dev-server',
            'webpack-dev-server/client?http://localhost:8080',
            './src/js/index.js'
        ],
    output:{
        //配合gulp使用的时候注释掉path配置，生成目录在gulp中配置
        //path:"./dist/js",
        publicPath: '/dist/js/',
        filename:"[name].js"

    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()  // 发生错误时不加载
    ],
    module:{
        loaders:[
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {test:/\.js[x]?$/,exclude:/lib|node_modules/,loader:"babel-loader?presets[]=es2015&presets[]=react"}
        ]
    },
    //在nw中运行时启用
    target: 'node-webkit'
}