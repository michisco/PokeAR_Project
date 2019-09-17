if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
}
   
var gastlys = [], //array modelli gastly totali :- max dim = 5
    gastlyShiny, //unico modello cromatico di Gastly 
    haunters = [],
    haunterShiny,
    gengars = [],
    gengarShiny,
    rotom,
    rotomShiny,
    pumpkaboo,
    hoopa;

var mixer; //mixer animation per i modelli

var levelGame = 0, //livello raggiunto dal giocatore in una partita
    score = 0; //punteggio del giocatore 

var flashAudio; //audio dello snapshot
var screamAudio; //audio di un urlo

var onceSpecial = false, //booleano che forza ad eseguire la funzione di special spawn una volta sola
    specialSpawn = false, //booleano che verifica se è presente un oggetto speciale in gioco
    catchHoopa = false, //booleano che verifica se il giocatore abbia catturato Hoopa
    pumpkabooSnap = false; //booleano che verifica se è stato fotografato Pumpkaboo

var timerSpawn = 0, //timer per lo spawn di oggetti
    eventSpawn = 5; //secondi che devono passare da uno spawn all'altro

var container, controls;
var camera, scene, renderer, light, pointLight;
var frustumCamera;

var isDesktopVersion = false; //booleano che verifica se il gioco è in modalità in desktop o mobile

var listener, scoreText;

var vectLookCamera, vectDirection, vectLookPumpkaboo, vectDirPumpkaboo;
  
