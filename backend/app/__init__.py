"""
CredBridge Backend Package Initialization
"""

import sys
from pathlib import Path

# Add backend directory to sys.path to resolve 'app' imports seamlessly
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
