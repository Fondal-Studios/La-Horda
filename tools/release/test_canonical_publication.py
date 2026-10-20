import importlib.util
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

spec = importlib.util.spec_from_file_location('publication', Path(__file__).with_name('check-canonical-publication.py'))
publication = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publication)


class PublicationTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root/'code.js').write_bytes(b'const live = true;\n')
        self.body = b'const live = true;\n'
        self.status = 200
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                owner.assertEqual(self.headers.get('Accept-Encoding'), 'identity')
                self.send_response(owner.status)
                self.end_headers()
                self.wfile.write(owner.body)

            def log_message(self, *_):
                pass

        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = 'http://127.0.0.1:' + str(self.server.server_port) + '/jugar/'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.tmp.cleanup()

    def run_check(self):
        return publication.check(self.url, self.root, ['code.js'])

    def test_exact_served_bytes(self):
        report = self.run_check()
        self.assertEqual(report['status'], 'CHECKED_FILES_MATCH')
        self.assertEqual(report['checks'][0]['status'], 'MATCH')

    def test_old_bytes_are_not_published_candidate(self):
        self.body = b'const live = false;\n'
        report = self.run_check()
        self.assertEqual(report['status'], 'NOT_CONFIRMED')
        self.assertEqual(report['checks'][0]['status'], 'DIFFERENT')

    def test_html_fallback_does_not_pass(self):
        self.body = b'<html>Not found</html>'
        self.assertEqual(self.run_check()['checks'][0]['status'], 'DIFFERENT')

    def test_404_is_missing(self):
        self.status = 404
        self.assertEqual(self.run_check()['checks'][0]['status'], 'MISSING')

    def test_http_failure_is_not_missing_or_match(self):
        self.status = 503
        self.assertEqual(self.run_check()['checks'][0]['status'], 'HTTP_ERROR')

    def test_missing_candidate_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'candidate'):
            publication.check(self.url, self.root, ['absent.png'])

    def test_candidate_cannot_escape_build_root(self):
        with self.assertRaisesRegex(ValueError, 'candidate'):
            publication.check(self.url, self.root, ['../other.js'])

    def test_remote_plain_http_or_credentials_are_rejected(self):
        for url in ['http://example.com/', 'https://user:secret@example.com/', 'https://example.com/?token=x']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                publication.check(url, self.root, ['code.js'])


if __name__ == '__main__':
    unittest.main()
