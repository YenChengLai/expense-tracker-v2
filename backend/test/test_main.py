import sys
from pathlib import Path
from fastapi.testclient import TestClient

# More robust path handling
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}