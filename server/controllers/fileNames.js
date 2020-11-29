var fs = require('fs')


var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

module.exports.getFileNames = function(req, res){
	console.log("inside getFileNames()")
	//let path = "/Users/Josh/exercise_data/side_delt_raise/" + req.params["type"]
	let path;
	if(req.params["type"] == "images"){
		path = "/Users/Josh/chord_recognition_data/movies/pvy_gbr_01/image"
	}
	else if(req.params["type"] == "labels"){
		path = "/Users/Josh/chord_recognition_data/movies/pvy_gbr_01/keypoints"
	}
	fs.readdir(path, function(err, fileNames) {	
		if(err){
			sendJSONresponse(res, 401, {
				message : err
			});
		}
		else{
			response = {
				"fileNames" : fileNames,
			}
			sendJSONresponse(res, 200, response);	
		}

	});
}

module.exports.getAnnotation = function(req, res){
	//const fileName = "/Users/Josh/exercise_data/side_delt_raise/labels/" + req.params.fileName
	console.log("req.params.fileName: ", req.params.fileName)
	const fileName = "/Users/Josh/chord_recognition_data/movies/pvy_gbr_01/keypoints/" + req.params.fileName
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




