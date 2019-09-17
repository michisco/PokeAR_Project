var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseX = 0, mouseY = 0;
var angle = 0;
var pitch = 0, yaw = 0;
var clock = new THREE.Clock();

var delta,
    timeNotFiring = 5; //timer per evitare firing mousedown

var ctxUI; //context del canvas della UI
var btn; 

var entities = []; //array modelli in gioco contemporaneamente :- max dim = 5

var gameOver = false;
var canvas, context; //canvas e context della UI di game over

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', onSnap, false);

function Init() {
    /*Ottengo il canvas ovvero la finestra di gioco*/
    canvas = document.getElementById("finalResult");
    context = canvas.getContext("2d");
    
    isDesktopVersion = true;
    PlayOST();
    Start();
    btn = document.getElementById("btnBack");
    /*Costruzione UI del gioco */
    var PIXEL_RATIO = (function () {
        var ctx = document.getElementById("cameraLook").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    })();


    createHiDPICanvas = function (w, h, ratio) {
        if (!ratio) { ratio = PIXEL_RATIO; }
        var can = document.getElementById("cameraLook");
        can.width = w * ratio;
        can.height = h * ratio;
        can.style.width = w + "px";
        can.style.height = h + "px";
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
        return can;
    }
}

//loop game
function animate() {
    requestAnimationFrame(animate);
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    if (!gameOver) {
        delta = clock.getDelta();
        timeNotFiring += delta;
        Update(delta);
        commandCamera(delta);
    }
    else {     
        //se game over levo ogni entità nel gioco 
        for (var i = entities.length - 1; i >= 0; i--) {
            entities[i].obj.visible = false;
            entities[i].obj.position.set(0, 0, 30);
            entities.splice(i, 1);
        }
         DrawingWindow();
    } 
    countdownHandler();
}

/* Calcola posizione del cursore in coordinate XY
 * 
 * @param {any} event = evento movimento cursore
 */
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 10;
    mouseY = (event.clientY - windowHalfY) * 10;
}

/* Firing evento mouse
 * 
 * @param {any} event = evento click mouse 
 */
function onSnap(event) {
    if (!gameOver) {
        //ogni 5 secondi da un click del mouse 
        if (timeNotFiring >= 5) {
            btn.classList.remove('animated');
            //SnapshotHandler(entities); --> richiamo la funzione per la gestione dello spawn dei target
            void btn.offsetWidth;
            btn.classList.add("animated");
            SnapshotHandler(entities);
            timeNotFiring = 0;
        }
    }
}

/* Muove la telecamera di gioco 
 * 
 * @param {any} delta = clock
 */
function commandCamera(delta) {

    var rotateAngle = Math.PI / 3 * delta;

    //left
    if (mouseX >= 3200) {
        if (yaw >= -Math.PI / 2 - 0.2)
            yaw -= rotateAngle;
    }
    //right
    else if (mouseX <= -3200) {
        if (yaw <= Math.PI / 2 + 0.2)
            yaw += rotateAngle;
    }

    //up
    if (mouseY >= 1000) {
        if (pitch >= -Math.PI / 4)
            pitch -= rotateAngle;
    }
    //down
    else if (mouseY <= -1000) {
        if (pitch <= Math.PI / 9)
            pitch += rotateAngle;
    }

    camera.setRotationFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
}

function onTransitionEnd(event) {

    const element = event.target;
    element.remove();

}

function countdownHandler(){
    document.getElementById("min").innerHTML = min;
    document.getElementById("sec").innerHTML = sec;
    
    if(timer == 31){
        document.getElementById("min").style.color = 'red';
        document.getElementById("sec").style.color = 'red';
        document.getElementById("between").style.color = 'red';
    }
    else if(timer > 31){
        document.getElementById("min").style.color = 'white';
        document.getElementById("sec").style.color = 'white';
        document.getElementById("between").style.color = 'white';
    }
}
