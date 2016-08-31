title: vue与chrome浏览器插件开发
categories:
  - 前端杂烩
tags:
  - 前端开发
  - 浏览器插件
date: 2016-08-31 11:44:14
---
项目中需要从百度图片和谷歌图片批量抓取一系列关键词的图片，而且需要是大图资源，不能是缩略图。    
在后端通过http请求直接拉取内容抓取，遇到下面两个问题：
- 有的大图地址是在前端通过脚本生成的，拉取页面内容之后无法直接得到大图地址
- 翻页请求并不是简单的pageindex++，拿到下一页内容。抓取第一页后边的内容也需要分析翻页请求链接组装，以及返回的数据如何解析。    

这两个问题导致通过后端爬取大图列表十分困难。于是我想起了以前玩过的杂技——浏览器插件。通过javascript控制浏览器打开网页，搜索关键词，页面渲染完毕之后拿到大图地址，第一页拿完之后让页面滚动到底部，继续加载图片，and so on!直到拿到足够数量的图片。    
做完这个小工具，想着总结一下经验，加深点印象，免得以后某一天有需要再来做的时候一脸懵逼，于是抽时间慢慢写下这边文章记录一下我对浏览器插件的认识。

# 什么是chrome浏览器插件
![](http://zoucz.com/blogimgs/2016-08-30/1472541011802.png)
地址栏右侧那些icon就是一个个浏览器插件。点击插件图标可以弹出插件窗口。
我所理解的chrome浏览器插件功能有三大块：
- 弹出一个窗口，让用户执行操作，或者显示信息
- 向网页中注入脚本文件，执行某些功能
- 调用chrome提供的native api，执行浏览器tab页开关、窗口开关、文件下载等操作

如上图腾讯电脑管家的插件，就是用来提供广告过滤功能的。它的工作原理应该就是给需要过滤的网址插入一段脚本，来把页面上的广告标签干掉。

# chrome插件开发
文档地址：[https://developer.chrome.com/extensions/overview](https://developer.chrome.com/extensions/overview "https://developer.chrome.com/extensions/overview")
## 代码模块
chrome插件完全由javascript、html、css开发，和上面的插件功能相对应，代码也可以分为三大模块：
- popup 弹出窗口代码集合。弹窗UI通过html+css开发，弹窗中也可以引用js脚本来控制交互操作。每个弹窗都相当于一个独立的tab页，运行在其中的js脚本拥有一个独立的上下文。
- inject.js。注入网页文件的脚本。需要注意的是，注入的脚本上下文也是独立的，它可以操作目标网页DOM，但是并不在目标网页脚本的上下文中。
- background.js。插件后台脚本，拥有独立的上下文，且此上下文是唯一的，无论浏览器打开多少个tab页，background.js的上下文都不会变化，除非关闭浏览器。

这三块代码之间的关系我画了个图方便理解：
![](http://zoucz.com/blogimgs/2016-08-30/1472543851862.png)

图中，黑色的部分代表chrome原生部分，其他的每一个方块都拥有一个独立的javascript上下文。
## manifest.json
chrome插件有一个比较重要的配置文件，manifest.json，用来指定各个模块的代码文件名、插件权限、插件图标、inject脚本插入时机等
```json
{
  "name": "imagefetcher",
  "version": "0.0.1",
  "manifest_version": 2,
  "description": "抓取图片网站大图文件",
  "background": { "scripts": ["dist/background.js"] },
  "icons": { "16": "icon.jpg",
    "48": "icon.jpg",
    "128": "icon.jpg" },
  "permissions": [
    "tabs","downloads",
    "http://*.baidu.com/",
    "http://*.google.com.hk/"
  ],
  "browser_action": {
    "default_icon": "icon.jpg" ,
    "default_title": "抓取图片",
    "default_popup": "index.html"
  },
  "content_scripts":[{
    "run_at":"document_end",
    "matches":["<all_urls>"],
    "js":["lib/jquery-2.0.0.min.js", "dist/inject.js"]
  }]
}
```
background指定background代码文件路径；content_scripts指定inject的脚本列表，以及注入的条件、注入时机；browser_action中的default_popup指定popup弹出的html文件路径；permissions指定能访问的网页或chrome提供的一些功能的权限；icons指定插件图标。

## 模块间通信
按照上面的结构，很容易可以联想到各个模块的分工：    
**popup模块** 的代码负责显示弹窗，让用户输入关键词，下发开始抓取指令；显示抓取进度；下发下载指令。  
**inject.js**负责分析网页的DOM，拿到大图资源链接，并翻页，直到获取足够数量的图片。    
**background.js**负责汇总各个网页抓取的结果，并将结果显示到弹窗中。    
由于这些脚本拥有各自的执行上下文，并不能通过直接调用函数的方式来通信，所以我们需要通过chrome提供的方式来进行模块间的通信。
### 与background的通信
在popup中或者inject中发出消息给background接收。
```javascript
chrome.runtime.sendMessage({action:ACTION.START_FETCH,data:xxxx});
```
sendMessage函数还可以接受一个回调函数，处理收到消息之后处理的返回结果。    `rome.runtime.sendMessage(string extensionId, any message, object options, function responseCallback)`

在background.js中监听消息：
```javascript
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
    var data=request.data;
    var fetch;
    if(data.tab_id){
        fetch=window.FETCH_ITEMS.getByTabId(data.tab_id);
    }
    //开始抓取消息，读取抓取队列的第一个，开始抓取，抓取完成之后继续读
    if(request.action==ACTION.START_FETCH){
        __fetch_list.push(data);
        readFetchList();
    }
    else if(request.action==ACTION.FETCH_PROGTRESS){
        fetch.urls=data.urls;
    }
    //抓取完成，修改fetch_item状态，若存在弹窗，通知弹窗刷新视图
    else if(request.action==ACTION.FETCH_SUCCESS){
        fetch.status=DOWNLOAD_STATUS.SUCCESS;
        fetch.urls=data.urls;
    }
});
```
### 与inject的通信
要指挥inject的脚本执行一些操作，必须给inject发消息，而inject是注入网页中的，所以发消息第一步必须先获取tab页的tabid，然后将消息发给特定的tab页。
在background中发出消息：
```javascript
chrome.tabs.getSelected(function(tab){
    chrome.tabs.sendMessage(tab.id, data, function(response) {
        console.log(response);
    });
});
```
inject中接收消息：
```javascript
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    var data=request.data;
    //开始抓取
    if(request.action==ACTION.START_FETCH){
        var site=SITES.getSite(data.site);
        if(!site){
            sendResponse({err:1,message:"未实现此网页抓取"});
            return;
        }
        sendResponse({err:0});
        fetcher=require('./fetchors/'+data.site);
        fetcher(data).then(function(urls){
            data.urls=urls;
            chrome.runtime.sendMessage({action:ACTION.FETCH_SUCCESS, data:data}); //发送给background
        }).done()
    }
});
```
## 调试
不能调试还写什么代码！ chrome插件的三大模块也是可以调试的，只不过都藏在各种犄角旮旯里边，下面扒一扒怎么分别给他们打断点。
### background
打开`chrome://extensions/`
![](http://zoucz.com/blogimgs/2016-08-31/1472614775230.png)
点“检查视图”后边的链接，就可以打开控制台了，在source里边打上断点，调试走起
### popup
![](http://zoucz.com/blogimgs/2016-08-31/1472614858204.png)
在插件图标上右键——审查弹出内容，打开控制台，在source里边打上断点，调试走起
### inject
![](http://zoucz.com/blogimgs/2016-08-31/1472614946123.png)
按F12打开被注入的页面的控制台，点Sources，点右侧中间的Content Scripts，就可以看到这个页面被那些插件注入了脚本了，根据名称找到自己的脚本，打上断点，调试走起
# 使用vue开发chrome插件
## vue带来的好处
### 干掉DOM操作
我开发的chrome插件是一个用来完成图片下载任务的插件。抓取过程中，需要显示抓取进度，并可以进行删除下载，其中涉及很多DOM操作。使用vue可以减少大量的dom操作代码，这个不细讲，参见[http://vuejs.org/guide/](http://vuejs.org/guide/ "http://vuejs.org/guide/")
![](https://raw.githubusercontent.com/zouchengzhuo/BigImageFetcher/master/guide/fetch.gif)
### 干掉复杂的通信
这个是我觉得用vue开发chrome插件最有价值的部分了，前边介绍了插件几大模块之间的通信，需要调用chrome提供的接口进行频繁的发送消息和监听处理。    
通过
```javascript
chrome.extension.getBackgroundPage()
```
可以拿到插件background脚本的window对象，注意这个background的执行上下文是只有一个的，所以在插件运行期间我们可以用它来存储各个tab页抓取回来的数据。
在popup的脚本中：
```javascript
var FETCH_ITEMS=chrome.extension.getBackgroundPage().FETCH_ITEMS;
var vm=new Vue({
    el: '#wrapper',
    data: {
        FETCH_ITEMS: FETCH_ITEMS
    },
    methods:{
    }
});
```
这样，将从各个tab页抓取回来的数据push到background.js暴露出来的一个对象中，popup弹出的网页中就可以实时显示抓取进度了，不需要在popup和background之间编写大量的通信代码。
至于各个tab页和background之间的通信，可以使用上面chrome提供的通信方式，也可以自己拿到background的window对象暴露出的变量，再进行操作。这里并没有复杂的视图更新和用户操作，所以怎么通信都无所谓了~
## 代码结构
![](http://zoucz.com/blogimgs/2016-08-31/1472613641660.png)
按照上面理解的结构，每个模块的代码集中到一起。
另外，插件中也允许根据路径直接访问插件中的资源，其路径是“chrome-extension://[extensionId]/[resourceName]” 。
select目录中存放的是一个用来筛选图片的页面代码，在popup页面中直接跳转到`/select.html`即可打开此页面。    


插件开发完成打包之后，把这些资源放到一个文件夹中    
![](http://zoucz.com/blogimgs/2016-08-31/1472613890160.png)
然后打开`chrome://extensions/`
![](http://zoucz.com/blogimgs/2016-08-31/1472613951515.png)
选择上面的目录即可看到地址栏右侧出现插件的图标。

## 坑
初次在chrome插件开发中使用vue的时候，遇到了这样一个问题：
![](http://zoucz.com/blogimgs/2016-08-31/1472614093409.png)
模型更新了，视图始终不更新，然后打开调试界面后运行`vm.$mount("#wrapper");`，视图却更新了。
百思不得其解，google之，发现chrome插件中有些javascript代码写法和正常环境中有所不同，幸好vue居然贴心的为这种情况准备了一个特殊的包，不然就前功尽弃了 :(    
这里总结了一个经验，用前端框架开发的过程中最好不要使用.min的包，打包好的代码里边会去掉一些警告的逻辑...  把.min包替换成非压缩包之后，看到了这个错误：    
![](http://zoucz.com/blogimgs/2016-08-31/1472614357135.png)
根据提示，在vue的项目里边找到了一个叫CSP的分支
[https://github.com/vuejs/vue/tree/csp/dist ](https://github.com/vuejs/vue/tree/csp/dist  "https://github.com/vuejs/vue/tree/csp/dist ")
![](http://zoucz.com/blogimgs/2016-08-31/1472614418582.png)
看文档说明，果然就是为插件开发定制的啊！ 没想到那么偏门的场合他们也有关注到！

# 成品
[https://github.com/zouchengzhuo/BigImageFetcher](https://github.com/zouchengzhuo/BigImageFetcher "https://github.com/zouchengzhuo/BigImageFetcher")    
抓取的资源路径都是源站的，所以并不用担心百度和google会封IP，可以放心抓取~
