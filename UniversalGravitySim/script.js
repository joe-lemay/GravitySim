const c = document.getElementById("canvas1");
const ctx = c.getContext("2d");

c.height = 900;
c.width = 1900;

let canvasX = 0;
let canvasY = 0;

let cameraChange = [];
let trailBool = false;

let distortionLevel = 0;
let distortionAngle = 0;
let distortionRadius = 0;

var isRunning = true;
var massScaler = 1;
var maxSpeed = 5;
var timeStep = 0.001;
var maxSize = 1;
var maxBodies = 1000;
var minDist = 50;
var maxDist = 500;
var distScale = 1.2;
var bounceDrag = 0.9;
var wallBool = false;
var bhMoveToggle = false;
var startX, startY, endX, endY;
var userBodyMass = 10;
var userBodySize = 10;
var userBodyType = "blackHole";

const G = 6.67408e-11;

let bodyList = [];

class massBody {
    static bodyList = [];
    constructor(data) {
        this.width = data.width;
        this.height = data.height;
        this.xPos = data.xPos;
        this.yPos = data.yPos;
        this.xSpeed = data.xSpeed;
        this.ySpeed = data.ySpeed;
        this.mass = data.mass;
        // this.blackHole = data.blackHole;
        this.color = data.color;
    }

    updateNewtonian() {
        bodyList.forEach(body => {
            const dx = this.xPos - body.xPos;
            const dy = this.yPos - body.yPos;
            if (dx !== 0 && dy !== 0) {
                let dist = Math.sqrt(dx * dx + dy * dy) / distScale;
                if (dist < minDist) { dist = minDist };
                if (dist > maxDist) { dist = maxDist };
                const force = (G * this.mass * body.mass * massScaler) / (dist * dist);
                // Calculate force x and y component
                const fx = force * (dx) / dist;
                const fy = force * (dy) / dist;

                //Update velocity
                if (bhMoveToggle) {
                    this.xSpeed -= fx / this.mass * timeStep;
                    this.ySpeed -= fy / this.mass * timeStep;
                    this.xPos += this.xSpeed;
                    this.yPos += this.ySpeed;
                }
                if (!bhMoveToggle) {
                    if (!this.blackHole) {
                        this.xSpeed -= fx / this.mass * timeStep;
                        this.ySpeed -= fy / this.mass * timeStep;
                        this.xPos += this.xSpeed;
                        this.yPos += this.ySpeed;
                    }

                }
                if (Math.abs(this.xSpeed) > maxSpeed) {
                    if (this.xSpeed > 0) {
                        this.xSpeed = maxSpeed
                    }
                    else {
                        this.xSpeed = maxSpeed * -1;
                    }
                }
                if (Math.abs(this.ySpeed) > maxSpeed) {
                    if (this.ySpeed > 0) {
                        this.ySpeed = maxSpeed
                    }
                    else {
                        this.ySpeed = maxSpeed * -1;
                    }
                };
            }
        });
        if (this.blackHole || wallBool) {
            if (this.xPos > 1880) { this.xSpeed *= -1 * bounceDrag };
            if (this.xPos < 20) { this.xSpeed *= -1 * bounceDrag };
            if (this.yPos > 980) { this.ySpeed *= -1 * bounceDrag };
            if (this.yPos < 20) { this.ySpeed *= -1 * bounceDrag };
        }
    }

    static updateAllBodies(bodyList) {
        bodyList.forEach(body => {
            body.updateNewtonian();
        })
    }

