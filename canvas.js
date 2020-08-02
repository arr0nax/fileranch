let mouseStart = [0,0];
let mouseEnd = [0,0];
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let centerX = canvasWidth/2;
let centerY = canvasHeight/2;
let coords = [centerX,centerY];
let gridSize = 300;
let gridX = Math.floor(canvasWidth / gridSize);
let gridY = Math.floor(canvasHeight / gridSize);
let zoomLevel = 1;
let noClick = true;
let files = []
let pointers = []
let texts = [];
let noRender = false;
let inp;
let addButton;
let closeButton;
let inputText;
let inputCoords;
let consoleText = '';
let mobile = canvasWidth < 600;

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	document.getElementById('goHome').onclick = () => {
		coords = [centerX,centerY];
		zoomLevel = 1;
	}
	getFiles();
}

function getFiles() {
	inp && inp.remove()
	fetch(`/square?xMax=${coords[0] + 500}&xMin=${coords[0] - canvasWidth/zoomLevel - 500}&yMax=${coords[1] + 500}&yMin=${coords[1] - canvasHeight/zoomLevel - 500}`)
	.then((res) => res.json())
	.then((json) => {
		console.log(json);
		noRender = true;
		pointers.forEach(pointer => pointer.remove());
		pointers = [];
		files = [];
		texts = [];
		texts = json.text;
		files = json.files;
		files.forEach(file => {
			// const a = createA('http://twitter.com', file.file)
			const a = createA('/files/'+file.file, file.file)
			a.attribute('target', '_')
			// a.attribute('download', file.file)
			pointers.push(a);
		})
		noRender = false;
	});

}

function mouseClicked(event) {
	

	// return false; //to prevent weird browser things
}

function sendText() {

}

function mouseMoved() {
	noClick = false;
}

// function doubleClicked() {
// 	var textInput = document.createElement('input')
// 	textInput.setAttribute('type', 'text')
// 	textInput.focus();
// }

function mouseReleased(event) {
	getFiles();
	cursor('grab')
	if (!noClick && (event.target.id == 'defaultCanvas0')) {
		if (document.getElementById('file').checked) {
			const fileCoords = [coords[0] - mouseX, coords[1] - mouseY];
			var fileSelector = document.createElement('input');
			fileSelector.setAttribute('type', 'file');
			fileSelector.setAttribute('style', 'position: absolute; top: -50px');
			document.body.insertBefore(fileSelector, document.getElementById('buttons'));
			fileSelector.click();
			consoleText = 'asking for file';
			fileSelector.addEventListener('input', (e) => {
				console.log(e);
				consoleText = 'fileChange'
				const formData = new FormData()
				formData.append('file', fileSelector.files[0]);
				fetch(`/file?x=${fileCoords[0]}&y=${fileCoords[1]}`, {
				  method: 'POST',
				  body: formData,
				}).then((response) => {
					consoleText = response;
					getFiles()
					fileSelector.remove();
				})
				.catch(err => {
					consoleText = err;
					console.log(err)
					fileSelector.remove();
				})
			})
		}
		if (document.getElementById('text').checked) {
			inp = createInput('');
			inp.position(mouseX - 9, mouseY - 10);
			inp.elt.focus();
			inputCoords = [coords[0] - mouseX, coords[1] - mouseY - 4];
			inp.input(function() {inputText = this.value()})
			inp.elt.addEventListener('keyup', function(e) {
				if (e.key === 'Enter' || e.keyCode === 13) {
					const formData = new FormData()
					formData.append('inputText', inputText);
					fetch(`/text?x=${inputCoords[0]}&y=${inputCoords[1]}&text=${inputText}`, {
						method: 'POST'
					}).then((response) => getFiles())
					.catch(err => console.log(err))
				}
			})
		}
	}
}

function mouseDragged(event) {
	noClick = true;
	mouseEnd = [event.layerX / zoomLevel, event.layerY / zoomLevel];
	coords = [coords[0]+mouseEnd[0]-mouseStart[0], coords[1]+mouseEnd[1]-mouseStart[1]];
	mouseStart = mouseEnd;
 }

function mousePressed(event) {
	noClick = false;
	mouseStart = [event.layerX / zoomLevel, event.layerY / zoomLevel];
	cursor('grabbing');
	inp && inp.remove();
	addButton && addButton.remove();
	closeButton && closeButton.remove();
}

// function mouseWheel(event) {
	// not quite ready yet
	// zoomLevel += -event.delta / 1000;
	// if (zoomLevel >= 10) zoomLevel = 10;
	// if (zoomLevel <= .1) zoomLevel = .1;
// }

function draw() {
	clear();
	// textSize(20);
	// text((coords[0] - mouseX) +', ' +( coords[1] - mouseY), 10, 10);
	textSize(12);
	// scale(zoomLevel);
	// if (mobile) {
	// 	scale(0.8, 0.8)
	// }
	var offsetX = coords[0] % gridSize;
	var offsetY = coords[1] % gridSize;
	stroke(220);
	for(var i=0; i<=gridX/zoomLevel; i++) {
		line(i*gridSize+offsetX,0, i*gridSize+offsetX, canvasHeight/zoomLevel) 
	}
	for(var j=0; j<=gridY/zoomLevel; j++) {
		line(0, j*gridSize+offsetY,canvasWidth/zoomLevel, j*gridSize+offsetY) 
	}
	fill(0, 102, 153, 0.5);
	for(var i=-1; i<=Math.ceil(gridX/zoomLevel) + 1; i++) {
		for(var j=-1; j<=Math.ceil(gridY/zoomLevel); j++) {
			var x = betterFloor(coords[0] / gridSize) - i;
			var y = betterFloor(coords[1] / gridSize) - j;
			var locX = i*gridSize+offsetX + 4;
			var locY = j*gridSize+offsetY - 4;
			text(x + ', ' + y, locX, locY);
		}
	}
	textSize(20);
	textStyle(ITALIC);
	fill(0,0,0);
	// text(consoleText, 10, 20);
	if (!noRender) {
		pointers.forEach((pointer, i) => {
			pointer.position(coords[0] - files[i].x, coords[1] - files[i].y);
	
		})
		texts.forEach((words, i) => {
			text(words.text, coords[0] - words.x, coords[1] - words.y);
		})
	}
}

function betterFloor(int) {
	if (Math.sign(int) == 1) {
		return Math.floor(int)
	} else {
		return Math.ceil(int)
	}
}

function windowResized() {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	centerX = canvasWidth/2;
	centerY = canvasHeight/2;
	gridX = Math.floor(canvasWidth / gridSize);
	gridY = Math.floor(canvasHeight / gridSize);	
	resizeCanvas(canvasWidth, canvasHeight);
  }