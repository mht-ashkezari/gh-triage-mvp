# apps/mlops/samplers/build_sample.py
from pathlib import Path
import argparse
import json
from collections import defaultdict, Counter

# Try fast JSON if available
try:
    import orjson as _orjson  # type: ignore
except Exception:
    _orjson = None

try:
    import yaml  # PyYAML
except Exception as e:
    raise SystemExit("PyYAML is required (pip install pyyaml)") from e


def json_loads(b: bytes):
    if _orjson:
        return _orjson.loads(b)
    return json.loads(b.decode("utf-8"))


def json_dumps(obj) -> bytes:
    if _orjson:
        return _orjson.dumps(obj) + b"\n"
    return (json.dumps(obj, ensure_ascii=False) + "\n").encode("utf-8")


def read_jsonl(path: Path):
    with path.open("rb") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                yield json_loads(line)
            except Exception:
                # tolerate concatenated objects …}{…}{… by splitting
                for part in line.replace(b'}{', b'}\n{').splitlines():
                    if part.strip():
                        yield json_loads(part)


# /repo/apps/mlops/samplers/build_sample.py → repo root is parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_BASE = REPO_ROOT / "datasets" / "snapshots"
DEFAULT_MANIFEST = DEFAULT_BASE / "manifest.yaml"


def label_names(row) -> list[str]:
    names = []
    for l in (row.get("labels") or []):
        if isinstance(l, dict):
            name = l.get("name")
        else:
            name = str(l)
        if name:
            names.append(name)
    return names or ["_none_"]  # treat unlabeled issues as a class


def build_balanced_rows(labels_map: dict[str, list[dict]], n_per: int) -> list[dict]:
    """Round-robin select up to n_per per label, without duplicating the same issue id across labels."""
    out_rows: list[dict] = []
    seen_ids: set[int | str] = set()
    per_label_added = Counter()

    order = sorted(labels_map.keys(), key=lambda k: len(labels_map[k]))
    idx = {k: 0 for k in order}

    progressed = True
    while progressed:
        progressed = False
        for lbl in order:
            if per_label_added[lbl] >= n_per:
                continue
            rows = labels_map[lbl]
            i = idx[lbl]
            while i < len(rows) and rows[i].get("id") in seen_ids:
                i += 1
            if i < len(rows):
                row = rows[i]
                out_rows.append(row)
                seen_ids.add(row.get("id"))
                per_label_added[lbl] += 1
                idx[lbl] = i + 1
                progressed = True
    return out_rows


def _repo_slug_from_entry(r: dict) -> str | None:
    """
    Resolve 'owner__name' from either shape:
      new: { repo: { owner, name }, ... }
      old: { owner, name, ... }
    Also tolerates a few alternates: { org }, { repo_owner }, { repo_name }, { slug }
    """
    if not isinstance(r, dict):
        return None

    repo = r.get("repo")
    if isinstance(repo, dict) and "owner" in repo and "name" in repo:
        return f'{repo["owner"]}__{repo["name"]}'

    owner = r.get("owner") or r.get("org") or r.get("repo_owner")
    name = r.get("name") or r.get("repo_name")
    if owner and name:
        return f"{owner}__{name}"

    slug = r.get("slug") or r.get("repo_slug") or r.get("id")
    if slug and isinstance(slug, str):
        return slug.replace("/", "__")

    return None


def _target_label_min(repo_cfg: dict, manifest: dict, default: int = 20) -> int:
    # prefer repo-level knob first; accept either field name
    v = repo_cfg.get("target_label_min") or repo_cfg.get("labels_target_per_class")
    if v is None:
        # optional project-wide default
        v = manifest.get("target_label_min") or manifest.get("labels_target_per_class")
    try:
        return int(v)
    except Exception:
        return default


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="owner__name (e.g., microsoft__vscode)")
    ap.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    ap.add_argument("--base", default=str(DEFAULT_BASE))
    args = ap.parse_args()

    base = Path(args.base) / args.repo
    sample_dir = base / "sample"
    meta_dir = base / "meta"
    sample_in = sample_dir / "issues.sample.jsonl"
    sample_out = sample_dir / "issues.sample.balanced.jsonl"

    if not sample_in.exists():
        raise SystemExit(f"Input sample not found: {sample_in}")

    # Build per-label buckets from the (unbalanced) sample
    labels_map: dict[str, list[dict]] = defaultdict(list)
    for row in read_jsonl(sample_in):
        for name in label_names(row):
            labels_map[name].append(row)

    # Manifest: resolve repo entry and the balancing knob robustly
    man = yaml.safe_load(Path(args.manifest).read_text(encoding="utf-8")) or {}
    repos = man.get("repos") or []
    repo_cfg = next((r for r in repos if _repo_slug_from_entry(r) == args.repo), None)
    if not repo_cfg:
        available = [s for s in (_repo_slug_from_entry(r) for r in repos) if s]
        raise SystemExit(
            f"Repo '{args.repo}' not found in manifest {args.manifest}.\n"
            f"Available slugs: {', '.join(available) if available else '(none)'}"
        )

    n_per = _target_label_min(repo_cfg, man, default=20)

    # Build balanced set and write JSONL
    out_rows = build_balanced_rows(labels_map, n_per)
    sample_dir.mkdir(parents=True, exist_ok=True)
    with sample_out.open("wb") as f:
        for r in out_rows:
            f.write(json_dumps(r))

    # Stats for acceptance
    lbls: list[str] = []
    for r in out_rows:
        labels = r.get("labels") or []
        names = [(l.get("name") if isinstance(l, dict) else str(l)) for l in labels if (l.get("name") if isinstance(l,dict) else str(l))]
        if not names:
            names = ["_none_"]
        lbls.extend(names)
    counts = Counter(lbls)

    meta_dir.mkdir(parents=True, exist_ok=True)
    stats = {
        "repo": args.repo.replace("__", "/"),
        "target_label_min": n_per,
        "labels_available": len(labels_map),
        "per_label_counts": dict(counts),
        "sample_size": len(out_rows),
        "input_sample": str(sample_in.relative_to(REPO_ROOT)),
        "output_sample": str(sample_out.relative_to(REPO_ROOT)),
    }
    (meta_dir / "stats.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")

    print(
        f"[ok] balanced sample → {sample_out} "
        f"(rows={len(out_rows)}, labels={len(labels_map)}, n_per={n_per})"
    )


if __name__ == "__main__":
    main()
