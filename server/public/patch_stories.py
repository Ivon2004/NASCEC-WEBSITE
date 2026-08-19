from pathlib import Path
path = Path('server/public/stories.json')
text = path.read_text(encoding='utf-8')
old = '   "imageCaption": "Students planting trees at Musunji Comprehensive School",\n    "content": "A School, a Forest, and a Tree-Planting Project: The NASCEC-Musunji Partnership\n'
new = '    "imageCaption": "Students planting trees at Musunji Comprehensive School",\n    "photographer": {\n      "name": "NASCEC Media Team",\n      "website": "https://nascec.org"\n    },\n    "content": "A School, a Forest, and a Tree-Planting Project: The NASCEC-Musunji Partnership\n'
if old not in text:
    raise SystemExit('Expected substring not found in stories.json')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
print('patched')
