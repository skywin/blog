title: nodejs模块发布及命令行程序开发
categories:
  - nodejs
tags:
  - nodejs
  - npm
date: 2016-02-17 18:01:17
---
# 前置技能
*  npm工具为nodejs提供了一个模块和管理程序模块依赖的机制，当我们希望把模块贡献出去给他人使用时，可以把我们的程序发布到npm提供的公共仓库中，为了方便模块的管理，npm规定要使用一个叫package.json的文件来描述我们模块的名称、版本等信息。    
* 我们贡献出去的程序模块，可能也依赖了别人所编写的模块，所以需要在package.json中写明我们依赖了哪些模块，便于别人安装。    
* 简单的nodejs程序可以通过 node xxx.js 来运行，当我们希望直接在控制台中使用xxx命令运行nodejs程序时，需要创建一个cmd命令文件(windows下)，并把它放到path路径下，npm提供了一个自动完成这个工作的流程，这个也是在package.json里边配置的。

基于以上几点，我觉得有必要挨个理解一下package.json里边的配置项：[我理解翻译的package.json文档](http://zoucz.com/blog/2016/02/17/npm-package)    
# 模块发布   
发布一个npm模块非常简单。
## 注册npm账户    
这个账户注册体验多好啊，不过记得密码别搞忘记了。   
npm adduser    
Username: zoucz   
Password: \*\*\*\*\*\*   
Email: 405966530@qq.com   
## 创建一个测试模块   
新建一个文件夹，npm init，一路enter ，要注意的是name不能是已经被别人抢占的，可以到[http://npmjs.org](http://npmjs.org)这里查询。   
此时文件夹下会生成一个package.json文件，如果看过package.json里边配置的含义，这里就比较好理解了。  
新建一个index.js，内容如下：    
![](http://zoucz.com/blogimgs/2016-02-17/1455699748299.png)    
此时模块就创建完毕了，简单吧！    
## 发布模块   
在刚刚新建的文件夹下打开cmd，运行npm publish ，模块发布完毕！
要注意的是每次发布的时候都需要增加版本号。  
此时在[http://npmjs.org](http://npmjs.org)这里就可以查询到刚刚发布的模块了，我测试模块名称是zoucz，那么此时别人也可以通过 npm install zoucz来使用我发布的模块了。    
# 开发控制台命令程序   
以windows下为例，我们怎么样才能创建一个cmd命令呢？  

1.在环境变量里边添加一段：";D:/test"  

2.在d盘test目录下创建一个mycmd.cmd文件  

这时就可以使用mycmd命令了。那么要怎么在cmd中调用node程序呢？ 很简单：  

3.在那个mycmd.cmd文件里边写上  node path/to/xxx.js，就可以了。 

使用npm创建控制台命令程序，我们不需要自己完成上面的步骤，只需要增加一行配置就可以了  

## 添加要执行的nodejs代码文件   
在模块根目录下添加bin目录   
![](http://zoucz.com/blogimgs/2016-02-17/1455701588490.png)   
新建zoucz.js内容如下：   

``` javascript
#!/usr/bin/env node
var util=require("util");
console.log("hello,i'm zouchegnzhuo,you can type command name/site/email");
var cmd=process.argv[2];
if(cmd){
    switch(cmd){
        case "name":
            console.log("邹成卓");
            break;
        case "site":
            console.log("http://zoucz.com");
            break;
        case "email":
            console.log("405966530@qq.com");
            break;
    }
}
```
要注意的是，文件首行的 **<span style='color:red'>\#!/usr/bin/env node</span>** 一定要添加 ，这一行的意思是生成cmd文件的时候用什么路径的什么程序来运行上面的代码，文章末尾的demo中给出了不加的后果。    
## 在package.json中配置bin   
在package.json中配置   
![](http://zoucz.com/blogimgs/2016-02-17/1455701982810.png)   
模块在npm install的时候会生成zoucz和zoucz\_err两个cmd文件。    
## 发布模块    
添加好上面的配置后，发布模块，别的码农就可以安装使用此命令了。   
## 安装使用控制台命令程序   
在cmd中 npm install -g zoucz ，就可以安装上面的模块，安装完成后可以使用zoucz命令和zoucz\_err命令。   
![](http://zoucz.com/blogimgs/2016-02-17/1455702296719.png)   

zoucz\_err是没有在js文件首行写\#!/usr/bin/env node的后果：   
![](http://zoucz.com/blogimgs/2016-02-17/1455702357644.png)   
运行命令之后：     
![](http://zoucz.com/blogimgs/2016-02-17/1455702374632.png)    

我们顺着图片中的路径，在C:\Users\czzou\AppData\Roaming\npm目录下可以找到npm为我们创建的cmd文件路径：   
![](http://zoucz.com/blogimgs/2016-02-17/1455702446611.png)    
可以看到npm创建cmd文件的同时也创建了linux下使用的文件。  
现在来看一下为什么执行zoucz\_err会报错，分别打开两个cmd文件：   
zoucz.cmd   
![](http://zoucz.com/blogimgs/2016-02-17/1455702842735.png)  
zoucz\_err.cmd   
![](http://zoucz.com/blogimgs/2016-02-17/1455702869691.png)   
后者压根就没有用node去执行那段代码，当然会报错了~   
这里要注意的是npm install -g  全局安装的时候，cmd文件是被创建在上面的路径下的，如果没有-g选项，局部安装，则会被创建在项目根目录node\_modules/.bin 目录下。    
# 最后   
npm可以帮我们做很多事情，做node开发的同学们都有必要花时间慢慢把npm的文档啃完[https://docs.npmjs.com](https://docs.npmjs.com)   
本文所使用的demo地址：[https://github.com/zouchengzhuo/nodejsLearn/tree/master/zoucz](https://github.com/zouchengzhuo/nodejsLearn/tree/master/zoucz)       