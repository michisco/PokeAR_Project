function sprite(options) {

    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = options.x;
    that.y = options.y;
    that.image = options.image;
    console.log(that.context);
    //that.scaleRatio = 1;

    that.update = function () {
        
        tickCount += 1;

        if (tickCount > ticksPerFrame) {

            tickCount = 0;

            // If the current frame index is in range
            if (frameIndex < numberOfFrames - 1) {
                // Go to the next frame
                frameIndex += 1;
            } else {
                frameIndex = 0;
            }
        }
    };

    that.render = function (cameraX, cameraY) {
        var x = that.x - cameraX;
        var y = that.y - cameraY;

        //x += WIDTH / 2;
        //y += HEIGHT / 2;
        // Draw the animation
        that.context.drawImage(
            that.image,
            frameIndex * that.width / numberOfFrames,
            0,
            that.width / numberOfFrames,
            that.height,
            x,
            y,
            that.width / numberOfFrames /** that.scaleRatio*/,
            that.height /** that.scaleRatio*/);
    };

   

    that.getFrameWidth = function () {
        return that.width / numberOfFrames;
    }; 

    return that;
}

