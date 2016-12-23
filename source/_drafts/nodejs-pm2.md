title: nodejs进程管理工具pm2
categories:
  - nodejs
tags:
  - nodejs
date: 2016-12-22 18:57:47
---
# nodejs存在的问题问题
nodejs作为一种单线程、单进程运行的程序，如果只是简单的使用的话，存在着如下一些问题：
- 无法充分利用多核cpu机器的性能，
- 服务不稳定，一个未处理的异常都会导致整个程序退出
- 没有成熟的日志管理方案、
- 没有服务/进程监控机制

所幸无论是nodejs本身还是强大的nodejs社区，已经有了很多比较成熟的方案来解决这些问题。

# cluster模块
从某个版本开始，nodejs提供了cluster模块来fork出多个工作线程：
```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);
}
```
由主进程fork出很多的工作进程，运行我们的业务代码，主线程会持有IO句柄，将任务根据round-robin算法分发给work进程去处理。

# pm2模块
pm2是一个开源的nodejs进程管理模块，nodejs本身的cluster提供了进程管理的基础功能，pm2则对其进行了强大的封装，并提供了方便命令行程序，使用起来非常方便。其github地址：[https://github.com/Unitech/pm2](https://github.com/Unitech/pm2 "https://github.com/Unitech/pm2")

安装pm2： `npm install pm2 -g`    
下面简单记录一下我平时比较常用的pm2命令

## 启动多个工作进程
`pm2 start server.js -i 5`    
此命令可以启动5个工作进程来运行我们的业务代码，且让nodejs程序在后台运行，提供异常退出拉起、日志、进程监控等功能。

## 扩容进程
`pm2 scale [app-name] 10 `    
将一个服务的进程扩容到10个

## 查看后台运行的服务、进程列表    
`pm2 list`    
执行此命令可查看当前正在后台运行的服务列表及其进程列表：    
![](D:\zoucz\nw_blog_creator/../source/blogimgs/2016-12-22/1482403299552.png)

## 停止服务
`pm2 stop [app-name]`    
停止名字为 app-name 的服务    
`pm2 stop all`    
停止所有服务

## 删除服务
`pm2 delete [app-name]`    
从列表中删除并停止名为app-name的服务    
`pm2 delete all`    
从列表中删除并停止所有服务的所有进程

## 查看日志
`pm2 logs [app-name]`    
查看名为app-name的服务的log
`pm2 logs all`    
查看所有服务的log

## 查看进程监控
`pm2 monit [app-name]`    
查看服务各进程的运行情况：
![](D:\zoucz\nw_blog_creator/../source/blogimgs/2016-12-22/1482403558500.png)    

## 查看服务详情
`pm2 show [app-name] `    
此命令会显示该服务所有进程的详细信息：    
![](D:\zoucz\nw_blog_creator/../source/blogimgs/2016-12-22/1482403654426.png)

## 代码热替换    
`pm2 start app.js --watch `    
此功能在项目开发阶段使用比较方便,其功能是在代码发生变化的时候立即自动重启服务使新代码生效。
可以在package.json中配置watch选项：
```json
{
  "watch": ["server", "client"],
  "ignore_watch" : ["node_modules", "client/img"],
  "watch_options": {
    "followSymlinks": false
  }
}
```
详见：[http://pm2.keymetrics.io/docs/usage/watch-and-restart/](http://pm2.keymetrics.io/docs/usage/watch-and-restart/ "http://pm2.keymetrics.io/docs/usage/watch-and-restart/")
