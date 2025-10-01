from pathlib import Path
import argparse, orjson, pandas as pd, yaml
from collections import defaultdict

def read_jsonl(path: Path):
    with path.open("rb") as f:
        for line in f:
            if line.strip():
                yield orjson.loads(line)

# Resolve repo root based on this file location: /repo/apps/mlops/samplers/build_sample.py
REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_BASE = REPO_ROOT / "datasets" / "snapshots"
DEFAULT_MANIFEST = DEFAULT_BASE / "manifest.yaml"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="owner__name (e.g., microsoft__vscode)")
    ap.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    ap.add_argument("--base", default=str(DEFAULT_BASE))
    args = ap.parse_args()

    base = Path(args.base) / args.repo
    sample_in = base / "sample" / "issues.sample.jsonl"
    # ... keep the rest of your code the same, but use Path objects:
    labels = defaultdict(list)
    for row in read_jsonl(sample_in):
        names = [l["name"] for l in row.get("labels", [])] or ["_none_"]
        for name in names:
            labels[name].append(row)

    man = yaml.safe_load(Path(args.manifest).read_text())
    repo_cfg = next(r for r in man["repos"] if f'{r["owner"]}__{r["name"]}' == args.repo)
    n_per = int(repo_cfg.get("labels_target_per_class", 20))

    out_rows = []
    for name, rows in labels.items():
        out_rows += rows[:n_per]

    out_path = base / "sample" / "issues.sample.balanced.jsonl"
    with out_path.open("wb") as f:
        for r in out_rows:
            f.write(orjson.dumps(r)); f.write(b"\n")

    print(f"[ok] wrote {len(out_rows)} rows → {out_path}")

if __name__ == "__main__":
    main()
