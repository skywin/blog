title: javascript单元测试框架mochajs详解
categories:
  - nodejs
tags:
  - nodejs
  - 单元测试
date: 2016-07-27 18:59:08
---
# 关于单元测试的想法
对于一些比较重要的项目，每次更新代码之后总是要自己测好久，担心一旦上线出了问题影响的服务太多，此时就希望能有一个比较规范的测试流程。在github上看到牛逼的javascript开源项目，也都是有测试代码的，看来业界大牛们都比较注重单元测试这块。
就我自己的理解而言：
- 涉及到大量业务逻辑的代码，可能我没有精力去给每个函数都写上单元测试的代码，功能细节的测试应该交由测试的同事去完成，但是对会直接影响项目正常运行的重要的数据接口，还是可以看情况写上几个单元测试用例的，每一次修改之后跑一跑用例测试一下。    
- 重要的框架底层模块，任何地方出一个小问题，都可能影响到很多服务。对于这种模块，最好是每个函数、每种接口都写上单元测试代码，不然一出问题就是一个大坑啊。
- 开放出去的公共模块，可以针对主要的函数和接口写上单元测试代码，这样可以确保模块代码比较健壮，看起来也专业一些：）。    

基于以上几个想法，我决定学习一款Javascript单元测试框架，并试试去使用它写一些单元测试的代码。    
看了很多技术站点和博客的文章，参考了一部分开源项目的测试代码，大致观望下风向，决定学习一下mocha.js这款单元测试框架。
别人的文章都是别人自己学习、咀嚼理解出来的内容，想学的透彻一点，还是自己学习并翻译一遍原版官方的文档比较好。

# mocha单元测试框架简介
mocha是一款功能丰富的javascript单元测试框架，它既可以运行在nodejs环境中，也可以运行在浏览器环境中。
javascript是一门单线程语言，最显著的特点就是有很多异步执行。同步代码的测试比较简单，直接判断函数的返回值是否符合预期就行了，而异步的函数，就需要测试框架支持回调、promise或其他的方式来判断测试结果的正确性了。mocha可以良好的支持javascript异步的单元测试。
mocha会串行地执行我们编写的测试用例，可以在将未捕获异常指向对应用例的同时，保证输出灵活准确的测试结果报告。
# 安装mocha
`npm install mocha -g` 
# 一个简单的例子
全局安装mocha后，在项目根目录创建test目录    
编写`test01.js` ，   
```javascript
var assert = require('chai').assert;
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
```
`npm install chai --save` 安装一下官方文档中使用的chai断言模块（一个用来判断结果是否正确的模块）     
打开控制台，在test目录同级运行`mocha`，得到如下结果：
     Array
        #indexOf()
          √ should return -1 when the value is not present
      1 passing (11ms)
可以看到：    
describe函数的第一个参数会被输出在控制台中，作为一个用例集的描述，而且这个描述是可以根据自己的需求来嵌套输出的，下面称之为：**用例集定义函数**。    
it函数第一个参数用来输出一个用例的描述，前边打个对勾代表测试通过，第二个参数是一个函数，用来编写用例内容，用断言模块来判断结果的正确性，下面称之为**用例函数**。

# mocha支持的断言模块
mocha支持任何可以抛出一个错误的断言模块。例如：should.js、better-assert、expect.js、unexpected、chai等。这些断言库各有各的特点，大家可以了解一下它们的特点，根据使用场景来选择断言库。

