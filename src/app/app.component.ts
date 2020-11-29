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

  public annotationType = "fretboard"
  public users = ["All"];
  public selectedUser = "All"
  public canvas;
  public canvasContext;
  public workingAnnotation;
  ngOnInit(){
  	this.getFileNames("images")
  	this.workingAnnotation = this.getBlankAnnotation()
    if(this.annotationType == 'fretboard'){
      this.selectKeyPoint("Top 0")
    }
    else if(this.annotationType == 'hand'){
      this.selectKeyPoint("Index 1")
    }


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
      else if(event.keyCode == 13){
        this.createJSONFile()
      }
    });
  }

  public getUsers(){
    for(let fileName of this.imageFileNames){
      let user = fileName.split(".")[1]
      if(!this.users.includes(user)){
        this.users.push(user)
      }
    }
  }

  public selectUser(user){
    this.selectedUser = user
  }

  public showFilename(name){
    if(this.selectedUser == "All"){
      return true
    }
    else{
      let split_name = name.split(".")
      if(split_name.includes(this.selectedUser)){
        return true
      }
      else{
        return false
      } 
    }
  }

  public toggleKeypoint(direction){
    console.log("inside toggleKeypoint")
    if(this.annotationType == 'exercise'){
      console.log("exerciseSelected: ", this.exerciseSelected)
      let index = this.keyPointsMap[this.exerciseSelected].indexOf(this.keyPointSelected)
      console.log("index: ", index)
      let newKeyPoint;
      if(direction == "up"){
        console.log("in up")
        if(index == this.keyPointsMap[this.exerciseSelected].length - 1){
            newKeyPoint = this.keyPointsMap[this.exerciseSelected][0]
        }
        else{
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
    else if(this.annotationType == 'fretboard'){
      let index = this.fretboardKeypoints.indexOf(this.keyPointSelected)
      let newKeyPoint;
      if(direction == "up"){
        console.log("in up")
        if(index == this.fretboardKeypoints.length - 1){
            newKeyPoint = this.fretboardKeypoints[0]
        }
        else{
          console.log(this.fretboardKeypoints[index + 1])
          newKeyPoint = this.fretboardKeypoints[index + 1]
        }
        
      }
      else{
           if(index == 0){
            return
            }
        newKeyPoint = this.fretboardKeypoints[index - 1]
      }
      this.selectKeyPoint(newKeyPoint)
    }

    else if(this.annotationType == 'hand'){
      let index = this.handKeypoints.indexOf(this.keyPointSelected)
      let newKeyPoint;
      if(direction == "up"){
        console.log("in up")
        if(index == this.handKeypoints.length - 1){
            newKeyPoint = this.handKeypoints[0]
        }
        else{
          console.log(this.handKeypoints[index + 1])
          newKeyPoint = this.handKeypoints[index + 1]
        }
        
      }
      else{
           if(index == 0){
            return
            }
        newKeyPoint = this.handKeypoints[index - 1]
      }
      this.selectKeyPoint(newKeyPoint)
    }
    
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
  console.log("type: ", type)
	this.http.get('api/fileNames/' + type)
				.subscribe( 
					(res) => {	
            console.log("res.json(): ", res.json())
						if(type == "images"){
							this.imageFileNames = res.json().fileNames
              console.log("imageFileNames: ", this.imageFileNames)
							this.getFileNames("labels")
              this.getUsers()
						}
						else{
							this.labelFileNames = res.json().fileNames
              console.log("labelFileNames: ", this.labelFileNames)
							this.matchFileNames()
						}							      		
					},
				    (error) => {
						console.log(error);
					}
		)
  }


  public getAnnotation(fileName){
  console.log("filename inside getAnnotation before en: ", fileName)
  let encodedFileName = encodeURIComponent(fileName)
	this.http.get('api/annotation/' + encodedFileName)
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
    var found = false
  	this.fileNameLabelStyles = []
  	for(var i = 0; i < this.labelFileNames.length; i++){
  		this.labelFileNames[i] = this.labelFileNames[i].split(".").slice(0,-1).join(".")
  	}
    console.log("labelFileNames: ", this.labelFileNames)
  	for(var i = 0; i < this.imageFileNames.length; i++){
  		if(this.labelFileNames.includes(this.imageFileNames[i].split(".").slice(0,-1).join("."))){
  			this.fileNameLabelStyles.push({"background-color" : "lightgreen", "border": "none"})
  		}
  		else{
  			this.fileNameLabelStyles.push({"background-color" : "red", "border": "none"})
        if(!found){
          this.selectImage(this.imageFileNames[i], i)
          found = true;
        }
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
	}, 500 )
  }

  public scaleFactor = 1
  public drawCanvas(){
    console.log("inside drawCanvas")
  	this.canvas.width = this.img.width * this.scaleFactor;
  	this.canvas.height = this.img.height * this.scaleFactor;
  	this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  	this.canvasContext.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

    if(this.annotationType == "exercise"){
    	const joints = Object.keys(this.workingAnnotation)
    	for(var i = 0; i < joints.length; i++){
    		this.canvasContext.beginPath()
    		this.canvasContext.arc(this.workingAnnotation[joints[i]]["x"] * this.canvas.width, this.workingAnnotation[joints[i]]["y"] * this.canvas.height, 2, 0 , 2 * Math.PI, false)
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

    else if(this.annotationType == "fretboard"){
      for(var i = 0; i < this.fretboardKeypoints.length; i++){
        if(!this.workingAnnotation[this.fretboardKeypoints[i]]){ continue }
        this.canvasContext.beginPath()
        let x = (this.workingAnnotation[this.fretboardKeypoints[i]]["x"] * this.canvas.width)
        let y = (this.workingAnnotation[this.fretboardKeypoints[i]]["y"] * this.canvas.height)
        this.canvasContext.arc(x, y,  2 , 0 , 2 * Math.PI, false)
        this.canvasContext.fillStyle = "red"
        this.canvasContext.fill()  
      }
    }

    else if(this.annotationType == "hand"){
      for(var i = 0; i < this.handKeypoints.length; i++){
        if(!this.workingAnnotation[this.handKeypoints[i]]){ return }
        this.canvasContext.beginPath()
        let x = (this.workingAnnotation[this.handKeypoints[i]]["x"] * this.canvas.width)
        let y = (this.workingAnnotation[this.handKeypoints[i]]["y"] * this.canvas.height)
        this.canvasContext.arc(x, y,  2 , 0 , 2 * Math.PI, false)
        this.canvasContext.fillStyle = "red"
        this.canvasContext.fill()  
      }
    }
  }


  public drawKeyPoint(){
    this.toggleLabels()
  	  setTimeout( ()=>{
        if(this.annotationType == "exercise"){
          this.keyPointsStylesMap[this.keyPointSelected]["border"] = "2px solid green"
          this.workingAnnotation[this.keyPointSelected]["x"] = (this.canvasX/this.canvas.width).toFixed(4)
          this.workingAnnotation[this.keyPointSelected]["y"] = (this.canvasY/this.canvas.height).toFixed(4)
          this.keyPointsLabelStyles[this.keyPointSelected].display = "block";
          this.keyPointsLabelStyles[this.keyPointSelected].top = (this.canvasY + this.canvasCoords.top) + "px"
          this.keyPointsLabelStyles[this.keyPointSelected].left = (this.canvasX + this.canvasCoords.left) + "px"
        }
        else if(this.annotationType == "fretboard"){
          let keypoint = {
            "x" : ((this.canvasX - window.scrollX)/this.canvas.width).toFixed(4),
            "y" : ((this.canvasY - window.scrollY)/this.canvas.height).toFixed(4)
          }
          this.fretboardLabelStyles[this.keyPointSelected]["border"] = "2px solid green"
          this.workingAnnotation[this.keyPointSelected] = keypoint
          this.fretboardLabelStyles[this.keyPointSelected].display = "block";
          this.fretboardLabelStyles[this.keyPointSelected].top = (this.canvasY + this.canvasCoords.top) + "px"
          this.fretboardLabelStyles[this.keyPointSelected].left = (this.canvasX + this.canvasCoords.left) + "px"         
        }
        else if(this.annotationType == "hand"){
          let keypoint = {
            "x" : ((this.canvasX - window.scrollX)/this.canvas.width).toFixed(4),
            "y" : ((this.canvasY - window.scrollY)/this.canvas.height).toFixed(4)
          }
          this.handLabelStyles[this.keyPointSelected]["border"] = "2px solid green"
          this.workingAnnotation[this.keyPointSelected] = keypoint
          this.handLabelStyles[this.keyPointSelected].display = "block";
          this.handLabelStyles[this.keyPointSelected].top = (this.canvasY + this.canvasCoords.top) + "px"
          this.handLabelStyles[this.keyPointSelected].left = (this.canvasX + this.canvasCoords.left) + "px"         
        }
	      this.drawCanvas()
  	  }, 50)

  }

  public computeDistance(pointA, pointB){
    let deltaX = Math.abs(pointA["x"] - pointB["x"])
    let deltaY = Math.abs(pointA["y"] - pointB["y"])

    let xSquared = Math.pow(deltaX, 2)
    let ySquared = Math.pow(deltaY, 2)

    return Math.sqrt(xSquared + ySquared)
  }

	public clearKeyPointsLabels(){
		let keyPoints = Object.keys(this.keyPointsLabelStyles)
		for(var i = 0; i < keyPoints.length; i++){
			this.keyPointsLabelStyles[keyPoints[i]]["display"] = "none"
		}
	}

  public exercises = ["Guitar", "Biceps Curl"]
  public exerciseSelected = "bicepscurl"
  //public keyPointSelected = "L-Shoulder"
  public keyPointSelected;
  public keyPointsMap = {
  	"bicepscurl" : ["L-Shoulder", "L-Elbow", "L-Wrist", "L-Hip",  "L-Knee", "L-Ankle", "R-Ankle", "R-Knee", "R-Hip", "R-Wrist", "R-Elbow", "R-Shoulder", "Chin", "T-Head"]
  }

  /*public fretboardKeypoints = [
    "Top 0", "Btm 0",
    "Top 1", "Btm 1",
    "Top 2", "Btm 2",
    "Top 3", "Btm 3",
    "Top 4", "Btm 4",
    "Top 5", "Btm 5",
    "Top 6", "Btm 6",
    "Top 7", "Btm 7",
    "Top 8", "Btm 8",
    "Top 9", "Btm 9",
    "Top 10", "Btm 10",
    "Top 11", "Btm 11",
    "Top 12", "Btm 12",
    "Top 13", "Btm 13",
    "Top 14", "Btm 14",
    "Top 15", "Btm 15",
    "Top 16", "Btm 16",
    "Top 17", "Btm 17",
    "Top 18", "Btm 18",
    "Top 19", "Btm 19",
    "Top 20", "Btm 20",
    "Top 21", "Btm 21",
    "Top 22", "Btm 22",
    "Top 23", "Btm 23",
    "Top 24", "Btm 24",
  ] */

  public fretboardKeypoints = ["Top 0", "Btm 0", "Top 22", "Btm 22" ]

  public handKeypoints = [
    "Index 1",
    "Index 2",
    "Index 3",
    "Index 4",
    "Middle 1",
    "Middle 2",
    "Middle 3",
    "Middle 4",
    "Ring 1",
    "Ring 2",
    "Ring 3",
    "Ring 4",
    "Pinkey 1",
    "Pinkey 2",
    "Pinkey 3",
    "Pinkey 4",
  ]

  public getBlankAnnotation(){
    if(this.annotationType == "exercise"){
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
    else if(this.annotationType == "fretboard" || this.annotationType == "hand"){
      return {}
    }
  }

  public toggleLabels(){
    if(this.annotationType == 'exercise'){
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
    else if(this.annotationType == 'fretboard'){
      console.log("fretboardLabelStyles: ", this.fretboardLabelStyles)
      for( var i = 0 ; i < this.fretboardKeypoints.length; i++){
        if(this.fretboardLabelStyles[this.fretboardKeypoints[i]]["display"] == "none"){
          this.fretboardLabelStyles[this.fretboardKeypoints[i]]["display"] = "block"
        }
        else{
          console.log("change to none")
          this.fretboardLabelStyles[this.fretboardKeypoints[i]]["display"] = "none"
        }
      }
    }
    else if(this.annotationType == 'hand'){
      console.log("fretboardLabelStyles: ", this.handLabelStyles)
      for( var i = 0 ; i < this.handKeypoints.length; i++){
        if(this.handLabelStyles[this.handKeypoints[i]]["display"] == "none"){
          this.handLabelStyles[this.handKeypoints[i]]["display"] = "block"
        }
        else{
          console.log("change to none")
          this.handLabelStyles[this.handKeypoints[i]]["display"] = "none"
        }
      }
    }
  }

  public fretboardSelectorsMap = {
    "Top 0" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "Btm 0" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "Top 1" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 1" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 2" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 2" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 3" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 3" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 4" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 4" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 5" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 5" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 6" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 6" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 7" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 7" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 8" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 8" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 9" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 9" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 10" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 10" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 11" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 11" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 12" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 12" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 13" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 13" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 14" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 14" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 15" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 15" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 16" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 16" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 17" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 17" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 18" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 18" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 19" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 19" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 20" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 20" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 21" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 21" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 22" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 22" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 23" : {
            "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 23" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Top 24" : {
     "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Btm 24" : {

      "background-color" : "white",
      "border" : "2px solid red" 
     },
  }

  public handLabelStyles = {
    "Index 1" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "Index 2" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "Index 3" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Index 4" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Middle 1" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Middle 2" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Middle 3" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Middle 4" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Ring 1" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Ring 2" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Ring 3" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Ring 4" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Pinkey 1" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Pinkey 2" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Pinkey 3" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Pinkey 4" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
  }

  public fretboardLabelStyles = {
    "Top 0" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "Btm 0" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
    "Top 1" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 1" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 2" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 2" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 3" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 3" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 4" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 4" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 5" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 5" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 6" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 6" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 7" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 7" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 8" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 8" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 9" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 9" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 10" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 10" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 11" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 11" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 12" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 12" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 13" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 13" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 14" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 14" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 15" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 15" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 16" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 16" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 17" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 17" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 18" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 18" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 19" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 19" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 20" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 20" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 21" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 21" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 22" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 22" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 23" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 23" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
    "Top 24" : {
      "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
    },
     "Btm 24" : {
       "position" : "absolute",
      "display" : "none",
      "top" : "0",
      "left" : "0",
      "background-color" : "lightgreen",
      "border" : "2px solid plack"
     },
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

  public handSelectorsMap = {
    "Index 1" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "Index 2" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
    "Index 3" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Index 4" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Middle 1" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Middle 2" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Middle 3" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Middle 4" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Ring 1" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Ring 2" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Ring 3" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Ring 4" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Pinkey 1" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Pinkey 2" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     },
    "Pinkey 3" : {
      "background-color" : "white",
      "border" : "2px solid red" 
    },
     "Pinkey 4" : {
       "background-color" : "white",
      "border" : "2px solid red" 
     }
  }

  public selectKeyPoint(keyPoint){
    this.keyPointSelected = keyPoint;
    this.toggleLabels()
    if(this.annotationType == 'exercise'){      
    	for(var i = 0; i < this.keyPointsMap[this.exerciseSelected].length; i++){
    		if(this.keyPointsMap[this.exerciseSelected][i] == this.keyPointSelected){
    			this.keyPointsStylesMap[this.keyPointsMap[this.exerciseSelected][i]]["background-color"] = "lightblue"
    		}
    		else{
    			this.keyPointsStylesMap[this.keyPointsMap[this.exerciseSelected][i]]["background-color"] = "white"
    		}
    	}
    }

    else if(this.annotationType == 'fretboard'){
      for(var i = 0; i < this.fretboardKeypoints.length; i++){
        if(this.fretboardKeypoints[i] == this.keyPointSelected){
          this.fretboardSelectorsMap[this.fretboardKeypoints[i]]["background-color"] = "lightblue"
        }
        else{
          this.fretboardSelectorsMap[this.fretboardKeypoints[i]]["background-color"] = "white"
        }
      }
    }

    else if(this.annotationType == 'hand'){
      for(var i = 0; i < this.fretboardKeypoints.length; i++){
        if(this.handKeypoints[i] == this.keyPointSelected){
          this.handSelectorsMap[this.handKeypoints[i]]["background-color"] = "lightblue"
        }
        else{
          this.handSelectorsMap[this.handKeypoints[i]]["background-color"] = "white"
        }
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

