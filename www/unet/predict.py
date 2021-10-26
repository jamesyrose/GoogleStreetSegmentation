import onnxruntime as ort
import bios
import numpy as np
from collections import namedtuple
import onnxruntime as ort


n_class = 27
Label = namedtuple('Label', [
    'name',
    'level3Id',
    'color',
])

labels = [
    Label('road', 0, (128, 64, 128)),
    Label('drivable fallback', 1, (81, 0, 81)),
    Label('sidewalk', 2, (244, 35, 232)),
    Label('non-drivable fallback', 3, (152, 251, 152)),
    Label('person/animal', 4, (220, 20, 60)),
    Label('rider', 5, (255, 0, 0)),
    Label('motorcycle', 6, (0, 0, 230)),
    Label('bicycle', 7, (119, 11, 32)),
    Label('autorickshaw', 8, (255, 204, 54)),
    Label('car', 9, (0, 0, 142)),
    Label('truck', 10, (0, 0, 70)),
    Label('bus', 11, (0, 60, 100)),
    Label('vehicle fallback', 12, (136, 143, 153)),
    Label('curb', 13, (220, 190, 40)),
    Label('wall', 14, (102, 102, 156)),
    Label('fence', 15, (190, 153, 153)),
    Label('guard rail', 16, (180, 165, 180)),
    Label('billboard', 17, (174, 64, 67)),
    Label('traffic sign', 18, (220, 220, 0)),
    Label('traffic light', 19, (250, 170, 30)),
    Label('pole', 20, (153, 153, 153)),
    Label('obs-str-bar-fallback', 21, (169, 187, 214)),
    Label('building', 22, (70, 70, 70)),
    Label('bridge/tunnel', 23, (150, 100, 100)),
    Label('vegetation', 24, (107, 142, 35)),
    Label('sky', 25, (70, 130, 180)),
    Label('unlabeled', 26, (0, 0, 0)),
]


class modelPredict():
    def __init__(self):
        temp = bios.read("unet/config.yaml")
        self.config = {}
        for k, v in temp.items():
            try:
                self.config[k] = eval(v)
            except:
                self.config[k] = v
        model_path = f"./unet/models/{self.config['model']}/model.onnx"
        # self.model =  onnx.load(model_path)
        self.model = ort.InferenceSession(model_path)
        # map_location=torch.device('cpu')

        # self.model = torch.load(model_path, map_location=map_location)
        # self.model.cpu()

    def mapColor(self, X):
        out = np.zeros((*X.shape, 3))
        for label in labels:
            i = label.level3Id
            out[X == i] = np.array(label.color)/255
        return out
    def np_normal(self, x): 
        MEAN = (0.485, 0.456, 0.406)
        std = (0.229, 0.224, 0.225)
        x[0,:,:]  = (x[0,:,:] -MEAN[0])/std[0]
        x[1,:,:]  = (x[1,:,:] -MEAN[1])/std[1]
        x[2,:,:]  = (x[2,:,:] -MEAN[2])/std[2]
        return x


    def predict(self, img):
        """

        Args:
            img: RGB img (3, X, Y)

        Returns:
        """
        img = (np.array(img) / 255).astype(np.float32).transpose(2,0,1)
        img =self.np_normal(img)
        im =  np.expand_dims(img, axis=0)
        print("#" * 20)
        print(im.shape)

        input_name = self.model.get_inputs()[0].name
        print(input_name)
        print("$ * 10")
        tf_rep =  self.model.run(None, {input_name: im}) # prepare(self.model).run(im)

        # outputs = tf_rep[0]
        # outputs = outputs[:, :, 4:-4]
        # out = np.argmax(outputs, axis = 1)
        # pred = self.mapColor(out).squeeze()

        # # path =  f"./unet/models/UNet_CE/model.onnx"
        # # model = ort.InferenceSession(path)
        # # # input_name = model.get_inputs()[0].name

        # tf_rep = model.run(None, {input_name: im})
        outputs = tf_rep[0]
        outputs = outputs[:, :, 4:-4]
        out = np.argmax(outputs, axis = 1)
        pred = self.mapColor(out).squeeze()
        return pred

