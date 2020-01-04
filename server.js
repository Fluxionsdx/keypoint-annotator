
var express = require('express');
var bodyParser = require('body-parser');


var routesAPI = require('./server/routes/index.js')


// Create Express App Object \\
var app = express();

app.use(bodyParser.json({limit : "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.static(__dirname + '/dist/keypoint-annotator'));
app.use(express.static('/Users/Josh/exercise_data/side_delt_raise/images'));
app.use('/api', routesAPI);



app.get('/', function(req, res){
  res.sendFile('index.html', {root : './dist/keypoint-annotator'})
});  


// Creating Server and Listening for Connections \\
var port = 3001
app.listen(process.env.PORT || port, function(){
  console.log('Server running on port ' + port);

});