    static drawBodies(thisCanvas) {
        bodyList.forEach(body => {
            if(cameraChange !== undefined){
                switch(cameraChange){
                    case "zoomIn":
                        thisCanvas.transform(1.5, 0, 0, 1.5, 0, 0);

                        break;
                    case "zoomOut":
                        thisCanvas.transform(0.7, 0, 0, 0.7, 0, 0)
                        break;
                    default:thisCanvas.translate(canvasX, canvasY);
                }
                ctx.clearRect(0, 0, 1920, 1080);
                cameraChange = undefined;
                canvasX = 0;
                canvasY = 0;
            }
            // console.log("Drawing: "+ body.xPos)
            // thisCanvas.fillRect(body.xPos, body.yPos, body.width, body.height);

            // thisCanvas.fillStyle = body.color;
            // thisCanvas.strokeStyle = "black"
            // thisCanvas.arc(body.xPos, body.yPos, body.width/2, 0, Math.PI * 2);
            // thisCanvas.fill();
            // thisCanvas.beginPath();
            // thisCanvas.stroke();

            
            if(!body.blackHole){
                var imageSun = new Image();
                imageSun.src = './imgs/sunfinal-bg.png';
    
                var imageJup = new Image();
                imageJup.src = './imgs/jupiterbg.png';
    
                var imageEarth = new Image();
                imageEarth.src = './imgs/earthbg.png';
                if (body.height < 25) {
                    
                    ctx.drawImage(imageEarth, body.xPos-body.width/2, body.yPos-body.height/2, body.width, body.height);
                }
                else if (body.height >= 25 && body.height < 60) {
                    ctx.drawImage(imageJup, body.xPos-body.width/2, body.yPos-body.height/2, body.width, body.height);
                } else {
                    ctx.drawImage(imageSun, body.xPos-body.width/2, body.yPos-body.height/2, body.width, body.height);
                }
            }else{
                drawDistortedBackground(body.xPos, body.yPos);
            }

        });
    }

    static makeBodies(num) {
        for (var i = 0; i < num; i++) {
            let size = Math.random() * maxSize;
            let thisData = {
                "xPos": Math.random() * (1780 - 20) + 20,
                "yPos": Math.random() * (980 - 20) + 20,
                // "xSpeed" : (Math.random() * (3 - (-3)) + (-3)/50),
                // "ySpeed" : (Math.random() * (3 - (-3)) + (-3)/50),
                "xSpeed": 0,
                "ySpeed": 0,
                "mass": size * 10000000000,
                "height": size,
                "width": size,
                "blackHole": false,
                "color": "white"
            }
            let thisBody = new massBody(thisData);
            bodyList.push(thisBody);
        }
    }

    static makeBlackHole(xPos = 700, yPos = 450) {
        let thisData = {
            "xPos": xPos,
            "yPos": yPos,
            "xSpeed": 0,
            "ySpeed": 0,
            "mass": 10000000000000,
            "height": 5,
            "width": 5,
            "blackHole": true,
            "color": "purple"
        }
        let blackHole = new massBody(thisData);
        bodyList.push(blackHole);
    }

    static createOnClick(evt) {
        let rect = c.getBoundingClientRect();
        let mouseX = evt.clientX - rect.left;
        let mouseY = evt.clientY - rect.top;
        this.makeBlackHole(mouseX, mouseY);
    }

    static createOnDrag(evt) {
        let rect = c.getBoundingClientRect();
        startX = evt.clientX - rect.left;
        startY = evt.clientY - rect.top;
    }
    static endDrag(evt) {
        let rect = c.getBoundingClientRect();
        endX = evt.clientX - rect.left;
        endY = evt.clientY - rect.top;

        let diffX = startX - endX;
        let diffY = startY - endY;
        console.log(diffX, diffY);
        let thisData = {
            "xPos": endX+userBodyMass/2,
            "yPos": endY+userBodyMass/2,
            "xSpeed": diffX * (massScaler * 10) / 50000,
            "ySpeed": diffY * (massScaler * 10) / 50000,
            "mass": userBodyMass * 10000000000,
            "height": userBodySize,
            "width": userBodySize,
            "blackHole": false,
            "color": "white"
        }
        if (userBodyType == "massBody") {
            let thisBody = new massBody(thisData);
            bodyList.push(thisBody);
        }
        if (userBodyType == "blackHole") {
            massBody.makeBlackHole(endX, endY);
        }
    }

    static clearHoles() {
        for (let i = 0; i < bodyList.length; i++) {
            if (bodyList[i].blackHole == true) {
                bodyList.splice(i, 1)
                i--
            }
        }
    }

    static clearLastBody() {
        bodyList.pop();
    }

