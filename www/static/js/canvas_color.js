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
    'sky': [70, 130, 180]
}

function seg_masks_color_id() {
    // Displays the class name of segmentation masks 
    // for seg on second page
    $("#seg_mask_img2").mousemove(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var c = this.getContext('2d');
        var p = c.getImageData(x, y, 1, 1).data;
        edit_class_name(p[0], p[1], p[2])

    });
    $("#seg_mask_img2").mouseenter(function () {
        if ($("#hover_class").is(":checked")) {
            $("#color_class").show()
        }
    }).mouseleave(function () {
        $("#color_class").hide()
    });

    // for pano on first tab
    $("#pano").mousemove(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        var c = $("#seg_mask_img")[0].getContext('2d');
        var p = c.getImageData(x, y, 1, 1).data;
        edit_class_name(p[0], p[1], p[2])

    });

    $("#pano").mouseenter(function () {
        if ($("#hover_class").is(":checked")) {
            $("#color_class").show()
        }
    }).mouseleave(function () {
        $("#color_class").hide()
    });
}


function edit_class_name(r, g, b) {
    // changes the hover class name
    var best = 256 * 3;
    var best_label = "";
    var buff = 0;
    // Because of the upscale, exact match is not garunteed
    for (const [k, v] of Object.entries(labels)) {
        // console.log(v)
        buff = Math.abs(v[0] - r) + Math.abs(v[1] - g) + Math.abs(v[2] - b);

        if (buff < best) {
            best = buff
            best_label = k
        }
    }
    var ele = $("#color_class")
    ele.html(best_label)
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomColor() {
    return `rgb(${randomInt(256)}, ${randomInt(256)}, ${randomInt(256)})`
}



document.addEventListener('mousemove', function (e) {
    let body = document.querySelector('body');
    let circle = document.getElementById('color_class');
    let left = e.offsetX;
    let top = e.offsetY;
    circle.style.left = left + 'px';
    circle.style.top = top + 'px';
});