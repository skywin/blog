title: 详解Javascript中正则表达式的使用
categories:
  - 前端开发
tags:
  - javascript
  - 正则表达式
date: 2016-01-29 14:07:32
---
本文章转自我的博客园博客 [原文地址](http://www.cnblogs.com/tzyy/p/4927476.html)     

正则表达式用来处理字符串特别好用，在JavaScript中能用到正则表达式的地方有很多，本文对正则表达式基础知识和Javascript中正则表达式的使用做一个总结。

第一部分简单列举了正则表达式在JavaScript中的使用场景；第二部分详细介绍正则表达式的基础知识，写出一些例子方便理解。

本文的内容是我自己看完正则表达式写法，和犀牛书中js正则表达式的章节后的总结，所以内容可能会有疏漏和不严谨的地方。若有大神路过发现文中错误的地方，欢迎斧正！

# Javascript中正则表达式的使用

一个正则表达式可以认为是对一种字符片段的特征描述，而它的作用就是从一堆字符串中找出满足条件的子字符串。比如我在JavaScript中定义一个正则表达式：

``` javascript
var reg=/hello/    或者  var reg=new RegExp("hello")
```

那么这个正则表达式可以用来从一堆字符串中找出 hello 这个单词。而“找出”这个动作，其结果可能是找出第一个hello的位置、用别的字符串替换hello、找出所有hello等等。下面就列举一下JavaScript中可以使用正则表达式的函数，简单介绍一下这些函数的作用，更复杂的用法会在第二部分中介绍。

## String.prototype.search方法
用来找出原字符串中某个子字符串首次出现的index，没有则返回-1


``` javascript
"abchello".search(/hello/);  //  3
```

## String.prototype.replace方法
用来替换字符串中的子串


``` javascript
"abchello".replace(/hello/,"hi");   //  "abchi"
```

## String.prototype.split方法
用来分割字符串


``` javascript
"abchelloasdasdhelloasd".split(/hello/);  //["abc", "asdasd", "asd"]
```

## String.prototype.match方法
用来捕获字符串中的子字符串到一个数组中。默认情况下只捕获一个结果到数组中，正则表达式有”全局捕获“的属性时(定义正则表达式的时候添加参数g)，会捕获所有结果到数组中


``` javascript
"abchelloasdasdhelloasd".match(/hello/);  //["hello"]
"abchelloasdasdhelloasd".match(/hello/g);  //["hello","hello"]
```

作为match参数的正则表达式在是否拥有全局属性的情况下，match方法的表现还不一样，这一点会在后边的正则表达式分组中讲到。

## RegExp.prototype.test方法
用来测试字符串中是否含有子字符串


``` javascript
/hello/.test("abchello");  // true
```

## RegExp.prototype.exec方法
和字符串的match方法类似，这个方法也是从字符串中捕获满足条件的字符串到数组中，但是也有两个区别。

1. exec方法一次只能捕获一份子字符串到数组中，无论正则表达式是否有全局属性

``` javascript
var reg=/hello/g;
reg.exec("abchelloasdasdhelloasd");   // ["hello"]
```

2. 正则表达式对象(也就是JavaScript中的RegExp对象)有一个lastIndex属性，用来表示下一次从哪个位置开始捕获，每一次执行exec方法后，lastIndex就会往后推，直到找不到匹配的字符返回null，然后又从头开始捕获。 这个属性可以用来遍历捕获字符串中的子串。


``` javascript
var reg=/hello/g;
reg.lastIndex; //0
reg.exec("abchelloasdasdhelloasd"); // ["hello"]
reg.lastIndex; //8
reg.exec("abchelloasdasdhelloasd"); // ["hello"]
reg.lastIndex; //19
reg.exec("abchelloasdasdhelloasd"); // null
reg.lastIndex; //0
```


# 正则表达式基础

## 元字符
 上面第一节以/hello/为例，但是实际应用中可能会遇到这样的需求： 匹配一串不确定的数字、匹配开始的位置、匹配结束的位置、匹配空白符。此时就可以用到元字符。

元字符：

``` javascript
//匹配数字:  \d
"ad3ad2ad".match(/\d/g);  // ["3", "2"]
//匹配除换行符以外的任意字符:  .
"a\nb\rc".match(/./g);  // ["a", "b", "c"]
//匹配字母或数字或下划线 ： \w
"a5_  汉字@!-=".match(/\w/g);  // ["a", "5", "_"]
//匹配空白符:\s
"\n \r".match(/\s/g);  //[" ", " ", ""] 第一个结果是\n，最后一个结果是\r
//匹配【单词开始或结束】的位置 ： \b
"how are you".match(/\b\w/g);  //["h", "a", "y"] 
// 匹配【字符串开始和结束】的位置:  开始 ^ 结束 $
"how are you".match(/^\w/g); // ["h"]
```

反义元字符，写法就是把上面的小写字母变成大写的，比如 ， 匹配所有不是数字的字符： \D

另外还有一些用来表示重复的元字符，会在下面的内容中介绍。

## 字符范围
在 [] 中使用符号 -  ，可以用来表示字符范围。如：

``` javascript
// 匹配字母 a-z 之间所有字母
/[a-z]/
// 匹配Unicode中 数字 0 到 字母 z 之间的所有字符
/[0-z]/ 
// unicode编码查询地址：
//https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
//根据上面的内容，我们可以找出汉字的Unicode编码范围是 \u4E00 到 \u9FA5，所以我们可以写一个正则表达式来判断一个字符串中是否有汉字
/[\u4E00-\u9FA5]/.test("测试");  // true 
```

## 重复 & 贪婪与懒惰
首先来讲重复，当我们希望匹配一些重复的字符时，就需要用到一些和重复相关的正则表达式，写法如下

``` javascript
//重复n次 {n}
"test12".match(/test\d{3}/); // null
"test123".match(/test\d{3}/); // ["test123"]
//重复n次或更多次  {n,}
"test123".match(/test\d{3,}/); //  ["test123"]
//重复n到m次
"test12".match(/test\d{3,5}/); //  null
"test12345".match(/test\d{3,5}/);  // ["test12345"]
"test12345678".match(/test\d{3,5}/);  // ["test12345"]
// 匹配字符test后边跟着数字，数字重复0次或多次
"test".match(/test\d*/); // ["test"]
"test123".match(/test\d*/); // ["test123"]
//重复一次或多次
"test".match(/test\d+/) ; // null
"test1".match(/test\d*/); //["test1"]
//重复一次或0次
"test".match(/test\d?/) ; // null
"test1".match(/test\d?/); //["test1"]
```

从上面的结果可以看到，字符test后边跟着的数字可以重复0次或多次时，正则表达式捕获的子字符串会返回尽量多的数字，比如/test\d*/匹配 test123 ，返回的是test123，而不是test或者test12。

正则表达式捕获字符串时，在满足条件的情况下捕获尽可能多的字符串，这就是所谓的“贪婪模式”。

对应的”懒惰模式“，就是在满足条件的情况下捕获尽可能少的字符串，使用懒惰模式的方法，就是在字符重复标识后面加上一个 "?"，写法如下

``` javascript
// 数字重复3~5次，满足条件的情况下返回尽可能少的数字
"test12345".match(/test\d{3,5}?/);  //["test123"]
// 数字重复1次或更多，满足条件的情况下只返回一个数字
"test12345".match(/test\d+?/);  // ["test1"]
```

## 字符转义
在正则表达式中元字符是有特殊的含义的，当我们要匹配元字符本身时，就需要用到字符转义，比如：

``` javascript
/\./.test("."); // true
```

## 分组 & 分支条件
正则表达式可以用 " ()  " 来进行分组，具有分组的正则表达式除了正则表达式整体会匹配子字符串外，分组中的正则表达式片段也会匹配字符串。

分组按照嵌套关系和前后关系，每个分组会分配得到一个数字组号，在一些场景中可以用组号来使用分组。

在 replace、match、exec函数中，分组都能体现不同的功能。

**replace函数**中，第二个参数里边可以用 $+数字组号来指代第几个分组的内容，如：

``` javascript
" the best language in the world is java ".replace(/(java)/,"$1script"); // " the best language in the world is javascript "
"/static/app1/js/index.js".replace(/(\/\w+)\.js/,"$1-v0.0.1.js"); //"/static/app1/js/index-v0.0.1.js"    (\/\w+)分组匹配的就是 /index ，在第二个参数中为其添加上版本号
```

**match函数**中，当正则表达式有全局属性时，会捕获所有满足正则表达式的子字符串

``` javascript
"abchellodefhellog".match(/h(ell)o/g); //["hello", "hello"]
```

但是当正则表达式没有全局属性，且正则表达式中有分组的时候，match函数只会返回整个正则表达式匹配的第一个结果，同时会将分组匹配到的字符串也放入结果数组中：

``` javascript
"abchellodefhellog".match(/h(ell)o/); //["hello", "ell"]
// 我们可以用match函数来分解url，获取协议、host、path、查询字符串等信息
"http://www.baidu.com/test?t=5".match(/^((\w+):\/\/([\w\.]+))\/([^?]+)\?(\S+)$/);
// ["http://www.baidu.com/test?t=5", "http://www.baidu.com", "http", "www.baidu.com", "test", "t=5"]
```

**exec函数**在正则表达式中有分组的情况下，表现和match函数很像，只是无论正则表达式是否有全局属性，exec函数都只返回一个结果，并捕获分组的结果

``` javascript
/h(ell)o/g.exec("abchellodefhellog"); //["hello", "ell"]
```

当正则表达式需要匹配几种类型的结果时，可以用到**分支条件**，例如

``` javascript
"asdasd hi  asdad hello asdasd".replace(/hi|hello/,"nihao"); //"asdasd nihao  asdad hello asdasd"
"asdasd hi  asdad hello asdasd".split(/hi|hello/); //["asdasd ", "  asdad ", " asdasd"]
```

 注意，分支条件影响它两边的所有内容， 比如 hi|hello  匹配的是hi或者hello，而不是 hiello 或者 hhello

分组中的分支条件不会影响分组外的内容

"abc acd  bbc bcd ".match(/(a|b)bc/g); //["abc", "bbc"]
 

## 后向引用
正则表达式的分组可以在其后边的语句中通过  \+数字组号来引用

比如

``` javascript
// 匹配重复的单词
/(\b[a-zA-Z]+\b)\s+\1/.exec(" asd sf  hello hello asd"); //["hello hello", "hello"]
```

## 断言
** (?:exp)** , 用此方式定义的分组，正则表达式会匹配分组中的内容，但是不再给此分组分配组号，此分组在replace、match等函数中的作用也会消失，效果如下：

``` javascript
/(hello)\sworld/.exec("asdadasd hello world asdasd")  // ["hello world", "hello"],正常捕获结果字符串和分组字符串
/(?:hello)\sworld/.exec("asdadasd hello world asdasd")  // ["hello world"]

"/static/app1/js/index.js".replace(/(\/\w+)\.js/,"$1-v0.0.1.js"); //"/static/app1/js/index-v0.0.1.js"
"/static/app1/js/index.js".replace(/(?:\/\w+)\.js/,"$1-v0.0.1.js"); //"/static/app1/js$1-v0.0.1.js"
```

**(?=exp) **这个分组用在正则表达式的后面，用来捕获exp前面的字符，分组中的内容不会被捕获，也不分配组号

``` javascript
/hello\s(?=world)/.exec("asdadasd hello world asdasd")  // ["hello "]
```

**(?!exp) ** 和前面的断言相反，用在正则表达式的后面，捕获后面不是exp的字符，同样不捕获分组的内容，也不分配组号

``` javascript
/hello\s(?!world)/.exec("asdadasd hello world asdasd") //null
```

## 处理选项
javascript中正则表达式支持的正则表达式有三个，g、i、m，分别代表全局匹配、忽略大小写、多行模式。三种属性可以自由组合共存。

``` javascript
// 全局匹配  g 
"abchelloasdasdhelloasd".match(/hello/);  //["hello"]
"abchelloasdasdhelloasd".match(/hello/g);  //["hello","hello"]

//忽略大小写 i
"abchelloasdasdHelloasd".match(/hello/g); //["hello"]
"abchelloasdasdHelloasd".match(/hello/gi); //["hello","Hello"]
 
```


在默认的模式下，元字符 ^ 和 $ 分别匹配字符串的开头和结尾处，模式 m 改变了这俩元字符的定义，让他们匹配一行的开头和结尾


``` javascript
"aadasd\nbasdc".match(/^[a-z]+$/g);  //null  字符串^和$之间有换行符，匹配不上 [a-z]+ ,故返回null
"aadasd\nbasdc".match(/^[a-z]+$/gm);  // ["aadasd", "basdc"] ，改变^$的含义，让其匹配一行的开头和末尾，可以得到两行的结果
```
