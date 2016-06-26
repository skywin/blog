/**
 * Created by czzou on 2016/1/25.
 */
import React from "react";
import $ from "jquery";
import {saveToDraft,publish,getContent,getTags,getCates} from "../fileOperate";
import {paste} from "./hotkey";

require("imports?jQuery=jquery!../../../../lib/magicsuggest/magicsuggest-min");
require("../../../../lib/magicsuggest/magicsuggest-min.css");

var editor=require("imports?this=>window!exports?window.editormd!../../../../lib/editor/editormd.min.js");
require("../../../../lib/editor/css/editormd.css");

require("./write.css");

var autoSave;
module.exports=React.createClass({
    getInitialState: function() {
        return {
            content:{}
        };
    },
    //组件挂载之前，检查一下是否有草稿需要编辑
    componentWillMount:function(){
        var title=this.props.params.title;
        if(title){
            this.setState({content:getContent(title)});
        }
    },
    componentWillUnmount:function(){
        if(autoSave){
            clearInterval(autoSave);
        }
    },
    fillEditor:function(catemg,tagmg){
        var content=this.state.content,
            editor=this.state.editor,
            tagmg=this.state.tagmg,
            catemg=this.state.catemg;

        if(content.content){
            editor.setMarkdown(content.content);
        }
        if(content.tags){
            tagmg.setValue(content.tags);
        }
        if(content.cates){
            catemg.setValue(content.cates);
        }
    },
    //组件挂载完成事件
    // 1.初始化编辑器
    // 2.每10s保存一次草稿
    componentDidMount:function(){
        var editor = editormd("editor", {
            width   : "90%",
            height  : 640,
            syncScrolling : "single",
            path    : "../lib/editor/lib"
        });
        autoSave=setInterval(this.save,10000);
        //调整编辑器尺寸
        window.onresize=function(){
            var height=document.documentElement.clientHeight-200,
                width=document.documentElement.clientWidth;
            //TODO
            //editor.setSize(width,height);
        }
        window.onresize();
        //绑定多选框
        var catemg=$('#cates').magicSuggest({
            placeholder: '选择分类',
            data: getCates()
        });
        var tagmg=$('#tags').magicSuggest({
            placeholder: '选择标签',
            data: getTags()
        });
        this.setState({editor:editor,catemg:catemg,tagmg:tagmg});
        //若页面路径是编辑草稿，填充之
        setTimeout(this.fillEditor,0);
        /*$(".CodeMirror").keydown(function(e){
            if(e.ctrlKey && e.keyCode==86){
                paste(e)
            }
        });*/
    },
    //保存文章
    save:function(){
        var editor = this.state.editor,
            catemg=this.state.catemg,
            tagmg=this.state.tagmg;
        var title=$("#title").val();
        var filename=$("#filename").val();
        var cates=catemg.getValue().join(",");
        var tags=tagmg.getValue().join(",");
        //TODO
        var content=editor.getMarkdown();
        saveToDraft(title,filename,cates,tags,content);
    },
    //发布文章
    pub:function(e){
        var editor = this.state.editor,
            catemg=this.state.catemg,
            tagmg=this.state.tagmg;
        var title=$("#title").val();
        var filename=$("#filename").val();
        var cates=catemg.getValue().join(",");
        var tags=tagmg.getValue().join(",");
        var content=editor.getMarkdown();
        publish(title,filename,cates,tags,content);
        if(autoSave){
            clearInterval(autoSave);
        }
    },
    pasteImg:function(e){
        var editor = this.state.editor;
        paste(e).then(function(path){
            if(path){
                editor.insertValue("![]("+path+")");
            }
        }).done();
    },
    render:function(){
        var content=this.state.content;
        return (
            <div onPaste={this.pasteImg}>
                <div id="titleform" className="form-inline">
                    <div className="form-group">
                        <span>文件名称：</span>
                        <input value={content.filename} id="filename" type="email" className="form-control input-sm" placeholder="文件名称" />
                    </div>
                    <div className="form-group">
                        <span>&nbsp;&nbsp;文章标题：</span>
                        <input value={content.title} id="title" type="text" className="form-control input-sm" placeholder="文章标题" />
                    </div>
                    <div className="form-group">
                        <span>&nbsp;&nbsp;分类：</span>
                        <input  id="cates" type="text" className="form-control input-sm" placeholder="分类，多个以','分隔" />
                    </div>
                    <div className="form-group">
                        <span>&nbsp;&nbsp;标签：</span>
                        <input  id="tags" type="text" className="form-control input-sm" placeholder="标签，多个以','分隔" />
                    </div>
                    &nbsp;
                    <button className="btn btn-success btn-xs" onClick={this.save}>保存(10s自动保存)</button>
                    &nbsp;
                    <button className="btn btn-success btn-xs" onClick={this.pub}>发布</button>
                </div>
                <textarea id="editor" onPaste={paste}></textarea>
            </div>
        );
    }
});