/**
 * Created by czzou on 2016/1/20.
 */
import React from "react";
import {render} from"react-dom";
import {Router,Route,Link,IndexRoute} from "react-router";
import createBrowserHistory from 'history/lib/createBrowserHistory';

require("../css/index.css");


var nav = React.createClass({
    render: function (){
        var curPath=this.props.location.pathname;
        curPath=curPath==="/"?"/write":curPath;
        return (
            <div>
                <div id="nav_wrapper">
                    <ul>
                        <li ><Link className={curPath==="/write"?"active":"inactive"} to="/write">write</Link></li>
                        <li ><Link className={curPath==="/draft"?"active":"inactive"} to="/draft">draft</Link></li>
                        <li ><Link className={curPath==="/config"?"active":"inactive"} to="/config">config</Link></li>
                        <li></li>
                    </ul>
                </div>
                <div id="body">
                    {this.props.children}
                </div>
            </div>
        );
    }
});


var write=React.createClass({
    render:function(){
        return (
            <div>WRITE</div>
        );
    }
});

var draft=React.createClass({
    render:function(){
        return (
            <div> DRAFT </div>
        );
    }
});

var config=React.createClass({
    render:function(){
        return (
            <div>CONFIG</div>
        );
    }
})

let history=createBrowserHistory();
render((<Router history={history}>
        <Route path="/" component={nav}>
            <IndexRoute component={write} />
            <Route path="/write" component={write} />
            <Route path="/draft" component={draft} />
            <Route path="/config" component={config} />
            <Route path="*" component={write}/>
        </Route>
    </Router>)
    ,document.body);