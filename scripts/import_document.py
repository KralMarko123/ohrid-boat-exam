"""Reproduce the supplied question bank from OOXML. Never infer correct answers."""
import argparse
import hashlib
import json
import re
import shutil
import struct
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'v': 'urn:schemas-microsoft-com:vml'}
W = '{' + NS['w'] + '}'
HEADINGS = {'1. Онови на навигација': 'Основи на навигација',
            '2. Основи на пловидбата и пловидбени прописи': 'Основи на пловидбата и пловидбени прописи',
            '3. Мотористика': 'Мотористика',
            '4. Морнарски работи и вештини': 'Морнарски работи и вештини',
            '5.Радио телефонска служба': 'Радио телефонска служба'}
# The source joins the third label to 'патишта' in navigation question 56.
OPTION = re.compile(r'(?:(?<!\S)|(?<=информации за пловни патишта))([АБВГABC])\s*\.')
NUMBER = re.compile(r'^(\d+)\s*\.\s*')

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def image_size(data):
    if data.startswith(b'\x89PNG'):
        return struct.unpack('>II', data[16:24])
    if data.startswith(b'\xff\xd8'):
        offset = 2
        while offset < len(data):
            if data[offset] != 255:
                offset += 1
                continue
            marker = data[offset + 1]
            offset += 2
            if marker in (0xD8, 0xD9):
                continue
            length = int.from_bytes(data[offset:offset + 2], 'big')
            if marker in (0xC0, 0xC1, 0xC2):
                height, width = struct.unpack('>HH', data[offset + 3:offset + 7])
                return width, height
            offset += length
    raise ValueError('Unsupported image dimensions')

