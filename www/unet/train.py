import os
import time
import gc
import importlib
import bios
import pickle
import logging

from PIL import Image
from tqdm import tqdm
from torchvision import utils
import torch
import torchvision.transforms as transforms
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader  # For custom data-sets
from dataloader import *
from utils import *

temp = bios.read("config.yaml")
config = {}
for k, v in temp.items():
    try:
        config[k] = eval(v)
    except:
        config[k] = v
data = {
    'model name': config["model"],
    'description': config["description"],
    'train': {
        'loss': [],
    },
    'val': {
        'mIOU': [],
        'loss': [],
        'acc': [],
        'ious': [],
    },
    'test': {
        'mIOU': [],
        'loss': [],
        'acc': [],
        'ious': [],
    },
    'loss': str(config["criterion"]),
    'lr': config["learning_rate"],
    'batch_size': config["batch_size"],
}

# Transformation
resize = 512
img_transforms = [
    transforms.RandomResizedCrop(resize),
    transforms.RandomRotation(10),
    transforms.RandomHorizontalFlip(),
    transforms.CenterCrop(resize - 32),
    transforms.ToTensor(),
    transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
]

label_transforms = [
    transforms.RandomResizedCrop(resize, interpolation=Image.NEAREST),
    transforms.RandomRotation(10),
    transforms.RandomHorizontalFlip(),
    transforms.CenterCrop(resize - 32),
]
val_img_transforms = [
    transforms.Resize(288),
    transforms.ToTensor(),
    transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
]
val_label_transforms = [
    transforms.Resize(288, interpolation=Image.NEAREST),
]

train_dataset = IddDataset(csv_file='train.csv', img_transforms=img_transforms, label_transforms=label_transforms)
val_dataset = IddDataset(csv_file='val.csv', img_transforms=val_img_transforms,
                         label_transforms=val_label_transforms)
train_loader = DataLoader(dataset=train_dataset,
                          batch_size=config["batch_size"], num_workers=4, shuffle=True)
val_loader = DataLoader(dataset=val_dataset, batch_size=config["batch_size"],
                        num_workers=4, shuffle=True)

# Import model
module = importlib.import_module(f"models.{config['model']}.model")
FCN = module.FCN
model = FCN(n_class)
optimizer = optim.Adam(model.parameters(), lr=config["learning_rate"])
use_gpu = torch.cuda.is_available()
if config["reload"]:
    model = torch.load(f"models/{config['model']}/best_model")

if use_gpu:
    gc.collect()
    torch.cuda.empty_cache()
    model = model.cuda()

# Criterion
if config["criterion"] == "CE":
    weights = torch.load("log_weights")
    criterion = nn.CrossEntropyLoss(weight=weights)

# logger
log_file = "output.log"
level = logging.INFO
name = "new_logger"
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
stream = logging.StreamHandler()
stream.setFormatter(formatter)
handler = logging.FileHandler(log_file)
handler.setFormatter(formatter)

logger = logging.getLogger(name)
logger.setLevel(level)
logger.addHandler(handler)
logger.addHandler(stream)


def update_data(mIOU, loss, acc, ious, epoch):
    data['val']['mIOU'].append(mIOU.item())
    data['val']['loss'].append(loss.item())
    data['val']['acc'].append(acc.item())
    data['val']['ious'].append(ious.cpu().numpy())
    data['epochs'] = epoch+1
    f = open(f'models/{config["model"]}/data.pkl', 'wb')
    pickle.dump(data, f)
    f.close()


def train():
    best_iou = 0
    for epoch in range(config["epochs"]):
        ts = time.time()
        loss_per_epoch = 0
        for iter, (X, tar, Y) in enumerate(train_loader):
            optimizer.zero_grad()
            if use_gpu:
                inputs = X.cuda()
                labels = Y.cuda() if isinstance(criterion, nn.CrossEntropyLoss) else tar.cuda()
            else:
                inputs, labels, target = X, Y, tar

            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            loss_per_epoch += loss.detach()
            if iter % 10 == 0:
                print("Epoch: {}, Iter: {}, Loss: {}".format(
                    epoch, iter, loss.item()))
            if iter == 50:
                break
        print("\nFinish epoch {}, time elapsed {}".format(epoch, time.time() - ts))
        loss_per_epoch /= (iter + 1)
        data['train']['loss'].append(loss_per_epoch.item())
        mIOU, loss, accs, ious = val(epoch)
        update_data(mIOU, loss, accs, ious, epoch)
        if mIOU > best_iou:
            best_iou = mIOU
            torch.save(model, f'models/{config["model"]}/best_model')
        model.train()


def val(epoch):
    model.eval()  # Don't forget to put in eval mode !
    # Complete this function - Calculate loss, accuracy and IoU for every epoch
    # Make sure to include a softmax after the output from your model
    accs = 0
    loss = 0

    # ious[0]: 26 class of intersections
    # ious[1]: 26 class of unions
    ious = torch.zeros((2, n_class - 1))
    if use_gpu:
        ious = ious.cuda()
    with torch.no_grad():
        for iter, (X, tar, Y) in enumerate((val_loader)):
            if use_gpu:
                inputs = X.cuda()
                labels = Y.cuda()
                if not isinstance(criterion, nn.CrossEntropyLoss):
                    target = tar.cuda()
            else:
                inputs, labels, target = X, Y, tar

            outputs = model(inputs)
            # avg loss per minibatch
            loss += criterion(outputs, labels if isinstance(criterion, nn.CrossEntropyLoss) else target)
            pred = outputs.argmax(dim=1)
            # avg pixel acc per minibatch
            accs += pixel_acc(pred, labels)
            # sum of minibatch iou
            ious += iou_test(pred, labels)
            if iter == 10:
                break
        # average loss
        loss /= (iter + 1)
        # average accs
        accs /= (iter + 1)
        # 26 class average ious
        mIOU = ious[0].sum() / ious[1].sum()
        msg = f"""
        \n-------------------------------VALIDATION-------------------------
        Epoch {epoch}   Loss: {loss}
        Accuracy: {accs}    Mean IOU: {mIOU}
        ------------------------------------------------------------------\n
        """
        logger.info(msg)
    return mIOU, loss, accs, ious

gc.collect()
torch.cuda.empty_cache()
train()