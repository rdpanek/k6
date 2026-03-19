# k6-load-preview

**Load profile visualizer for k6 scripts.**

Reads the script configuration via `k6 inspect` and renders the load profile
as an ASCII chart in the terminal, or as an interactive HTML / static SVG file.

No external dependencies — Go standard library and `k6` in PATH only.

---

## Requirements

- **Go** 1.18+ — see installation instructions below
- **k6** available in `PATH` — see installation instructions below

---

## Installation

### Go

#### macOS

**Option A — Homebrew (recommended):**
```bash
brew install go
```

**Option B — official installer:**
1. Download the `.pkg` installer from [go.dev/dl](https://go.dev/dl/)
2. Run the installer — Go is added to `/usr/local/go/bin` automatically
3. Verify:
```bash
go version
```

#### Windows

**Option A — winget:**
```powershell
winget install GoLang.Go
```

**Option B — official installer:**
1. Download the `.msi` installer from [go.dev/dl](https://go.dev/dl/)
2. Run the installer — Go is added to `C:\Program Files\Go\bin` and `PATH` is updated automatically
3. Restart your terminal, then verify:
```powershell
go version
```

**Option C — Chocolatey:**
```powershell
choco install golang
```

#### Linux

**Option A — package manager:**
```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y golang-go

# Fedora / RHEL
sudo dnf install -y golang

# Arch
sudo pacman -S go
```

> **Note:** Distro packages may lag behind upstream. For the latest version use Option B.

**Option B — official tarball (latest version):**
```bash
# Download (replace 1.22.4 with the current version from go.dev/dl)
curl -LO https://go.dev/dl/go1.22.4.linux-amd64.tar.gz

# Remove any previous installation and extract
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz

# Add to PATH (add this line to ~/.bashrc or ~/.zshrc)
export PATH=$PATH:/usr/local/go/bin

# Apply to current shell
source ~/.bashrc   # or source ~/.zshrc

# Verify
go version
```

---

### k6

#### macOS

```bash
brew install k6
```

#### Windows

```powershell
winget install k6 --source winget
```

Or with Chocolatey:
```powershell
choco install k6
```

#### Linux

```bash
# Debian / Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install -y k6

# Fedora / RHEL / CentOS
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6

# Arch (AUR)
yay -S k6
```

#### Docker (any platform)

```bash
docker run --rm -i grafana/k6 version
```

---

## Verify installation

```bash
go version    # e.g. go version go1.22.4 darwin/arm64
k6 version    # e.g. k6 v0.51.0 (go1.22.4, darwin/arm64)
```

---

## Docker

If you don't want to install Go, you can use the pre-built Docker image.
It contains both `k6` and the `k6-load-preview` binary.

### Pull from GitHub Container Registry

```bash
docker pull ghcr.io/rdpanek/k6:load-preview.latest
```

### Build locally

```bash
# Run from the root of this repository
docker build -f tools/Dockerfile -t k6-preview .
```

> The `Dockerfile` uses a two-stage build:
> - **Stage 1** (`golang:1.22-alpine`) — compiles `k6-load-preview` binary
> - **Stage 2** (`grafana/k6:latest`) — adds the binary on top of the official k6 image

### Run with Docker

Mount the repository root as `/work` so the container can read your scripts
and write output files back to the host.

**Terminal ASCII chart only:**
```bash
docker run --rm -v $(pwd):/work ghcr.io/rdpanek/k6:load-preview.latest \
  demos/executors/09-workload-model.js
```

**Generate interactive HTML chart:**
```bash
docker run --rm -v $(pwd):/work ghcr.io/rdpanek/k6:load-preview.latest \
  demos/executors/09-workload-model.js -o chart.html
```

The file `chart.html` is written to your current directory (mounted as `/work`).

**Generate static SVG chart:**
```bash
docker run --rm -v $(pwd):/work ghcr.io/rdpanek/k6:load-preview.latest \
  demos/executors/11-kafka-8h-soak.js -o kafka-profile.svg
```

**Windows (PowerShell) — use `${PWD}` instead of `$(pwd)`:**
```powershell
docker run --rm -v ${PWD}:/work ghcr.io/rdpanek/k6:load-preview.latest `
  demos/executors/09-workload-model.js -o chart.html
```

**Show help:**
```bash
docker run --rm ghcr.io/rdpanek/k6:load-preview.latest
```

### Available image tags

| Tag | Description |
|-----|-------------|
| `load-preview.latest` | Latest build of k6-preview |
| `<version>.load-preview` | Specific versioned build (e.g. `1.2.3.load-preview`) |
| `latest` | Standard k6 image (no k6-preview) |
| `kafka.latest` | k6 with Kafka extension |

All images are published to:
**`ghcr.io/rdpanek/k6`** — https://github.com/users/rdpanek/packages/container/package/k6

### GitHub Actions — automatic build

The workflow `.github/workflows/build-k6-preview.yml` automatically builds
and publishes a new image to `ghcr.io/rdpanek/k6:load-preview.latest` on every
push to `master` that changes any of:

- `tools/k6-load-preview.go`
- `tools/Dockerfile`
- `.github/workflows/build-k6-preview.yml`

Required GitHub secret: **`GHCR_PAT`** — a Personal Access Token with
`write:packages` scope (same secret used by other build workflows).

---

## Usage

```
go run tools/k6-load-preview.go <script.js> [options]
```

| Option | Description |
|--------|-------------|
| `-o <file.html>` | Generate an **interactive HTML chart** (recommended). Open in any browser. |
| `-o <file.svg>` | Generate a **static SVG line chart**. Open in browser or Inkscape. |
| _(no flag)_ | ASCII chart in terminal only. |

Run without arguments to display this help in the terminal.

---

## Examples

### Terminal — ASCII chart

```bash
go run tools/k6-load-preview.go demos/executors/09-workload-model.js
```

### Interactive HTML chart

```bash
go run tools/k6-load-preview.go demos/executors/09-workload-model.js -o chart.html
```

Open `chart.html` in any browser. No server required.

### Static SVG chart

```bash
go run tools/k6-load-preview.go demos/executors/09-workload-model.js -o chart.svg
```

### Build binary, then run

```bash
go build -o k6-load-preview tools/k6-load-preview.go
./k6-load-preview demos/executors/11-kafka-8h-soak.js -o kafka-profile.html
./k6-load-preview demos/executors/11-kafka-8h-soak.js -o kafka-profile.svg
```

### SVG → PDF

1. Open `chart.svg` in **Google Chrome** or **Firefox**
2. `Ctrl+P` → **Save as PDF** → Landscape orientation
3. Or: **Inkscape** → File → Export as PDF

---

## Output modes

### 1. Terminal (ASCII chart)

Stacked bar chart rendered directly in the terminal using Unicode block characters.

```
      ╔════════════════════ K6 Load Profile Preview ════════════════════╗

 500 │                                 ████████████████
     │               ████████████████████████████████████████
     │   ██████████████████████████████████████████████████████████████
   0 └──────────────────────────────────────────────────────────────────┘
       0s          10m        20m        30m        40m        50m    1h0m

  Legend:
  ██  health_monitor    constant-vus           max 2 VUs
  ██  document_indexer  constant-arrival-rate  max 5 RPS
  ██  search_load       ramping-arrival-rate   max 10 RPS
```

**Symbols:**

| Symbol | Meaning |
|--------|---------|
| `█` | Active load — VUs or RPS at that point in time |
| `▒` | Graceful ramp-down phase — executor waits for in-flight iterations to finish |
| `·` | Scenario not yet started (waiting for `startTime`) |

**Y axis:** Normalized 0–100% of the stacked sum of all scenarios.
Absolute values (VUs or RPS) are listed in the scenario table below the chart.

**X axis:** Time from 0 to total test duration.

**Scenario table columns:**

| Column | Description |
|--------|-------------|
| `Start` | Scenario start time (`startTime`) |
| `End` | Finish time including graceful ramp-down |
| `Max` | Peak value (VUs or RPS) |

> **Mixed scenarios (VUs + RPS):** When a test combines `constant-vus` and
> `constant-arrival-rate`, the Y axis is labeled `VUs/RPS` — values are
> normalized to the maximum; absolute numbers are in the table.

---

### 2. Interactive HTML chart

Self-contained single-file HTML page with a **Canvas 2D** chart.
Open in any browser — no internet connection or server required.

#### Interaction

| Action | Effect |
|--------|--------|
| Move mouse anywhere in the chart | Vertical crosshair appears. Colored dots and labels show the name and current value of every active scenario at that time. Labels are automatically repositioned to avoid overlap. |
| Move mouse close to a specific line (≤ 14 px) | All other lines fade to 10% opacity. The hovered line is bolded. A label shows its name and exact value at that X position. |
| Move mouse out of chart | All lines return to full opacity. |

The legend below the chart shows each scenario's color and line style (solid / dashed / dotted / dash-dot).

**Color + line style assignment:**
- 20 distinct colors cycle through scenarios
- When all colors are used, the next cycle uses a different line style (dashed, then dotted, then dash-dot)
- Supports up to 80 visually unique scenario identities

---

### 3. Static SVG chart

High-resolution SVG file (1600 px wide, dynamic height).
Each scenario is rendered as a separate colored+styled line — values are **not stacked**, so the exact profile of each scenario is clearly visible.

Best for: sharing, embedding in reports, printing as PDF.

---

## Supported executors

| Executor | Chart appearance |
|----------|-----------------|
| `constant-vus` | Flat horizontal line at the configured VU count |
| `ramping-vus` | Rising/falling line following `stages`; graceful ramp-down shown as a dashed tail |
| `constant-arrival-rate` | Flat horizontal line at the computed RPS |
| `ramping-arrival-rate` | Rising/falling RPS line following `stages` |
| `shared-iterations` | Flat line for `maxDuration` |
| `per-vu-iterations` | Flat line for `maxDuration` |
| `externally-controlled` | Flat line showing `maxVUs` as the capacity ceiling |

> **Open Model vs Closed Model:**
> `constant-arrival-rate` and `ramping-arrival-rate` are Open Model executors —
> they fire iterations at a fixed rate regardless of response time, avoiding
> Coordinated Omission. VU-based executors are Closed Model — each VU waits
> for the previous iteration to finish before starting the next.

---

## How it works internally

1. Runs `k6 inspect <script.js>` to get the parsed scenario configuration as JSON.
2. Builds a piecewise-linear load profile for each scenario (keyframe points over time).
3. Renders the profile as a stacked ASCII chart, or exports it as HTML/SVG.

No k6 test is actually executed — `k6 inspect` only parses the script configuration.

---

## Author

**Radim Daniel Pánek** — [rdpanek@canarytrace.com](mailto:rdpanek@canarytrace.com)
[k6.canarytrace.com](https://k6.canarytrace.com)
