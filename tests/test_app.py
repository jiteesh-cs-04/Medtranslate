import io, os
import pytest
from app import create_app


@pytest.fixture()
def client():
    return create_app().test_client()


def test_public_pages_load(client):
    for path in ("/", "/login", "/dashboard"):
        assert client.get(path).status_code == 200


def test_buttons_go_to_different_places(client):
    html = client.get("/").get_data(as_text=True)
    assert 'nav__signin" href="/login"' in html
    assert 'nav__cta" href="/dashboard"' in html
    assert 'href="/dashboard">Get Started' in html


def test_login_is_demo_only(client):
    html = client.get("/login").get_data(as_text=True)
    assert "sign-in isn&#39;t connected" in html or "sign-in isn't connected" in html
    assert 'href="/dashboard"' in html and 'href="/"' in html
    assert "<form" not in html and "disabled" in html
    assert client.post("/api/login", json={}).status_code in (404, 405)


def test_dashboard_logo_goes_home(client):
    assert 'class="brand brand--dark" href="/"' in client.get("/dashboard").get_data(as_text=True)


def test_analyze_uses_ai_pipeline_and_reports_missing_configuration(client, monkeypatch):
    from PIL import Image
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    buf = io.BytesIO(); Image.new("RGB", (20, 20), "white").save(buf, "PNG"); buf.seek(0)
    r = client.post("/api/analyze", data={"file": (buf, "lab.png"), "language": "English"}, content_type="multipart/form-data")
    assert r.status_code == 200
    body = r.get_json()
    assert {"document_type", "summary", "medicines", "tests", "questions_for_doctor", "disclaimer", "stage", "error", "demo"} <= set(body)
    assert body["demo"] is False
    assert body["error"]
    assert body["document_type"] == "unknown"


def test_health_reports_ai_configuration(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-returned")
    body = client.get("/api/health").get_json()
    assert body["ai_configured"] is True
    assert "test-key-not-returned" not in str(body)


def test_analyze_rejects_bad_type(client):
    r = client.post("/api/analyze", data={"file": (io.BytesIO(b"x"), "a.txt")}, content_type="multipart/form-data")
    assert r.status_code == 400
