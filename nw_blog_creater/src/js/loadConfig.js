/**
 * Created by czzou on 2016/1/22.
 */
var fs=require("fs");
module.exports=(
    function(){
        var config=fs.readFileSync("config.json");
        config=JSON.parse(config);
        return config;
    }
)()