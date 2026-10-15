"""Audit source coverage, answer marks and images; report editorial text differences."""
import argparse
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

project = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--bank', type=Path, default=project / 'src/data/questions.json')
parser.add_argument('--strict-text', action='store_true', help='Also require unedited source text (for fresh imports).')
args = parser.parse_args()
bank = json.loads(args.bank.read_text(encoding='utf-8'))
text_edits = []

def check_text(expected, actual, question_id, field):
    if expected != actual:
        text_edits.append({'question': question_id, 'field': field})
        if args.strict_text:
            raise AssertionError(('source-text', question_id, field))
source = project / 'public' / bank['source']['download']
assert hashlib.sha256(source.read_bytes()).hexdigest() == bank['source']['sha256']
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
def normalize(text):
    return ' '.join(text.split())

with zipfile.ZipFile(source) as archive:
    doc = ET.fromstring(archive.read('word/document.xml'))
    paragraphs = doc.findall('.//w:body//w:p', ns)
    relations = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}
    headings = {s['sourceTitle'] for s in bank['sections']}
    text_checks = 0
    image_checks = 0
    floating_checks = 0
    covered_paragraphs = set()
    for number, question in enumerate(bank['questions']):
        end = bank['questions'][number + 1]['sourceParagraph'] if number + 1 < len(bank['questions']) else len(paragraphs)
        raw, marked, image_paths = '', [], []
        for i in range(question['sourceParagraph'], end):
            p = paragraphs[i]
            text = ''.join(t.text or '' for t in p.findall('.//w:t', ns))
            if normalize(text) in headings:
                continue
            covered_paragraphs.add(i)
            for run in p.findall('.//w:r', ns):
                value = ''.join(t.text or '' for t in run.findall('.//w:t', ns))
                highlight = run.find('w:rPr/w:highlight', ns)
                is_yellow = highlight is not None and highlight.get('{' + ns['w'] + '}val') == 'yellow'
                marked.extend([is_yellow] * len(value))
                raw += value
            raw += '\n'
            marked.append(False)
            drawings = list(p.findall('.//w:drawing', ns))
            floating = p.findall('.//wp:anchor', ns)
            if len(floating) > 1:
                # These source rows use the same column and paragraph coordinates.
                assert len(floating) == len(drawings)
                assert len({ET.tostring(a.find('wp:positionV', ns)) for a in floating}) == 1
                drawings = sorted(floating, key=lambda a: int(a.find('wp:positionH/wp:posOffset', ns).text))
                floating_checks += 1
            for drawing in drawings:
                image = drawing.find('.//a:blip', ns)
                rid = image.get('{' + ns['r'] + '}embed')
                image_paths.append('images/' + Path(relations[rid]).name)
        labels = list(re.finditer(r'(?:(?<!\S)|(?<=информации за пловни патишта))[АБВГABC]\s*\.', raw))
        assert len(labels) == len(question['options']), question['id']
        prompt = re.sub(r'^\s*\d+\s*\.\s*', '', raw[:labels[0].start()])
        check_text(normalize(prompt), question['text'], question['id'], 'text')
        for i, label in enumerate(labels):
            stop = labels[i + 1].start() if i + 1 < len(labels) else len(raw)
            option = question['options'][i]
            expected_text = normalize(raw[label.end():stop])
            check_text(expected_text, option['text'], question['id'], option['id'])
            expected_correct = any(marked[j] and not raw[j].isspace() for j in range(label.start(), stop))
            assert expected_correct == option['correct'], ('highlight', question['id'], i)
            text_checks += 1
        actual_images = question['images'] + [path for option in question['options'] for path in option['images']]
        assert image_paths == actual_images, ('image-order', question['id'], image_paths, actual_images)
        image_checks += len(image_paths)
    for i, p in enumerate(paragraphs):
        if i not in covered_paragraphs:
            text = normalize(''.join(t.text or '' for t in p.findall('.//w:t', ns)))
            assert not text or text in headings, ('unmapped-source-paragraph', i, text)

print(json.dumps({'status': 'passed', 'questions': len(bank['questions']),
    'answerHighlights': text_checks, 'editedTextFields': len(text_edits), 'imageOccurrences': image_checks,
    'floatingImageRowsChecked': floating_checks, 'unmappedSourceParagraphs': 0}, indent=2))
