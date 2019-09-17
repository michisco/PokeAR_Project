function spriteHandler(idPoke) {
    var res = "";

    switch (idPoke) {
        case "00-0": res = "public/assets/BoxSprite/GastlyNormal.png"; break; //gastly normal sprite
        case "00-1": res = "public/assets/BoxSprite/GastlyShiny.png"; break; //gastly shiny
        case "01-0": res = "public/assets/BoxSprite/HaunterNormal.png"; break; //haunter normal
        case "01-1": res = "public/assets/BoxSprite/HaunterShiny.png"; break; //haunter shiny
        case "02-0": res = "public/assets/BoxSprite/GengarNormal.png"; break; //gengar normal
        case "02-1": res = "public/assets/BoxSprite/GengarShiny.png"; break; //gengar shiny
        case "03-0": res = "public/assets/BoxSprite/RotomNormal.png"; break; //rotom normal
        case "03-1": res = "public/assets/BoxSprite/RotomShiny.png"; break; //rotom shiny
        case "04-0": res = "public/assets/BoxSprite/PumpkabooNormal.png"; break; //pumpkaboo normal
        case "04-1": res = "public/assets/BoxSprite/PumpkabooShiny.png"; break; //pumpkaboo shiny
        case "05-0": res = "public/assets/BoxSprite/HoopaShiny.png"; break; //hoopa normal
        default: res = "public/assets/BoxSprite/GastlyNormal.png"; break;
    }
    return res;
}

function pokeBox(posx, posy, cx, id) {

    this.context = cx;
    this.x = posx;
    this.y = posy;
    this.image = new Image();
    this.image.src = spriteHandler(id);
    this.scaleRatio = 1;
    var x = posx,
        y = posy;
    //panelClass = 'js-cd-panel-' + id,
    //panel = document.getElementsByClassName(panelClass)[0],

    /*panel.addEventListener('click', function (event) {
        if (hasClass(event.target, 'js-cd-close') || hasClass(event.target, panelClass)) {
            event.preventDefault();
            removeClass(panel, 'cd-panel--is-visible');
        }
    });*/

    this.draw = function (numberCatch) {
        this.context.drawImage(
            this.image,
            this.x,
            this.y);
        this.context.font = "14px Arial";
        this.context.fillStyle = 'white';
        this.context.fillText("x" + numberCatch, x + 65, y + 60);
    }
}

function refreshIcon(posx, posy, cx) {

    this.context = cx;
    this.x = posx;
    this.y = posy;
    this.image = new Image();
    this.image.src = "public/assets/refresh.png";
    this.scaleRatio = 1;
    var x = posx,
        y = posy;

    this.draw = function () {
        this.context.drawImage(
            this.image,
            this.x,
            this.y);
    }

    function tap(e) {

        var loc = {},
            dist,
            pos = getElementPosition(canvas),
            tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
            tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY,
            canvasScaleRatio = canvas.width / canvas.offsetWidth;

        loc.x = (tapX - pos.x) * canvasScaleRatio;
        loc.y = (tapY - pos.y) * canvasScaleRatio;

        // distanza tra il click e lo sprite
        dist = distance({
            x: (x + 65 / 2),
            y: (y + 65 / 2)
        }, {
            x: loc.x,
            y: loc.y
        });

        // controllo il tap/click se è all'interno dello sprite	
        if (dist < 65 / 2) {
            e.preventDefault();
            Restart();
        }
    }

    function distance(p1, p2) {

        var dx = p1.x - p2.x,
            dy = p1.y - p2.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    function getElementPosition(element) {

        var parentOffset,
            pos = {
                x: element.offsetLeft,
                y: element.offsetTop
            };

        if (element.offsetParent) {
            parentOffset = getElementPosition(element.offsetParent);
            pos.x += parentOffset.x;
            pos.y += parentOffset.y;
        }
        return pos;
    }

    canvas.addEventListener("touchstart", tap);
    canvas.addEventListener("mousedown", tap);
}

    
   /* this.update = function () {
        numberCatch++;
        uiCatch = "x" + numberCatch
    }
    */
    /*function tap(e) {

        var loc = {},
            dist,
            pos = getElementPosition(canvas),
            tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
            tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY,
            canvasScaleRatio = canvas.width / canvas.offsetWidth;

        loc.x = (tapX - pos.x) * canvasScaleRatio;
        loc.y = (tapY - pos.y) * canvasScaleRatio;
       
        // distanza tra il click e lo sprite
        dist = distance({
            x: (x + 65 / 2),
            y: (y + 65 / 2)
        }, {
                x: loc.x,
                y: loc.y
            });
        
        // controllo il tap/click se è all'interno dello sprite	
        if (dist < 65 / 2) {
            e.preventDefault();
            addClass(panel, 'cd-panel--is-visible');
        }
    }*/

   /* function distance(p1, p2) {

        var dx = p1.x - p2.x,
            dy = p1.y - p2.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    function getElementPosition(element) {

        var parentOffset,
            pos = {
                x: element.offsetLeft,
                y: element.offsetTop
            };

        if (element.offsetParent) {
            parentOffset = getElementPosition(element.offsetParent);
            pos.x += parentOffset.x;
            pos.y += parentOffset.y;
        }
        return pos;
    }

    canvas.addEventListener("touchstart", tap);
    canvas.addEventListener("mousedown", tap);
}*/

//class manipulations - needed if classList is not supported
/*function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}
function addClass(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += " " + className;
}

function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}*/
