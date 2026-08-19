from pathlib import Path
import json
path = Path('server/public/stories.json')
text = path.read_text(encoding='utf-8')
print('File length:', len(text))
try:
    data = json.loads(text)
    print('Valid JSON, entries:', len(data))
    print('First entry keys:', data[0].keys())
except Exception as ex:
    print('JSON parse error:', repr(ex))
    raise
