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
  ngOnInit(){
  	this.getFileNames("images")

  }

  ngAfterViewInit(){
	document.addEventListener('click', this.getCanvasPos.bind(this), true);
	this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
	this.canvasContext = this.canvas.getContext('2d')
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

	      console.log(this.canvasX)
	      console.log(this.canvasY)
	}

  public drawKeyPoint(){
  	  console.log("inside drawKeyPoint()")
  	  setTimeout( ()=>{
  	  	  console.log(this.canvasContext)
	  	  this.canvasContext.beginPath()
	      this.canvasContext.arc(this.canvasX, this.canvasY, 5, 0 , 2 * Math.PI, false)
	      this.canvasContext.fillStyle = "red"
	      this.canvasContext.fill()

	      this.bicepsCurlAnnotation[this.keyPointSelected]["x"] = this.canvasX/this.canvas.width
	      this.bicepsCurlAnnotation[this.keyPointSelected]["y"] = this.canvasY/this.canvas.height

	      this.keyPointsLabelStyles[this.keyPointSelected].display = "block";
	      this.keyPointsLabelStyles[this.keyPointSelected].top = (this.canvasY + this.canvasCoords.top) + "px"
	      console.log("top: ",this.keyPointsLabelStyles[this.keyPointSelected].top)
	      this.keyPointsLabelStyles[this.keyPointSelected].left = (this.canvasX + this.canvasCoords.left) + "px"
	      console.log(this.bicepsCurlAnnotation)
  	  }, 50)

  }

  public imageFileNames = []
  public labelFileNames = []
  public getFileNames(type){
	this.http.get('api/fileNames/' + type)
				.subscribe( (res) => {	
						console.log("response: ", res)	
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


  public fileNameLabelStyles = []
  public matchFileNames(){
  	this.fileNameLabelStyles = []
  	for(var i = 0; i < this.labelFileNames.length; i++){
  		this.labelFileNames[i] = this.labelFileNames[i].split(".").slice(0,-1).join(".")
  	}

  	console.log(this.labelFileNames)


  	for(var i = 0; i < this.imageFileNames.length; i++){
  		if(this.labelFileNames.includes(this.imageFileNames[i].split(".").slice(0,-1).join("."))){
  			this.fileNameLabelStyles.push({"background-color" : "lightgreen"})
  		}
  		else{
  			this.fileNameLabelStyles.push({"background-color" : "red"})
  		}
  	}
  }

  public selectedImage;
  public fileNameSelected;
  public selectImage(name){
  	this.clearKeyPointsLabels()
  	this.fileNameSelected = name
	this.selectedImage = encodeURIComponent(name);
	var img = document.createElement("IMG") as HTMLImageElement;
	img.src = this.selectedImage;
	setTimeout( ()=>{
		this.canvas.width = img.width * 2;
		this.canvas.height = img.height * 2;
		this.canvasContext.drawImage(img, 0, 0, img.width * 2, img.height * 2);
	}, 50 )
  }

  public clearKeyPointsLabels(){
  	for(var i = 0; i < this.keyPointsMap[this.exerciseSelected].length; i++){
  		this.keyPointsLabelStyles[this.keyPointsMap[this.exerciseSelected][i]]["display"] = "none"
  	}
  }

  public exercises = ["Guitar", "Biceps Curl"]
  public exerciseSelected = "bicepscurl"
  public keyPointSelected = "L-Shoulder"
  public keyPointsMap = {
  	"bicepscurl" : ["L-Shoulder", "L-Elbow", "L-Wrist", "L-Hip"]
  }


  public bicepsCurlAnnotation = {
  	"L-Shoulder" : {
  		"x" : "",
  		"y" : ""
  	},
  	"L-Elbow" : {
  		"x" : "",
  		"y" : ""
  	},
  	"L-Wrist" : {
  		"x" : "",
  		"y" : ""
  	},
  	"L-Hip" : {
  		"x" : "",
  		"y" : ""
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
  }

  public selectKeyPoint(keyPoint){
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
  		"background-color" : "lightblue"
  	},
  	"L-Elbow" : {
  		"background-color" : "white"
  	},
  	"L-Wrist" : {
  		"background-color" : "white"
  	},
  	"L-Hip" : {
  		"background-color" : "white"
  	},

  }

createJSONFile(){

	let name = this.fileNameSelected.split(".").slice(0,-1).join(".") + ".json"
	let a = document.createElement('a');
	let type = "json";
	let text = JSON.stringify(this.bicepsCurlAnnotation)
	a.href = URL.createObjectURL( new Blob([text], { type: type }) );
	a.download = name
	a.click();

	window.location.reload()
	//this.getFileNames("images")
	
}


}

