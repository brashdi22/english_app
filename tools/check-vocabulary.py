"""Lists words in the book that the offline speech model does not know.

Words the model doesn't know can never be recognized, so each one needs an
entry in SPOKEN_FORMS (js/offline-speech.js).

    pip install vosk
    tar xzf models/vosk-model-small-en-us-0.15.tar.gz -C /tmp
    node tools/book-phrases.mjs > /tmp/phrases.json
    python3 tools/check-vocabulary.py /tmp/vosk-model-small-en-us-0.15 /tmp/phrases.json
"""
import json
import re
import sys

from vosk import KaldiRecognizer, Model, SetLogLevel

model_dir, phrases_file = sys.argv[1:3]
phrases = json.load(open(phrases_file))
words = sorted({w for p in phrases for w in re.sub(r"[^a-z' ]", " ", p.lower().replace("’", "'")).split()})
print(f"{len(words)} different words in the book", file=sys.stderr)
SetLogLevel(-1)  # the model prints "missing in vocabulary" warnings to stderr
model = Model(model_dir)
for i in range(0, len(words), 100):
    KaldiRecognizer(model, 16000, json.dumps(words[i:i + 100] + ["[unk]"]))
