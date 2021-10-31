labels = {
    'road': [128, 64, 128],
    'drivable fallback': [81, 0, 81],
    'sidewalk': [244, 35, 232],
    'non-drivable fallback': [152, 251, 152],
    'person/animal': [220, 20, 60],
    'rider': [255, 0, 0],
    'motorcycle': [0, 0, 230],
    'bicycle': [119, 11, 32],
    'autorickshaw': [255, 204, 54],
    'car': [0, 0, 142],
    'truck': [0, 0, 70],
    'bus': [0, 60, 100],
    'vehicle fallback': [136, 143, 153],
    'curb': [220, 190, 40],
    'wall': [102, 102, 156],
    'fence': [190, 153, 153],
    'guard rail': [180, 165, 180],
    'billboard': [174, 64, 67],
    'traffic sign': [220, 220, 0],
    'traffic light': [250, 170, 30],
    'pole': [153, 153, 153],
    'obs-str-bar-fallback': [169, 187, 214],
    'building': [70, 70, 70],
    'bridge/tunnel': [150, 100, 100],
    'vegetation': [107, 142, 35],
    'sky': [70, 130, 180],
    'unlabled': [0, 0, 0]
}
color_map_keys = Object.keys(labels)

function colorMap(idx) {
    // Gets RGB color
    return labels[color_map_keys[idx]]
}

async function drawImgCanvas(arr) {
    // Takes array of (27,512, 512) and fetchs color code and draws to canvas 
    var c = document.getElementById("seg_mask_img");
    var c2 = document.getElementById("seg_mask_img2");

    var ctx = c.getContext("2d");
    var ctx2 = c2.getContext("2d");

    arr = nj.array(arr).T.reshape(512, 512, 27);
    for (let i = 0; i < 512; i++) {
        tmp = new Array()
        for (let j = 0; j < 512; j++) {
            var idx = 0
            var max_val = -100
            for (let k = 0; k < 27; k++) {
                val = arr.get(i, j, k)
                if (val > max_val) {
                    max_val = val;
                    idx = k
                }
            }
            // fetch color
            var color = colorMap(idx)
            r = color[0]
            g = color[1]
            b = color[2]

            ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 1)";
            ctx.fillRect(i, j, 1, 1);
            ctx2.fillStyle = "rgba(" + r + "," + g + "," + b + ", 1)";
            ctx2.fillRect(i, j, 1, 1);
        }
    }
}

function webgl_detect(return_context) {
    if (!!window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i = 0; i < names.length; i++) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter == "function") {
                    // WebGL is enabled
                    if (return_context) {
                        // return WebGL object if the function's argument is present
                        return { name: names[i], gl: context };
                    }
                    // else, return just true
                    return true;
                }
            } catch (e) { }
        }

        // WebGL is supported, but disabled
        return false;
    }

    // WebGL not supported
    return false;
}

function imgTransform(img) {
    // Normalization and reshaping to correct tensor, flattened to pass into worker
    img = tf.image.resizeBilinear(img, [512, 512]).div(tf.scalar(255))
    img = tf.cast(img, dtype = 'float32');

    /*mean of natural image*/
    let meanRgb = { red: 0.485, green: 0.456, blue: 0.406 }

    /* standard deviation of natural image*/
    let stdRgb = { red: 0.229, green: 0.224, blue: 0.225 }

    let indices = [
        tf.tensor1d([0], "int32"),
        tf.tensor1d([1], "int32"),
        tf.tensor1d([2], "int32")
    ];

    /* sperating tensor channelwise and applyin normalization to each chanel seperately */
    let centeredRgb = {
        red: tf.gather(img, indices[0], 2)
            .sub(tf.scalar(meanRgb.red))
            .div(tf.scalar(stdRgb.red))
            .reshape([512, 512]),

        green: tf.gather(img, indices[1], 2)
            .sub(tf.scalar(meanRgb.green))
            .div(tf.scalar(stdRgb.green))
            .reshape([512, 512]),

        blue: tf.gather(img, indices[2], 2)
            .sub(tf.scalar(meanRgb.blue))
            .div(tf.scalar(stdRgb.blue))
            .reshape([512, 512]),
    }


    /* combining seperate normalized channels*/
    let processedImg = tf.stack([
        centeredRgb.red, centeredRgb.green, centeredRgb.blue
    ]).expandDims();
    return processedImg;
}

function prepareT4d() {
    /*constructs the image into a array  and performs normalization 
    so that it can be processed in the work*/
    tf.engine().startScope()
    im = document.getElementById("raw_img")
    im = tf.browser.fromPixels(im);
    im = imgTransform(im)
    out = im.dataSync();
    tf.engine().endScope()
    return { "data": out, "webgl": webgl_detect() }
}

async function segmentOnWorker() {
    // Sends inference to worker model
    data = prepareT4d();
    if (!webgl_detect()) {
        alert("WebGL not detected, this may run really slow")
    }
    worker.postMessage(data);
}


worker = new Worker("static/js/predict.js")

worker.onmessage = function (e) {
    console.log('Message received from worker');
    if (e.data === "") {
        alert("Segmentation Failed, computing resources may be to limited")
    } else {
        drawImgCanvas(e.data)
    }
    toggleLoad()
}