/* Funzione che inizializza il gioco*/
function Start() {

    /*Costruzione UI del gioco */
    scoreText = document.getElementById("scoreGame");
   
    /*Inizializzo il gestore del caricamento*/
    const loadingManager = new THREE.LoadingManager();

    /*Aggiorno la percentuale di caricamento della pagina*/
    loadingManager.onProgress = function (item, loaded, total) {
        document.getElementById("loadingText").innerHTML = (parseInt(loaded / 102 * 100)) + '%';
    };

    /*Creo un nuovo container dove ospitare il "mondo" di gioco e lo appendo al body della pagine html */
    container = this.document.createElement('div');
    document.body.appendChild(container);

    /*Creo una camera di gioco */
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 85, 0); //<--- (x: asse orizzontale , y: altezza, z: asse verticale)
    frustumCamera = new THREE.Frustum();  

    /*Creo audio listener*/
    listener = new THREE.AudioListener();
    camera.add(listener);

    /*Creo vectors*/
    vectLookCamera = new THREE.Vector3();
    vectDirection = new THREE.Vector3();
    vectLookPumpkaboo = new THREE.Vector3();
    vectDirPumpkaboo = new THREE.Vector3();

    /*Creo una scena */
    scene = new THREE.Scene();
    //controllo se è un dispositivo o Desktop
    if(isDesktopVersion){
        scene.background = new THREE.CubeTextureLoader()
        .setPath( 'public/js/Textures/Park3Med/' )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
    }

    /*Aggiungo una luce ambientale*/
    light = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(light);
    /*e una luce direzionale dall'alto*/
    pointLight = new THREE.DirectionalLight(0xffffff);
    pointLight.position.set(0, 200, 100);
    pointLight.castShadow = true;
    camera.add(pointLight);

    //Audio dello snapshot
    flashAudio = new THREE.Audio(this.listener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('public/ost/sound/cameraSnapshot.wav', function (buffer) {
        flashAudio.setBuffer(buffer);
        flashAudio.setVolume(0.4);
    });
    
    screamAudio = new THREE.Audio(this.listener);
    var audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load('public/ost/sound/scream.wav', function (buffer) {
        screamAudio.setBuffer(buffer);
        screamAudio.setVolume(0.6);
    });

    /*Caricamento dei modelli .fbx */
    const loader = new THREE.FBXLoader(loadingManager);
    //const loader = new THREE.FBXLoader();
    loader.load('public/assets/model/RotomNormal.fbx', function (object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.timeScale = 1.45;
        action.play();
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                //cambio PhongMaterial in LambertMaterial
                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning
                });
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/rotomCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        object.translateZ(30);
        object.visible = false;
        rotom = { 'obj': object, 'name': "Rotom", 'countLife': 6, 'animationSetup': action, 'cry': sound, 'mixer': mixer };

        scene.add(object);
    });
    loader.load('public/assets/modelShiny/RotomShiny.fbx', function (object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.timeScale = 1.45;
        action.play();
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                //cambio PhongMaterial in LambertMaterial
                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning
                });
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/rotomCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        object.translateZ(30);
        object.visible = false;
        rotomShiny = { 'obj': object, 'name': "RotomS", 'countLife': 4, 'animationSetup': action, 'cry': sound, 'mixer': mixer };
        scene.add(object);
    });
    loader.load('public/assets/modelShiny/HoopaShiny.fbx', function (object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.play();
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                //cambio PhongMaterial in LambertMaterial
                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning
                });
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/hoopaCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        object.translateZ(30);
        object.visible = false;
        hoopa = { 'obj': object, 'name': "Hoopa", 'timeRush': 10, 'isRushing': false, 'timeLife': 15, 'cry': sound, 'mixer': mixer };
        scene.add(object);
    });
    loader.load('public/assets/modelShiny/PumpkabooShiny.fbx', function (object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.play();
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                //cambio PhongMaterial in LambertMaterial
                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning
                });
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/pumpkabooCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        object.translateZ(30);
        object.visible = false;
        pumpkaboo = { 'obj': object, 'name': "Pumpkaboo", 'timeLife': 10, 'cry': sound, 'mixer': mixer };
        scene.add(object);
    });
    loader.load('public/assets/modelShiny/HaunterShiny.fbx', function (object) {

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                //cambio PhongMaterial in LambertMaterial
                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning
                });
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/haunterCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.play();
        object.translateZ(30);
        object.visible = false;

        haunterShiny = { 'obj': object, "name": "HaunterS", 'orientation': 0, 'cry': sound, 'mixer': mixer};
        scene.add(object);
    });
    loader.load('public/assets/modelShiny/GengarShiny.fbx', function (object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.play();

        var array = [];
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                child.material = new THREE.MeshLambertMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    name: oldMat.name,
                    alphaMap: oldMat.alphaMap,
                    aoMap: oldMat.aoMap,
                    combine: oldMat.combine,
                    emissive: oldMat.emissive,
                    emissiveMap: oldMat.emissiveMap,
                    emissiveIntensity: oldMat.emissiveIntensity,
                    envMap: oldMat.envMap,
                    lightMap: oldMat.lightMap,
                    lightMapIntensity: oldMat.lightMapIntensity,
                    morphNormals: oldMat.morphNormals,
                    morphTargets: oldMat.morphTargets,
                    skinning: oldMat.skinning,
                    transparent: true
                });
                array.push(child.material);
            }
        });
        //assegno audio all'oggetto
        var sound = new THREE.PositionalAudio(listener);
        audioLoader.load('public/ost/sound/gengarCry.wav', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(100);
            sound.setVolume(0.5);
        });

        gengarShiny = { 'obj': object, 'name': "GengarS", 'invisibility': false, 'mat': array, 'timeVisible': 20, 'cry': sound, 'mixer': mixer};
        object.translateZ(30);
        object.visible = false;
        scene.add(object);
    });

    /*Caricamento sprite in una mesh */
    var gastlyTexture = new THREE.TextureLoader().load('public/assets/modelShiny/GastlyShiny.png');
    var runnerMaterial = new THREE.MeshBasicMaterial({ map: gastlyTexture, useScreenCoordinates: false, transparent: true });
    var runnerGeometry = new THREE.PlaneBufferGeometry(128, 128, 1, 1);
    var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
    runner.position.set(0, 0, 30);
    runner.visible = false;
    //assegno audio all'oggetto
    var soundGas = new THREE.PositionalAudio(listener);
    audioLoader.load('public/ost/sound/gastlyCry.wav', function (buffer) {
        soundGas.setBuffer(buffer);
        soundGas.setRefDistance(100);
        soundGas.setVolume(0.5);
    });
    gastlyShiny = { 'obj': runner, 'name': "GastlyS", 'cry': soundGas, 'mixer': new textureAnimator(gastlyTexture, 64, 1, 64, 75)};
    scene.add(runner);

    for (var i = 0; i < 5; i++) {

        loader.load('public/assets/model/HaunterNormal.fbx', function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const oldMat = child.material;

                    //cambio PhongMaterial in LambertMaterial
                    child.material = new THREE.MeshLambertMaterial({
                        color: oldMat.color,
                        map: oldMat.map,
                        name: oldMat.name,
                        alphaMap: oldMat.alphaMap,
                        aoMap: oldMat.aoMap,
                        combine: oldMat.combine,
                        emissive: oldMat.emissive,
                        emissiveMap: oldMat.emissiveMap,
                        emissiveIntensity: oldMat.emissiveIntensity,
                        envMap: oldMat.envMap,
                        lightMap: oldMat.lightMap,
                        lightMapIntensity: oldMat.lightMapIntensity,
                        morphNormals: oldMat.morphNormals,
                        morphTargets: oldMat.morphTargets,
                        skinning: oldMat.skinning
                    });
                }
            });

            //assegno audio all'oggetto
            var sound = new THREE.PositionalAudio(listener);
            audioLoader.load('public/ost/sound/haunterCry.wav', function (buffer) {
                sound.setBuffer(buffer);
                sound.setRefDistance(100);
                sound.setVolume(0.5);
            });

            mixer = new THREE.AnimationMixer(object);
            var action = mixer.clipAction(object.animations[0]);
            action.play();
            object.translateZ(30);
            object.visible = false;

            haunters.push({ 'obj': object, 'name': "Haunter", 'orientation': 0, 'cry': sound, 'mixer': mixer});
            scene.add(object);
        });

        loader.load('public/assets/model/GengarNormal.fbx', function (object) {
            mixer = new THREE.AnimationMixer(object);
            var action = mixer.clipAction(object.animations[0]);
            action.play();

            var array = [];
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const oldMat = child.material;

                    child.material = new THREE.MeshLambertMaterial({
                        color: oldMat.color,
                        map: oldMat.map,
                        name: oldMat.name,
                        alphaMap: oldMat.alphaMap,
                        aoMap: oldMat.aoMap,
                        combine: oldMat.combine,
                        emissive: oldMat.emissive,
                        emissiveMap: oldMat.emissiveMap,
                        emissiveIntensity: oldMat.emissiveIntensity,
                        envMap: oldMat.envMap,
                        lightMap: oldMat.lightMap,
                        lightMapIntensity: oldMat.lightMapIntensity,
                        morphNormals: oldMat.morphNormals,
                        morphTargets: oldMat.morphTargets,
                        skinning: oldMat.skinning,
                        transparent: true
                    });
                    array.push(child.material);
                }
            });

            //assegno audio all'oggetto
            var sound = new THREE.PositionalAudio(listener);
            audioLoader.load('public/ost/sound/gengarCry.wav', function (buffer) {
                sound.setBuffer(buffer);
                sound.setRefDistance(100);
                sound.setVolume(0.5);
            });

            gengars.push({ 'obj': object, 'name': "Gengar", 'invisibility': false, 'mat': array, 'timeVisible': 20, 'cry': sound, 'mixer': mixer});
            object.translateZ(30);
            object.visible = false;
            scene.add(object);
        });
        var gastlyTexture = new THREE.TextureLoader().load('public/assets/model/Gastly.png');
        var runnerMaterial = new THREE.MeshBasicMaterial({ map: gastlyTexture, useScreenCoordinates: false, transparent: true });
        //var runnerGeometry = new THREE.PlaneBufferGeometry(176, 176, 1, 1);
        var runnerGeometry = new THREE.PlaneBufferGeometry(128, 128, 1, 1);
        var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
        runner.position.set(0, 0, 30);
        runner.visible = false;
        //assegno audio all'oggetto
        gastlys.push({ 'obj': runner, 'name': "Gastly", 'cry': soundGas, 'mixer': new textureAnimator(gastlyTexture, 64, 1, 64, 75)});
        scene.add(runner);
    }

    if(isDesktopVersion)
        renderer = new THREE.WebGLRenderer(); 
    else{
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0xffffff, 0);
    } 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;  
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    /*quando tutte le entità sono state caricate attivo il loop game e levo la barra di caricamento*/
    loadingManager.onLoad = function () {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');

        loadingScreen.addEventListener('transitionend', onTransitionEnd);
        countdown();
        animate();
   };
}

