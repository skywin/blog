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
        path:"./dist/js",
        publicPath: '/dist/js/',
        filename:"main.js"

    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()  // 发生错误时不加载
    ],
    module:{
        loaders:[
            { test: /\.css$/, loader: 'style-loader!css-loader!resolve-url-loader' },
            { test:/\.js[x]?$/,exclude:/lib|node_modules/,loader:"babel-loader?presets[]=es2015&presets[]=react"},
            /*{ test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, loader: 'file-loader' }*/

            //打包字体文件
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            }
        ]
    },

    //在nw中运行时启用
    target: 'node-webkit'
}