    static recreateUniverse() {
        for (let i = 0; i < bodyList.length; i++) {
            bodyList.splice(i, 1)
            i--
        }
        ctx.clearRect(0, 0, 1920, 1080);
        massBody.makeBodies(maxBodies);
    }

    static clearAllBodies() {
        bodyList = [];
        ctx.clearRect(0, 0, 1920, 1080);
    }

}

function updateDistortion() {
    distortionLevel += 0.1;
    distortionAngle += 0.1;
    distortionRadius += 0.5;

    if (distortionRadius > 1) {
        distortionRadius = 0;
    }
    if (distortionLevel > 8) {
        distortionLevel = 8;
    }
}

function drawDistortedBackground(xPos,yPos) {
    // Draw a black circle to represent the black hole
    ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(xPos, yPos, 2, 0, Math.PI * 2);
    ctx.fill();

    // Save the canvas state
    ctx.save();

    // Apply the distortion effect using a combination of scale, rotate, and translate transforms
    ctx.translate(xPos, yPos);
    ctx.rotate(distortionAngle);
    ctx.scale(distortionLevel, distortionLevel);
    ctx.translate(-xPos, -yPos);

    // Draw a gradient circle to represent the distorted background
    const gradient = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, 1);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'gray');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(xPos, yPos, distortionRadius/2, 0, Math.PI * 2);
    ctx.fill();

    // Restore the canvas state
    ctx.restore();
}

function checkHole() {
    let bhMove = document.querySelector('input[name="bhInput"]:checked').value;
    if (bhMove == "true") {
        bhMoveToggle = false
        console.log(bhMoveToggle)
    }
    else {
        bhMoveToggle = true
        console.log(bhMoveToggle)
    }
}

function checkBodyType() {
    let bodyType = document.getElementById("bodyChoice");
    userBodyType = bodyType.options[bodyType.selectedIndex].value;
}

function checkWall() {
    let wallTog = document.querySelector('input[name="wallInput"]:checked').value;
    if (wallTog == "true") {
        wallBool = true
        console.log(wallBool)
    }
    else {
        wallBool = false
        console.log(wallBool)
    }
}

function checkTrails(){
    let trailTog = document.querySelector('input[name="trailInput"]:checked').value;
    if(trailTog == "true"){
        trailBool = true
    }
    else{
        trailBool = false
    }
}

function zoomIn(){
    cameraChange = "zoomIn";
}
function zoomOut(){
    cameraChange = "zoomOut";
}

function panLeft(){
    canvasX += 100;
    cameraChange = "moveLeft"
}

function panRight(){
    canvasX -= 100;
    cameraChange = "moveRight"
}

function panUp(){
    canvasY += 100;
    cameraChange = "moveUp"
}

function panDown(){
    canvasY -= 100;
    cameraChange = "moveDown"
}

const timeSlider = document.getElementById("time");
timeSlider.addEventListener('input', function (e) {
    timeStep = e.target.value
});

const massSlider = document.getElementById("mass");
massSlider.addEventListener('input', function (e) {
    massScaler = e.target.value
});

const numOfBodies = document.getElementById("bodyNum");
numOfBodies.addEventListener('input', function (e) {
    maxBodies = e.target.value
});

const maxSizeOutput = document.getElementById("maxSize");
maxSizeOutput.addEventListener('input', function (e) {
    maxSize = e.target.value
});

const distSlider = document.getElementById("dist");
distSlider.addEventListener('input', function (e) {
    distScale = e.target.value;
    console.log(distScale)
});

const bodyMassInput = document.getElementById("bodyMass");
bodyMassInput.addEventListener('input', function (e) {
    userBodyMass = e.target.value;
});

const bodySizeInput = document.getElementById("bodySize");
bodySizeInput.addEventListener('input', function (e) {
    userBodySize = e.target.value;
    console.log(userBodySize)
});

massBody.makeBodies(maxBodies);

function animate(running) {
    massBody.updateAllBodies(bodyList);
    if(!trailBool){
        ctx.clearRect(0, 0, 1920, 1080);
    }
    massBody.drawBodies(ctx);
    updateDistortion();
    if(running){
        requestAnimationFrame(animate);
    }
}
animate(isRunning);