/* Game loop */
function Update(delta) {

   /* aggiorno il comportamento dei vari modelli all'interno della lista degli oggetti in gioco*/
   for (var i = 0; i < entities.length; i++) {
       //animazione
       if (entities[i].name === "Gastly" || entities[i].name === "GastlyS")
           entities[i].mixer.update(2000 * delta);
       else
           entities[i].mixer.update(delta);

       //comportamenti oggetti
       if (entities[i].name === haunters[0].name || entities[i].obj === haunterShiny.obj)
           HaunterBehaviour(entities[i], delta);
       else if (entities[i].name === gengars[0].name || entities[i].obj === gengarShiny.obj)
           GengarBehaviour(entities[i], delta);
       else if (entities[i].name === hoopa.name)
           HoopaBehaviour(entities[i], delta);
   }

   /*se è presente un gameObject speciale*/
   if (specialSpawn) {
       if (rotom.obj.visible){
           rotom.mixer.update(delta);
           RotomBehaviour(rotom);
       }
       else if (rotomShiny.obj.visible){
           rotomShiny.mixer.update(delta);
           RotomBehaviour(rotomShiny);
       }
       else if (pumpkaboo.obj.visible){
           pumpkaboo.mixer.update(delta);
           PumpkabooBehaviour(pumpkaboo, delta);
       }
   }

   timerSpawn += delta;

   /* se ci sono meno di 5 oggetti in gioco e sono passati TOT secondi, aggiungo un nuovo oggetto in gioco*/
   if (entities.length < 5 && timerSpawn >= eventSpawn) {
      SpawnGameObject(entities, levelGame);
      //cambio durata evento randomicamente in un intervallo da 4 a 8 secondi
      eventSpawn = Math.floor((Math.random() * 5) + 4);
      timerSpawn = 0;
   }
  
   if(timer === 52 || timer === 82 || timer === 112)
       onceSpecial = true;
    
   /*spawn di gameobject speciali a intervalli specifici nel tempo di gioco dopo aver raggiunto il livello 3*/
   if (levelGame >= 2 && (timer === 50 || timer === 80 || timer === 110) && onceSpecial)
      SpawnSpecialGO(levelGame, timer);

   frustumCamera.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
   renderer.render(scene, camera);
}

function RadarCamera(list) {
    contextRadar.clearRect(0, 0, canvasRadar.width, canvasRadar.height);
    contextRadar.canvas.width  = window.innerWidth;
    contextRadar.canvas.height = window.innerHeight;
    /*numero di oggetti che stanno a destra, sinistra, sopra o sotto alla visuale della camera*/
    var nRight = 0, nLeft = 0, nUp = 0, nDown = 0;
    for (var i = list.length - 1; i >= 0; i--) {
        /*controllo che l'oggetto non sia nel frustum della camera*/
        if (!frustumCamera.containsPoint(list[i].obj.position)) {
            camera.getWorldDirection(vectLookCamera);
            vectDirection.crossVectors(vectLookCamera, list[i].obj.position);
            var direction = vectDirection.dot(camera.up);
            if (direction <= 0)
                nRight++;
            else
                nLeft++;
            
            if (list[i].obj.position.y >= 310)
                nUp++;
            else if (list[i].obj.position.y <= 0) 
                nDown++;
        }
    }

    /*controllo che almeno un oggetto sta alla destra della visuale della camera e attivo la freccia*/
    if (nRight > 0){   
         if(canvasRadar.width <= 500 || canvasRadar.height <= 500){
            imgRadar.src = "public/assets/arrowDx-45px.png";
            contextRadar.drawImage(imgRadar, (canvasRadar.width/2) + 25, (canvasRadar.height/2) - 37);
         }
        else if(canvasRadar.width >= 501 || canvasRadar.height >= 501){
            imgRadar.src = "public/assets/arrowDx-85px.png";
            contextRadar.drawImage(imgRadar, (canvasRadar.width/2) + 55, (canvasRadar.height/2) - 65);
        }
        
    }

    /*controllo che almeno un oggetto sta alla sinistra della visuale della camera e imposto il border a sinistra*/
    if (nLeft > 0){
       
        if(canvasRadar.width <= 500 || canvasRadar.height <= 500){
            imgRadar.src = "public/assets/arrowSx-45px.png";
            contextRadar.drawImage(imgRadar, (canvasRadar.width/2) - 70, (canvasRadar.height/2) - 37);
        }
        else if(canvasRadar.width >= 501 || canvasRadar.height >= 501){
            imgRadar.src = "public/assets/arrowSx-85px.png";
            contextRadar.drawImage(imgRadar, (canvasRadar.width/2) - 135, (canvasRadar.height/2) - 65);
        }
    }
    
    /*controllo se è presente rotom in modo da segnalarlo*/
    if(rotom.obj.visible || rotomShiny.obj.visible){
        contextRadar.drawImage(imgRotomR, canvasRadar.width - 60, 55);
    }
}

