#!/usr/bin/env python3
"""Local Fossil Hybrid HR source-mode simulator server."""

from __future__ import annotations

import argparse
import json
import mimetypes
import threading
import time
import webbrowser
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse


SIMULATOR_ROOT = Path(__file__).resolve().parent
WWW_ROOT = SIMULATOR_ROOT / "wwwroot"
DEFAULT_FIXTURE = SIMULATOR_ROOT / "fixtures" / "simple-menu-demo"


@dataclass(frozen=True)
class AppWorkspace:
    root: Path

    @classmethod
    def open(cls, path: str | Path) -> "AppWorkspace":
        root = Path(path).expanduser().resolve()
        if not root.is_dir():
            raise ValueError(f"App directory does not exist: {root}")

        required = [
            root / "app.js",
            root / "build" / "app.json",
            root / "build" / "files" / "layout",
        ]
        missing = [str(item) for item in required if not item.exists()]
        if missing:
            raise ValueError("App directory is incomplete:\n- " + "\n- ".join(missing))

        return cls(root=root)

    @property
    def manifest_path(self) -> Path:
        return self.root / "build" / "app.json"

    @property
    def source_path(self) -> Path:
        return self.root / "app.js"

    @property
    def layout_root(self) -> Path:
        return self.root / "build" / "files" / "layout"

    def manifest(self) -> dict[str, Any]:
        with self.manifest_path.open("r", encoding="utf-8-sig") as stream:
            value = json.load(stream)
        if not isinstance(value, dict):
            raise ValueError("build/app.json must contain a JSON object")
        return value

    def source(self) -> str:
        return self.source_path.read_text(encoding="utf-8-sig")

    def layout(self, name: str) -> str:
        safe_name = _safe_single_name(name)
        path = (self.layout_root / safe_name).resolve()
        _ensure_inside(path, self.layout_root)
        if not path.is_file():
            raise FileNotFoundError(f"Layout not found: {safe_name}")
        return path.read_text(encoding="utf-8-sig")

    def file_bytes(self, relative_path: str) -> bytes:
        decoded = unquote(relative_path).replace("\\", "/").lstrip("/")
        if not decoded or ".." in Path(decoded).parts:
            raise ValueError("Invalid app file path")
        path = (self.root / decoded).resolve()
        _ensure_inside(path, self.root)
        if not path.is_file():
            raise FileNotFoundError(decoded)
        return path.read_bytes()

    def status(self) -> dict[str, Any]:
        manifest = self.manifest()
        return {
            "loaded": True,
            "appPath": str(self.root),
            "identifier": manifest.get("identifier", ""),
            "version": manifest.get("version", ""),
            "sourceFile": str(self.source_path),
            "layoutDirectory": str(self.layout_root),
        }


def _safe_single_name(value: str) -> str:
    value = unquote(value).strip()
    if not value or value in {".", ".."}:
        raise ValueError("Missing or invalid name")
    if "/" in value or "\\" in value or Path(value).name != value:
        raise ValueError("Only a single filename is allowed")
    return value


def _ensure_inside(path: Path, root: Path) -> None:
    root = root.resolve()
    try:
        path.relative_to(root)
    except ValueError as error:
        raise ValueError("Path escapes the configured app directory") from error


class SimulatorHandler(BaseHTTPRequestHandler):
    server_version = "FossilHrSimulator/0.1"

    @property
    def workspace(self) -> AppWorkspace:
        return self.server.workspace  # type: ignore[attr-defined]

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        try:
            if parsed.path == "/api/status":
                self._send_json(self.workspace.status())
                return
            if parsed.path == "/api/app/manifest":
                self._send_json(self.workspace.manifest())
                return
            if parsed.path == "/api/app/source":
                self._send_text(
                    self.workspace.source(),
                    content_type="text/javascript; charset=utf-8",
                )
                return
            if parsed.path == "/api/app/layout":
                query = parse_qs(parsed.query)
                name = query.get("name", [""])[0]
                self._send_text(
                    self.workspace.layout(name),
                    content_type="application/json; charset=utf-8",
                )
                return
            if parsed.path == "/api/app/file":
                query = parse_qs(parsed.query)
                relative_path = query.get("path", [""])[0]
                data = self.workspace.file_bytes(relative_path)
                guessed, _ = mimetypes.guess_type(relative_path)
                self._send_bytes(data, guessed or "application/octet-stream")
                return

            self._serve_static(parsed.path)
        except FileNotFoundError as error:
            self._send_json({"error": str(error)}, status=HTTPStatus.NOT_FOUND)
        except (ValueError, json.JSONDecodeError) as error:
            self._send_json({"error": str(error)}, status=HTTPStatus.BAD_REQUEST)
        except Exception as error:  # pragma: no cover - defensive server boundary
            self._send_json(
                {"error": f"{type(error).__name__}: {error}"},
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
            )

    def _serve_static(self, request_path: str) -> None:
        relative = unquote(request_path).lstrip("/") or "index.html"
        if ".." in Path(relative).parts:
            raise ValueError("Invalid static path")

        path = (WWW_ROOT / relative).resolve()
        _ensure_inside(path, WWW_ROOT)
        if not path.is_file():
            raise FileNotFoundError(relative)

        data = path.read_bytes()
        guessed, _ = mimetypes.guess_type(path.name)
        self._send_bytes(data, guessed or "application/octet-stream")

    def _send_json(
        self,
        value: Any,
        status: HTTPStatus = HTTPStatus.OK,
    ) -> None:
        payload = json.dumps(value, ensure_ascii=False, indent=2).encode("utf-8")
        self._send_bytes(payload, "application/json; charset=utf-8", status)

    def _send_text(
        self,
        value: str,
        content_type: str,
        status: HTTPStatus = HTTPStatus.OK,
    ) -> None:
        self._send_bytes(value.encode("utf-8"), content_type, status)

    def _send_bytes(
        self,
        payload: bytes,
        content_type: str,
        status: HTTPStatus = HTTPStatus.OK,
    ) -> None:
        self.send_response(status.value)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format_string: str, *args: object) -> None:
        message = format_string % args
        print(f"[http] {self.address_string()} {message}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the Fossil Hybrid HR source-mode simulator."
    )
    parser.add_argument(
        "--app",
        default=str(DEFAULT_FIXTURE),
        help="Path to an SDK-style app directory containing app.js and build/app.json.",
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5178)
    parser.add_argument("--no-browser", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    workspace = AppWorkspace.open(args.app)

    httpd = ThreadingHTTPServer((args.host, args.port), SimulatorHandler)
    httpd.workspace = workspace  # type: ignore[attr-defined]

    url = f"http://{args.host}:{args.port}/"
    status = workspace.status()

    print("Fossil Hybrid HR PC simulator")
    print(f"App:        {status['identifier']} ({status['appPath']})")
    print(f"Simulator:  {url}")
    print("Press Ctrl+C to stop.")

    if not args.no_browser:
        threading.Thread(
            target=lambda: (time.sleep(0.35), webbrowser.open(url)),
            daemon=True,
        ).start()

    try:
        httpd.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print("\nStopping simulator...")
    finally:
        httpd.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
