import re
import base64
from io import BytesIO
from PIL import Image

def main():
    svg_path = "public/logoaivv.svg"
    output_png_path = "public/logoaivv_square.png"
    
    print("Reading SVG...")
    with open(svg_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract base64 image data
    match = re.search(r'href="data:image/png;base64,([^"]+)"', content)
    if not match:
        match = re.search(r'xlink:href="data:image/png;base64,([^"]+)"', content)
    
    if not match:
        raise Exception("Could not find embedded PNG in SVG")
        
    base64_data = match.group(1)
    print("Decoding base64 PNG...")
    img_data = base64.b64decode(base64_data)
    img = Image.open(BytesIO(img_data))
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Calculate new square size (the max of width and height)
    new_size = max(width, height)
    
    # Create new transparent square image
    new_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
    
    # Calculate offset to paste centered
    offset_x = (new_size - width) // 2
    offset_y = (new_size - height) // 2
    
    print(f"Padding to {new_size}x{new_size} with offset ({offset_x}, {offset_y})")
    new_img.paste(img, (offset_x, offset_y))
    
    print(f"Saving square PNG to {output_png_path}...")
    new_img.save(output_png_path, "PNG")
    print("Done!")

if __name__ == "__main__":
    main()
