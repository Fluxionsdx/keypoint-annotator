var fs = require('fs')


var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

module.exports.getFileNames = function(req, res){
	console.log("inside getFileNames()")
	let imagePath = "/Users/Josh/exercise_data/left_side/" + req.params["type"]
	var imageFileNames = []
	var labelFileNames = []
	fs.readdir(imagePath, function(err, fileNames) {	
		if(err){
			sendJSONresponse(res, 401, {
				message : err
			});
		}
		else{
			imageFileNames = fileNames
			response = {
				"fileNames" : fileNames,
			}
			sendJSONresponse(res, 200, response);	
		}

	});
}

module.exports.getAnnotation = function(req, res){
	const fileName = "/Users/Josh/exercise_data/left_side/labels/" + req.params.fileName
	fs.readFile(fileName, 'utf8', (err, jsonString) => {
		if(err){
			sendJSONresponse(res, 401, {
				message : err
			});
		}
		else{
			try {
			    const annotation = JSON.parse(jsonString)
			    sendJSONresponse(res, 200, annotation);
			    
			} 
			catch(err) {
			    sendJSONresponse(res, 401, {
					message : err
				});
			}
		}

	})

}




