/**
 * Created by czzou on 2016/1/20.
 */
import React from "react";
import {render} from"react-dom";
import {min,close,full,small } from "./win";
import {Router,Route,Link,IndexRoute,Redirect } from "react-router";
import createBrowserHistory from 'history/lib/createBrowserHistory';
import config from "./component/config/config";
import draft from "./component/draft/draft";
import write from "./component/write/write";
require("../css/index.css");


var nav = React.createClass({
    render: function (){
        var curPath=this.props.location.pathname;
        if(curPath.length>20) curPath="/"; // nw.js的应用程序目录很长，fix一下，以正确高亮顶部菜单
        curPath=curPath==="/"?"/write":curPath;
        return (
            <div>
                <div id="nav_wrapper">
                    <ul>
                        <li ><Link className={curPath==="/write"?"active":"inactive"} to="/write"><span className="glyphicon glyphicon-edit" aria-hidden="true"></span>&nbsp;发布</Link></li>
                        <li ><Link className={curPath==="/draft"?"active":"inactive"} to="/draft"><span className="glyphicon glyphicon-inbox" aria-hidden="true"></span>&nbsp;草稿</Link></li>
                        <li ><Link className={curPath==="/config"?"active":"inactive"} to="/config"><span className="glyphicon glyphicon-cog" aria-hidden="true"></span>&nbsp;配置</Link></li>
                    </ul>
                    <div id="drag">

                    </div>
                    <div id="win_ctrl">
                        <span onClick={min} className="glyphicon glyphicon-minus" aria-hidden="true"></span>
                        <span onClick={full} className="glyphicon glyphicon-resize-full winfull" aria-hidden="true"></span>
                        <span onClick={small} className="glyphicon glyphicon-resize-small winsmall" aria-hidden="true"></span>
                        <span onClick={close} className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </div>
                </div>
                <div id="content">
                    {this.props.children}
                </div>
            </div>
        );
    }
});


let history=createBrowserHistory();
render((<Router history={history}>
        <Route path="/" component={nav}>
            <IndexRoute component={write} />
            <Route path="write" component={write} />
            <Route path="write/:title" component={write} />
            <Route path="draft" component={draft} />
            <Route path="config" component={config} />
            <Route path="*" component={write}/>
        </Route>
    </Router>)
    ,document.body);