# 同步代码测试
在测试同步代码的时候，用例函数执行完毕后，mocha就直接开始执行下一个用例函数了。 下面是一个同步测试代码的例子：
```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      [1,2,3].indexOf(5).should.equal(-1);
      [1,2,3].indexOf(0).should.equal(-1);
    });
  });
});
```
# 异步代码测试
官方文档自称，用mocha来测试异步的代码不要再简单！真的很自信啊~~  
只需要在用例函数里边加一个done回调，异步代码执行完毕后调用一下done，就可以通知mocha，我执行完啦，去执行下一个用例函数吧！
就像下面这样：
```javascript
describe('User', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User('Luna');
      user.save(function(err) {
        if (err) throw err;
        done();
      });
    });
  });
});
```
对于上面的情况，判断用例执行成功与否是在异步代码的回调里边完成的，这种情况适用于正确性判断比较复杂的情况。如果异步代码中逻辑错误时，会在回调中抛出一个错误，那么测试代码还可以再简单一点：
```javascript
describe('User', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User('Luna');
      user.save(function(err) {
        if (err) throw err;
        done();
      });
    });
  });
});
```
# promise代码测试
如果异步模块并不是使用callback，而是使用promise来返回结果的时候，可以让用例函数返回一个promise对象来进行正确性判断，像下面这样：
```javascript
beforeEach(function() {
  return db.clear()
    .then(function() {
      return db.save([tobi, loki, jane]);
    });
});

describe('#find()', function() {
  it('respond with matching records', function() {
    return db.find({ type: 'User' }).should.eventually.have.length(3);
  });
});
```
后边还会再提到这种情况

# 不建议使用箭头函数
不建议在mocha测试框架中使用箭头函数。箭头函数语法中对this的绑定让会用例函数没办法访问Mocha框架上下文中定义的一些函数，例如`this.timeout(1000)`在箭头函数中就无法得到正确的结果。
我对这里的理解是：mocha会把用例函数注册到自身的某个属性中，通过属性调用的使用，正常函数可以访问到mocha的其他属性，但是箭头函数不行，就像下面的代码一样：
```javascript
function getTest(){
    this.a=555;
    var test={
        a:1,
        b:function(){
            console.log(this.a)
        },
        c:()=>{
        console.log(this.a);
    }
}
    return test;
}
var test=getTest();
test.b();
test.c();
```
输出结果是
    1
    555
# 钩子函数
mocha提供4种钩子函数：`before()`、`after()`、`beforeEach()`、`afterEach()`，这些钩子函数可以用来在用例集/用例函数开始执行之前/结束执行之后，进行一些环境准备或者环境清理的工作。
```javascript
describe('hooks', function() {

  before(function() {
    // runs before all tests in this block
  });

  after(function() {
    // runs after all tests in this block
  });

  beforeEach(function() {
    // runs before each test in this block
  });

  afterEach(function() {
    // runs after each test in this block
  });

  // test cases
});
```
## 钩子函数的描述参数
定义钩子函数的时候，可以传第一个可选参数作为钩子函数的描述，可以帮助定位用例中的错误信息。若没有穿第一个参数，使用一个非匿名函数作为钩子函数，那么函数名称就将被作为钩子函数的描述。
```javascript
beforeEach(function() {
  // beforeEach hook
});

beforeEach(function namedFun() {
  // beforeEach:namedFun
});

beforeEach('some description', function() {
  // beforeEach:some description
});
```
## 异步的钩子函数
钩子函数不仅能是同步函数，也可能是异步的函数，就像前边的异步测试用例函数一样。如果我们在开始之前，需要做一些异步的操作，例如在数据库里边准备一些模拟数据，就需要用到这种场景了：
```javascript
describe('Connection', function() {
  var db = new Connection,
    tobi = new User('tobi'),
    loki = new User('loki'),
    jane = new User('jane');

  beforeEach(function(done) {
    db.clear(function(err) {
      if (err) return done(err);
      db.save([tobi, loki, jane], done);
    });
  });

  describe('#find()', function() {
    it('respond with matching records', function(done) {
      db.find({type: 'User'}, function(err, res) {
        if (err) return done(err);
        res.should.have.length(3);
        done();
      });
    });
  });
});
```
## 全局钩子
前边讲的钩子函数都是定义在用例集函数里边的，如果在用例集函数之外定义钩子函数，那么这个钩子函数将会对所有的mocha单元测试用例生效。若编写了多个用例集js文件，无论在哪一个用例集文件中，用例集函数之外定义钩子函数，都会对所有用例函数生效。
前边讲到，用例集函数是可以嵌套的，而mocha会生成一个包在最外面的describe函数，把所有的用例集包含起来，那么在其中定义的钩子函数也就对所有的用例函数生效了~
```javascript
beforeEach(function() {
  console.log('before every test in every file');
});
```
## 延迟启动测试
如果想在mocha命令运行之后，先做一些别的工作，再启动测试，可以使用`mocha --delay`命令，此命令会在全局环境中生成一个run函数，延迟工作完成后调用run函数即可启动测试。
```javascript
setTimeout(function() {
  // do some setup

  describe('my suite', function() {
    // ...
  });

  run();
}, 5000);
```

