---
title: "Migrating to uv: A Step Change in Python Package Management"
description: Replace pip and venv with fast, integrated Python tooling
pubDatetime: 2026-02-12T00:00:00Z
modDatetime: 2026-02-12T00:00:00Z
draft: false
tags:
  - uv
  - python
  - pip
  - package-management
  - development
lang: en
---

**uv** (by Astral) is an extremely fast Python package manager—often 10–100× faster than pip—and replaces pip, venv, poetry/pip-tools, and pyenv in one tool while staying pip-compatible.

## Install

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

macOS: `brew install uv`. Windows: `scoop install uv`.

## Basic usage

- Create venv: `uv venv`
- Install deps: `uv pip install -r requirements.txt` or `uv sync` with `pyproject.toml`
- Run: `uv run script.py`

For migration from existing projects and lockfiles, see the [Chinese version](2026-02-12-migrate-to-uv) of this post.
