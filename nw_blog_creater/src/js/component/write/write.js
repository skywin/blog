/**
 * Created by czzou on 2016/1/25.
 */
import React from "react";
import marked from "../../../../lib/editor/dist/marked.js";
import $ from "jquery";
import {saveToDraft,publish} from "./createFile";
var Editor=require("imports?this=>window!exports?window.Editor!../../../../lib/editor/dist/editor.js");
window.marked=marked;
require("../../../../lib/editor/dist/editor.css");
require("./write.css");
var autoSave;
module.exports=React.createClass({
    //组件挂载完成事件
    // 1.初始化编辑器
    // 2.每10s保存一次草稿
    componentDidMount:function(){
        var editor = new Editor({
         element: document.getElementById('editor'),
         toolbar: [ {name: 'bold', action: Editor.toggleBold},
            {name: 'italic', action: Editor.toggleItalic},
            '|',
            {name: 'quote', action: Editor.toggleBlockquote},
            {name: 'unordered-list', action: Editor.toggleUnOrderedList},
            {name: 'ordered-list', action: Editor.toggleOrderedList},
            '|',
            {name: 'link', action: Editor.drawLink},
            {name: 'image', action: Editor.drawImage},
            '|',
            {name: 'preview', action: Editor.togglePreview}]
         });
         editor.render();
         this.setState({editor:editor});
         autoSave=setInterval(function(){
            var title=$("#title").val();
            var filename=$("#filename").val();
            var cates=$("#cates").val();
            var tags=$("#tags").val();
            var content=editor.codemirror.getValue();
            saveToDraft(title,filename,cates,tags,content);
        },10000);
        //调整编辑器尺寸
        window.onresize=function(){
            var height=document.documentElement.clientHeight-200,
                width=document.documentElement.clientWidth;
            editor.codemirror.setSize(width,height);
        }
        window.onresize();
    },
    //发布文章
    pub:function(){
        var editor = this.state.editor;
        var title=$("#title").val();
        var filename=$("#filename").val();
        var cates=$("#cates").val();
        var tags=$("#tags").val();
        var content=editor.codemirror.getValue();
        publish(title,filename,cates,tags,content);
    },
    render:function(){
        return (
            <div>
                <form id="titleform" className="form-inline">
                    <div className="form-group">
                        <span>文件名称：</span>
                        <input id="filename" type="email" className="form-control input-sm" placeholder="文件名称" />
                    </div>
                    <div className="form-group">
                        <span>文章标题：</span>
                        <input id="title" type="text" className="form-control input-sm" placeholder="文章标题" />
                    </div>
                    <div className="form-group">
                        <span>分类：</span>
                        <input id="cates" type="text" className="form-control input-sm" placeholder="分类，多个以','分隔" />
                    </div>
                    <div className="form-group">
                        <span>标签：</span>
                        <input id="tags" type="text" className="form-control input-sm" placeholder="标签，多个以','分隔" />
                    </div>
                    &nbsp;
                    <button className="btn btn-success btn-xs" onClick={this.pub}>发布</button>
                </form>
                <textarea id="editor"></textarea>
            </div>
        );
    }
});