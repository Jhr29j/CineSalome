import os
import sys

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "BACKEND")
sys.path.insert(0, BACKEND_DIR)

from main import app