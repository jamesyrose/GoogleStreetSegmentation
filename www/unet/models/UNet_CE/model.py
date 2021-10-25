#%%
import torch
import torch.nn as nn
import torchvision.transforms.functional as F

class FCN(nn.Module):

    def __init__(self, n_class):
        super().__init__()
        self.n_class = n_class
        self.relu = nn.ReLU(inplace=True)
        # Block 1         
        self.conv1_1 = nn.Conv2d(3, 64, kernel_size=3,
                               stride=1, padding=1, dilation=1)     
        self.conv1_2 = nn.Conv2d(64, 64, kernel_size=3,
                               stride=1, padding=1, dilation=1)
        self.max_pool_1 = nn.MaxPool2d(2,2)
        # Block 2         
        self.conv2_1 = nn.Conv2d(64, 128, kernel_size=3,
                               stride=1, padding=1, dilation=1)     
        self.conv2_2 = nn.Conv2d(128, 128, kernel_size=3,
                               stride=1, padding=1, dilation=1)
        self.max_pool_2 = nn.MaxPool2d(2,2)
        
        # Block 3
        self.conv3_1 = nn.Conv2d(128, 256, kernel_size=3,
                               stride=1, padding=1, dilation=1)     
        self.conv3_2 = nn.Conv2d(256, 256, kernel_size=3,
                               stride=1, padding=1, dilation=1)
        self.max_pool_3 = nn.MaxPool2d(2,2)

        
        # Block 4
        self.conv4_1 = nn.Conv2d(256, 512, kernel_size=3,
                               stride=1, padding=1, dilation=1)     
        self.conv4_2 = nn.Conv2d(512, 512, kernel_size=3,
                               stride=1, padding=1, dilation=1)
        self.max_pool_4 = nn.MaxPool2d(2,2)
                 

        # Block 5
        self.conv5_1 = nn.Conv2d(512, 1024, kernel_size=3,
                               stride=1, padding=1, dilation=1)     
        self.conv5_2 = nn.Conv2d(1024, 1024, kernel_size=3,
                               stride=1, padding=1, dilation=1)
        
        # output channels should be 1024 now        

        # Inverse Block 5         
        self.deconv1_1 = nn.ConvTranspose2d(
            1024, 512, kernel_size=2, stride=2, padding=0, dilation=1, output_padding=0)
        self.iconv1_1 = nn.Conv2d(1024, 512, kernel_size=3,
                               stride=1, padding=1, dilation=1) 
        self.iconv1_2 = nn.Conv2d(512, 512, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        
        # Inverse Block 4
        self.deconv2_1 = nn.ConvTranspose2d(
            512, 256, kernel_size=2, stride=2, padding=0, dilation=1, output_padding=0)
        self.iconv2_1 = nn.Conv2d(512, 256, kernel_size=3,
                               stride=1, padding=1, dilation=1) 
        self.iconv2_2 = nn.Conv2d(256, 256, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        
    
        # Inverse Block 3
        self.deconv3_1 = nn.ConvTranspose2d(
            256, 128, kernel_size=2, stride=2, padding=0, dilation=1, output_padding=0)
        self.iconv3_1 = nn.Conv2d(256, 128, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        self.iconv3_2 = nn.Conv2d(128, 128, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        
        # Inverse Block 2
        self.deconv4_1 = nn.ConvTranspose2d(
            128, 64, kernel_size=2, stride=2, padding=0, dilation=1, output_padding=0)
        self.iconv4_1 = nn.Conv2d(128, 64, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        self.iconv4_2 = nn.Conv2d(64, 64, kernel_size=3,
                       stride=1, padding=1, dilation=1) 
        
        # classify to n_classes channels
        self.classifier = nn.Conv2d(64, self.n_class, kernel_size=1)

    def forward(self, x):

        # ------- ENCODER --------
        x1 = self.relu(self.conv1_2(self.relu(self.conv1_1(x))))
        x2 = self.max_pool_1(x1)
        x3 = self.relu(self.conv2_2(self.relu(self.conv2_1(x2))))
        x4 = self.max_pool_2(x3)
        x5 = self.relu(self.conv3_2(self.relu(self.conv3_1(x4))))
        x6 = self.max_pool_3(x5)
        x7 = self.relu(self.conv4_2(self.relu(self.conv4_1(x6))))
        x8 = self.max_pool_4(x7)
        x9 = self.relu(self.conv5_2(self.relu(self.conv5_1(x8))))
#         print(x9.shape)

        # ------ DECODER --------

#         print(x1.shape)
#         print(x2.shape)
#         print(x3.shape)
#         print(x4.shape)
#         print(x5.shape)
#         print(x6.shape)
#         print(x7.shape)
#         print(x8.shape)
#         print(x9.shape)
        
#         temp =self.deconv1_1(x9)
        
#         crop_shape = temp.shape
# #         print(crop_shape)
#         test_x7 = x7[:,:,:crop_shape[-2], :crop_shape[-2]]
#         print(test_x7.shape, self.deconv1_1(x9).shape)
#         print(torch.cat([test_x7, self.deconv1_1(x9)], axis=1).shape)
        
        deconv_x9 = self.deconv1_1(x9)
#         print(deconv_x9.shape)
#         crop_shape = deconv_x9.shape
#         crop_x7 = x7[:,:,:crop_shape[-2], :crop_shape[-2]]        
        x10 = self.relu(self.iconv1_2(self.relu(self.iconv1_1(torch.cat([x7, deconv_x9], axis=1)))))
        
        deconv_x10 = self.deconv2_1(x10)
#         crop_shape = deconv_x10.shape
#         crop_x5 = x5[:,:,:crop_shape[-2], :crop_shape[-2]]
#         print(x5.shape, deconv_x10.shape)
        x11 = self.relu(self.iconv2_2(self.relu(self.iconv2_1(torch.cat([x5, deconv_x10], axis=1)))))
       
        deconv_x11 = self.deconv3_1(x11)
#         crop_shape = deconv_x11.shape
#         crop_x3 = x3[:,:,:crop_shape[-2], :crop_shape[-2]]
        
        x12 = self.relu(self.iconv3_2(self.relu(self.iconv3_1(torch.cat([x3, deconv_x11], axis=1)))))
        
        deconv_x12 = self.deconv4_1(x12)
#         crop_shape = deconv_x12.shape
#         crop_x1 = x1[:,:,:crop_shape[-2], :crop_shape[-2]]
        
        x14 = self.relu(self.iconv4_2(self.relu(self.iconv4_1(torch.cat([x1, deconv_x12], axis=1)))))
#         print(x14.shape)
        score = self.classifier(x14)
#         print(score.shape)
        
        # N,   C ,  H ,  W
        # 128, 32, 128, 128
        # print(f"x shape:{x.shape}")
        # print(f"x1 shape:{x1.shape}")
        # print(f"x2 shape:{x2.shape}")
        # print(f"x3 shape:{x3.shape}")
        # print(f"x4 shape:{x4.shape}")
        # print(f"x5 shape:{x5.shape}")
        # print(f"x6 shape:{x6.shape}")
        # print(f"x7 shape:{x7.shape}")
        # print(f"x8 shape:{x8.shape}")
        # print(f"x9 shape:{x9.shape}")
        # print(f"x10 shape:{x10.shape}")
        # print(f"x11 shape:{x11.shape}")
        # print(f"x12 shape:{x12.shape}")
        # print(f"x14 shape:{x14.shape}")
        # print(f"score shape:{score.shape}")

        return score  # size=(N, n_class, x.H/1, x.W/1)
#%%
if __name__ == "__main__":
    
    model = FCN(27)
    x = torch.randn(1,3, 512, 512)
    #%%
    y = model(x)
    #%%
    
    
#%%
