var fs = require('fs');
var path = require('path');

module.exports.use = function (app){
    var files = [];
    readdirSync(path.join(__dirname, 'routers'), files);
    files.forEach(function(file){
        var router = require(file);
        app.use(router.routes());
    });
};


function readdirSync(folder, fileList){
    var files = fs.readdirSync(folder);
    files.forEach(function(item) {
        var tmpPath = path.join(folder, item);
        var stats = fs.statSync(tmpPath);

        if (stats.isDirectory()) {
            readdirSync(tmpPath, fileList);
        } else {
            fileList.push(tmpPath);
        }
    });
};


function readdir(folder, fileList){
    fs.readdir(folder, function(files){
        files.forEach(function(item) {
            var tmpPath = path.join(folder, item);
            var stats = fs.statSync(tmpPath);

            if (stats.isDirectory()) {
                readdir(tmpPath, fileList);
            } else {
                fileList.push(tmpPath);
            }
        });
    });
    
};