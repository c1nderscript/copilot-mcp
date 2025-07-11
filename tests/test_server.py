import subprocess
import sys
import time
import urllib.request
import json
from pathlib import Path

SERVER_SCRIPT = str(Path(__file__).resolve().parent.parent / 'src' / 'server.py')


def start_server():
    proc = subprocess.Popen([sys.executable, SERVER_SCRIPT], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # wait briefly for server to start
    time.sleep(0.5)
    return proc


def stop_server(proc):
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        proc.kill()


def test_server_responds_to_ping():
    proc = start_server()
    try:
        with urllib.request.urlopen('http://localhost:8000/ping') as resp:
            data = json.load(resp)
        assert data.get('message') == 'pong'
    finally:
        stop_server(proc)
