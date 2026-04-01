import torch.nn as nn
from torchvision import models

class CataractRiskModel(nn.Module):
    def __init__(self, num_classes=3):
        super(CataractRiskModel, self).__init__()
        # Load Pretrained ResNet18
        # weights='DEFAULT' is the modern way, but pretrained=True works for older torchvision
        self.model = models.resnet18(pretrained=True)
        
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_ftrs, num_classes)
        )
        
    def forward(self, x):
        return self.model(x)
