var fs = require('fs');
var path = require('path');

module.exports = function (){
    var files = [];
    readdirSync(path.join(__dirname, 'schedule'), files);
    files.forEach(function(file){
        require(file);
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