# 测试用例TODO
可以编写一个等待被实现的测试用例，在报告里边也会有提示
```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    // pending test below
    it('should return -1 when the value is not present');
  });
});
```
     2 passing (11ms)
      1 pending
    

# 仅执行一个用例集/用例
在用例集函数或者用例函数后边添加`.only()`可以让mocha只执行此用例集或用例
```javascript
describe('Array', function() {
  describe.only('#indexOf()', function() {
    // ...
  });
});
```
Array用例集下面的嵌套集合，只有#indexOf用例集会被执行
```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    it.only('should return -1 unless present', function() {
      // ...
    });

    it('should return the index when present', function() {
      // ...
    });
  });
});
```
这种写法，#indexOf用例集下面的用例，只有第一个加了only的会被执行。    
注意：在同一用例集下有多个only标记，mocha会报错。 

# 跳过哪些用例集/用例
和加上.only相反，在用例集函数或者用例函数后边加`.skip()`，可以跳过此用例集或用例的执行。跳过的用例会被标记为`pending`的用例，在报告中也会作为pending用例体现出来。下面是一些例子：
```javascript
describe('Array', function() {
  describe.skip('#indexOf()', function() {
    // ...
  });
});
```
跳过用例集
```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    it.skip('should return -1 unless present', function() {
      // ...
    });

    it('should return the index when present', function() {
      // ...
    });
  });
});
```
跳过用例。    
对于一些作废的用例，按我们以往的做法可能就是把它注释掉，mocha推荐的做法是给它们加上skip标记。    

除了使用添加skip标记之外，mocha还允许在用例执行的过程中跳过此用例，例如用例执行需要某些上下文环境，但是执行的时候发现这些环境并没有准备好，此时就可以调用skip函数跳过此用例：
```javascript
it('should only test in the correct environment', function() {
  if (/* check test environment */) {
    // make assertions
  } else {
    this.skip();
  }
});
```
上面被跳过的用例同样会在测试报告中以pending的形式体现出来。为了避免测试逻辑混乱，在调用skip函数之后，就不要再再用例函数或after钩子中执行更多的逻辑了。    

这里要说明一点，在一个用例函数中，不要存在一个逻辑分支啥也不做，直接让整个用例函数结束，这样是不科学的。用例函数中应该至少使用断言做一个判断，或者调用skip函数跳过用例。    
```javascript
it('should only test in the correct environment', function() {
  if (/* check test environment */) {
    // make assertions
  } else {
    // do nothing
  }
});
```
这样的用例如果走到了do nothing逻辑，在报告中会被标记为pass。比较推荐的做法是，在before钩子函数中检查测试需要的上下文环境，不具备则跳过。
```javascript
before(function() {
  if (/* check test environment */) {
    // setup code
  } else {
    this.skip();
  }
});
```

# 重新执行用例
你可以指定让一个失败的用例重新执行一定次数。这个特性是为做**end-to-end测试**(功能性测试/Selenium测试)而设计的，这些测试数据不好模拟。 **mocha是不推荐用这个特性来做单元测试的。**    

这个特性会重新运行用例函数的beforeEach和afterEach钩子函数，但是不会重新运行before和after钩子函数。

下面是一个重新执行的例子：
```javascript
describe('retries', function() {
  // Retry all tests in this suite up to 4 times
  this.retries(4);
  
  beforeEach(function () {
    browser.get('http://www.yahoo.com');
  });
  
  it('should succeed on the 3rd try', function () {
    // Specify this test to only retry up to 2 times
    this.retries(2);
    expect($('.foo').isDisplayed()).to.eventually.be.true;
  });
});

```
# 动态生成用例
mocha可以使用`Function.prototype.call`和函数表达式来定义用例集和用例，它们可以用来直接动态生成一些测试用例，而不需要使用其他额外的语法。
和你可能在其他框架中见到的一样，这个特性可以实现通过定义一些参数来实现测试用例的功能。
```javascript
var assert = require('chai').assert;

function add() {
  return Array.prototype.slice.call(arguments).reduce(function(prev, curr) {
    return prev + curr;
  }, 0);
}

describe('add()', function() {
  var tests = [
    {args: [1, 2],       expected: 3},
    {args: [1, 2, 3],    expected: 6},
    {args: [1, 2, 3, 4], expected: 10}
  ];

  tests.forEach(function(test) {
    it('correctly adds ' + test.args.length + ' args', function() {
      var res = add.apply(null, test.args);
      assert.equal(res, test.expected);
    });
  });
});
```
上面的测试会生成下面这样报告：
      add()
        ✓ correctly adds 2 args
        ✓ correctly adds 3 args
        ✓ correctly adds 4 args

