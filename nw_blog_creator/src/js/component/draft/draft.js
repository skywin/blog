/**
 * Created by czzou on 2016/1/21.
 */
import React from "react";
import {getDrafts,deleteDraft} from "../fileOperate";
import {Link} from "react-router";

module.exports=React.createClass({
    componentWillMount:function(){
        this.getfiles();
    },
    getfiles:function(){
        var files=getDrafts();
        this.setState({files:files});
    },
    deleteDraft:function(e){
        deleteDraft(e.target.title);
        this.getfiles();
    },
    render:function(){
        var that=this;
        return (
            <div>
                <table className="table table-bordered">
                    <tbody>
                    <tr><th>草稿</th><th>操作</th></tr>
                    {that.state.files.map(function(file){
                        return <tr><td>{file}</td><td><button className="btn btn-danger btn-xs" title={file} onClick={that.deleteDraft}>删除</button>&nbsp;
                            <Link to={"/write/"+file}>
                                <button className="btn btn-success btn-xs" title={file} onClick={that.edit}>编辑</button>
                            </Link>
                        </td></tr>
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
});