/*Ridimensionamento della finestra di gioco */
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();    
}

/*Animazione della texture
 * 
 * @param {any} texture = texture da animare
 * @param {any} horizontal = dimensione orizzontale
 * @param {any} vertical = dim. verticale
 * @param {any} numTiles = numero di tiles
 * @param {any} tileDuration = durata per ogni tiles
 */
function textureAnimator(texture, horizontal, vertical, numTiles, tileDuration) {
    this.tilesHorizontal = horizontal;
    this.tilesVertical = vertical;
    this.numberTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    this.tileDisplayDuration = tileDuration;
    this.currentDisplayTime = 0;

    this.currentTile = 0;
    this.update = function (milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }

    };
}

/* Gestione dello spawn degli oggetti in gioco
 * 
 * @param {any} list = lista entità che saranno in gioco 
 * @param {any} level = livello raggiunto dal giocatore nella singola partita
 */
function SpawnGameObject(list, level) {
    var res = CandidateObj(level);
    //inserisce l'oggetto candidato nella lista dell'entità in gioco 
    if (res != 0) {
        list.push(res);

        if (res.name === gastlys[0].name || res.obj === gastlyShiny.obj)
            GastlyBehaviour(res.obj);
        else {
            //posiziono l'oggetto candidato in un punto randomico nella room e lo rendo visibile     
            var x = Math.floor(Math.random() * 600) + 381;
            var z = -1 * (Math.floor(Math.random() * 600) + 381);
            res.obj.position.set(x, 100, z);
            //orientamento iniziale randomico dell'oggetto candidato
            res.obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), (Math.random() * Math.PI) * 2 - Math.PI);
            res.obj.visible = true;
            if(res.name === hoopa.name)
                res.timeLife = 15;
        }
        //quando spawna l'oggetto emette un suono
        res.cry.play();
    }
}

/* Gestione dello spawn degli oggetti speciali in gioco
 *  
 * @param {any} level = livello raggiunto dal giocatore nella singola partita
 * @param {any} countdown = tempo del countdown in secondi
 */
function SpawnSpecialGO(level, countdown) {
    var probability = function (n) {
          return !!n && Math.random() <= n;
    };
    
    if ((countdown === 50 || 
            (countdown === 80 && probability(.5)) ||
                (countdown === 110 && probability(.3))) && !specialSpawn) {
        var res = CandidateSpecialObj(level);

        /*spawn di rotom*/
        if (res.obj === rotom.obj || res.obj === rotomShiny.obj) {
            //posiziono l'oggetto candidato in un punto randomico nella room e lo rendo visibile     
            res.obj.position.set(((Math.random() * 305) + 95), 0, (Math.random() * -305) - 95);
            res.obj.lookAt(camera.position);
            if (res.obj === rotom.obj)
                res.countLife = 6;
            else
                res.countLife = 4;
        }
        /*spawn di pumpkaboo*/
        else{
            res.obj.position.set(0, 55, -130);
            res.obj.lookAt(camera.position);
            res.timeLife = 10;
        }

        res.obj.visible = true;
        specialSpawn = true;

        //quando spawna l'oggetto emette un suono
        res.cry.play();
    }
    else
        onceSpecial = false;
}

/* Scelta dell'oggetto da spawnare 
 * 
 * @param {any} lvl = livello raggiunto dal giocatore nella singola partita
 * 
 * @return {Object} = oggetto di gioco candidato
 */
