import os
import sys
import glob
import numpy as np
import imageio.v2 as imageio
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

def create_master_video():
    print("🎬 Compiling FULL ELABORATE master video (581 frames)...")
    frames_dir = "video_frames"
    output_mp4 = "simplystore_demo.mp4"
    output_gif = "simplystore_demo.gif"

    frame_files = sorted(glob.glob(os.path.join(frames_dir, "*.png")))
    print(f"Total frames gathered: {len(frame_files)}")

    images = []
    for f in frame_files:
        img = Image.open(f).convert('RGB').resize((1280, 720), Image.Resampling.LANCZOS)
        images.append(img)

    # 1. Compile MP4 Video at 4 FPS (Duration: ~2.5 - 3 Minutes)
    print("🎥 Writing MP4 video file: simplystore_demo.mp4...")
    writer = imageio.get_writer(output_mp4, fps=4.0)
    for img in images:
        writer.append_data(np.array(img))
    writer.close()
    print(f"✅ Generated Master MP4 Video: {output_mp4}")

    # 2. Compile Animated GIF Preview (sampling every 3rd frame for smooth playback)
    print("🎞️ Writing Animated GIF preview: simplystore_demo.gif...")
    gif_images = images[::3]
    gif_images[0].save(
        output_gif,
        save_all=True,
        append_images=gif_images[1:],
        duration=220,
        loop=0
    )
    print(f"✅ Generated Master Animated GIF: {output_gif}")

if __name__ == "__main__":
    create_master_video()