# 测试时间
许多测试报告会展示测试时间，同样也会标记出那些用例耗时比较长：    
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-27/1469587478096.png)

可能对于某些测试用例，耗时就是会比较长，那么耗费多长时间才应该本认为执行耗时过长呢？ 可以通过`slow()`函数来标记一下：
```javascript
describe('something slow', function() {
  this.slow(10000);

  it('should take long enough for me to go make a sandwich', function() {
    // ...
  });
});
```
# 测试超时
## 用例集执行超时
在用例集下定义的timeout超时会对此用例集下定义的所有嵌套的用例集和用例生效，如果嵌套的用例集或者用例重写了timeout时间，则会覆盖上层的设置。通过`this.timeout(0)`，可以关掉用例或用例集的超时判断。
```javascript
describe('a suite of tests', function() {
  this.timeout(500);

  it('should take less than 500ms', function(done){
    setTimeout(done, 300);
  });

  it('should take less than 500ms as well', function(done){
    setTimeout(done, 250);
  });
})
```
## 用例执行超时
```javascript
it('should take less than 500ms', function(done){
  this.timeout(500);
  setTimeout(done, 300);
});
```
## 钩子函数超时
```javascript
describe('a suite of tests', function() {
  beforeEach(function(done) {
    this.timeout(3000); // A very long environment setup.
    setTimeout(done, 2500);
  });
});
```
钩子函数同样可以通过`this.timeout(0)`来关闭超时判断。

# diff差异比较功能
若断言库抛出了AssertionErrors，且错误对象中有err.expected属性和err.actual属性，mocha会尝试在报告中展示期望的值和得到的值的差异：
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-27/1469588275973.png)

# mocha使用命令和参数
## mocha init 初始化浏览器中测试
`mocha init`命令用来生成一个浏览器中单元测试的架子。    
新建一个目录test    
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-27/1469588933550.png)    
在同级目录运行命令 `mocha init test` ，可以看到test目录下生成了一些样式表文件和js脚本，以及一个用来运行用例、展示报告的index.html    
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-27/1469589018406.png)
接着使用文章开头的chai断言库，此时需要用script标签引入了，于是在index.html中加上
```html
<script src="http://chaijs.com/chai.js"></script>
```
index.html内容如下：
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Mocha</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="mocha.css" />
  </head>
  <body>
    <div id="mocha"></div>
	<script src="http://chaijs.com/chai.js"></script>
    <script src="mocha.js"></script>
    <script>mocha.setup('bdd');</script>
    <script src="tests.js"></script>
    <script>
      mocha.run();
    </script>
  </body>
