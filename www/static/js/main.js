
var panorama;
var API_KEY = config["apiKey"];
var last_im;
var auto_seg = false;


function initialize() {
  // Initialize google maps and street view
  var start = new google.maps.LatLng(41.8893022, 12.4935329);


  var mapOptions = {
    center: start,
    zoom: 14
  };
  map = new google.maps.Map(
    document.getElementById('map-canvas'), mapOptions);

  var panoramaOptions = {
    position: start,
    pov: {
      heading: 320,
      pitch: 5.8789
    }
  };
  panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
  map.setStreetView(panorama);
  last_im = getPanoImgDim()

}

function toggleSegOverlay() {
  // Toggles Segmentation overlay on first tab
  ele = $("#segmentation")
  check_box = $("#seg_checkbox")
  if (ele.is(":visible")) {
    ele.hide()
    check_box.prop('checked', false);
  } else {
    ele.show()
    check_box.prop('checked', true);
  }
}

function toggleHoverClass() {
  // toggles segmentation class label that exists above the pointer when hovering segmentation map
  check_box = $("#hover_class")
  if (check_box.is(":checked")) {
    check_box.prop('checked', false);
  } else {
    check_box.prop('checked', true);
  }
}
function changeOverlayOpacity() {
  // Changes segmentation overlay  opacity on first tab
  var val = document.getElementById("opacityOverlay").value
  var cols = document.getElementsByClassName('overlay')
  for (i = 0; i < cols.length; i++) {
    cols[i].style.opacity = val / 100
  }
}
function segmentAutomatically() {
  // toggles checkbox for automatic segmentation
  var box = $("#segment_auto")
  if (auto_seg) {
    box.prop('checked', false);
    auto_seg = false
  } else {
    box.prop('checked', true);
    auto_seg = true
  }
}


function getPanoImgDim() {
  // Used to check if the map has changed so it doesnt try to segment the same image again
  var loc = panorama.getPosition();
  var pov = panorama.getPov();
  var size = document.getElementById("pano").getBoundingClientRect()
  return `${loc["lat"]().toFixed(4)},${loc["lng"]().toFixed(4)},${pov["heading"].toFixed(4)},${pov["pitch"].toFixed(4)},${pov["zoom"].toFixed(4)}`
}

function getPanoImgURL() {
  // gets static street view image url
  var loc = panorama.getPosition();
  var pov = panorama.getPov();
  var size = document.getElementById("pano").getBoundingClientRect()
  // return `https://maps.googleapis.com/maps/api/streetview?size=512x512&location=${loc["lat"]()},${loc["lng"]()}&fov=${180 / 2 ** pov["zoom"]}&heading=${pov["heading"]}&pitch=${pov["pitch"]}&zoom=${pov["zoom"]}&key=${API_KEY}`
  // return "https://webtools.verlet.io/test/static/img/test3.jpeg"
  return "static/img/default_old.jpeg"
}

function toggleLoad() {
  // Loading screen to stop user from makeing more changes. Only runs when it is segmenting
  var ele = $("#loading")
  if (ele.is(":visible")) {
    $("#loading").hide("fast")
  } else {
    $("#loading").show("fast")
  }
}


function segment(manual = false) {
  // Calls python function using ajax that gets the image from url and then segments it through pytorch model. 
  var panoim = getPanoImgDim();
  if (panoim !== last_im && (auto_seg || manual)) {
    toggleLoad();
    var url = getPanoImgURL();
    url = "https://maps.googleapis.com/maps/api/streetview?size=512x512&location=41.88930216105437,12.4935328695066&fov=89.99999999999999&heading=17.811654981645006&pitch=-15.305973058661124&zoom=1.0000000000000002&key=AIzaSyCUq83yk43jU83mksZDcgPjWnPY9PB6MVk"
    img = document.getElementById("raw_img")
    img.src = url
    modelPredict("raw_img")
    drawImgCanvas(predicted_image)
    toggleLoad()

  }

}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


function GetLocation() {
  // Get location of address and changes the maps location
  if ($("#marzen").is(":visible")) {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById("txtAddress").value;
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        console.log(latitude, longitude)
        var new_center = new google.maps.LatLng(latitude, longitude)
        map.setCenter(new_center)
        panorama.setPosition(new_center)
      } else {
        alert("api keys invalid")
      }
    });
  }
};

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


document.onclick = function () {
  // check segment function every click
  segment()
}

window.onload = function () {
  // default paths 
  default_mask = "../static/img/default_mask.jpeg"

  // set canvas for overlays
  assignBase64Canvas("seg_mask_img", default_mask)
  assignBase64Canvas("seg_mask_img2", default_mask)

  // Hover masks to identify obj
  seg_masks_color_id()

  // Hover class element (id the segmeneted clas)
  let circle = document.getElementById('color_class');
  const onMouseMove = (e) => {
    circle.style.left = e.pageX + 'px';
    circle.style.top = e.pageY + 'px';
  }
  document.addEventListener('mousemove', onMouseMove);
};

setInterval(function () {
  segment()
}, 500);



google.maps.event.addDomListener(window, 'load', initialize);
