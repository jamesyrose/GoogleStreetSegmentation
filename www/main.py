import sys
from flask import Flask, render_template, request
from io import  BytesIO
from PIL import Image
import requests
import base64
import numpy as np
from config import config


from unet.predict import modelPredict
sys.path.append("unet")

model = modelPredict()


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', apiKey = config["apiKey"])


@app.route('/suggestions')
def suggestions():
    def data_to_decode(im): 
        image = Image.fromarray(np.uint8(im))
        obj = BytesIO()            
        image.save(obj, format='png')  
        obj.seek(0)

        seg_img = obj                        
        data1 = seg_img.read()              # get data from file (BytesIO)
        data1 = base64.b64encode(data1)  # convert to base64 as bytes
        data1 = data1.decode() 
        return data1

    url = request.args.get('jsdata')

    # read image from file
    # image_raw = Image.open("/home/oem/Documents/GoogleStreetSegmentation/www/static/img/default.jpeg")
    # print(url)
    response = requests.get(url)
    image_raw = Image.open(BytesIO(response.content))
    
    seg = model.predict(image_raw)
    
    seg = np.pad(seg, ((0,8), (0,0), (0, 0)), 'edge')
    seg = seg / seg.max() * 255
    # seg = Image.open("/home/oem/Documents/GoogleStreetSegmentation/www/static/img/seg.jpeg")

    #segmentation
    seg = data_to_decode(seg)
    # raw image 
    raw = data_to_decode(image_raw)


    # html = f'<div id="seg"><img id="seg_mask_img" src="data:image/png;base64,{seg}" class="overlay"></div><div id="raw" style="display: none;"><img id="seg_raw_img" src="data:image/png;base64,{raw}" class="overlay"></div>'
    html = f"data:image/png;base64,{seg}||data:image/png;base64,{raw}"
    return html




if __name__ == '__main__':
    app.run(debug=True)