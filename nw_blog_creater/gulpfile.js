/**
 * Created by czzou on 2016/1/18.
 */
var gulp=require("gulp"),
    webpack=require("gulp-webpack"),
    webpackconfig=require("./webpack.config.js"),
    path=require("path"),
    JSZip=require("jszip"),
    fs=require("fs"),
    exec = require('child_process').exec;
gulp.task('webpack', function () {
    var myConfig = Object.create(webpackconfig);
    return gulp
        .src('./src/js/index.js')
        .pipe(webpack(myConfig))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task("startexe",["webpack"],function(){
    // 1.将 lib index.html package.json打成zip包 app.nw
    // 2.将app.nw写入 ../nwjs-v0.12.3-win-x64 目录
    // 3.运行cd ../nwjs-v0.12.3-win-x64 & copy /b nw.exe+app.nw app.exe & app.exe
    // 即可打开exe文件调试
    zipFiles(["index.html","package.json","lib","dist","config"]);
    exec("taskkill /f /im app.exe ",function(){
        exec("cd ../nwjs-v0.12.3-win-x64 & copy /b nw.exe+app.nw app.exe & app.exe",function(){
            process.exit();
        });
    });
});
gulp.task("default",["webpack","startexe"]);
function zipFiles(files){
    var zip = new JSZip();
    files.forEach(function(fpath){
        addtozip(zip,fpath,"");
    });
    function addtozip(zip,fname,fprefix){
        var fpath=fprefix+fname;
        if(fs.lstatSync(fpath).isFile()){
            zip.file(fname, fs.readFileSync(fpath));
            console.log("file------",fpath);
        }
        else{
            console.log("folder------",fname);
            var folder = zip.folder(fname);
            var subnames=fs.readdirSync(fpath);
            fprefix=fprefix+fname+"/";
            subnames.forEach(function(subname){
                addtozip(folder,subname,fprefix);
            })
        }
    }
    var content = zip.generate({type:"nodebuffer"});
    fs.writeFileSync('../nwjs-v0.12.3-win-x64/app.nw', content);
}