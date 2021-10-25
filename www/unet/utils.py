import torch

def iou(pred, target):
    n_class = 26
    ious = torch.zeros((2,n_class))
    if torch.cuda.is_available():
        ious = ious.cuda()
    for cls in range(n_class):
        # predict 1, target = 1
        predMask = pred == cls
        targetMask = target == cls
        intersection = (predMask & targetMask).sum()
        union = (predMask | targetMask).sum()
        # intersection of each class
        ious[0,cls] += intersection.float()
        # union of each class
        ious[1, cls] += union.float()
    return ious

def iou_test(pred, target):
    n_class = 26
    index = torch.arange(n_class)[None]
    if torch.cuda.is_available():
        index = index.cuda()
    return torch.stack([((pred[:,:,:,None] == index) & (target[:,:,:, None] == index)).sum(axis=(0,1,2)).cuda(),\
    ((pred[:,:,:,None] == index) | (target[:,:,:, None] == index)).sum(axis=(0,1,2)).cuda()]).float().cuda()


def pixel_acc(pred, target):
    res = (pred[target != 26] == target[target != 26]).to(dtype=torch.float).mean()
    if torch.cuda.is_available():
        res = res.cuda()
    return res
    
