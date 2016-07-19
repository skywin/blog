title: 做一个gulp+webpack+vue的单页应用开发架子
categories:
  - 前端开发
tags:
  - gulp
  - webpack
  - vue
date: 2016-07-19 15:06:56
---
## 1.目标
最近项目上的事情不多，根据我自己的开发习惯，决定开发一些简单的开发架子，方便以后事情多的时候直接套用。本文讲的一个gulp+webpack+vue的单页应用架子，想要达到的目的：
- 可以通过命令打包开发chunk，并支持热替换
- 可以通过命令打包可发布的chunk
- 支持路由
- 路由中的代码实现按需加载
- 用CommonJs的风格组织代码
- 代码结构尽量清晰易懂    

尽我所能先做出一个满足以上特点的架子吧，最近看完ES6，准备再去看看flux和reduce，看过之后再来思考下前端数据如何管理比较科学规范。架子中有做的不规范可改进的地方，烦请大家指出，我好更新。    
首先来看一下整个架子的结构：
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-19/1468898445051.png)
## 2.实现
### 2.1合并库文件
库文件不会随业务代码发生变化，所以所有库文件打包成一个文件就好了，这部分代码需要直接在页面中以`<script></script>`标签引入，不能和业务代码打包到一起。如果和业务代码打包到一起，一旦业务代码发生变化，整个打包的文件在浏览器中都需要被重新加载，这种做法不利于客户端做缓存，也会使webpack打包业务代码的过程变得非常慢，所以这里使用gulp合并一下库文件：
```javascript
/**
 * 合并lib文件
 */
gulp.task('concat-lib',function(){
    gulp.src(['vue/dist/vue.min.js','vue-router/dist/vue-router.min.js'],{
        cwd:'../lib'
    }).pipe(concat('vue.min.js')).pipe(gulp.dest('../release'));
})
```
### 2.2组织业务代码
从上图可以看到，所有的业务开发代码都放在src目录下，展开来看：
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-19/1468898616279.png)
- components目录用来存放公用的vue组件，这块架子中没有，所以是空着的
- css用来存放所有的样式文件，modules和components目录下分别存放各模块和各个组件所使用的样式，app.css是主入口页面样式，main.css是所有样式。把样式集中起来是为了方便样式的打包。
- modules用来存放各个模块的代码，模块的模板和js代码放在同一目录下。
- app.js是程序主入口js，在此文件中定义单页应用的路由，指向各个模块
- index.html是应用主页面

核心代码是这块：
```javascript
var Vue = require('vue')
var VueRouter = require('vue-router');
Vue.use(VueRouter);
var compo1=require('./modules/module1');
require('./css/main.css');

// 路由器需要一个根组件。
// 出于演示的目的，这里使用一个空的组件，直接使用 HTML 作为应用的模板
var App = Vue.extend({})

// 创建一个路由器实例
// 创建实例时可以传入配置参数进行定制，为保持简单，这里使用默认配置
var router = new VueRouter()

// 定义路由规则
// 每条路由规则应该映射到一个组件。这里的“组件”可以是一个使用 Vue.extend
// 创建的组件构造函数，也可以是一个组件选项对象。
// 稍后我们会讲解嵌套路由
router.map({
    '/': {
        component: compo1
    },
    '/path1': {
        component: compo1
    },
    '/path2': {
        component: function (resolve) {
            //amd规范 实现效果：
            //路由1中的模块和主页面模块打包在一起
            //路由2中的模块按需加载
            require(['./modules/module2'],resolve);
            //commonJs规范实现方式:
            //require.ensure([],function(require){
            //    var comm2=require('./components/compo2');
            //    resolve(comm2)
            //});
        }
    }
});
//默认路径
//router.go('/path1');
// 现在我们可以启动应用了！
// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
router.start(App, '#app')
```

默认模块是moduel1，/path1路由指向module1，/path2路由指向module2，module2的模块并不是和module1一样在主页面中一开始就加载好的，而是在路由到此路径后才去加载，app.js中提供了vue组件文档中提供的两种方式：CommonJs和AMD两种规范的方式来加载，两种方式是等价的。

`require('./css/main.css');` 把所有css加载到应用中，以便在开发模式下可以看到样式，在打包发布代码的时候会忽略此require，将样式打包成独立的文件。

### 2.3打包开发代码
打包开发代码的webpack配置是build目录下的webpack.config.dev.js
```javascript
var webpack = require('webpack');
var path=require('path');
module.exports={
    //这里写成数组是为了dev server插入服务配置
    entry: {
        "app":['../src/app.js'],
    },
    output:{
        path:path.resolve(__dirname, "../release"),//__dirname+'/../release',
        publicPath: "/release/",//dev server 会从此路径去拿hot-update.json
        filename:'[name].bundle.js'
    },
    externals: {
        'vue': 'Vue',
        'vue-router':'VueRouter'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {test:/\.html$/,loader:'html-loader'}
        ]
    },
    plugins: [

    ],
    devtool: "source-map"
}
```
程序主入口是app.js，所有entry只需要配置一个app.js。    
output配置中的publicPath是用来配置项目中静态文件路径的，这里开发过程中会使用webpack-dev-server，给配置到release目录下就行了。
externals下面配置的是通过标签引入，可以在全局环境下访问到的变量，可以通过require这里配置的key来获取那些变量。
`devtool: "source-map"` 可以为压缩之后的代码生成source-map文件，这里开发打包的代码并没有被压缩，所以这个其实没意义。
`{test:/\.html$/,loader:'html-loader'}` 是用来在组件中加载html模板的：

