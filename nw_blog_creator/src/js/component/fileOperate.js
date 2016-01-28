/**
 * Created by czzou on 2016/1/26.
 */
import $ from "jquery";
import fs from "fs";
require("../../../lib/common.js");
var config=require("../loadConfig"),
    base=config.base,
    sbase=config.sbase,
    drafts=config.drafts,
    domain=config.domain,
    posts=config.posts,
    tags=config.tags,
    cates=config.cates,
    imgs=config.imgs,
    exec=require('child_process').exec;

function createFile(title,filename,cates,tags,content){
    if(!filename) return false;
    var txt="";
    txt+="title: "+title+"\r\n";
    txt+="categories:\r\n";
    if(cates){
        cates=cates.split(",");
        cates.forEach(function(cate){
            txt+="  - "+cate+"\r\n";
        });
    }
    txt+="tags:\r\n";
    if(tags){
        tags=tags.split(",");
        tags.forEach(function(tag){
            txt+="  - "+tag+"\r\n";
        });
    }
    txt+="date: "+new Date().format("yyyy-MM-dd hh:mm:ss")+"\r\n";
    txt+="---\r\n";
    txt+=content;
    return txt;
}
//根据数据生成文件，存入草稿文件夹
function saveToDraft(title,filename,cates,tags,content){
    var txt=createFile(title,filename,cates,tags,content);
    if(!txt) return;
    fs.writeFileSync(drafts+"/"+filename+".md",txt);
}
//1.
//2.将文章内容写到_post目录中(注意文件名加上日期)
//3.从草稿箱中删除文章内容
//4.生成静态文件
//5.发布到git
function publish(title,filename,cates,tags,content){
    var parsebase=sbase.replace(/([\:\\])/g,"\\$1");
    content=content.replace(new RegExp(parsebase,"g"),"http://"+domain);
    var txt=createFile(title,filename,cates,tags,content);
    if(!txt){
        $.error("请填写文件名称");
        return;
    }
    if(!title){
        $.error("请填写文章名称");
        return;
    }
    fs.writeFileSync(posts+"/"+new Date().format("yyyy-MM-dd-")+filename+".md",txt);
    if(fs.existsSync(drafts+"/"+filename+".md")){
        fs.unlinkSync(drafts+"/"+filename+".md");
    }
    $.success("开始生成并发布");
    //切换到 posts 目录
    //d: & cd D:\learn\blog_gitcafe_hexo\nw_blog_creater\_post
    var disk=posts.match(/^\w{1}:/)[0]
    var command=disk+" & cd "+posts+" & hexo generate & hexo deploy";
    exec(command,function(){
        $.success("发布完成");
    });
}
/**
 * 获取草稿列表
 * @returns {*}
 */
function getDrafts(){
    var files=fs.readdirSync(drafts);
    return files;
}
/**
 * 删除草稿
 * @param filepath
 */
function deleteDraft(filepath){
    filepath=drafts+"/"+filepath;
    if(confirm("确认删除此草稿？")){
        if(fs.existsSync(filepath)){
            fs.unlinkSync(filepath)
        }
    }
}

/**
 * 获取草稿内容
 * @param filepath
 */
function getContent(filepath){
    var content={};
    content.filename=filepath.replace(".md","");
    filepath=drafts+"/"+filepath;
    var text=fs.readFileSync(filepath,"utf8");
    var reg={
        title:/^title:\s(.*)\r\n/,
        tags:/tags:\r\n((?:\s{2}\-\s.*\r\n)*)/,
        cates:/categories:\r\n((?:\s{2}\-\s.*\r\n)*)/,
        items:/[^\s]+(?=\r\n)/g,
        content:/\r\n\-{3}\r\n([\s\S]*)/
    }
    content.title=text.match(reg.title)[1];
    content.tags=text.match(reg.tags)[1].match(reg.items);
    content.cates=text.match(reg.cates)[1].match(reg.items);
    content.content=text.match(reg.content)[1];

    return content;
}
//获取标签列表
function getTags(){
    try {
        return JSON.parse(fs.readFileSync(tags));
    }
    catch (e){
        return [];
    }
}
//获取分类列表
function getCates(){
    try {
        return JSON.parse(fs.readFileSync(cates));
    }
    catch (e){
        return [];
    }
}

/**
 * 向图片文件夹下写入文件
 */
function writeImg(filename,data){
    var dateStr=new Date().format("yyyy-MM-dd");
    if(!fs.existsSync(imgs+"/"+dateStr)){
        fs.mkdirSync(imgs+"/"+dateStr);
    }
    var path=imgs+"/"+dateStr+"/"+filename
    fs.writeFileSync(path,data,'base64');
    //var url="http://"+domain+"/"+dateStr+"/"+filename;
    return path;
}

exports.saveToDraft=saveToDraft;
exports.publish=publish;
exports.getDrafts=getDrafts;
exports.deleteDraft=deleteDraft;
exports.getContent=getContent;
exports.getTags=getTags;
exports.getCates=getCates;
exports.writeImg=writeImg;