</html>
```
test.js是一个空文件，等待我们去编写用例，在其中加上：
```javascript
var assert = chai.assert;
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});
```
在浏览器中打开index.html，可以看到用例执行报告：    
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-27/1469589261302.png)    

## mocha命令参数
mocha命令的基本格式是：` mocha [debug] [options] [files]` 
options包括下面这些，我翻译了一部分目前能理解的
     -h, --help                              输出帮助信息
     -V, --version                           输出mucha版本
     -A, --async-only                        强制让所有测试用例必须使用callback或者返回promise的方式来异步判断正确性
     -c, --colors                            启用报告中颜色
     -C, --no-colors                         禁用报告中颜色
     -G, --growl                             enable growl notification support
     -O, --reporter-options <k=v,k2=v2,...>  reporter-specific options
     -R, --reporter <name>                   specify the reporter to use
     -S, --sort                              排序测试文件
     -b, --bail                              bail after first test failure
     -d, --debug                             enable node's debugger, synonym for node --debug
     -g, --grep <pattern>                    只执行满足 <pattern>格式的用例
     -f, --fgrep <string>                    只执行含有 <string> 的用例
     -gc, --expose-gc                        展示gc回收的log
     -i, --invert                            让 --grep 和 --fgrep 的匹配取反
     -r, --require <name>                    require一下<name>指定的模块
     -s, --slow <ms>                         指定slow时间（单位ms，默认75ms）
     -t, --timeout <ms>                      指定超时时间（单位ms，默认2000ms）
     -u, --ui <name>                         指定user-interface (bdd|tdd|exports)
     -w, --watch                             观察用例文件变化，并重新执行
     --check-leaks                           检测未回收global变量泄露
     --compilers <ext>:<module>,...          用指定的模块来编译文件
     --debug-brk                             启用node的debug模式
     --delay                                 等待异步的用例集（见前边的）
     --es_staging                            enable all staged features
     --full-trace                            display the full stack trace
     --globals <names>                       allow the given comma-delimited global [names]
     --harmony                               enable all harmony features (except typeof)
     --harmony-collections                   enable harmony collections (sets, maps, and weak maps)
     --harmony-generators                    enable harmony generators
     --harmony-proxies                       enable harmony proxies
     --harmony_arrow_functions               enable "harmony arrow functions" (iojs)
     --harmony_classes                       enable "harmony classes" (iojs)
     --harmony_proxies                       enable "harmony proxies" (iojs)
     --harmony_shipping                      enable all shipped harmony features (iojs)
     --inline-diffs                          显示预期和实际结果的string差异比较
     --interfaces                            display available interfaces
     --no-deprecation                        silence deprecation warnings
     --no-exit                               require a clean shutdown of the event loop: mocha will not call process.exit
     --no-timeouts                           禁用timeout，可通过--debug隐式指定
     --opts <path>                           定义option文件路径
     --prof                                  显示统计信息
     --recursive                             包含子目录
     --reporters                             展示可用报告
     --retries                               设置失败用例重试次数
     --throw-deprecation                     每次调用deprecated函数的时候都抛出一个异常
     --trace                                 显示函数调用栈
     --trace-deprecation                     启用的时候显示调用栈
     --watch-extensions <ext>,...            --watch监控的扩展

下面是官方文档对部分命令的详细说明：
### -W, --WATCH
用例一旦更新立即执行
### --COMPILERS
例如` --compilers coffee:coffee-script `编译CoffeeScript 1.6，或者`--compilers coffee:coffee-script/register`编译CoffeeScript 1.7+
### -B, --BAIL
如果只对第一个抛出的异常感兴趣，可以使用此命令。
### -D, --DEBUG
开启nodejs的debug模式，可以在debugger语句处暂停执行。
### --GLOBALS <NAMES>
names是一个以逗号分隔的列表，如果你的模块需要暴露出一些全局的变量，可以使用此命令，例如`mocha  --globals app,YUI`。   
这个命令还可以接受通配符，例如` --globals '*bar`。参数传入 * 的话，会忽略所有全局变量。

### --CHECK-LEAKS
默认情况下，mocha并不会去检查应用暴露出来的全局变量，加上这个配置后就会去检查，此时某全局变量如果没有用上面的--GLOBALS去配置为可接受，mocha就会报错

### -R, --REQUIRE <MODULE-NAME>
这个命令可以用来引入一些依赖的模块，比如should.js等，这个命令相当于在测试目录下每个js文件头部运行一下`require('should.js')`,模块中对Object、Array等对象的扩展会生效，也可以用`--require ./test/helper.js`这样的命令去引入指定的本地模块。    
但是...  很鸡肋的是，如果要引用模块导出的对象，还是需要require，` var should = require('should')`这样搞。
### -U, --UI <NAME>
--ui选项可以用来指定所使用的测试接口，默认是“bdd”
### -R, --REPORTER <NAME>
这个命令可以用来指定报告格式，默认是“spec”。可以使用第三方的报告样式，例如：    
`npm install mocha-lcov-reporter`,` --reporter mocha-lcov-reporter`
### -T, --TIMEOUT <MS>
用来指定用例超时时间
















