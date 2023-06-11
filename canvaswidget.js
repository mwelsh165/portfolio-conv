/*TO DO: 
-	Replace canvasContent with a 2D array
--		Make sure it works with the Convolutional Network
*/
//COULD DO: include drawing the canvas and button in this file. maybe make it a class?
async function importModel(){
	let m = await tf.loadLayersModel('conv/model.json');
	return m
}
function drawPixel(event, ctx){
	//first find the cursor location within the canvas itself (clientX gives it relative to the viewport so we must first find where the canvas is within the viewport)
	let rect = event.target.getBoundingClientRect();
	
	//get exact pixel location within grid (for shading)
	let pixelLoc = [event.clientX - rect.left, event.clientY - rect.top];
	console.log(pixelLoc);
	let location = [Math.floor(pixelLoc[0]/10), Math.floor(pixelLoc[1]/10)];
	
	//if lastcell == location do nothing, else
	lastcell = location;
	//rewrite this to include shading on the adjacent cells
	
	context.fillStyle='#000000';
	if(canvasContent[location[1]][location[0]] != 1) {
		//set the content array (fed to ANN) to have a positive value at the correct index
		canvasContent[location[1]][location[0]] = 1;
		console.log(location);
		ctx.fillRect(location[0]*10, location[1]*10, 10,10);
	}
	
	//list in order up,down,left,right
	//at the centre of the cell, shading on either side is 0 (could try 1/10th?)
	//only trigger new draw call when the mouse moves into a new cell
	//will need to change context.fillStyle colour for each write, ewww
	//location is a 2d array [x,y]
	adjacent_cells = [[location[0],location[1]-1], [location[0],location[1]+1], [location[0]-1,location[1]],[location[0]+1,location[1]]];
	context.fillStyle='#DDDDDD'
	for(let i = 0; i<4; i++){
		let coords = [adjacent_cells[i][0]*10, adjacent_cells[i][1]*10];
		console.log(coords);
		if(canvasContent[adjacent_cells[i][1]][adjacent_cells[i][0]] < 1){	
			ctx.fillRect(coords[0],coords[1], 10, 10);
			canvasContent[adjacent_cells[i][1]][adjacent_cells[i][0]] = Math.random() * 0.3;
		}
	}
		//canvasContent[location[0]+(27*location[1])] += 
	
	//from here or from another button, call another function to format the drawing ready for entrance into the ANN.
	//callANN(location);
	
}

function clearDrawArea(can, ctx) {
	ctx.clearRect(0,0,can.width,can.height);
	for(let i = 0; i<canvasContent.length; i++){
		canvasContent[i] = new Array(28).fill(0);
	}
}

async function callANN(){
	console.log(canvasContent);
	m = await model;
	//not the right shape
	//figure out shape for single example in python notebook
	let example = tf.tensor(canvasContent);
	example = tf.expandDims(example);
	example = tf.expandDims(example,example.rank);
	console.log(example.dataSync());
	const prediction = m.predict(example).dataSync();
	console.log(prediction);
	let mostLikely = prediction.indexOf(Math.max(...prediction));
	console.log(mostLikely);
	generateChart(prediction);
}

function generateChart(prediction){
	div = document.getElementById('results');
	let data = [
	{
		x: ['0','1','2','3','4','5','6','7','8','9','10'],
		y: [...prediction],
		type: 'bar'
	}
	];
	Plotly.newPlot(results, data);
}
var model =  importModel();
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');
var canvasContent = new Array(28);
for(let i = 0; i<canvasContent.length; i++){
	canvasContent[i] = new Array(28).fill(0);
}
console.log(canvasContent);
context.fillStyle = '#000000';
//track last cell the mouse was in
var lastcell;
//mousedown or click event. mousedown/up might allow drawing rather than individual pixel clicks
//clientx/y
// use addEventListener(MouseEvent, shouldDraw)
canvas.addEventListener('mousemove', function() { if(event.buttons==1){ drawPixel(event,context,canvasContent)}});
canvas.addEventListener('mousedown', function(){drawPixel(event,context,canvasContent)});

let clearButton = document.querySelector('#clearcanvas');
clearButton.addEventListener('click', function(){ console.log("clear"); clearDrawArea(canvas, context)});

let evalButton = document.querySelector('#evaluate');
evalButton.addEventListener('click', function(){callANN()});
