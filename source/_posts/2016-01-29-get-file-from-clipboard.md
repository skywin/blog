title: 浏览器中用JavaScript获取剪切板中的文件
categories:
  - 前端开发
tags:
  - 前端开发
  - 浏览器
date: 2016-01-29 11:17:04
---
在网页上编辑内容时，有时候需要插入图片，一般的做法是：  
1. 从网络上下载图片至本地 or  截图保存至本地
2. 在编辑器中点击图片上传按钮，选择本地文件，等待上传完成
3. 将上传好的图片链接插入编辑器中  

这样做太麻烦了，我比较喜欢的操作是开着QQ或者其他的一些截图工具，截图-粘贴  。
为了这样做我们需要在浏览器中获取剪切板中的文件。  
chrome浏览器支持onPaste事件，事件对象中可以获取剪切板中的文件内容，代码如下：  

``` javascript
function paste(event){
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    var dfd=Q.defer();
    if(items.length>0 && items[0].kind==="file"){
        var blob = items[0].getAsFile();
        var reader = new FileReader();
        var filename=new Date().getTime()+".png";
        reader.onload = function(e){
            var base64=e.target.result;
            base64=base64.replace(/^data:image\/(png|jpg);base64,/, "");
            var path=writeImg(filename,base64);
            dfd.resolve(path);
        };
        reader.readAsDataURL(blob);
    }
    else{
        dfd.resolve();
    }
    return dfd.promise;
}
```
其中Q是一个promise库，writeImg是一个使用node写入本地文件系统(nw.js下运行)，见[我的blog编辑器](https://github.com/zouchengzhuo/blog/tree/master/nw_blog_creator)    
FileReader可以把blob对象读取为dataurl（实际上就是用base64表示的uri），ArrayBuffer等格式的数据：    
![reader](http://zoucz.com/blogimgs/2016-01-29/1454036632733.png)   

当这种场景发生在纯浏览器环境时，writeImg方法也可以选择不保存到本地，而是通过http上传到一个文件服务器，此时可以直接用blob对象上传而不用读取。
