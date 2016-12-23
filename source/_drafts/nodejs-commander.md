title: nodejs命令行应用程序管理模块commander
categories:
  - nodejs
tags:
  - nodejs
date: 2016-12-23 17:09:33
---
记得曾经写过一篇使用nodejs开发命令行程序的文章：[http://zoucz.com/blog/2016/02/17/node-cmd-app/](http://zoucz.com/blog/2016/02/17/node-cmd-app/ "http://zoucz.com/blog/2016/02/17/node-cmd-app/")    
在这篇文章的demo文章中，我是这样管理命令行参数的：    
```javascript
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
当我们使用例如这样`node test01.js -b -p -P -c czzou`的命令来运行nodejs程序，在程序中可以通过`process.argv`来获取请求参数，打印出这些参数，可以看到：    
`console.log(process.argv);`    
```json
[ 'C:\\Program Files\\nodejs\\node.exe',
  'D:\\learn\\nodejsLearn\\commanderLearn\\test01.js',
  '-b',
  '-p',
  '-P',
  '-c',
  'czzou' ]

```
我们在命令行程序中需要解析这些命令来设置一些属性，执行一些操作，或者输出命令帮助信息等，每次自己去写一堆代码处理这些逻辑，每个人的方法还各自不同，是不是显得有点too young too native啊！     
实际上nodejs社区里边已经有了比较成熟的命令行管理工具，例如我今天学的这一款：[https://github.com/tj/commander.js](https://github.com/tj/commander.js "https://github.com/tj/commander.js")，下面跟着官方示例来学习一下这个模块的用法。

# 命令解析、参数解析
可以看看下面这个demo
```javascript
#!/usr/bin/env node

var program = require('commander');

program
  .version('0.0.1')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

console.log('you ordered a pizza with:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese);
```
## .version函数，设置版本号
接收一个字符串作为版本号，运行`node test01.js --version/-V`命令时，会在控制台中输出此版本号。    
    
## .option函数，接收命令设置属性
接收三个参数：接收命令，多个命令以逗号分隔、命令描述、命令参数默认值。    
`-c, --cheese [type]` 中括号括起来的属性代表此命令可以接收参数，如果命令不能接收参数，则受到此命令时，命令属性为true，否则为false，如果命令可以接收参数，则命令属性值为命令中输入的值。    
这里注意：**尖括号代表必须输入的命令参数，中括号代表可选的命令参数**

## .parse函数
`.parse(process.argv)` 传入process.argv给commander模块以解析。

上面的demo以命令`node test01.js -b -p -P -c czzou`运行的结果：    
    - you ordered a pizza with:
    - peppers
    - pineapple
    - bbq
    - czzou cheese

## option函数命令参数Parse函数
commander允许用户自行限制命令输入的参数类型，option函数的第三个参数可以用来传入一个函数来处理用户输入的命令，用法如下：
```javascript
function range(val) {
  return val.split('..').map(Number);
}

function list(val) {
  return val.split(',');
}

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function increaseVerbosity(v, total) {
  return total + 1;
}

program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-i, --integer <n>', 'An integer argument', parseInt)
  .option('-f, --float <n>', 'A float argument', parseFloat)
  .option('-r, --range <a>..<b>', 'A range', range)
  .option('-l, --list <items>', 'A list', list)
  .option('-o, --optional [value]', 'An optional value')
  .option('-c, --collect [value]', 'A repeatable value', collect, [])
  .option('-v, --verbose', 'A value that can be increased', increaseVerbosity, 0)
  .parse(process.argv);

console.log(' int: %j', program.integer);
console.log(' float: %j', program.float);
console.log(' optional: %j', program.optional);
program.range = program.range || [];
console.log(' range: %j..%j', program.range[0], program.range[1]);
console.log(' list: %j', program.list);
console.log(' collect: %j', program.collect);
console.log(' verbosity: %j', program.verbose);
console.log(' args: %j', program.args);
```
## 通过正则表达式限定命令参数
除了传入函数来Parse参数，option函数还支持用正则表达式限定参数：
```javascript
program
  .version('0.0.1')
  .option('-s --size <size>', 'Pizza size', /^(large|medium|small)$/i, 'medium')
  .option('-d --drink [drink]', 'Drink', /^(coke|pepsi|izze)$/i)
  .parse(process.argv);

console.log(' size: %j', program.size);
console.log(' drink: %j', program.drink);
```

# 命令执行
## 命令执行函数
通过command函数和action函数配合，可以做命令执行的功能：
```javascript
#!/usr/bin/env node

var program = require('commander');
program
  .version('0.0.1')
  .command('rmdir')
  .action(function () {
    console.log('rmdir');
  });
program.parse(process.argv);
```
这种方式即可定义一个rmdir命令，用户输入此命令之后执行传入.action函数的回调函数

## 命令执行函数参数
```javascript
#!/usr/bin/env node

var program = require('commander');

program
  .version('0.0.1')
  .command('rmdir <dir> [otherDirs...]')
  .action(function (dir, otherDirs) {
    console.log('rmdir %s', dir);
    if (otherDirs) {
      otherDirs.forEach(function (oDir) {
        console.log('rmdir %s', oDir);
      });
    }
  });

program.parse(process.argv);
```
同上一节命令解析中的参数解析一样，执行命令时也可以传入参数，后边的`[otherDirs...]`表示一个可变参数，可以接收任意多个用户传入的参数。    
输入命令：`node test02.js rmdir aaa bbb ccc`,得到结果：    
    - rmdir aaa
    - rmdir bbb
    - rmdir ccc

## 子命令文件执行
```javascript
#!/usr/bin/env node

var program = require('commander');

program
    .version('0.0.1')
    .command('install [name]', 'install one or more packages', {isDefault: true})
    .command('search [query]', 'search with optional query')
    .command('list', 'list packages installed')
    .parse(process.argv);
```
这种情况，需要执行命令，还带有命令说明语句的，commander是不支持直接写上回调的！这里我觉得很奇怪，不知道为啥要这样设计。。。   
官方推荐的做法是，在另一个文件中定义子命令：    
例如，刚刚的文件名为 `pm.js` ，则在同级目录可新建一个文件 `pm-install.js`，用来执行install命令，其写法及参数接收方法为：    
```javascript
#!/usr/bin/env node

var program = require('commander');

program
    .option('-f, --force', 'force installation')
    .parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
    console.error('packages required');
    process.exit(1);
}

console.log();
if (program.force) console.log('  force: install');
pkgs.forEach(function(pkg){
    console.log('  install : %s', pkg);
});
console.log();
```


# 设定命令格式，接收满足格式的命令
```javascript
#!/usr/bin/env node

var program = require('../');

program
  .version('0.0.1')
  .arguments('<cmd> [env]')
  .action(function (cmd, env) {
     cmdValue = cmd;
     envValue = env;
  });

program.parse(process.argv);

if (typeof cmdValue === 'undefined') {
   console.error('no command given!');
   process.exit(1);
}
console.log('command:', cmdValue);
console.log('environment:', envValue || "no environment given");
```
![](D:\zoucz\nw_blog_creator/../source/blogimgs/2016-12-23/1482478048931.png)

# 启用--harmony模式
在低版本的nodejs上，若想启用es6的部分新特性，可以使用--harmony模式。 启用--harmony有两种方法：    
- 文件首行加上 `#! /usr/bin/env node --harmony`    
- 使用这样的命令启动node程序 `node --harmony examples/pm publish`    

# 输出帮助信息
commander提供了自动输出帮助信息的能力：    
`xxx -h  或者  xxx --help`：    
![](D:\zoucz\nw_blog_creator/../source/blogimgs/2016-12-23/1482483238087.png)

有此利器，用nodejs开发命令行程序那是简单又顺手啊 ：）
