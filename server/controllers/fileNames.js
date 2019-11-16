var fs = require('fs')


var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

module.exports.getFileNames = function(req, res){
	console.log("inside getFileNames()")
	let imagePath = "/Users/Josh/exercise_data/bicepscurl/" + req.params["type"]
	var imageFileNames = []
	var labelFileNames = []
	fs.readdir(imagePath, function(err, fileNames) {	
		imageFileNames = fileNames
		response = {
			"fileNames" : fileNames,
		}
		sendJSONresponse(res, 200, response);
	});
}





