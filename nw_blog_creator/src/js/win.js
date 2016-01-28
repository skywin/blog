/**
 * Created by czzou on 2016/1/27.
 */
import nw from "nw.gui";
import $ from "jquery";
var win = nw.Window.get();

exports.min=function(){
    win.minimize();
}
exports.close=function(){
    win.close();
}
exports.full=function(){
    $("#win_ctrl .winfull").hide();
    $("#win_ctrl .winsmall").show();
    win.enterFullscreen();
}
exports.small=function(){
    $("#win_ctrl .winsmall").hide();
    $("#win_ctrl .winfull").show();
    win.leaveFullscreen();
}