![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-19/1468908847635.png)
```javascript
var template=require('./module1.html');
// 定义组件
var comm = Vue.extend({
    template: template,
    data:function () {
        return {
            items:[{a:1,b:2,c:3},{a:4,b:5,c:5},{a:7,b:8,c:9}]
        }
    }
});
```
用上面的配置来打包，就会得到开发版本的打包代码了。

### 2.4使用webpack-dev-server和热替换插件HotModuleReplacementPlugin
为了方便开发调试，需要启动一个server来访问项目，并支持热替换，自动刷新浏览器，以方便修改代码之后能够实时看到效果。
在gulpfile.js做如下配置：
```javascript
ar webpackConfigDev=require("./webpack.config.dev.js");
var WebpackDevServer = require("webpack-dev-server");

/**
 * 使用测试配置打包，启动hot dev server
 */
gulp.task('webpack-dev',['concat-lib'],function(){
    var config = Object.create(webpackConfigDev);
    //这两项配置原本是在webpack.config.dev.js里边配置，可是通过gulp启动devserver，那种配置无效，只能在此处写入
    //官网的解释是webpack-dev-server没有权限读取webpack的配置
    config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    var compiler = webpack(config);
    var server = new WebpackDevServer(compiler, {
        contentBase: "../",
        publicPath: "/release/",
        hot: true,
        compress: false,
        stats: { colors: true }
    });
    server.listen(8080, "localhost", function() {});
    // server.close();
});
```
这样会启动一个本地的8080端口监听，用来访问某个目录下的静态文件
- `contentBase: "../"` 配置，指定了静态文件目录在项目根目录下，所以访问http://localhost:8080 会看到根目录下的文件列表，点进去src目录，就会默认访问index.html，看到单页应用的效果了
- `publicPath: "/release/"` 这个配置很重要，它指定了webpack-dev-server提供的打包静态文件路径，值得注意的是，使用WebpackDevServer的时候，并不会在release目录生成webpack打包文件，只会在内存中生成打包文件，通过localhost:8080/release/ 路径，可以访问到开发打包后的代码。
通过gulp启动此server之后，访问http://localhost:8080/src 路径，可以看到用下面的效果：

![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-19/vuegif.gif)
可以看到，访问主页面的时候，加载了app.bundle.js打包文件，访问路由/path2的时候，才会去加载1.1.bundle.js文件，子组件是延迟2s后才加载的。
更新代码之后，会实时打包并刷新浏览器，看到实时效果。

### 2.5打包生产环境代码
和开发代码不同，生产环境代码具有以下特点：
- 代码需要压缩
- 打包生成的文件名中需要包含文件hash值，以方便控制客户端缓存
- css不能像开发环境那样打包到js代码中，需要打包成独立的文件，在页面开头直接引入
基于以上特点，webpack配置文件如下：
```javascript
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path=require('path');
var cssExtract=new ExtractTextPlugin("[name].[contenthash:8].css");
module.exports={
    entry: {
        index:'../src/app.js'
    },
    output:{
        path:path.resolve(__dirname, "../release"),
        publicPath:"",//TODO 填写生产环境静态文件路径
        filename:'[name].[chunkhash:8].bundle.js'
    },
    externals: {
        'vue': 'Vue',
        'vue-router':'VueRouter'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: cssExtract.extract("style-loader", "css-loader") },
            {test:/\.html$/,loader:'html-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true,
                warnings: false
            }
        }),
        cssExtract
    ]
}
```
其中publicPath是填写静态文件路径的，如果图片或其他静态资源需要存放在CDN服务器上，可以把CDN地址配置到这里。
生成打包文件之后，可以通过gulp替换掉主入口文件 index.html里面的静态文件路径，这里通过webpack模板也可以完成此工作，但配置较为繁琐，个人感觉还是通过gulp来替换比较方便一点：
```javascript
gulp.src('../src/index.html')
        //.pipe(greplace(/xxxxx/g,"xxxxx"))
        .pipe(gulp.dest('../release'));
```
打包后的代码：
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-19/1468911336639.png)
后面的步骤就是上传静态文件到CDN或其他上线流程了，这里可以通过根据自己业务编写的gulp插件来完成，大家业务不同，处理方式不尽相同，我就不继续往下写了。

## 3.把命令都整合到npm中
我个人不太喜欢项目根目录下一堆跟打包相关的文件，所以在这个项目中，我把所有跟打包相关的文件都放到了build目录下，然后在package.json中：
```json
"scripts": {
    "dev": "gulp default --gulpfile build/gulpfile.js",
    "build": "gulp build --gulpfile build/gulpfile.js",
    "release": "gulp release --gulpfile build/gulpfile.js"
  },
```
这样就可以使用npm命令来执行上面的操作了：
`npm run dev` 启动webpack-dev-server，使用开发webpack配置来打包代码，支持热替换
`npm run build` 打包开发代码
`npm run release` 打包生产环境代码

## 4.后续
对于一个可用单页应用而言，这个架子可能还缺着很多东西，对前端数据流程的管理、网络请求的管理、公共组件的组织等，在以后的项目中都会加上这些东西，用到了再往里边更新吧！

代码地址：https://github.com/zouchengzhuo/scaffold/tree/master/gulp-webpack-vue