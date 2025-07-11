from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/ping':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'pong'}).encode())
        else:
            self.send_response(404)
            self.end_headers()


def run(port: int = 8000):
    server = HTTPServer(('localhost', port), Handler)
    print('Server running on port', port, flush=True)
    server.serve_forever()


if __name__ == '__main__':
    run()
