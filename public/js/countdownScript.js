var timer = 120; //durata game
var min = 2;
var sec = 0;

var audio1 = new Audio('public/ost/LoopCreepy.wav');
function PlayOST() {
    audio1.addEventListener('ended', function () {
        //Attendi 500 millisecondi prima del prossimo loop
        setTimeout(function () { audio1.play(); }, 0);
    }, false);
    audio1.volume = 0.5;
    audio1.load();
    audio1.play();
}

function countdown() {
    var audio2;
    var timeGame = setInterval(function (){
        min = parseInt(timer / 60, 10)
        sec = parseInt(timer % 60, 10);
        min = (min < 10) ? "0" + min : min;
        sec = (sec < 10) ? "0" + sec : sec;

        if (timer == 31) {
             audioFadeOut(audio1);
            audio2 = new Audio('public/ost/countdownPokeBusters.wav');
            audio2.load();
            audio2.volume = 0.6;
            audio2.play();
            audio2.addEventListener('ended', function () {
                audio2.pause();
            }, false);
        }

        if (timer > 0) {
            timer--;
        }
        else {
            //finisce il tempo chiamo la funzione GameOver 
            GameOver();
            clearInterval(timeGame);
        }
            
    }, 1000);
    
    //funzione che esegue la dissolvenza in uscita dell'audio
    function audioFadeOut(q) {
        if (q.volume) {
            var volumeInt = 0.4;
            var setVolume = 0;  // livello di volume da raggiungere
            var speed = 0.005;  // velocità di decremento della ost
            q.volume = volumeInt;
            var fAudio = setInterval(function () {
                volumeInt -= speed;
                q.volume = volumeInt.toFixed(1); //arrontonda di due decimali
                if (volumeInt.toFixed(1) <= setVolume) {
                    clearInterval(fAudio); //blocca l'intervallo
                    q.pause();
                };
            }, 50);
        };
    };
}
