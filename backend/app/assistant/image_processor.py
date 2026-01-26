from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import io
import math

class ImageProcessor:
    @staticmethod
    def draw_annotations(
        image_path: str,
        annotations: list[dict]
    ) -> bytes:
        """
        Draw annotations on an image
        
        Args:
            image_path: Path to the original image
            annotations: List of annotations with format:
                [{"x": 45, "y": 30, "label": "1", "text": "Check here"}, ...]
                where x and y are percentages (0-100)
        
        Returns:
            Image bytes (JPEG format)
        """
        # Open image
        img = Image.open(image_path)
        draw = ImageDraw.Draw(img)
        
        # Calculate sizes based on image dimensions for better scaling
        base_size = min(img.width, img.height)
        circle_radius = int(base_size * 0.04)  # 4% of smallest dimension
        font_size_label = int(base_size * 0.05)  # 5% for numbers
        font_size_text = int(base_size * 0.025)  # 2.5% for text
        line_width = max(6, int(base_size * 0.008))  # Thicker lines
        
        # Try to load a nice font, fallback to default
        try:
            font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size_label)
            font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size_text)
        except:
            font_label = ImageFont.load_default()
            font_text = ImageFont.load_default()
        
        # Process annotations
        for idx, ann in enumerate(annotations, start=1):
            # Convert percentage to pixels
            x = int(img.width * ann['x'] / 100)
            y = int(img.height * ann['y'] / 100)
            
            # Get radius from annotation or use default
            # Radius is specified as percentage of image width
            radius_percent = ann.get('radius', 9)  # Default 9% - moderate size
            current_radius = int(base_size * radius_percent / 100)
            # Moderate circles - clamp between 40px and 25% of image (not too big)
            current_radius = max(40, min(current_radius, base_size // 4))
            
            # Draw bright red circle outline only
            draw.ellipse(
                [x - current_radius, y - current_radius, x + current_radius, y + current_radius],
                outline='#FF0000',
                width=line_width
            )
            
            # Draw number inside circle (white text with black outline for visibility)
            number_text = str(idx)
            # Use larger font for number
            try:
                number_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 
                                                 int(base_size * 0.08))  # Large number
            except:
                number_font = ImageFont.load_default()
            
            # Get text bounding box to center it
            number_bbox = draw.textbbox((0, 0), number_text, font=number_font)
            number_width = number_bbox[2] - number_bbox[0]
            number_height = number_bbox[3] - number_bbox[1]
            
            # Draw number with black outline for contrast
            number_x = x - number_width // 2
            number_y = y - number_height // 2
            
            # Black outline (draw 8 times around)
            for dx in [-2, 0, 2]:
                for dy in [-2, 0, 2]:
                    if dx != 0 or dy != 0:
                        draw.text((number_x + dx, number_y + dy), number_text, 
                                 font=number_font, fill='#000000')
            
            # White number on top
            draw.text((number_x, number_y), number_text, font=number_font, fill='#FFFFFF')
        
        # Draw legend at bottom of image
        # Calculate proper spacing based on font size
        try:
            legend_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 
                                            int(base_size * 0.03))  # Larger for readability
        except:
            legend_font = font_text
        
        # Calculate legend dimensions
        line_spacing = int(base_size * 0.05)  # 5% of image for each line - plenty of space
        legend_padding = 30
        legend_height = legend_padding * 2 + len(annotations) * line_spacing
        legend_y_start = max(20, img.height - legend_height - 20)  # Ensure it fits
        
        # Draw semi-transparent white background for legend
        draw.rectangle(
            [10, legend_y_start, img.width - 10, img.height - 10],
            fill=(255, 255, 255, 250),
            outline='#FF0000',
            width=4
        )
        
        # Draw legend items with proper spacing
        current_y = legend_y_start + legend_padding
        for idx, ann in enumerate(annotations, start=1):
            if 'text' in ann and ann['text']:
                legend_text = f"[{idx}] {ann['text']}"
                draw.text(
                    (30, current_y),
                    legend_text,
                    fill='#FF0000',
                    font=legend_font
                )
                current_y += line_spacing  # Use consistent line spacing
        
        # Convert to RGB before saving (JPEG doesn't support alpha)
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # Use alpha channel as mask
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()

# Singleton instance
image_processor = ImageProcessor()
