

importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js');
// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.5.0/dist/tf.min.js')
importScripts('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js');
// importScripts('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js');
const MODEL_URL = '../../output/model.pb/model.json';
var model;
var res;
var im;

onmessage = function (e) {
    /*
    e.data["data"] should be a 1d array of Size(512*512*3)
    e.data["gpu"] should be bool for use webgl
    */
    console.log("recieved")
    if (!model) {
        // load if not loaded
        model = tf.loadGraphModel(MODEL_URL);
    }
    if (!e.data.webgl) {
        tf.setBackend("cpu")
    }
    // re creates tensor
    t4d = tf.tensor4d(e.data.data, [1, 3, 512, 512])
    // run model
    tf.tidy(() => {
        model.then(function (r) {
            res = r.predict(t4d);
            var shape = res.shape;
            im = res.dataSync();
            shape.reverse().map(a => {
                im = im.reduce((b, c) => {
                    latest = b[b.length - 1]
                    latest.length < a ? latest.push(c) : b.push([c])
                    return b
                }, [[]])
            })
            console.log('segment done');
            if (im) {
                postMessage(im[0])
            } else {
                // if it failed return this
                postMessage("")
            }
        })
    })
}
