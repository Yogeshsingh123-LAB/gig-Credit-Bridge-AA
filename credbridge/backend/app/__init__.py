"""
CredBridge Backend Package Initialization
Ensures both backend and intelligence monorepo paths are present in sys.path.
"""

import sys
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent.parent)
credbridge_dir = str(Path(__file__).resolve().parent.parent.parent)

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if credbridge_dir not in sys.path:
    sys.path.insert(0, credbridge_dir)
