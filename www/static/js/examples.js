
var API_KEY = config["apiKey"];
var panorama;
var last_im;
var auto_seg = false;

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

function seg_masks_color_id(id) {
    // Displays the class name of segmentation masks 
    // for seg on second page
    $(id).mousemove(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var c = this.getContext('2d');
        var p = c.getImageData(x, y, 1, 1).data;
        edit_class_name(p[0], p[1], p[2])

    });
    $(id).mouseenter(function () {
        $("#color_class").show()
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

        if (buff  < best ) {
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

function changeOverlayOpacity(){
    console.log("hisd")
var val = document.getElementById("opacityOverlay").value
var cols = document.getElementsByClassName('overlay2')
for (i = 0; i < cols.length; i++) {
    cols[i].style.opacity = val / 100
}

}


document.addEventListener('mousemove', function (e) {
    let body = document.querySelector('body');
    let circle = document.getElementById('color_class');
    let left = e.offsetX;
    let top = e.offsetY;
    circle.style.left = left + 'px';
    circle.style.top = top + 'px';
});



function assignBase64Canvas(id, base64im) {
  // assigns base 64 image to canvas element on load
  var canvas = document.getElementById(id);
  var ctx = canvas.getContext("2d");

  var image = new Image();
  image.onload = function () {
    ctx.drawImage(image, 0, 0);
  };
  image.src = base64im
}


window.onload = function () {
  // set canvas for overlays
    assignBase64Canvas("jrzqctlnnz_raw", "examples/jrzqctlnnz_raw.png");
    assignBase64Canvas("jrzqctlnnz_raw2", "examples/jrzqctlnnz_raw.png");
    assignBase64Canvas("jrzqctlnnz_seg", "examples/jrzqctlnnz_seg.png");
    assignBase64Canvas("qwocqyfxst_raw", "examples/qwocqyfxst_raw.png");
    assignBase64Canvas("qwocqyfxst_raw2", "examples/qwocqyfxst_raw.png");
    assignBase64Canvas("qwocqyfxst_seg", "examples/qwocqyfxst_seg.png");
    assignBase64Canvas("ukhetzuqgo_raw", "examples/ukhetzuqgo_raw.png");
    assignBase64Canvas("ukhetzuqgo_raw2", "examples/ukhetzuqgo_raw.png");
    assignBase64Canvas("ukhetzuqgo_seg", "examples/ukhetzuqgo_seg.png");
    assignBase64Canvas("xopvriwhiz_raw", "examples/xopvriwhiz_raw.png");
    assignBase64Canvas("xopvriwhiz_raw2", "examples/xopvriwhiz_raw.png");
    assignBase64Canvas("xopvriwhiz_seg", "examples/xopvriwhiz_seg.png");
    assignBase64Canvas("fvfpoifqgo_raw", "examples/fvfpoifqgo_raw.png");
    assignBase64Canvas("fvfpoifqgo_raw2", "examples/fvfpoifqgo_raw.png");
    assignBase64Canvas("fvfpoifqgo_seg", "examples/fvfpoifqgo_seg.png");
    assignBase64Canvas("rxvcndjxih_raw", "examples/rxvcndjxih_raw.png");
    assignBase64Canvas("rxvcndjxih_raw2", "examples/rxvcndjxih_raw.png");
    assignBase64Canvas("rxvcndjxih_seg", "examples/rxvcndjxih_seg.png");
    assignBase64Canvas("quyhrhlsgi_raw", "examples/quyhrhlsgi_raw.png");
    assignBase64Canvas("quyhrhlsgi_raw2", "examples/quyhrhlsgi_raw.png");
    assignBase64Canvas("quyhrhlsgi_seg", "examples/quyhrhlsgi_seg.png");
    assignBase64Canvas("qjmpxleagb_raw", "examples/qjmpxleagb_raw.png");
    assignBase64Canvas("qjmpxleagb_raw2", "examples/qjmpxleagb_raw.png");
    assignBase64Canvas("qjmpxleagb_seg", "examples/qjmpxleagb_seg.png");
    assignBase64Canvas("aqgpgjwztb_raw", "examples/aqgpgjwztb_raw.png");
    assignBase64Canvas("aqgpgjwztb_raw2", "examples/aqgpgjwztb_raw.png");
    assignBase64Canvas("aqgpgjwztb_seg", "examples/aqgpgjwztb_seg.png");
    assignBase64Canvas("ycoxqowjpz_raw", "examples/ycoxqowjpz_raw.png");
    assignBase64Canvas("ycoxqowjpz_raw2", "examples/ycoxqowjpz_raw.png");
    assignBase64Canvas("ycoxqowjpz_seg", "examples/ycoxqowjpz_seg.png");
    assignBase64Canvas("crodhtqobu_raw", "examples/crodhtqobu_raw.png");
    assignBase64Canvas("crodhtqobu_raw2", "examples/crodhtqobu_raw.png");
    assignBase64Canvas("crodhtqobu_seg", "examples/crodhtqobu_seg.png");
    assignBase64Canvas("gsaenpeuiv_raw", "examples/gsaenpeuiv_raw.png");
    assignBase64Canvas("gsaenpeuiv_raw2", "examples/gsaenpeuiv_raw.png");
    assignBase64Canvas("gsaenpeuiv_seg", "examples/gsaenpeuiv_seg.png");
    assignBase64Canvas("ukqjtxzrcz_raw", "examples/ukqjtxzrcz_raw.png");
    assignBase64Canvas("ukqjtxzrcz_raw2", "examples/ukqjtxzrcz_raw.png");
    assignBase64Canvas("ukqjtxzrcz_seg", "examples/ukqjtxzrcz_seg.png");
    assignBase64Canvas("onhrhcpuwd_raw", "examples/onhrhcpuwd_raw.png");
    assignBase64Canvas("onhrhcpuwd_raw2", "examples/onhrhcpuwd_raw.png");
    assignBase64Canvas("onhrhcpuwd_seg", "examples/onhrhcpuwd_seg.png");
    assignBase64Canvas("ekbduonbaj_raw", "examples/ekbduonbaj_raw.png");
    assignBase64Canvas("ekbduonbaj_raw2", "examples/ekbduonbaj_raw.png");
    assignBase64Canvas("ekbduonbaj_seg", "examples/ekbduonbaj_seg.png");
    assignBase64Canvas("izjnladnql_raw", "examples/izjnladnql_raw.png");
    assignBase64Canvas("izjnladnql_raw2", "examples/izjnladnql_raw.png");
    assignBase64Canvas("izjnladnql_seg", "examples/izjnladnql_seg.png");
    assignBase64Canvas("iojumzlizz_raw", "examples/iojumzlizz_raw.png");
    assignBase64Canvas("iojumzlizz_raw2", "examples/iojumzlizz_raw.png");
    assignBase64Canvas("iojumzlizz_seg", "examples/iojumzlizz_seg.png");
    assignBase64Canvas("ntjsfgsixc_raw", "examples/ntjsfgsixc_raw.png");
    assignBase64Canvas("ntjsfgsixc_raw2", "examples/ntjsfgsixc_raw.png");
    assignBase64Canvas("ntjsfgsixc_seg", "examples/ntjsfgsixc_seg.png");
  // Hover masks to identify obj
  seg_masks_color_id("#jrzqctlnnz_seg");
  seg_masks_color_id("#qwocqyfxst_seg");
  seg_masks_color_id("#ukhetzuqgo_seg");
  seg_masks_color_id("#xopvriwhiz_seg");
  seg_masks_color_id("#fvfpoifqgo_seg");
  seg_masks_color_id("#rxvcndjxih_seg");
  seg_masks_color_id("#quyhrhlsgi_seg");
  seg_masks_color_id("#qjmpxleagb_seg");
  seg_masks_color_id("#aqgpgjwztb_seg");
  seg_masks_color_id("#ycoxqowjpz_seg");
  seg_masks_color_id("#crodhtqobu_seg");
  seg_masks_color_id("#gsaenpeuiv_seg");
  seg_masks_color_id("#ukqjtxzrcz_seg");
  seg_masks_color_id("#onhrhcpuwd_seg");
  seg_masks_color_id("#ekbduonbaj_seg");
  seg_masks_color_id("#izjnladnql_seg");
  seg_masks_color_id("#iojumzlizz_seg");
  seg_masks_color_id("#ntjsfgsixc_seg");

  // Hover class element (id the segmeneted clas)
  let circle = document.getElementById('color_class');
  const onMouseMove = (e) => {
    circle.style.left = e.pageX + 'px';
    circle.style.top = e.pageY + 'px';
  }
  document.addEventListener('mousemove', onMouseMove);
};
