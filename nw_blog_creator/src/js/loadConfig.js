/**
 * Created by czzou on 2016/1/22.
 */
var fs=require("fs");
var config;
module.exports=(
    function(){
        if(!config){
            config=fs.readFileSync("config.json");
            config=JSON.parse(config);
        }
        return config;
    }
)()