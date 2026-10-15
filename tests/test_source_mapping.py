"""Protect source answer/image mapping while permitting editorial JSON changes."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANK = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))


class SourceAuditTests(unittest.TestCase):
    def audit(self, bank, *flags):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'questions.json'
            path.write_text(json.dumps(bank), encoding='utf-8')
            return subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / 'scripts/verify_source_mapping.py'),
                                   '--bank', str(path), *flags], capture_output=True, text=True, encoding='utf-8')

    def test_text_edits_pass_but_strict_import_audit_rejects_them(self):
        bank = copy.deepcopy(BANK)
        bank['questions'][0]['text'] += ' Editorial correction.'
        result = self.audit(bank)
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['answerHighlights'], 935)
        self.assertGreater(report['editedTextFields'], 0)
        strict = self.audit(bank, '--strict-text')
        self.assertNotEqual(strict.returncode, 0)
        self.assertIn('source-text', strict.stderr)

    def test_changed_answer_key_is_rejected(self):
        bank = copy.deepcopy(BANK)
        options = bank['questions'][0]['options']
        options[0]['correct'], options[1]['correct'] = False, True
        result = self.audit(bank)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('highlight', result.stderr)

    def test_changed_image_order_is_rejected(self):
        bank = copy.deepcopy(BANK)
        q = next(q for q in bank['questions'] if q['id'] == 'section-2-q39')
        q['options'][0]['images'], q['options'][1]['images'] = q['options'][1]['images'], q['options'][0]['images']
        result = self.audit(bank)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('image-order', result.stderr)

    def test_import_recovers_the_joined_third_option_and_passes_strict_audit(self):
        with tempfile.TemporaryDirectory() as directory:
            source = ROOT / 'public' / BANK['source']['download']
            imported = subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / 'scripts/import_document.py'),
                                       str(source), '--output', directory], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(imported.returncode, 0, imported.stderr)
            bank = json.loads((Path(directory) / 'src/data/questions.json').read_text(encoding='utf-8'))
            q = next(q for q in bank['questions'] if q['id'] == 'section-1-q56')
            self.assertEqual([o['text'] for o in q['options'][1:]],
                             ['информации за пловни патишта', 'податоци за внатрешната пловидба'])
            self.assertEqual([o['correct'] for o in q['options']], [True, False, False])
            result = self.audit(bank, '--strict-text')
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()