function CandidateObj(lvl) {
    var probability = function (n) {
        return !!n && Math.random() <= n;
    };

    var i = 0;
    switch (lvl) {
        case 10:
            //spawn 40% gengar - 40% haunter - 10% gastly - 10% hoopa
            if (probability(.1)) {
                while (i < 5) {
                    //spawn 90% gastly - 10% shiny
                    if (probability(.9)) {
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                    else {
                        if (!gastlyShiny.obj.visible)
                            return gastlyShiny;
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                }
            }
            else {
                //controllo che hoopa non sia già presente
                if (probability(.1) && !hoopa.obj.visible && !catchHoopa && score >= 20000) {
                        return hoopa;
                }
                else {
                    if (probability(.5)) {
                        while (i < 5) {
                            //spawn 90% haunter - 10% shiny
                            if (probability(.9)) {
                                if (!haunters[i].obj.visible)
                                    return haunters[i];
                                i++;
                            }
                            else {
                                if (!haunterShiny.obj.visible)
                                    return haunterShiny;

                                if (!haunters[i].obj.visible)
                                    return haunters[i];
                                i++;
                            }
                        }
                    }
                    else {
                        while (i < 5) {
                            //spawn 90% gengar - 10% shiny
                            if (probability(.9)) {
                                if (!gengars[i].obj.visible)
                                    return gengars[i];
                                i++;
                            }
                            else {
                                if (!gengarShiny.obj.visible)
                                    return gengarShiny;

                                if (!gengars[i].obj.visible)
                                    return gengars[i];
                                i++;
                            }
                        }
                    }
                }
            }
            break;
        case 9:
            //spawn 40% gengar - 40% haunter - 15% gastly - 5% hoopa
            if (probability(.15)) {
                while (i < 5) {
                    //spawn 90% gastly - 10% shiny
                    if (probability(.9)) {
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                    else {
                        if (!gastlyShiny.obj.visible)
                            return gastlyShiny;
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                }
            }
            else {
                //controllo che hoopa non sia già presente o che non sia già stato catturato
                if (probability(.05) && !hoopa.obj.visible && !catchHoopa && score >= 16000) {
                        return hoopa;
                }
                else {
                    if (probability(.5)) {
                        while (i < 5) {
                            //spawn 90% haunter - 10% shiny
                            if (probability(.9)) {
                                if (!haunters[i].obj.visible)
                                    return haunters[i];
                                i++;
                            }
                            else {
                                if (!haunterShiny.obj.visible)
                                    return haunterShiny;

                                if (!haunters[i].obj.visible)
                                    return haunters[i];
                                i++;
                            }
                        }
                    }
                    else {
                        while (i < 5) {
                            //spawn 90% gengar - 10% shiny
                            if (probability(.9)) {
                                if (!gengars[i].obj.visible)
                                    return gengars[i];
                                i++;
                            }
                            else {
                                if (!gengarShiny.obj.visible)
                                    return gengarShiny;

                                if (!gengars[i].obj.visible)
                                    return gengars[i];
                                i++;
                            }
                        }
                    }
                }
            }
            break;
        case 8:
        case 7:
        case 6:
        case 5:
            //spawn 40% gengar - 40% haunter - 20% gastly 
            if (probability(.2)) {
                while (i < 5) {
                    //spawn 90% gastly - 10% shiny
                    if (probability(.9)) {
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                    else {
                        if (!gastlyShiny.obj.visible)
                            return gastlyShiny;
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                }
            }
            else {
                if (probability(.5)) {
                    while (i < 5) {
                        //spawn 90% haunter - 10% shiny
                        if (probability(.9)) {
                            if (!haunters[i].obj.visible)
                                return haunters[i];
                            i++;
                        }
                        else {
                            if (!haunterShiny.obj.visible)
                                return haunterShiny;

                            if (!haunters[i].obj.visible)
                                return haunters[i];
                            i++;
                        }
                    }
                }
                else {
                    while (i < 5) {
                        //spawn 90% gengar - 10% shiny
                        if (probability(.9)) {
                            if (!gengars[i].obj.visible)
                                return gengars[i];
                            i++;
                        }
                        else {
                            if (!gengarShiny.obj.visible)
                                return gengarShiny;

                            if (!gengars[i].obj.visible)
                                return gengars[i];
                            i++;
                        }
                    }
                }
            }
            break;
        case 4:
        case 3:
            //spawn 20% gengar - 40% haunter - 40% gastly
            if (probability(.4)) {
                while (i < 5) {
                    //spawn 90% gastly - 10% shiny
                    if (probability(.9)) {
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                    else {
                        if (!gastlyShiny.obj.visible)
                            return gastlyShiny;
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                }
            }
            else {
                if (probability(.7)) {
                    while (i < 5) {
                        //spawn 90% haunter - 10% shiny
                        if (probability(.9)) {
                            if (!haunters[i].obj.visible)
                                return haunters[i];
                            i++;
                        }
                        else {
                            if (!haunterShiny.obj.visible)
                                return haunterShiny;

                            if (!haunters[i].obj.visible)
                                return haunters[i];
                            i++;
                        }
                    }
                }
                else {
                    while (i < 5) {
                        //spawn 90% gengar - 10% shiny
                        if (probability(.9)) {
                            if (!gengars[i].obj.visible)
                                return gengars[i];
                            i++;
                        }
                        else {
                            if (!gengarShiny.obj.visible)
                                return gengarShiny;

                            if (!gengars[i].obj.visible)
                                return gengars[i];
                            i++;
                        }
                    }
                }
            }
            break;
        case 2:
        case 1:
            //spawn 50% haunter - 50% gastly
            if (probability(.5)) {
                while (i < 5) {
                    //spawn 90% gastly - 10% shiny
                    if (probability(.9)) {
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                    else {
                        if (!gastlyShiny.obj.visible)
                            return gastlyShiny;
                        if (!gastlys[i].obj.visible)
                            return gastlys[i];
                        i++;
                    }
                }
            }
            else {
                while (i < 5) {
                    //spawn 90% haunter - 10% shiny
                    if (probability(.9)) {
                        if (!haunters[i].obj.visible)
                            return haunters[i];
                        i++;
                    }
                    else {
                        if (!haunterShiny.obj.visible)
                            return haunterShiny;
                        if (!haunters[i].obj.visible)
                            return haunters[i];
                        i++;
                    }
                }
            }
            break;
        case 0:
            while (i < 5) {
                //spawn 90% gastly - 10% shiny
                if (probability(.9)) {
                    if (!gastlys[i].obj.visible)
                        return gastlys[i];
                    i++;
                }
                else {
                    if (!gastlyShiny.obj.visible)
                        return gastlyShiny;
                    if (!gastlys[i].obj.visible)
                        return gastlys[i];
                    i++;
                }
            }
    }
    return 0;
}

/* Scelta dell'oggetto speciale da spawnare 
 * 
 * @param {any} lvl = livello raggiunto dal giocatore nella singola partita
 * 
 * @return {Object} = oggetto speciale di gioco candidato
 */
function CandidateSpecialObj(lvl) {
    var probability = function (n) {
        return !!n && Math.random() <= n;
    };

    var i = 0;
    switch (lvl) {
        case 10:
        case 9:
            //spawn 75% pumpkaboo - 25% rotom
            if (probability(.25)) {
                //spawn 90% rotom - 10% shiny
                if (probability(.9))
                    return rotom;
                else
                    return rotomShiny;
            }
            else {
                    return pumpkaboo;
            }
            break;
        case 8:
        case 7:
            //spawn 55% pumpkaboo - 45% rotom
            if (probability(.45)) {
                //spawn 90% rotom - 10% shiny
                if (probability(.9))
                    return rotom;
                else
                    return rotomShiny;
            }
            else
                return pumpkaboo;
            break;
        case 6:
        case 5:
        case 4:
            //spawn 35% pumpkaboo - 65% rotom
            if (probability(.65)) {
                //spawn 90% rotom - 10% shiny
                if (probability(.9))
                    return rotom;
                else
                    return rotomShiny;
            }
            else
                return pumpkaboo;
            break;
        case 3:
        case 2:
            //spawn 90% rotom - 10% shiny
            if (probability(.9))
                return rotom;
            else
                return rotomShiny;
            break;
        case 1:
        case 0:
    }

    return 0;
}

/* Comportamento dei Gastly
 * 
 * @param {any} npc = modello/object
 */
function GastlyBehaviour(npc) {
    //scelgo randomicamente un angolo tra 0° e 180° e un raggio tra 430 e 600
    var angle = Math.floor(Math.random() * 181);
    var r = Math.floor(Math.random() * 171) + 430;
    //calcolo la posizione nell'asse x
    var x = Math.cos(angle) * r;
    //calcolo la posizione nell'asse z
    var z = Math.sin(angle) * r;
    if (z > 0)
        z *= -1;

    npc.position.set(x, 75, z);
    //controllo che non si trovi nella stessa posizione di un altro oggetto simile altrimenti lo sposto leggermente
    for (var i = 0; i < gastlys.length; i++) {
        if (gastlys[i].obj.visible) {
            if ((x <= gastlys[i].obj.position.x + 100
                && x >= gastlys[i].obj.position.x - 100) && (z <= gastlys[i].obj.position.z + 100
                    && z >= gastlys[i].obj.position.z - 100)) {
                if (x <= 0)
                    npc.position.set(x + 100, 75, z + 100);
                else
                    npc.position.set(x - 100, 75, z - 100);
            }
        }
    }
    npc.lookAt(camera.position);
    npc.visible = true;
}

/*Comportamento degli Haunter
 * 
 * @param {any} npc = modello/object 
 * @param {any} delta = timing
 */
function HaunterBehaviour(npc, delta) {
    //npc.obj.rotationOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/2*delta);
    /*Quando l'NPC raggiunge il confine, torna indietro*/
    if (BoundaryCollision(npc.obj)) {
        npc.obj.rotateY(Math.PI / 2 * delta);
    }
   
    /*Quando raggiune la distanza minima dalla camera di gioco, il modello si sposta verso l'altro,
     altrimenti scende nella posizione precedente*/
    if (npc.obj.position.distanceTo(camera.position) <= 350) {
        if (npc.obj.position.y <= 270)
            npc.obj.translateY(2);
    }
    else {
        if (npc.obj.position.y > 100)
            npc.obj.translateY(-2);
    }

    /*si sposta continuamente nel mondo di gioco*/
    npc.obj.translateZ(3);
}

/* Comportamento dei Gengar
 * 
 * @param {any} npc = modello/object 
 * @param {any} delta = timing
 */
function GengarBehaviour(npc, delta) {

    /*Quando l'NPC raggiunge il confine, torna indietro*/
    if (BoundaryCollision(npc.obj)) {
        npc.obj.rotateY(Math.PI / 2 * delta);
        npc.obj.translateZ(3);
    }
    else
        npc.obj.translateZ(4);

    /*Gestione dell'invisibilità dell'NPC*/
    if (npc.invisibility) {
        /*Se deve diventare invisibile controllo finché non raggiunge l'opacità a 0,
         altrimenti diminuisco lentamente tale opacità*/
        if (npc.mat[0].opacity <= 0
            && npc.mat[1].opacity <= 0
            && npc.mat[2].opacity <= 0
            && npc.mat[3].opacity <= 0
            && npc.mat[4].opacity <= 0
            && npc.mat[5].opacity <= 0
            && npc.mat[6].opacity <= 0) {

            npc.timeVisible += 3 * delta;

            /*Raggiunti 20 secondi, si resetta l'invisibilità a false*/
            if (npc.timeVisible >= 20)
                npc.invisibility = false;
        }
        else {
            npc.mat[0].opacity -= 0.6 * delta;
            npc.mat[1].opacity -= 0.6 * delta;
            npc.mat[2].opacity -= 0.6 * delta;
            npc.mat[3].opacity -= 0.6 * delta;
            npc.mat[4].opacity -= 0.6 * delta;
            npc.mat[5].opacity -= 0.6 * delta;
            npc.mat[6].opacity -= 0.6 * delta;
        }
    }
    else {
        /*Se deve diventare visibile controllo finché non raggiunge l'opacità a 1,
         altrimenti aumento lentamente tale opacità*/
        if (npc.mat[0].opacity >= 1
            && npc.mat[1].opacity >= 1
            && npc.mat[2].opacity >= 1
            && npc.mat[3].opacity >= 1
            && npc.mat[4].opacity >= 1
            && npc.mat[5].opacity >= 1
            && npc.mat[6].opacity >= 1) {

            npc.timeVisible -= 3 * delta;

            /*Diminuiti i 20 secondi, si resetta l'invisibilità a true*/
            if (npc.timeVisible <= 0)
                npc.invisibility = true;
        }
        else {
            npc.mat[0].opacity += 0.6 * delta;
            npc.mat[1].opacity += 0.6 * delta;
            npc.mat[2].opacity += 0.6 * delta;
            npc.mat[3].opacity += 0.6 * delta;
            npc.mat[4].opacity += 0.6 * delta;
            npc.mat[5].opacity += 0.6 * delta;
            npc.mat[6].opacity += 0.6 * delta;
        }
    }

    /*Quando raggiune la distanza minima dalla camera di gioco, il modello si sposta verso l'altro,
     altrimenti scende nella posizione precedente*/

    if (npc.obj.position.distanceTo(camera.position) <= 380) {
        if (npc.obj.position.y <= 320)
            npc.obj.translateY(3);
    }
    else {
        if (npc.obj.position.y > 100)
            npc.obj.translateY(-3);
    }
}

/* Comportamento dei Rotom
 * 
 * @param {any} npc = modello/object 
 */
function RotomBehaviour(npc) {

    /*Spostamento NPC*/
    if (!npc.animationSetup.isRunning() && npc.countLife > 0) {
        //resetto tutte le proprietà dell'animazione dell'npc
        npc.animationSetup.reset();
        npc.animationSetup.timeScale = 1.45;
        npc.animationSetup.setLoop(THREE.LoopOnce);
        npc.animationSetup.clampWhenFinished = true;
        npc.animationSetup.play();
        //setto l'npc nella metà opposta dell'area di gioco
        var clearRotation = new THREE.Euler(0, 0, 0, 'XYZ');
        npc.obj.setRotationFromEuler(clearRotation);
        var opposite = npc.obj.position.x >= 0 ? -1 : 1;
        npc.obj.position.set(((Math.random() * 305) + 95) * opposite, 0, (Math.random() * -305) - 95);

        npc.obj.lookAt(camera.position);
        npc.countLife--;
    }

    /*Dopo tot secondi, l'NPC viene despawnato*/
    if (npc.countLife === 0) {
        specialSpawn = false;
        onceSpecial = true;
        npc.obj.visible = false;
        npc.obj.position.set(0, 0, 30);
    }
}

/* Comportamento di Hoopa
 * 
 * @param {any} npc = modello/object 
 * @param {any} delta = timing
 */
function HoopaBehaviour(npc, delta) {
    //npc.obj.rotationOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/2*delta);
    /*Quando l'NPC raggiunge il confine, torna indietro*/
    if (BoundaryCollision(npc.obj)) {
        npc.obj.rotateY(Math.PI / 2 * delta);
        npc.obj.translateZ(4);
    }
    else {
        //NPC fa uno scatto per pochi secondi ad intervalli regolari
        if (npc.isRushing) {
            npc.obj.translateZ(7);
            npc.timeRush += delta;
            if (npc.timeRush > 10)
                npc.isRushing = false;
        }
        else {
            npc.obj.translateZ(5);
            npc.timeRush -= delta;
            if (npc.timeRush <= 0)
                npc.isRushing = true;
        }
    }
    npc.timeLife -= delta;

    if (npc.timeLife <= 0) {
        /*specialSpawn = false;
        npc.obj.visible = false;
        npc.obj.position.set(0, 0, 30);*/
        for (var i = entities.length - 1; i >= 0; i--) {
            if (entities[i].name === "Hoopa") {
                entities[i].obj.visible = false;
                entities[i].obj.position.set(0, 0, 30);
                entities.splice(i, 1);
            }
        }
    }
}

/* Comportamento dei Pumpkaboo
 * 
 * @param {any} npc = modello/object 
 */
function PumpkabooBehaviour(npc, delta) {
    if(!frustumCamera.containsPoint(npc.obj.position)){
        camera.getWorldDirection(vectLookPumpkaboo);
        vectDirPumpkaboo.crossVectors(vectLookPumpkaboo, npc.obj.position);
        var direction = vectDirPumpkaboo.dot(camera.up);
        npc.obj.position.set(130*Math.cos(direction), 55, -(130*Math.sin(direction)));
        npc.obj.lookAt(camera.position);
    }    
    npc.timeLife -= delta;

    //se timetoLife arriva a zero despawn del modello
    if (npc.timeLife <= 0) {
        specialSpawn = false;
        onceSpecial = true;
        npc.obj.visible = false;
        npc.obj.position.set(0, 0, 30);
    }

}

/* Gestione collisione confini mondo di gioco 
 * @param { any } obj = oggetto 3D target che si muove nel mondo di gioco
 */
function BoundaryCollision(obj) {

    // console.log(obj.rotation);

    if (obj.position.x >= 1200)
        return true;
    else if (obj.position.z >= -10)
        return true;
    else if (obj.position.x <= -1200)
        return true;
    else if (obj.position.z <= -1200)
        return true;
    else
        return false;
}

/* Aggiorno il punteggio o il countdown a seconda dell'oggetto 'fotografato'
 * 
 * @param {any} obj = oggetto 'fotografato' 
 */
function UpdateScore(obj) {
    switch (obj.name) {
        case "Gastly": {
            score += 100;
            break;
        }
        case "GastlyS": {
            score += 200;
            break;
        }
        case "Haunter": {
            score += 300;
            break;
        }
        case "HaunterS": {
            score += 600;
            break;
        }
        case "Gengar": {
            score += 500;
            break;
        }
        case "GengarS": {
            score += 1000;
            break;
        }
        case "Rotom": {
            timer += 40;
            break;
        }
        case "RotomS": {
            timer += 60;
            break;
        }
        case "Pumpkaboo": {
            score = Math.floor(score / 2);
            break;
        }
        case "Hoopa": {
            score += 10000;
            break;
        }
        default: score += 0;
    }

    if (score <= 999999)
        scoreText.innerHTML = score + "$";
    else{
        scoreText.innerHTML = "999999$";
        score = 999999;
    }
}

/*Gestione fotografia dei target
 * 
 * @param {any} list = lista entità in gioco
 */
function SnapshotHandler(list) {
    flashAudio.play();

    /*controllo se il giocatore ha fotografato un oggetto speciale*/
    if (specialSpawn) {
        if (frustumCamera.containsPoint(rotom.obj.position)) {
            /*aggiorno il punteggio, rimetto l'oggetto nascosto e lo tolgo dalla lista di oggetti in gioco*/
            UpdateScore(rotom);
            rotom.obj.visible = false;
            rotom.obj.position.set(0, 0, 30);
            specialSpawn = false;
            onceSpecial = true;
        }
        else if (frustumCamera.containsPoint(rotomShiny.obj.position)) {
            /*aggiorno il punteggio, rimetto l'oggetto nascosto e lo tolgo dalla lista di oggetti in gioco*/
            UpdateScore(rotomShiny);
            rotomShiny.obj.visible = false;
            rotomShiny.obj.position.set(0, 0, 30);
            specialSpawn = false;
            onceSpecial = true;
        }
        else if (pumpkaboo.obj.visible) {
            pumpkabooSnap = true;
            /*aggiorno il punteggio, rimetto l'oggetto nascosto e lo tolgo dalla lista di oggetti in gioco*/
            UpdateScore(pumpkaboo);
            pumpkaboo.obj.visible = false;
            pumpkaboo.obj.position.set(0, 0, 30);
            specialSpawn = false;
            onceSpecial = true;
            screamAudio.play();
        }
        //else if (frustumCamera.containsPoint(hoopa.obj.position)) {
            /*aggiorno il punteggio, rimetto l'oggetto nascosto e lo tolgo dalla lista di oggetti in gioco*/
           // UpdateScore(hoopa);
            /*controllo se il giocatore ha raggiunto una quota prestabilita e aumento il livello */
          /*  hoopa.obj.visible = false;
            hoopa.obj.position.set(0, 0, 30);
            specialSpawn = false;
        }  */      
    }

    for (var i = list.length - 1; i >= 0; i--) {
        /*controllo che l'oggetto sia nel frustum della camera*/
        if (frustumCamera.containsPoint(list[i].obj.position) && !pumpkabooSnap) {
            /*controllo se l'oggetto è 'Gengar' e invisibile, a quel punto lo ignoro altrimenti lo 'catturo'*/
            if (!((list[i].name === "Gengar" && list[i].invisibility) || (list[i].name === "GengarS" && list[i].invisibility))) {
                if(list[i].name === "Hoopa")
                    catchHoopa = true;
                /*aggiorno il punteggio, rimetto l'oggetto nascosto e lo tolgo dalla lista di oggetti in gioco*/
                UpdateScore(list[i]);
                /*controllo se il giocatore ha raggiunto una quota prestabilita e aumento il livello */
                LevelUp(score);
                list[i].obj.visible = false;
                list[i].obj.position.set(0, 0, 30);
                list.splice(i, 1);
            }
        }
    }
    pumpkabooSnap = false;
}

/*Gestione gameover */
function GameOver() {
    document.getElementById("radar").style.display = "none";   
    gameOver = true;
    //inizializzo tutte le variabili dinamiche di gioco 
    levelGame = 0;
    delta = 0;
    eventSpawn = 5;
    //prima di azzerrare punteggio, inserirlo nella finestra di fine gioco
    timerSpawn = 0;
    specialSpawn = false;
    pumpkabooSnap = false;
     catchHoopa = false;
    //appare la finestra di fine gioco 
    canvas.style.display = "block";
    DrawingWindow();
}

/*Restart del gioco */
function Restart() {     
    score = 0;
    timer = 120;
    gameOver = false;
    PlayOST();
    countdown();
    scoreText.innerHTML = "0$";
    //tolgo la finestra di fine gioco
    canvas.style.display = "none";
    document.getElementById("radar").style.display = "block";   
}

/* Raggiunto una quota di punteggio aumenta il livello di difficoltà
 * 
 * @param {any} score = punteggio del giocatore in una partita
 */
function LevelUp(scoreGame) {
    if (scoreGame >= 600 && levelGame == 0)
        levelGame = 1; //lvl 2 - Facile
    else if (scoreGame >= 1300 && levelGame == 1)
        levelGame = 2; //lvl 3
    else if (scoreGame >= 3500 && levelGame == 2)
        levelGame = 3; //lvl 4
    else if (scoreGame >= 6500 && levelGame == 3)
        levelGame = 4; //lvl 5 - Medio
    else if (scoreGame >= 10000 && levelGame == 4)
        levelGame = 5; //lvl 6
    else if (scoreGame >= 11500 && levelGame == 5)
        levelGame = 6; //lvl 7
    else if (scoreGame >= 14000 && levelGame == 6)
        levelGame = 7; //lvl 8 - Difficile
    else if (scoreGame >= 15000 && levelGame == 7)
        levelGame = 8; // lvl 9
    else if (scoreGame >= 16000 && levelGame == 8)
        levelGame = 9; // lvl 10 - Molto difficile
    else if (scoreGame >= 20000 && levelGame == 9)
        levelGame = 10; // lvl Bonus
    else
        levelGame = levelGame;
}

/*Funzione che disegna la finestra di game over */
function DrawingWindow() {
    context.clearRect(0, 0, canvas.width, canvas.height);   
    context.fillStyle = "#ffffff"; 
    context.textAlign = "center";

    if(canvas.width <= 500){
        context.font = "normal bold 17px PokeDollarFont";
        context.fillText("Total score: " + score + "$", canvas.width / 2, canvas.height / 2);
        context.font = "normal bold 15px PokeDollarFont";
        context.fillText("Tap per rigiocare!", canvas.width / 2, (canvas.height / 2) + 50);
    }
    else if(canvas.width >= 501 && canvas.width <= 1020){
        context.font = "normal bold 30px PokeDollarFont";
        context.fillText("Total score: " + score + "$", canvas.width / 2, canvas.height / 2);
        context.font = "normal bold 28px PokeDollarFont";
        context.fillText("Tap per rigiocare!", canvas.width / 2, (canvas.height / 2) + 70);  
    }
    else {  
        context.font = "normal bold 40px PokeDollarFont";
        context.fillText("Total score: " + score + "$", canvas.width / 2, canvas.height / 2);
        context.font = "normal bold 38px PokeDollarFont";
        if(isDesktopVersion) 
            context.fillText("Clicca per rigiocare!", canvas.width / 2, (canvas.height / 2) + 100);  
        else
            context.fillText("Tap per rigiocare!", canvas.width / 2, (canvas.height / 2) + 100); 
    }
}
