import { Component, OnInit, AfterViewInit, ApplicationRef } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  
  constructor(
  	public http: Http,
  	public ar: ApplicationRef
  ){

  }

  public canvas;
  public canvasContext;
  public workingAnnotation;
  ngOnInit(){
  	this.getFileNames("images")
  	this.workingAnnotation = this.getBlankAnnotation()

  }

  ngAfterViewInit(){
  	document.addEventListener('click', this.getCanvasPos.bind(this), true);
  	this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
  	this.canvasContext = this.canvas.getContext('2d')

    document.addEventListener("keydown", event => {
      if(event.keyCode == 65){
        this.toggleKeypoint("down")
      }
      else if(event.keyCode == 83){
        this.toggleKeypoint("up")
      }
    });
  }

  public toggleKeypoint(direction){
    console.log("exerciseSelected: ", this.exerciseSelected)
    let index = this.keyPointsMap[this.exerciseSelected].indexOf(this.keyPointSelected)
    console.log("index: ", index)
    let newKeyPoint;
    if(direction == "up"){
      console.log("in up")
      if(index == this.keyPointsMap[this.exerciseSelected].length - 1){
          console.log("in up if")
          newKeyPoint = this.keyPointsMap[this.exerciseSelected][0]
      }
      else{
        console.log("in up else")
        console.log(this.keyPointsMap[this.exerciseSelected][index + 1])
        newKeyPoint = this.keyPointsMap[this.exerciseSelected][index + 1]
      }
      
    }
    else{
         if(index == 0){
          return
          }
      newKeyPoint = this.keyPointsMap[this.exerciseSelected][index - 1]
    }
    this.selectKeyPoint(newKeyPoint)
    
  }


  public canvasX;
  public canvasY;
  public canvasCoords;
  public getCanvasPos(e){
	      let cursorX = e.pageX;
	      let cursorY = e.pageY;
	      let canvas = document.getElementById("canvas")
	      this.canvasCoords = canvas.getBoundingClientRect();
	      this.canvasX = parseInt((cursorX - this.canvasCoords.left).toString())
	      this.canvasY = parseInt((cursorY - this.canvasCoords.top).toString())
	}
  
  public imageFileNames = []
  public labelFileNames = []
  public getFileNames(type){
	this.http.get('api/fileNames/' + type)
				.subscribe( 
					(res) => {	
						if(type == "images"){
							this.imageFileNames = res.json().fileNames
							this.getFileNames("labels")
						}
						else{
							this.labelFileNames = res.json().fileNames
							this.matchFileNames()
						}							      		
					},
				    (error) => {
						console.log(error);
					}
		)
  }


  public getAnnotation(fileName){
	this.http.get('api/annotation/' + fileName)
				.subscribe( 
					(res) => {	
						console.log("fileName inside getAnnotation: ", fileName)
						this.workingAnnotation = res.json()
											      		
					},
				    (error) => {
						console.log(error);
					}
		)
  }


  public fileNameLabelStyles = []
  public matchFileNames(){
  	this.fileNameLabelStyles = []
  	for(var i = 0; i < this.labelFileNames.length; i++){
  		this.labelFileNames[i] = this.labelFileNames[i].split(".").slice(0,-1).join(".")
  	}
  	for(var i = 0; i < this.imageFileNames.length; i++){
  		if(this.labelFileNames.includes(this.imageFileNames[i].split(".").slice(0,-1).join("."))){
  			this.fileNameLabelStyles.push({"background-color" : "lightgreen", "border": "none"})
  		}
  		else{
  			this.fileNameLabelStyles.push({"background-color" : "red", "border": "none"})
  		}
  	}
  }

  public selectedImage;
  public fileNameSelected;
  public img;
  public showSaveButton = false;
  public selectImage(name, index){
  	console.log(name)
  	for(var i = 0; i < this.fileNameLabelStyles.length; i++){
  		if(i == index){
  			this.fileNameLabelStyles[i]["border"] = "2px solid black"
  		}
   		else{
  			this.fileNameLabelStyles[i]["border"] = "none"
  		}
  	}
  	this.showSaveButton = true;
  	this.fileNameSelected = name
	this.selectedImage = encodeURIComponent(name);
  	if(this.labelFileNames.includes(name.split(".").slice(0,-1).join("."))){
  		this.getAnnotation(name.split(".").slice(0,-1).join(".") + ".json")
  	}
  	else{
  		this.workingAnnotation = this.getBlankAnnotation()
  	}
  	this.img = document.createElement("IMG") as HTMLImageElement;
	this.img.src = this.selectedImage;
	setTimeout( ()=>{
		this.drawCanvas()
	}, 50 )
  }

  public scaleFactor = 1.5
  public drawCanvas(){
  	this.canvas.width = this.img.width * this.scaleFactor;
	this.canvas.height = this.img.height * this.scaleFactor;
	this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
	this.canvasContext.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
	const joints = Object.keys(this.workingAnnotation)
	for(var i = 0; i < joints.length; i++){
		this.canvasContext.beginPath()
		this.canvasContext.arc(this.workingAnnotation[joints[i]]["x"] * this.canvas.width, this.workingAnnotation[joints[i]]["y"] * this.canvas.height, 5, 0 , 2 * Math.PI, false)
		this.canvasContext.fillStyle = "red"
		this.canvasContext.fill()		
	    this.keyPointsLabelStyles[joints[i]].left = ((this.workingAnnotation[joints[i]]["x"] * this.canvas.width) + this.canvasCoords.left) + "px"
	    this.keyPointsLabelStyles[joints[i]].top = ((this.workingAnnotation[joints[i]]["y"] * this.canvas.height) + this.canvasCoords.top) + "px"
		if(this.workingAnnotation[joints[i]].x == "0" && this.workingAnnotation[joints[i]].y == "0"){
			this.keyPointsLabelStyles[joints[i]].display = "none";
		}
		else{
			this.keyPointsLabelStyles[joints[i]].display = "block";
		}
	}

  }


  public drawKeyPoint(){
  	  setTimeout( ()=>{
        this.keyPointsStylesMap[this.keyPointSelected]["border"] = "2px solid green"
	      this.workingAnnotation[this.keyPointSelected]["x"] = (this.canvasX/this.canvas.width).toFixed(4)
	      this.workingAnnotation[this.keyPointSelected]["y"] = (this.canvasY/this.canvas.height).toFixed(4)
	      this.keyPointsLabelStyles[this.keyPointSelected].display = "block";
	      this.keyPointsLabelStyles[this.keyPointSelected].top = (this.canvasY + this.canvasCoords.top) + "px"
	      this.keyPointsLabelStyles[this.keyPointSelected].left = (this.canvasX + this.canvasCoords.left) + "px"
	      this.drawCanvas()
  	  }, 50)

  }

	public clearKeyPointsLabels(){
		let keyPoints = Object.keys(this.keyPointsLabelStyles)
		for(var i = 0; i < keyPoints.length; i++){
			this.keyPointsLabelStyles[keyPoints[i]]["display"] = "none"
		}
	}

  public exercises = ["Guitar", "Biceps Curl"]
  public exerciseSelected = "bicepscurl"
  public keyPointSelected = "L-Shoulder"
  public keyPointsMap = {
  	"bicepscurl" : ["L-Shoulder", "L-Elbow", "L-Wrist", "L-Hip",  "L-Knee", "L-Ankle", "R-Ankle", "R-Knee", "R-Hip", "R-Wrist", "R-Elbow", "R-Shoulder", "Chin", "T-Head"]
  }

  public getBlankAnnotation(){
	return {
		"L-Shoulder" : {
			"x" : "0",
			"y" : "0"
		},
		"L-Elbow" : {
			"x" : "0",
			"y" : "0"
		},
		"L-Wrist" : {
			"x" : "0",
			"y" : "0"
		},
		"L-Hip" : {
			"x" : "0",
			"y" : "0"
		},
    "L-Knee" : {
      "x" : "0",
      "y" : "0"
    },
    "L-Ankle" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Shoulder" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Elbow" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Wrist" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Hip" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Knee" : {
      "x" : "0",
      "y" : "0"
    },
    "R-Ankle" : {
      "x" : "0",
      "y" : "0"
    },
    "Chin" : {
      "x" : "0",
      "y" : "0"
    },
    "T-Head" : {
      "x" : "0",
      "y" : "0"
    },
	}
  }

  public toggleLabels(){
    let keypoints = Object.keys(this.keyPointsLabelStyles)
    for( var i = 0 ; i < keypoints.length; i++){
      if(this.keyPointsLabelStyles[keypoints[i]]["display"] == "none"){
        this.keyPointsLabelStyles[keypoints[i]]["display"] = "block"
      }
      else{
        console.log("change to none")
        this.keyPointsLabelStyles[keypoints[i]]["display"] = "none"
      }
    }
  }

  public keyPointsLabelStyles = {
  	"L-Shoulder" : {
  		"position" : "absolute",
  		"display" : "none",
  		"top" : "0",
  		"left" : "0",
  		"background-color" : "lightgreen",
  		"border" : "2px solid plack"
  	},
  	"L-Elbow" : {
  		"position" : "absolute",
  		"display" : "none",
  		"top" : "0",
  		"left" : "0",
  		"background-color" : "lightgreen",
  		"border" : "2px solid plack"
  	},
  	"L-Hip" : {
  		"position" : "absolute",
  		"display" : "none",
  		"top" : "0",
  		"left" : "0",
  		"background-color" : "lightgreen",
  		"border" : "2px solid plack"
  	},
  	"L-Wrist" : {
  		"position" : "absolute",
  		"display" : "none",
  		"top" : "0",
  		"left" : "0",
  		"background-color" : "lightgreen",
  		"border" : "2px solid plack"
  	},
    "L-Ankle" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "L-Knee" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Shoulder" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Elbow" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Hip" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Wrist" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Ankle" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "R-Knee" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "Chin" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "T-Head" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
  }

  public selectKeyPoint(keyPoint){
    console.log("keyPoint: ", keyPoint)
    this.toggleLabels()
  	this.keyPointSelected = keyPoint;
  	for(var i = 0; i < this.keyPointsMap[this.exerciseSelected].length; i++){
  		if(this.keyPointsMap[this.exerciseSelected][i] == this.keyPointSelected){
  			this.keyPointsStylesMap[this.keyPointsMap[this.exerciseSelected][i]]["background-color"] = "lightblue"
  		}
  		else{
  			this.keyPointsStylesMap[this.keyPointsMap[this.exerciseSelected][i]]["background-color"] = "white"
  		}
  	}
  }

  public keyPointsStylesMap = {
  	"L-Shoulder" : {
  		"background-color" : "lightblue",
      "border" : "2px solid red" 
  	},
  	"L-Elbow" : {
  		"background-color" : "white",
      "border" : "2px solid red" 
  	},
  	"L-Wrist" : {
  		"background-color" : "white",
      "border" : "2px solid red" 
  	},
  	"L-Hip" : {
  		"background-color" : "white",
      "border" : "2px solid red" 
  	},
    "L-Ankle" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "L-Knee" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "R-Shoulder" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "R-Elbow" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "R-Wrist" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "R-Hip" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "R-Ankle" : {
      "background-color" : "white",
      "border" : "2px solid red"
    },
    "R-Knee" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "Chin" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "T-Head" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },

  }

createJSONFile(){

	let name = this.fileNameSelected.split(".").slice(0,-1).join(".") + ".json"
	let a = document.createElement('a');
	let type = "json";
	let text = JSON.stringify(this.workingAnnotation)
	a.href = URL.createObjectURL( new Blob([text], { type: type }) );
	a.download = name
	a.click();

	window.location.reload()
	//this.getFileNames("images")
	
}


}

