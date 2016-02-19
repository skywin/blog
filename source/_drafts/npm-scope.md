title: 理解nodejs模块的scope
categories:
  - nodejs
tags:
  - nodejs
  - npm
  - npm-scope
date: 2016-02-18 11:20:47
---
# 描述
原文档地址：[https://docs.npmjs.com/misc/scope](https://docs.npmjs.com/misc/scope)  

所有npm模块都有name，有的模块的name还有scope。scope的命名规则和name差不多，同样不能有url非法字符或者下划线点符号开头。scope在模块name中使用时，以@开头，后边跟一个/ 。package.json中，name的写法如下：  

> @somescope/somepackagename

scope是一种把相关的模块组织到一起的一种方式，也会在某些地方影响npm对模块的处理。  

npm公共仓库支持带有scope的的模块，同时npm客户端对没有scope的模块也是向后兼容的，所以可以同时使用两者。  

# 安装带有scope的模块
带有scope的模块安装在一个子目录中，如果正常的模块安装在node\_modules/packagename目录下，那么带有scope的模块安装在node\_modules/@myorg/packagename目录下，@myorg就是scope前面加上了@符号，一个scope中可以包含很多个模块。  

安装一个带有scope的模块：  

> npm install @myorg/mypackage

在package.json中写明一个依赖:  

> "dependencies": {
>   "@myorg/mypackage": "^1.3.0"
> }

如果@符号被省略，那么npm会尝试从github中安装模块，在npm install命令的文档中有说明  [https://docs.npmjs.com/cli/install](https://docs.npmjs.com/cli/install)  

# require带有scope的模块  
在代码中require一个含有scope的模块：  

> require('@myorg/mypackage')

nodejs在解析socpe模块的时候，并没有把它当做一个有什么蹊跷的东西来处理，仅仅是按照路径去找@myorg目录下的mypackage模块。  
# 发布带有scope的模块  
带有scope的模块可以被发布到任意支持socpe模块的npm仓库，包括npm公共仓库，公共仓库从2015-04-19就开始支持带有scope的模块了。 

如果有必要，可以把某个scope关联到某个仓库，见下面的说明。  

如果要发布一个公共socpe模块，你必须在最开始发布的时候指定--access public。这样会让模块能被公开使用，就像在publish之后运行了 npm access public命令一样。  

如果要发布私有模块，那么你必须有一个npm私有模块账户，可以选择自己搭建一个npm服务，或者直接使用官方的，官方的需要支付7刀/月。  

发布私有模块的命令：  

> npm publish 

或者

> npm publish --access restricted 。

即发布socpe模块时，默认就是restricted的。  
这些在npm publish文档里边可以看到详细说明。 [https://docs.npmjs.com/cli/publish ](https://docs.npmjs.com/cli/publish )
# 将一个scope和一个仓库关联  

scope可以和一些自己搞的npm仓库关联起来。这样你就可以同时使用npm公共仓库和一些其他的私有仓库中的模块，例如企业npm。  
可以用npm login把scope关联到一个仓库：  

> npm login --registry=http://reg.example.com --scope=@myco   
 
scope和仓库可以是一个多对一的关系：一个仓库里边可以放多个scope，但是一个scope同时只能放在一个仓库中。  
也可以用npm config把scope关联到一个仓库：  

> npm config set @myco:registry http://reg.example.com

当一个scope关联到一个私有仓库之后，该scope下的模块在npm install的时候都会从它关联的仓库中获取模块，而不是npm配置的仓库，发布的时候也是同样的道理，会发布到它关联的仓库而不是npm配置的仓库。  

# 相关文档  
* [npm-install](https://docs.npmjs.com/cli/install)    
* [npm-publish](https://docs.npmjs.com/cli/publish)    
* [npm-access](https://docs.npmjs.com/cli/access)  