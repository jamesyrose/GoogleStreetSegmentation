from os import pread
import sys
from flask import Flask, render_template, request, send_file
from io import StringIO, BytesIO
from PIL import Image, ImageDraw
from numpy.core.defchararray import mod
import requests
import base64
import numpy as np

import matplotlib.pyplot as plt

from unet.predict import modelPredict
sys.path.append("unet")

model = modelPredict()

image_raw = Image.open("/home/oem/Documents/GoogleStreetSegmentation/www/static/img/test2.jpeg")
seg = model.predict(image_raw)
seg = seg / seg.max() * 256 
print(seg)
print(seg.shape)

# print(seg.shape)
# plt.imshow(seg)
# plt.axis('off')
# img_buf = BytesIO()
# plt.savefig(img_buf, format='jpg', bbox_inches='tight',  pad_inches = 0)
# print(img_buf)
# im = Image.open(img_buf)
# print(np.array(im).shape)
# im.save("/home/oem/Documents/GoogleStreetSegmentation/www/static/img/seg2.jpeg")
