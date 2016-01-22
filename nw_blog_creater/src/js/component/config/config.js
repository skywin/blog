/**
 * Created by czzou on 2016/1/21.
 */
var fs=require("fs"),
    config=require("../../loadConfig");
var tagconfig=  config.base+"/../source/_data/tags.json";
var cateconfig= config.base+"/../source/_data/category.json";
var tags=fs.readFileSync(tagconfig,"utf8");
var cates=fs.readFileSync(cateconfig,"utf8");
tags=JSON.parse(tags);
cates=JSON.parse(cates);
require("./config.css");

import React from "react";
module .exports=React.createClass({
    getInitialState: function() {
        return {
            tags: tags,
            cates: cates,
            tagValue:"",
            cateValue:""
        };
    },
    tagValueChange:function(event){
        this.setState({tagValue:event.target.value});
    },
    cateValueChange:function(event){
        this.setState({cateValue:event.target.value});
    },
    addTag:function(){
        var tag=this.state.tagValue;
        var tags=this.state.tags;
        if(!tag){
            alert("标签名称不能为空");
            return false;
        }
        if(tags.indexOf(tag)>-1){
            alert("已有标签");
        }
        this.setState({tagValue:""});
        tags.push(tag);
        fs.writeFileSync(tagconfig,JSON.stringify(tags));
        this.setState({tags:tags});
        return false;
    },
    removeTag:function(event){
        var tags=this.state.tags;
        var tag=event.target.title;
        tags.splice(tags.indexOf(tag),1);
        fs.writeFileSync(tagconfig,JSON.stringify(tags));
        this.setState({tags:tags});
    },
    addCate:function(){
        var cates=this.state.cates;
        var cate=this.state.cateValue;
        if(!cate){
            alert("分类名称不能为空");
            return false;
        }
        if(cates.indexOf(cate)>-1){
            alert("已有分类");
        }
        this.setState({cateValue:""});
        cates.push(cate);
        fs.writeFileSync(cateconfig,JSON.stringify(cates));
        this.setState({cates:cates});
        return false;
    },
    removeCate:function(event){
        var cates=this.state.cates;
        var cate=event.target.title;
        cates.splice(cates.indexOf(cate),1);
        fs.writeFileSync(cateconfig,JSON.stringify(cates));
        this.setState({cates:cates});
    },
    render:function(){
        var tags=this.state.tags;
        var cates=this.state.cates;
        var tag=this.state.tagValue;
        var cate=this.state.cateValue;
        var removeTag=this.removeTag;
        var removeCate=this.removeCate;
        return (
            <form className="form-horizontal sq-form">
                <div className="form-group">
                    <label className="col-sm-2 control-label">标签</label>
                    <div className="col-sm-10">
                        {
                            tags.map(function (tag) {
                                return <span className="label label-success">{tag}&nbsp;
                                    <span className="glyphicon glyphicon-remove" title={tag} onClick={removeTag}> </span></span>
                            })
                        }
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label"></label>
                    <div className="col-sm-10">
                       <input type="text" className="form-control shortinput" value={tag} onChange={this.tagValueChange}></input>
                       <button type="button" className="btn btn-success" onClick={this.addTag}>添加</button>
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label">分类</label>
                    <div className="col-sm-10">
                        {
                            cates.map(function (cate) {
                                return <span className="label label-success">{cate}&nbsp;
                                    <span className="glyphicon glyphicon-remove" title={cate} onClick={removeCate} > </span></span>
                            })
                        }
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label"></label>
                    <div className="col-sm-10">
                        <input type="text" className="form-control shortinput" value={cate} onChange={this.cateValueChange}></input>
                        <button type="button" className="btn btn-success" onClick={this.addCate}>添加</button>
                    </div>
                </div>
            </form>
        );
    }
});