/**
 * Created by czzou on 2016/1/28.
 */
import nw from "nw.gui";
import Q from "q";
import {writeImg} from "../fileOperate";
var clipboard = nw.Clipboard.get();

/**
 * 粘贴时：
 * 1.图片base64 保存到图片目录
 * 2.图片链接   保存到图片目录
 * 3.本地图片   保存到图片目录
 * 然后上传到git，编辑器中插入图片链接
 *
 * 超链接 插入超链接
 * @param e
 */
exports.paste=function(event){
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    var dfd=Q.defer();
    if(items.length>0 && items[0].kind==="file"){
        var blob = items[0].getAsFile();
        var reader = new FileReader();
        var filename=new Date().getTime()+".png";
        reader.onload = function(e){
            var base64=e.target.result;
            base64=base64.replace(/^data:image\/(png|jpg);base64,/, "");
            var path=writeImg(filename,base64);
            dfd.resolve(path);
        };
        reader.readAsDataURL(blob);
    }
    else{
        dfd.resolve();
    }
    return dfd.promise;
}