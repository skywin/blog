# 简介
hexo博客
nwjs-v0.12.3-winx64是为了支持编辑发布工具的node-webkit文件
nw_blog_creater是编写发布工具项目
# blog配置
安装nodejs
安装git
npm  install -g hexo
npm  install -g webpack
npm  install -g gulp
根目录下npm install
hexo generate 生成blog静态文件
hexo deploy 将blog发布至远程git仓库，git地址在_config.yml中配置，请事先配置好本地git的ssh key
生成静态文件和发布的工作都可以由编辑器自动完成
#编辑器配置
需要将nw.js的nwjs-v0.12.3-winx64文件夹放置到根目录
在nw_blog_creator目录下npm install
安装完成后运行 gulp 即可启动编写发布工具
nwjs-v0.12.3-winx64目录下会生成一个editor.exe，直接发送至桌面快捷方式可运行


站点地址：http://zoucz.com