import os
import torch
import torchvision.transforms as transforms

import bios
import numpy as np
from unet.dataloader import *


class modelPredict():
    def __init__(self):
        temp = bios.read("unet/config.yaml")
        self.config = {}
        for k, v in temp.items():
            try:
                self.config[k] = eval(v)
            except:
                self.config[k] = v
        model_path = f"./unet/models/{self.config['model']}/best_model"
        map_location=torch.device('cpu')

        self.model = torch.load(model_path, map_location=map_location)
        self.model.cpu()

    def mapColor(self, X):
        out = np.zeros((*X.shape, 3))
        for label in labels:
            i = label.level3Id
            out[X == i] = np.array(label.color)/255
        return out


    def predict(self, img):
        """

        Args:
            img: RGB img (3, X, Y)

        Returns:

        """
        test_transforms = [
            transforms.ToTensor(),
            transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
        ]
        trans = transforms.Compose(test_transforms)
        X = trans(img).float()

        torch.set_num_threads(2)
        outputs = self.model(X.unsqueeze(0))
        outputs = outputs[:, :, 4:-4]
        pred = outputs.argmax(dim=1).cpu()[0]
        predColor = self.mapColor(pred.numpy())
        return predColor


