"""Mantiene el grafo de graphify al día mientras Claude Code trabaja.

Graphify reconstruye el código solo (análisis sintáctico, sin IA), pero los
documentos (.md, .pdf, imágenes) necesitan una reextracción con el skill
`/graphify . --update`. Este hook cubre las dos cosas:

  post  (PostToolUse en Edit/Write): anota qué archivo cambió.
  stop  (Stop): al terminar el turno, corre `graphify update .` si cambió
        código y, si cambiaron documentos, le pide a Claude una sola vez que
        actualice el grafo antes de cerrar.

Se desactiva con la variable de entorno GRAPHIFY_AUTO_SYNC=0.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

# Extensiones que graphify trata como documentos (requieren reextracción con IA).
DOC_EXTENSIONS = {
    ".md", ".mdx", ".qmd", ".txt", ".rst", ".html",
    ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
    ".docx", ".xlsx",
}
# Carpetas y archivos que no forman parte del grafo.
IGNORED_PREFIXES = ("graphify-out/", ".claude/", ".git/", "node_modules/", "dist/", ".supabase/")
IGNORED_FILES = {"CLAUDE.md"}


def project_dir(data: dict) -> Path:
    return Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ".").resolve()


def pending_path(root: Path) -> Path:
    return root / ".claude" / ".graphify-pending.json"


def load_pending(root: Path) -> dict:
    try:
        return json.loads(pending_path(root).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"code": [], "docs": []}


def save_pending(root: Path, pending: dict) -> None:
    path = pending_path(root)
    if not pending["code"] and not pending["docs"]:
        path.unlink(missing_ok=True)
        return
    path.write_text(json.dumps(pending, ensure_ascii=False, indent=2), encoding="utf-8")


def on_post(data: dict) -> int:
    root = project_dir(data)
    raw = (data.get("tool_input") or {}).get("file_path") or (data.get("tool_input") or {}).get("notebook_path")
    if not raw:
        return 0
    try:
        rel = Path(raw).resolve().relative_to(root).as_posix()
    except ValueError:
        return 0  # fuera del proyecto
    if rel in IGNORED_FILES or rel.startswith(IGNORED_PREFIXES) or Path(rel).name.startswith("."):
        return 0  # .gitignore, .env.example y similares no aportan al grafo
    kind = "docs" if Path(rel).suffix.lower() in DOC_EXTENSIONS else "code"
    pending = load_pending(root)
    if rel not in pending[kind]:
        pending[kind].append(rel)
        save_pending(root, pending)
    return 0


def on_stop(data: dict) -> int:
    root = project_dir(data)
    pending = load_pending(root)

    if pending["code"]:
        try:
            subprocess.run(["graphify", "update", "."], cwd=root, timeout=300,
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        except (OSError, subprocess.SubprocessError) as exc:
            print(f"[graphify-sync] no se pudo correr 'graphify update .': {exc}", file=sys.stderr)
        pending["code"] = []

    # Si el grafo ya se actualizó en este turno (es más nuevo que el documento), no hace falta pedirlo.
    graph = root / "graphify-out" / "graph.json"
    graph_mtime = graph.stat().st_mtime if graph.exists() else 0.0
    docs = [d for d in pending["docs"] if (root / d).exists() and (root / d).stat().st_mtime > graph_mtime]
    pending["docs"] = docs
    # stop_hook_active: Claude ya está continuando por este hook; no se vuelve a bloquear.
    if docs and not data.get("stop_hook_active"):
        pending["docs"] = []
        save_pending(root, pending)
        lista = ", ".join(docs[:10]) + (" …" if len(docs) > 10 else "")
        print(
            "[graphify-sync] Cambiaron documentos del proyecto desde la última actualización "
            f"del grafo: {lista}. Antes de cerrar, actualiza el grafo con el skill graphify "
            "en modo incremental (`/graphify . --update`, solo reextrae lo que cambió) y "
            "regenera la bóveda de Obsidian. Si el cambio merece entrada en docs/bitacora.md, agrégala primero.",
            file=sys.stderr,
        )
        return 2  # el texto de stderr le llega a Claude y sigue trabajando

    save_pending(root, pending)
    return 0


def main() -> int:
    # En Windows la salida por defecto no es UTF-8 y los acentos llegarían rotos.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    if os.environ.get("GRAPHIFY_AUTO_SYNC", "1").strip().lower() in ("0", "false", "no"):
        return 0
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8") or "{}")
    except ValueError:
        data = {}
    if mode == "post":
        return on_post(data)
    if mode == "stop":
        return on_stop(data)
    return 0


if __name__ == "__main__":
    sys.exit(main())
