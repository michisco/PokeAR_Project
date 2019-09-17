var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseX = 0, mouseY = 0;
var angle = 0;
var pitch = 0, yaw = 0;
var clock = new THREE.Clock();

var delta,
    timeNotFiring = 5; //timer per evitare firing mousedown

var entities = []; //array modelli in gioco contemporaneamente :- max dim = 5

var ctxUI; //context del canvas della UI
var btn, controls, bat;

var gameOver = false;
var batteryEmpty = false;

var canvas, context; //canvas e context della UI di game over

var canvasRadar, contextRadar, imgRadar, imgRotomR; //canvas, context e immagine della UI del radar

function Init() {  
    //controllo se è disponibile il giroscopio nel dispositivo, altrimenti mostro schermata errore
    if (window.DeviceMotionEvent) { 
                /*Ottengo il canvas ovvero la finestra di gioco*/
                canvas = document.getElementById("finalResult");
                context = canvas.getContext("2d"); 
                    
                /*Ottengo il canvas ovvero la finestra di gioco*/
                canvasRadar = document.getElementById("radar");
                contextRadar = canvasRadar.getContext("2d");  
                imgRadar = new Image();
                imgRotomR = new Image();
                imgRotomR.src = "public/assets/rotomRadar.png";
    
                isDesktopVersion = false;
                PlayOST();
                Start();
       
                //Gestione fotocamera dispositivo
                CameraHandler();
                btn = document.getElementById("btnBack");
                bat = document.getElementById('battery');
          
                // Aggiungo il controller DeviceOrientation 
                controls = new THREE.DeviceOrientationControls(camera);
    }
    else {
                const loadingScreen = document.getElementById('loading-screen');
                loadingScreen.style.display = "none";
                const errorScreen = document.getElementById('notSupport-screen');
                errorScreen.style.display = "block";
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
        controls.update();
        Update(delta);
        RadarCamera(entities); 
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
    
    /*cambiamento della UI della batteria a seconda del tempo rimanente*/
      BatteryLoss();
}

function onTransitionEnd(event) {

    const element = event.target;
    element.remove();
}

/* Gestione camera dispositivo */
function CameraHandler() {
    //I vecchi browser potrebbero non implementare mediaDevices quindi setto primo un oggetto vuoto
    if (navigator.mediaDevices === undefined) {
         navigator.mediaDevices = {};
    }
    
    if (navigator.mediaDevices.getUserMedia === undefined) {
         navigator.mediaDevices.getUserMedia = function(constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
      
    }

    var video = document.getElementById('video1');
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    // Ottengo accesso alla camera!
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: "environment" } }
        })
            .then(function (stream) {
                //controllo per i browser più recenti
                if ("srcObject" in video) {
                     video.srcObject = stream;
                } else {
                    // Avoid using this in new browsers, as it is going away.
                     var vu = window.URL || window.webkitURL;
                     video.src = vu.createObjectURL(stream);
                }
                video.onloadedmetadata = function(e) {
                     video.play();
                };
            });
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
            void btn.offsetWidth;
            btn.classList.add("animated");
            SnapshotHandler(entities);
            timeNotFiring = 0;
        }
    }
}

function BatteryLoss() {                                         
            if (timer == 0){
                bat.classList.remove('flicker');
                bat.src = 'public/assets/empty-battery.png';
                batteryEmpty = false;
            }
            else if (timer <= 30 && timer > 0 && !batteryEmpty){
                bat.src = 'public/assets/empty-battery.png';
                bat.classList.add('flicker'); 
                batteryEmpty = true;
            }
            else if (timer <= 70 && timer > 30)
                bat.src = 'public/assets/half-battery.png';
            else if (timer <= 110 && timer > 70)
                bat.src = 'public/assets/battery-almost-full.png';
            else if (timer > 110)
                bat.src = 'public/assets/full-battery.png';                                           
 }