def convert(source, destination):
    destination = Path(destination)
    media_dir = destination / 'public' / 'images'
    media_dir.mkdir(parents=True, exist_ok=True)
    sections, questions, warnings = [], [], []
    media = {}
    current = None
    media_count = 0
    reordered_image_paragraphs = []
    with zipfile.ZipFile(source) as archive:
        rels = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}
        root = ET.fromstring(archive.read('word/document.xml'))
        paragraphs = root.findall('.//w:body//w:p', NS)
        for index, p in enumerate(paragraphs):
            raw = ''.join(t.text or '' for t in p.findall('.//w:t', NS))
            text = clean(raw)
            images = []
            image_nodes = p.findall('.//a:blip', NS) + p.findall('.//v:imagedata', NS)
            anchors = p.findall('.//wp:anchor', NS)
            if len(image_nodes) > 1 and anchors:
                # Floating objects are stored in drawing order, NOT visual order.
                # Only automatically resolve a single row in one coordinate frame.
                if len(anchors) != len(image_nodes):
                    raise ValueError(f'Mixed floating/inline image layout requires review: paragraph {index}')
                positions = []
                for anchor in anchors:
                    h = anchor.find('wp:positionH', NS)
                    v = anchor.find('wp:positionV', NS)
                    x = anchor.find('wp:positionH/wp:posOffset', NS)
                    y = anchor.find('wp:positionV/wp:posOffset', NS)
                    if any(value is None for value in (h, v, x, y)):
                        raise ValueError(f'Unresolved image coordinates: paragraph {index}')
                    positions.append((h.get('relativeFrom'), v.get('relativeFrom'), int(y.text), int(x.text), anchor))
                if len({position[:3] for position in positions}) != 1:
                    raise ValueError(f'Non-row floating image layout requires review: paragraph {index}')
                ordered = [position[4].find('.//a:blip', NS) for position in sorted(positions, key=lambda value: value[3])]
                if ordered != image_nodes:
                    reordered_image_paragraphs.append(index)
                image_nodes = ordered
            for node in image_nodes:
                rel = node.get('{' + NS['r'] + '}embed') or node.get('{' + NS['r'] + '}id')
                target = rels[rel]
                name = Path(target).name
                data = archive.read('word/' + target)
                (media_dir / name).write_bytes(data)
                width, height = image_size(data)
                media['images/' + name] = {'width': width, 'height': height}
                images.append('images/' + name)
                media_count += 1
            if text in HEADINGS:
                section = {'id': 'section-' + str(len(sections) + 1), 'title': HEADINGS[text], 'sourceTitle': text}
                sections.append(section)
                current = None
                continue
            if not text and not images:
                continue
            matches = list(OPTION.finditer(raw))
            number = NUMBER.match(text)
            # The first 16 radio questions are unnumbered in the document.
            radio_start = sections[-1]['id'] == 'section-5' and text and not matches and (current is None or len(current['options']) == 3)
            if number or radio_start:
                ordinal = 1 + sum(q['sectionId'] == sections[-1]['id'] for q in questions)
                current = {'id': f"{sections[-1]['id']}-q{ordinal}", 'sectionId': sections[-1]['id'],
                           'number': ordinal, 'sourceNumber': int(number[1]) if number else None,
                           'sourceParagraph': index, 'text': text[number.end():] if number else text,
                           'images': images, 'options': []}
                questions.append(current)
                continue
            if current is None:
                raise ValueError(f'Unassigned paragraph {index}: {text}')
            current['images'].extend(images)
            if matches:
                spans, offset = [], 0
                for run in p.findall('.//w:r', NS):
                    runtext = ''.join(t.text or '' for t in run.findall('.//w:t', NS))
                    highlight = run.find('w:rPr/w:highlight', NS)
                    if highlight is not None and highlight.get(W + 'val') == 'yellow':
                        spans.append((offset, offset + len(runtext)))
                    offset += len(runtext)
                for n, match in enumerate(matches):
                    start = match.start()
                    end = matches[n+1].start() if n+1 < len(matches) else len(raw)
                    correct = any(raw[max(a,start):min(b,end)].strip() for a,b in spans if max(a,start) < min(b,end))
                    current['options'].append({'id': f"option-{len(current['options']) + 1}",
                        'sourceLabel': match[1], 'text': clean(raw[match.end():end]), 'images': [], 'correct': correct})
            elif text:
                if current['options']:
                    current['options'][-1]['text'] += ' ' + text
                else:
                    current['text'] += ' ' + text
        for q in questions:
            # Image-only answers appear in reading order alongside the option labels.
            if all(not o['text'] for o in q['options']):
                if len(q['images']) != len(q['options']):
                    raise ValueError(f"Image mapping requires review: {q['id']}")
                for option, image in zip(q['options'], q['images']):
                    option['images'] = [image]
                q['images'] = []
            if len(q['options']) not in (2, 3) or sum(o['correct'] for o in q['options']) != 1:
                raise ValueError(f"Answer mapping requires review: {q}")
            if q['sourceNumber'] != q['number']:
                warnings.append({'id': q['id'], 'kind': 'source-number', 'sourceNumber': q['sourceNumber'], 'displayNumber': q['number']})
    for section in sections:
        section['count'] = sum(q['sectionId'] == section['id'] for q in questions)
    bank = {'schemaVersion': 1, 'source': {'filename': Path(source).name,
        'sha256': hashlib.sha256(Path(source).read_bytes()).hexdigest(),
        'download': 'documents/Odgovoreni_prasanja_upravuvac_na_camec.docx'}, 'media': media, 'sections': sections, 'questions': questions}
    data_dir = destination / 'src' / 'data'
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / 'questions.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    doc_dir = destination / 'public' / 'documents'
    doc_dir.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, doc_dir / 'Odgovoreni_prasanja_upravuvac_na_camec.docx')
    report = {'questions': len(questions), 'sections': sections, 'imageOccurrences': media_count,
              'uniqueImages': len(list(media_dir.iterdir())), 'normalizations': warnings,
              'floatingImageParagraphsReordered': reordered_image_paragraphs,
              'answerPolicy': 'Exact yellow highlights from the supplied document. No factual corrections.'}
    (destination / 'import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k != 'normalizations'}, ensure_ascii=False))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--output', default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args()
    convert(args.source, args.output)
