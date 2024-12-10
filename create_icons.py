from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, text):
    # Create a new image with a white background
    image = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a default font
    try:
        font = ImageFont.truetype("arial.ttf", size=int(size/2))
    except IOError:
        font = ImageFont.load_default()
    
    # Draw a border
    draw.rectangle([0, 0, size-1, size-1], outline='blue')
    
    # Draw the text in the center
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    position = ((size-text_width)/2, (size-text_height)/2)
    draw.text(position, text, fill='blue', font=font)
    
    return image

# Create icons
sizes = [16, 48, 128]
for size in sizes:
    icon = create_icon(size, 'ST')
    icon.save(f'icon{size}.png')

print("Icons created successfully!")
