var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path

var childArgs = [
	path.join(__dirname, 'alimama.js'),
	'http://s.click.taobao.com/t?e=m=2&s=6wY6Ereh8tccQipKwQzePOeEDrYVVa64Qih/7PxfOKS5VBFTL4hn2f5TTZPb+xBHJYccVKkURIiuji8WTRD0Y9YlGdYebonI8xw916Re0NDPLxT0Ff6eTGyw3IPsoPThfQWum2Y2XiECRt2YlgQq5HEqY+akgpmw&unid=A1FDKUJQM6AM25AAA64I&ref=&et=27tVqWrRAvjDco8f0C3lM2CBoSaFJ%2Fsi'
]

childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	console.log(err);
	console.log(stdout);
	console.log(stderr);
})