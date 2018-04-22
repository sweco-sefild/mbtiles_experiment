var express = require('express');
var http = require('http');
var app = express();
var tilelive = require('tilelive');
require('mbtiles').registerProtocols(tilelive);
var connect = require('connect');
var serveStatic = require('serve-static');
var path = require('path');
var exec = require('child_process').exec;
var result = '';
var currentSource = '';

function loadData() {
    tilelive.load('mbtiles:///home/ubuntu/data/se_500k.mbtiles', function (err, source) {
        if (err) {
            throw err;
        }
        currentSource = source
    });
}


app.set('port', 7777);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get(/^\/v2\/tiles\/(\d+)\/(\d+)\/(\d+).pbf$/, function (req, res) {

    var z = req.params[0];
    var x = req.params[1];
    var y = req.params[2];

    console.log('get tile %d, %d, %d', z, x, y);

    currentSource.getTile(z, x, y, function (err, tile, headers) {
        if (err) {
            res.status(404)
            res.send(err.message);
            console.log(err.message);
        } else {
            res.set(headers);
            res.send(tile);
        }
    });
});

app.get('/json', function (req, res) {
    res.sendFile(path.join(__dirname + '/minimal.json'));
});
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/minimal.html'));
});
app.get('/data', function (req, res) {
    var child = exec('sh run.sh');

    child.stdout.on('data', function (data) {
        result += data;
    });

    child.on('close', function () {
        console.log('done', result);
        loadData()
        res.send("Data fixed")
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});




