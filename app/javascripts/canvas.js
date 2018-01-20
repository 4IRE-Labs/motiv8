

window.Badge = {
    colors: [
        '#f23a2f',
        '#e51b58',
        '#30383e',
        '#9124a7',
        '#5b33ae',
        '#3648ac',
        '#1e8bf0',
        '#009ff1',
        '#00b4ce',
        '#008b7c',
        '#43a646',
        '#80bb41',
        '#c5d633',
        '#fee734',
        '#feb80d',
        '#fe8c03',
        '#fe4c20',
        '#6d4b3f',
        '#939393',
        '#55727f'
    ],    
    /**
     * Use: 
     * Badge.drawBadge({
            canvasId: string,
            face: 1...8,
            mask: 1...4,
            color: 0...19
        });
     */
    drawBadge: function(data) {

        if (data.canvas == undefined) {
            data.canvas = document.getElementById(data.canvasId);
        }
        
        data.context = data.canvas.getContext('2d');
        data.size = [data.canvas.width, data.canvas.height];
        data.context.fillStyle = Badge.colors[data.color];
        data.context.fillRect(0, 0, data.size[0], data.size[1]);

        data.bodyImage = new Image();
        data.bodyImage.src = 'assets/body.svg';
        data.bodyImage.onload = function(){
            data.context.drawImage(data.bodyImage, 0, 0, data.size[0], data.size[1]);
        };

        data.faceImage = new Image();
        data.faceImage.src = 'assets/face_'+data.face+'.svg';
        data.faceImage.onload = function(){
            data.context.drawImage(data.faceImage, 0, 0, data.size[0], data.size[1]);
        };

        data.maskImage = new Image();
        data.maskImage.src = 'assets/mask_'+data.mask+'.svg';
        data.maskImage.onload = function(){
            data.context.drawImage(data.maskImage, 0, 0, data.size[0], data.size[1]);
        };
    }
};