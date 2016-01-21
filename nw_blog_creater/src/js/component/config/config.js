/**
 * Created by czzou on 2016/1/21.
 */
//var fs=require("fs");
//var tags=fs.readFileSync("config/tags.json","utf-8");

var tags=["tag1","tag2"];
var cates=["cate1","cate2"];
require("./config.css");

import React from "react";
module .exports=React.createClass({
    render:function(){
        return (
            <form className="form-horizontal">
                <div className="form-group">
                    <label className="col-sm-2 control-label">标签</label>
                    <div className="col-sm-10">
                        {
                            tags.map(function (tag) {
                                return <span className="label label-success">{tag}&nbsp;<span className="glyphicon glyphicon-remove"> </span></span>
                            })
                        }
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label"></label>
                    <div className="col-sm-10">
                       <input type="text" className="form-control shortinput"></input>
                       <button className="btn btn-success">添加</button>
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label">分类</label>
                    <div className="col-sm-10">
                        {
                            cates.map(function (cate) {
                                return <span className="label label-success">{cate}&nbsp;<span className="glyphicon glyphicon-remove"> </span></span>
                            })
                        }
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label"></label>
                    <div className="col-sm-10">
                        <input type="text" className="form-control shortinput"></input>
                        <button className="btn btn-success">添加</button>
                    </div>
                </div>
            </form>
        );
    }
});