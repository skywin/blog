/**
 * Created by czzou on 2016/1/26.
 */
require("../../../../lib/common.js");
var fs=require("fs"),
    config=require("../../loadConfig"),
    drafts=config.drafts,
    posts=config.posts,
    exec=require('child_process').exec;

function createFile(title,filename,cates,tags,content){
    if(!filename) return false;
    var txt="";
    txt+="title: "+title+"\r\n";
    if(cates){
        txt+="categories:\r\n";
        cates=cates.split(",");
        cates.forEach(function(cate){
            txt+="  - "+cate+"\r\n";
        });
    }
    if(tags){
        txt+="tags:\r\n";
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
    var txt=createFile(title,filename,cates,tags,content);
    if(!txt){
        alert("请填写文件名称");
        return;
    }
    if(!title){
        alert("请填写文章名称");
    }
    fs.writeFileSync(posts+"/"+new Date().format("yyyy-MM-dd-")+filename+".md",txt);
    if(fs.existsSync(drafts+"/"+filename+".md")){
        fs.unlinkSync(drafts+"/"+filename+".md");
    }
    alert("开始生成并发布");
    //切换到 posts 目录
    //d: & cd D:\learn\blog_gitcafe_hexo\nw_blog_creater\_post
    var disk=posts.match(/^\w{1}:/)[0]
    var command=disk+" & cd "+posts+" & hexo generate & hexo deploy";
    exec(command,function(){
        alert("发布完成");
    });
}
exports.saveToDraft=saveToDraft;
exports.publish=publish;