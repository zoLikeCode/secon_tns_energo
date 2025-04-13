import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import warnings
warnings.filterwarnings("ignore")

# Устройство
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Загрузка модели и классов
checkpoint_path = 'meter_model+_3epoch_new_data.pth'
checkpoint = torch.load(checkpoint_path, map_location=device)

class_names = checkpoint['class_names']
num_classes = len(class_names)

# Инициализация модели
model = models.mobilenet_v2(pretrained=False)
num_features = model.classifier[1].in_features
model.classifier[1] = torch.nn.Linear(num_features, num_classes)
model.load_state_dict(checkpoint['model_state_dict'])
model = model.to(device)
model.eval()

# Предобработка изображения
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], 
                         [0.229, 0.224, 0.225])
])

# Классы, относящиеся к "meter"
METER_CLASSES = {'new', 'legacy'}

def predict_meter_or_unusable(image_path):
    """Принимает путь к изображению, возвращает 'meter' или 'unusable'"""
    img = Image.open(image_path).convert('RGB')
    input_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor)
        probs = F.softmax(output, dim=1)
        pred_index = torch.argmax(probs, 1).item()
        pred_class = class_names[pred_index]

    if pred_class in METER_CLASSES:
        return "meter"
    elif pred_class == "unusable":
        return "unusable"


def main(path):
    img_path = path  # путь до изображения
    result = predict_meter_or_unusable(img_path)
    return result