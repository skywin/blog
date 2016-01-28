## 说明
一个为hexo制作的文章编写发布工具
使用了markdown编辑器：https://github.com/lepture/editor ，为满足功能需求略有修改
使用 nw.js制作桌面软件：http://docs.nwjs.io/en/v0.13.0-beta4/
使用react制作UI组件：https://facebook.github.io/react/docs/getting-started.html
使用gulp+webpack打包项目：https://webpack.github.io/docs/
## 使用配置
安装node、git，全局安装gulp、webpack、hexo
在本地git客户端和远程git仓库中配置好ssh key(为了自动部署):https://help.github.com/articles/generating-an-ssh-key/
在本目录的上级目录中解压一个nw.js的项目 nwjs-v0.12.3-win-x64
在本目录下 npm install
运行 gulp 命令，即可启动编辑器程序
nwjs-v0.12.3-win-x64 目录下也会生成 editor.exe 程序，可创建此程序的快捷方式使用
## hexo相关配置
gulpfile.js中，initConfig任务内需要进行hexo相关的一些配置
> var config={
>         domain:"zoucz.com",
>         base:__dirname,
>         sbase:__dirname+"/../source",
>         tags:__dirname+"/../source/_data/tags.json",
>         cates:__dirname+"/../source/_data/category.json",
>         posts:__dirname+"/../source/_posts",
>         drafts:__dirname+"/../source/_drafts",
>         imgs:__dirname+"/../source/blogimgs"
>     }
分别是网站域名、hexo根目录，hexo的src路径，标签路径，分类路径，文章路径，草稿路径，图片保存路径
## 好用的功能
编辑完点发布，自动调用hexo方法生成静态文件，并部署到gitcafe和github两个仓库
支持QQ截图直接贴图（编辑器中显示的是本地路径，发布时自动替换为线上路径）

