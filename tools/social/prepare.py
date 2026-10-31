import json, subprocess, pathlib
p=pathlib.Path('social-output')
manifest=json.loads((p/'manifest.json').read_text())
if manifest['errors']:
    raise SystemExit('Browser errors; refusing automatic publishing')
# Convert only; do not label footage as gameplay without independent verification.
subprocess.run(['ffmpeg','-y','-i',str(p/'capture.webm'),'-vf','scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(p/'candidate-reel.mp4')],check=True)
manifest['status']='candidate_requires_visual_review'
(p/'manifest.json').write_text(json.dumps(manifest,indent=2))
