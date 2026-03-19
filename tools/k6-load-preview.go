// k6-preview — load profile visualizer for k6 scripts
//
// Usage:
//
//	go run tools/k6-load-preview.go <script.js>
//	go run tools/k6-load-preview.go <script.js> -o chart.svg
//
// Run without arguments for full help:
//
//	go run tools/k6-load-preview.go
//
// Requires: k6 in PATH (for `k6 inspect`)
// Dependencies: Go stdlib only

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// ── ANSI ─────────────────────────────────────────────────────────────────────

const (
	reset = "\x1b[0m"
	bold  = "\x1b[1m"
	dim   = "\x1b[2m"
)

var palette = []string{
	"\x1b[34m", // blue
	"\x1b[32m", // green
	"\x1b[33m", // yellow
	"\x1b[35m", // magenta
	"\x1b[36m", // cyan
	"\x1b[31m", // red
	"\x1b[94m", // bright blue
	"\x1b[92m", // bright green
	"\x1b[93m", // bright yellow
	"\x1b[96m", // bright cyan
}

func col(idx int) string { return palette[idx%len(palette)] }

// ── SVG Export ────────────────────────────────────────────────────────────────

const (
	svgW  = 1600
	svgH  = 960
	svgL  = 90  // left margin — Y axis labels
	svgR  = 40  // right margin
	svgT  = 65  // top margin — title
	svgB  = 165 // bottom margin — X axis + legend
	svgCW = svgW - svgL - svgR // chart area width
	svgCH = svgH - svgT - svgB // chart area height
)

// svgStyle holds a stroke color and a dash pattern for SVG lines.
// dashArray "" = solid, otherwise passed to stroke-dasharray.
type svgStyle struct {
	color    string
	dash     string // "" solid | "8,5" dashed | "3,5" dotted | "10,4,3,4" dash-dot
	dashDesc string // human-readable for legend
}

// 20 saturated colors × 4 line styles = 80 unique visual identities.
// Color cycles through the palette; style advances every 20 scenarios.
var svgColors = []string{
	"#1d4ed8", // blue
	"#dc2626", // red
	"#15803d", // green
	"#b45309", // amber
	"#7c3aed", // purple
	"#0f766e", // teal
	"#be123c", // rose
	"#0369a1", // sky
	"#92400e", // brown
	"#065f46", // dark green
	"#6d28d9", // violet
	"#b91c1c", // dark red
	"#0e7490", // cyan
	"#d97706", // orange
	"#4338ca", // indigo
	"#166534", // forest
	"#9d174d", // pink
	"#1e40af", // dark blue
	"#047857", // emerald
	"#7e22ce", // deep purple
}

// lineDashes cycles after every full color palette rotation.
var lineDashes = []struct{ dash, desc string }{
	{"", "solid"},
	{"10,5", "dashed"},
	{"3,5", "dotted"},
	{"12,4,3,4", "dash-dot"},
}

func svgStyleFor(idx int) svgStyle {
	n := len(svgColors)
	color := svgColors[idx%n]
	d := lineDashes[(idx/n)%len(lineDashes)]
	return svgStyle{color: color, dash: d.dash, dashDesc: d.desc}
}

// ── Duration parsing ("1m30s", "30s", "1m0s", "1h0m0s", null) ───────────────

var componentRe = regexp.MustCompile(`(\d+(?:\.\d+)?)(h|ms|m|s|µs|us|ns)`)

func parseDur(s string) float64 {
	if s == "" || s == "null" {
		return 0
	}
	total := 0.0
	for _, m := range componentRe.FindAllStringSubmatch(s, -1) {
		val, _ := strconv.ParseFloat(m[1], 64)
		switch m[2] {
		case "h":
			total += val * 3600
		case "m":
			total += val * 60
		case "s":
			total += val
		case "ms":
			total += val / 1000
		}
	}
	return total
}

func fmtDur(s float64) string {
	if s <= 0 {
		return "0s"
	}
	h := int(s) / 3600
	m := (int(s) % 3600) / 60
	sec := int(math.Round(s)) % 60
	var b strings.Builder
	if h > 0 {
		fmt.Fprintf(&b, "%dh", h)
	}
	if m > 0 {
		fmt.Fprintf(&b, "%dm", m)
	}
	if sec > 0 || b.Len() == 0 {
		fmt.Fprintf(&b, "%ds", sec)
	}
	return b.String()
}

// ── k6 inspect JSON structures ───────────────────────────────────────────────

type Stage struct {
	Duration string  `json:"duration"`
	Target   float64 `json:"target"`
}

type Scenario struct {
	Executor         string            `json:"executor"`
	StartTime        *string           `json:"startTime"`
	GracefulStop     *string           `json:"gracefulStop"`
	GracefulRampDown *string           `json:"gracefulRampDown"`
	VUs              float64           `json:"vus"`
	StartVUs         float64           `json:"startVUs"`
	Duration         *string           `json:"duration"`
	MaxDuration      *string           `json:"maxDuration"`
	Iterations       float64           `json:"iterations"`
	Stages           []Stage           `json:"stages"`
	Rate             float64           `json:"rate"`
	TimeUnit         *string           `json:"timeUnit"`
	PreAllocatedVUs  float64           `json:"preAllocatedVUs"`
	MaxVUs           float64           `json:"maxVUs"`
	StartRate        float64           `json:"startRate"`
	Exec             *string           `json:"exec"`
	Tags             map[string]string `json:"tags"`
}

type InspectOutput struct {
	Scenarios    map[string]Scenario `json:"scenarios"`
	VUs          float64             `json:"vus"`
	Duration     *string             `json:"duration"`
	Stages       []Stage             `json:"stages"`
	GracefulStop *string             `json:"gracefulStop"`
}

// ── Executor profile ──────────────────────────────────────────────────────────

type point struct{ t, v float64 }

type Profile struct {
	startTime     float64
	endTime       float64
	gracefulStart float64 // -1 = no graceful phase
	maxVal        float64
	pType         string // "VUs" or "RPS"
	pts           []point
	executor      string
}

func (p *Profile) get(t float64) float64 {
	if t < p.startTime || t > p.endTime {
		return 0
	}
	if len(p.pts) == 0 {
		return p.maxVal
	}
	for i := 1; i < len(p.pts); i++ {
		if t <= p.pts[i].t {
			dt := p.pts[i].t - p.pts[i-1].t
			if dt == 0 {
				return p.pts[i].v
			}
			r := (t - p.pts[i-1].t) / dt
			v := p.pts[i-1].v + r*(p.pts[i].v-p.pts[i-1].v)
			if v < 0 {
				v = 0
			}
			return v
		}
	}
	return 0
}

func ptrStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func buildProfile(sc Scenario) *Profile {
	start := parseDur(ptrStr(sc.StartTime))

	switch sc.Executor {

	case "constant-vus":
		dur := parseDur(ptrStr(sc.Duration))
		return &Profile{
			startTime: start, endTime: start + dur,
			gracefulStart: -1, maxVal: sc.VUs, pType: "VUs",
			pts: []point{{start, sc.VUs}, {start + dur, sc.VUs}},
		}

	case "ramping-vus":
		gr := parseDur(ptrStr(sc.GracefulRampDown))
		if gr == 0 {
			gr = 30
		}
		pts := []point{{start, sc.StartVUs}}
		cur := start
		for _, st := range sc.Stages {
			cur += parseDur(st.Duration)
			pts = append(pts, point{cur, st.Target})
		}
		gracefulStart := cur
		endTime := cur + gr
		pts = append(pts, point{endTime, 0})
		mx := 0.0
		for _, p := range pts {
			if p.v > mx {
				mx = p.v
			}
		}
		return &Profile{
			startTime: start, endTime: endTime,
			gracefulStart: gracefulStart, maxVal: mx, pType: "VUs", pts: pts,
		}

	case "shared-iterations", "per-vu-iterations":
		maxDur := parseDur(ptrStr(sc.MaxDuration))
		if maxDur == 0 {
			maxDur = 600
		}
		vus := sc.VUs
		if vus == 0 {
			vus = 1
		}
		return &Profile{
			startTime: start, endTime: start + maxDur,
			gracefulStart: -1, maxVal: vus, pType: "VUs",
			pts: []point{{start, vus}, {start + maxDur, vus}},
		}

	case "constant-arrival-rate":
		dur := parseDur(ptrStr(sc.Duration))
		tu := parseDur(ptrStr(sc.TimeUnit))
		if tu == 0 {
			tu = 1
		}
		rps := sc.Rate / tu
		return &Profile{
			startTime: start, endTime: start + dur,
			gracefulStart: -1, maxVal: rps, pType: "RPS",
			pts: []point{{start, rps}, {start + dur, rps}},
		}

	case "ramping-arrival-rate":
		tu := parseDur(ptrStr(sc.TimeUnit))
		if tu == 0 {
			tu = 1
		}
		pts := []point{{start, sc.StartRate / tu}}
		cur := start
		for _, st := range sc.Stages {
			cur += parseDur(st.Duration)
			pts = append(pts, point{cur, st.Target / tu})
		}
		mx := 0.0
		for _, p := range pts {
			if p.v > mx {
				mx = p.v
			}
		}
		return &Profile{
			startTime: start, endTime: cur,
			gracefulStart: -1, maxVal: mx, pType: "RPS", pts: pts,
		}

	case "externally-controlled":
		dur := parseDur(ptrStr(sc.Duration))
		if dur == 0 {
			dur = 600
		}
		vus := sc.VUs
		mx := sc.MaxVUs
		if mx == 0 {
			mx = vus
		}
		return &Profile{
			startTime: start, endTime: start + dur,
			gracefulStart: -1, maxVal: mx, pType: "VUs",
			pts: []point{{start, vus}, {start + dur, vus}},
		}
	}
	return nil
}

// ── CLI Render ────────────────────────────────────────────────────────────────

type cell struct {
	ch string
	ci int // -1 = empty
}

func render(scenarios map[string]Scenario, names []string) {
	profiles := make(map[string]*Profile, len(names))
	totalEnd := 0.0
	for _, name := range names {
		p := buildProfile(scenarios[name])
		if p != nil {
			profiles[name] = p
			if p.endTime > totalEnd {
				totalEnd = p.endTime
			}
		}
	}
	if totalEnd == 0 {
		fmt.Println("\nCannot determine test duration.\n")
		return
	}

	const W = 78
	const H = 14
	dt := totalEnd / W

	// allMax = maximum of the stacked sum of all scenarios at any single point in time
	allMax := 0.0
	for x := 0; x < W; x++ {
		t := (float64(x) + 0.5) * dt
		total := 0.0
		for _, name := range names {
			if p := profiles[name]; p != nil {
				total += p.get(t)
			}
		}
		if total > allMax {
			allMax = total
		}
	}
	if allMax == 0 {
		allMax = 1
	}

	// Build raster grid
	grid := make([][]cell, H)
	for y := range grid {
		grid[y] = make([]cell, W)
		for x := range grid[y] {
			grid[y][x] = cell{" ", -1}
		}
	}

	// Mark columns where a scenario hasn't started yet (startTime wait)
	waitCol := make([]bool, W)
	for _, name := range names {
		p := profiles[name]
		if p == nil || p.startTime <= 0 {
			continue
		}
		xStart := int(p.startTime / dt)
		for x := 0; x < xStart && x < W; x++ {
			waitCol[x] = true
		}
	}

	for x := 0; x < W; x++ {
		t := (float64(x) + 0.5) * dt
		stackBottom := 0
		for idx, name := range names {
			p := profiles[name]
			if p == nil {
				continue
			}
			val := p.get(t)
			barH := int(math.Round(val / allMax * H))
			isGraceful := p.gracefulStart >= 0 && t >= p.gracefulStart && t < p.endTime
			ch := "█"
			if isGraceful {
				ch = "▒"
			}
			for h := 0; h < barH && (stackBottom+h) < H; h++ {
				y := H - 1 - (stackBottom + h)
				grid[y][x] = cell{ch, idx}
			}
			stackBottom += barH
		}
	}

	// ── Print ────────────────────────────────────────────────────────────────
	hasRPS := false
	hasVUs := false
	hasGraceful := false
	hasWait := false
	for _, name := range names {
		p := profiles[name]
		if p == nil {
			continue
		}
		if p.pType == "RPS" {
			hasRPS = true
		} else {
			hasVUs = true
		}
		if p.gracefulStart >= 0 {
			hasGraceful = true
		}
		if p.startTime > 0 {
			hasWait = true
		}
	}

	yLabel := "VUs"
	if hasRPS && hasVUs {
		yLabel = "VUs/RPS"
	} else if hasRPS {
		yLabel = "RPS"
	}

	title := " K6 Load Profile Preview "
	padTotal := W - len(title)
	padL := padTotal / 2
	padR := padTotal - padL
	header := "╔" + strings.Repeat("═", padL) + title + strings.Repeat("═", padR) + "╗"
	fmt.Printf("\n%s     %s%s\n\n", bold, header, reset)

	for y := 0; y < H; y++ {
		val := allMax * float64(H-y) / H
		lbl := "    "
		if y == 0 || y%4 == 0 || y == H-1 {
			lbl = fmt.Sprintf("%4d", int(math.Round(val)))
		}
		fmt.Printf("%s%s │%s", dim, lbl, reset)
		for x := 0; x < W; x++ {
			c := grid[y][x]
			if c.ci >= 0 {
				fmt.Printf("%s%s%s", col(c.ci), c.ch, reset)
			} else if y == H-1 && waitCol[x] {
				fmt.Printf("%s·%s", dim, reset)
			} else {
				fmt.Print(" ")
			}
		}
		fmt.Printf("%s│%s\n", dim, reset)
	}

	// X axis
	fmt.Printf("%s   0 └%s┘%s\n", dim, strings.Repeat("─", W), reset)

	// Time labels
	ticks := 7
	seg := W / (ticks - 1)
	line := "       "
	for i := 0; i < ticks; i++ {
		t := totalEnd * float64(i) / float64(ticks-1)
		lbl := fmtDur(t)
		if i < ticks-1 {
			line += fmt.Sprintf("%-*s", seg, lbl)
		} else {
			line += lbl
		}
	}
	fmt.Printf("%s%s%s\n", dim, line, reset)

	// Legend
	fmt.Printf("\n  %sLegend:%s\n", bold, reset)
	for idx, name := range names {
		p := profiles[name]
		sc := scenarios[name]
		if p == nil {
			continue
		}
		mxStr := fmtVal(p.maxVal)
		fmt.Printf("  %s██%s  %s%s%s  %s%s%s  max %s %s\n",
			col(idx), reset,
			bold, name, reset,
			dim, sc.Executor, reset,
			mxStr, p.pType)
	}
	if hasGraceful {
		fmt.Printf("  %s▒  = graceful ramp-down phase%s\n", dim, reset)
	}
	if hasWait {
		fmt.Printf("  %s·  = scenario not yet started (waiting for startTime)%s\n", dim, reset)
	}

	// Table
	const lineW = 76
	fmt.Printf("\n  %sScenario overview:%s\n", bold, reset)
	fmt.Printf("  %s%s%s\n", dim, strings.Repeat("─", lineW), reset)
	fmt.Printf("  %s%-24s%-26s%-8s%-8s%s%s\n", bold,
		"Scenario", "Executor", "Start", "End", "Max", reset)
	fmt.Printf("  %s%s%s\n", dim, strings.Repeat("─", lineW), reset)

	for idx, name := range names {
		p := profiles[name]
		sc := scenarios[name]
		if p == nil {
			continue
		}
		mxStr := fmtVal(p.maxVal) + " " + p.pType
		gracefulNote := ""
		if p.gracefulStart >= 0 {
			gracefulNote = fmt.Sprintf("  %s(graceful: %s)%s", dim, fmtDur(p.endTime-p.gracefulStart), reset)
		}
		// truncate long names for table
		execName := sc.Executor
		if len(execName) > 24 {
			execName = execName[:23] + "…"
		}
		displayName := name
		if len(displayName) > 22 {
			displayName = displayName[:21] + "…"
		}
		fmt.Printf("  %s%-24s%s%-26s%-8s%-8s%s%s\n",
			col(idx), displayName, reset,
			execName,
			fmtDur(p.startTime),
			fmtDur(p.endTime),
			mxStr, gracefulNote)
	}

	fmt.Printf("  %s%s%s\n", dim, strings.Repeat("─", lineW), reset)
	fmt.Printf("  %sTotal test duration:%s %s%s%s\n", bold, reset, bold, fmtDur(totalEnd), reset)
	fmt.Printf("  %s%s axis is normalized — absolute values are in the table above.%s\n\n", dim, yLabel, reset)
	fmt.Printf("  %sAuthor: Radim Daniel Pánek (rdpanek@canarytrace.com)  k6.canarytrace.com%s\n\n", dim, reset)
}

func fmtVal(v float64) string {
	if v == math.Trunc(v) {
		return strconv.Itoa(int(v))
	}
	return strconv.FormatFloat(v, 'f', 1, 64)
}

func dashToInts(dash string) []int {
	if dash == "" {
		return []int{}
	}
	parts := strings.Split(dash, ",")
	out := make([]int, 0, len(parts))
	for _, p := range parts {
		n, _ := strconv.Atoi(strings.TrimSpace(p))
		out = append(out, n)
	}
	return out
}

// ── HTML generator ────────────────────────────────────────────────────────────
// Interactive canvas chart: crosshair on hover, line highlight on proximity.

func generateHTML(scenarios map[string]Scenario, names []string, outputPath string) error {
	profiles := make(map[string]*Profile, len(names))
	totalEnd := 0.0
	for _, name := range names {
		p := buildProfile(scenarios[name])
		if p != nil {
			profiles[name] = p
			if p.endTime > totalEnd {
				totalEnd = p.endTime
			}
		}
	}
	if totalEnd == 0 {
		return fmt.Errorf("cannot determine test duration")
	}

	yMax := 0.0
	hasRPS, hasVUs := false, false
	for _, p := range profiles {
		if p == nil {
			continue
		}
		if p.maxVal > yMax {
			yMax = p.maxVal
		}
		if p.pType == "RPS" {
			hasRPS = true
		} else {
			hasVUs = true
		}
	}
	if yMax == 0 {
		yMax = 1
	}
	yLabel := "VUs"
	if hasRPS && hasVUs {
		yLabel = "VUs / RPS"
	} else if hasRPS {
		yLabel = "RPS"
	}

	// ── JSON scenario data ────────────────────────────────────────────────────
	type ptJSON struct {
		T float64 `json:"t"`
		V float64 `json:"v"`
	}
	type scJSON struct {
		Name     string   `json:"name"`
		Executor string   `json:"executor"`
		Color    string   `json:"color"`
		Dash     []int    `json:"dash"`
		DashDesc string   `json:"dashDesc"`
		PType    string   `json:"pType"`
		MaxVal   float64  `json:"maxVal"`
		StartT   float64  `json:"startT"`
		EndT     float64  `json:"endT"`
		Pts      []ptJSON `json:"pts"`
	}

	scList := make([]scJSON, 0, len(names))
	for idx, name := range names {
		p := profiles[name]
		if p == nil {
			continue
		}
		st := svgStyleFor(idx)
		pts := make([]ptJSON, len(p.pts))
		for i, pt := range p.pts {
			pts[i] = ptJSON{T: pt.t, V: pt.v}
		}
		scList = append(scList, scJSON{
			Name:     name,
			Executor: scenarios[name].Executor,
			Color:    st.color,
			Dash:     dashToInts(st.dash),
			DashDesc: st.dashDesc,
			PType:    p.pType,
			MaxVal:   p.maxVal,
			StartT:   p.startTime,
			EndT:     p.endTime,
			Pts:      pts,
		})
	}
	jsonBytes, err := json.Marshal(scList)
	if err != nil {
		return fmt.Errorf("JSON marshal: %w", err)
	}

	// ── Legend HTML ───────────────────────────────────────────────────────────
	var legend strings.Builder
	for idx, name := range names {
		p := profiles[name]
		if p == nil {
			continue
		}
		sc := scenarios[name]
		st := svgStyleFor(idx)
		dashAttr := ""
		if st.dash != "" {
			dashAttr = ` stroke-dasharray="` + st.dash + `"`
		}
		fmt.Fprintf(&legend,
			`<div class="leg-item"><svg width="36" height="14"><line x1="2" y1="7" x2="34" y2="7" stroke="%s" stroke-width="2.5" stroke-linecap="round"%s/></svg>`+
				`<span class="leg-name">%s</span><span class="leg-exec">%s</span><span class="leg-max">max %s %s</span></div>`+"\n",
			st.color, dashAttr, name, sc.Executor, fmtVal(p.maxVal), p.pType,
		)
	}

	// ── Assemble HTML ─────────────────────────────────────────────────────────
	var b strings.Builder
	b.WriteString(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>K6 Load Profile Preview</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;font-family:'Courier New',Courier,monospace;color:#0f172a}
.container{max-width:1440px;margin:0 auto;padding:24px 28px}
h1{font-size:20px;font-weight:bold;text-align:center;margin-bottom:18px;letter-spacing:.02em}
.wrap{position:relative;width:100%;cursor:crosshair}
#bg,#ov{position:absolute;top:0;left:0;display:block}
#ov{pointer-events:none}
.legend{margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:7px 28px}
.leg-item{display:flex;align-items:center;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.leg-item svg{flex-shrink:0;margin-right:8px}
.leg-name{font-weight:bold;color:#0f172a;margin-right:8px}
.leg-exec{color:#64748b;margin-right:8px}
.leg-max{color:#94a3b8}
.footer{margin-top:18px;text-align:center;color:#cbd5e1;font-size:12px;padding-bottom:10px}
</style></head>
<body><div class="container">
<h1>K6 Load Profile Preview</h1>
<div class="wrap" id="wrap"><canvas id="bg"></canvas><canvas id="ov"></canvas></div>
<div class="legend">
`)
	b.WriteString(legend.String())
	b.WriteString(`</div>
<div class="footer">Author: Radim Daniel Pánek (rdpanek@canarytrace.com) &middot; k6.canarytrace.com</div>
</div><script>
`)
	fmt.Fprintf(&b, "const SCENARIOS=%s;\n", jsonBytes)
	fmt.Fprintf(&b, "const TOTAL_END=%.6g;\n", totalEnd)
	fmt.Fprintf(&b, "const Y_MAX=%.6g;\n", yMax)
	fmt.Fprintf(&b, "const Y_LABEL=%q;\n", yLabel)
	b.WriteString(`
const MARGIN={left:80,right:30,top:50,bottom:48};
const wrap=document.getElementById('wrap');
const bgC=document.getElementById('bg');
const ovC=document.getElementById('ov');
const bgX=bgC.getContext('2d');
const ovX=ovC.getContext('2d');
let W=0,H=0,cW=0,cH=0,dpr=1,hovered=-1;

function getVal(sc,t){
  if(t<sc.startT||t>sc.endT)return 0;
  const p=sc.pts;
  if(!p.length)return 0;
  for(let i=1;i<p.length;i++){
    if(t<=p[i].t){
      const dt=p[i].t-p[i-1].t;
      if(dt===0)return p[i].v;
      return Math.max(0,p[i-1].v+(t-p[i-1].t)/dt*(p[i].v-p[i-1].v));
    }
  }
  return 0;
}
function tToX(t){return MARGIN.left+t/TOTAL_END*cW;}
function xToT(x){return(x-MARGIN.left)/cW*TOTAL_END;}
function vToY(v){return MARGIN.top+(1-v/Y_MAX)*cH;}
function fmtDur(s){
  if(s<=0)return'0s';
  const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=Math.round(s)%60;
  return(h?h+'h':'')+(m?m+'m':'')+((!h&&!m)||sec?sec+'s':'');
}
function fmtVal(v){return v===Math.floor(v)?String(v):v.toFixed(1);}

function resize(){
  W=wrap.clientWidth;
  H=Math.min(640,Math.max(360,Math.round(W*0.44)));
  wrap.style.height=H+'px';
  cW=W-MARGIN.left-MARGIN.right;
  cH=H-MARGIN.top-MARGIN.bottom;
  dpr=window.devicePixelRatio||1;
  [bgC,ovC].forEach(c=>{
    c.width=W*dpr;c.height=H*dpr;
    c.style.width=W+'px';c.style.height=H+'px';
  });
  bgX.setTransform(dpr,0,0,dpr,0,0);
  ovX.setTransform(dpr,0,0,dpr,0,0);
  drawBg(hovered);
}

function drawBg(hIdx){
  bgX.clearRect(0,0,W,H);
  bgX.fillStyle='#ffffff';bgX.fillRect(0,0,W,H);
  bgX.fillStyle='#f8fafc';bgX.fillRect(MARGIN.left,MARGIN.top,cW,cH);

  // Horizontal grid + Y labels
  const GH=6;
  for(let i=0;i<=GH;i++){
    const gy=MARGIN.top+i/GH*cH,val=Y_MAX*(GH-i)/GH;
    bgX.strokeStyle=i===GH?'#94a3b8':'#e2e8f0';bgX.lineWidth=1;bgX.setLineDash([]);
    bgX.beginPath();bgX.moveTo(MARGIN.left,gy);bgX.lineTo(MARGIN.left+cW,gy);bgX.stroke();
    bgX.fillStyle='#64748b';bgX.font='12px monospace';bgX.textAlign='right';
    bgX.fillText(fmtVal(val),MARGIN.left-8,gy+4);
  }

  // Vertical grid + X labels
  const GV=8;
  for(let i=0;i<=GV;i++){
    const t=TOTAL_END*i/GV,gx=tToX(t);
    bgX.strokeStyle=(i===0||i===GV)?'#94a3b8':'#e2e8f0';bgX.lineWidth=1;bgX.setLineDash([]);
    bgX.beginPath();bgX.moveTo(gx,MARGIN.top);bgX.lineTo(gx,MARGIN.top+cH);bgX.stroke();
    bgX.fillStyle='#475569';bgX.font='12px monospace';bgX.textAlign='center';
    bgX.fillText(fmtDur(t),gx,MARGIN.top+cH+18);
  }

  // Left border
  bgX.strokeStyle='#94a3b8';bgX.lineWidth=2;bgX.setLineDash([]);
  bgX.beginPath();bgX.moveTo(MARGIN.left,MARGIN.top);bgX.lineTo(MARGIN.left,MARGIN.top+cH);bgX.stroke();

  // Y axis label (rotated)
  bgX.save();
  bgX.translate(14,MARGIN.top+cH/2);bgX.rotate(-Math.PI/2);
  bgX.fillStyle='#64748b';bgX.font='13px monospace';bgX.textAlign='center';
  bgX.fillText(Y_LABEL,0,0);bgX.restore();

  // Scenario lines (keyframe points — piecewise linear, no sampling needed)
  SCENARIOS.forEach((sc,idx)=>{
    const isHov=hIdx>=0&&idx===hIdx;
    bgX.globalAlpha=hIdx>=0&&!isHov?0.1:1.0;
    bgX.strokeStyle=sc.color;bgX.lineWidth=isHov?3.5:2.5;
    bgX.setLineDash(sc.dash);bgX.lineJoin='round';bgX.lineCap='round';
    bgX.beginPath();
    sc.pts.forEach((pt,i)=>{
      const x=tToX(pt.t),y=vToY(pt.v);
      i===0?bgX.moveTo(x,y):bgX.lineTo(x,y);
    });
    bgX.stroke();bgX.setLineDash([]);bgX.globalAlpha=1;
  });
}

function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

function drawOverlay(mx,my){
  ovX.clearRect(0,0,W,H);
  if(mx<MARGIN.left||mx>MARGIN.left+cW||my<MARGIN.top||my>MARGIN.top+cH)return;
  const t=xToT(mx);
  if(t<0||t>TOTAL_END)return;

  // Crosshair
  ovX.setLineDash([6,4]);ovX.strokeStyle='#94a3b8';ovX.lineWidth=1;
  ovX.beginPath();ovX.moveTo(mx,MARGIN.top);ovX.lineTo(mx,MARGIN.top+cH);ovX.stroke();
  ovX.setLineDash([]);

  // Time label
  const ts=fmtDur(t);
  ovX.font='12px monospace';ovX.textAlign='center';
  const tw=ovX.measureText(ts).width;
  ovX.fillStyle='rgba(255,255,255,0.9)';
  ovX.fillRect(mx-tw/2-4,MARGIN.top+cH+4,tw+8,17);
  ovX.fillStyle='#475569';ovX.fillText(ts,mx,MARGIN.top+cH+17);

  // Find nearest scenario line at this X position
  let minD=Infinity,nearIdx=-1;
  SCENARIOS.forEach((sc,idx)=>{
    if(t<sc.startT||t>sc.endT)return;
    const d=Math.abs(my-vToY(getVal(sc,t)));
    if(d<minD){minD=d;nearIdx=idx;}
  });

  if(minD<=14&&nearIdx>=0){
    // ── Hover mode: highlight one line, show its label ────────────────────
    if(nearIdx!==hovered){hovered=nearIdx;drawBg(hovered);}
    const sc=SCENARIOS[nearIdx];
    const v=getVal(sc,t),sy=vToY(v);
    // Dot
    ovX.beginPath();ovX.arc(mx,sy,5,0,Math.PI*2);
    ovX.fillStyle=sc.color;ovX.fill();
    ovX.strokeStyle='#fff';ovX.lineWidth=2;ovX.stroke();
    // Label
    const lbl=sc.name+': '+fmtVal(v)+' '+sc.pType;
    ovX.font='bold 13px monospace';
    const lw=ovX.measureText(lbl).width;
    const lx=mx+14+lw<MARGIN.left+cW-4?mx+14:mx-14-lw;
    const ly=Math.max(MARGIN.top+14,Math.min(MARGIN.top+cH-4,sy));
    ovX.fillStyle='rgba(255,255,255,0.94)';
    ovX.strokeStyle=sc.color;ovX.lineWidth=1.5;
    rrect(ovX,lx-5,ly-14,lw+10,20,4);ovX.fill();ovX.stroke();
    ovX.fillStyle=sc.color;ovX.textAlign='left';ovX.fillText(lbl,lx,ly);

  }else{
    // ── Crosshair mode: show labels for all active scenarios ──────────────
    if(hovered!==-1){hovered=-1;drawBg(-1);}
    const hits=[];
    SCENARIOS.forEach(sc=>{
      if(t<sc.startT||t>sc.endT)return;
      const v=getVal(sc,t);
      if(v<=0)return;
      hits.push({sc,v,dotY:vToY(v),lblY:vToY(v)});
    });
    if(!hits.length)return;
    // Sort top→bottom, then deconflict label Y positions
    hits.sort((a,b)=>a.dotY-b.dotY);
    const GAP=17;
    for(let i=1;i<hits.length;i++)
      if(hits[i].lblY-hits[i-1].lblY<GAP)hits[i].lblY=hits[i-1].lblY+GAP;
    for(let i=hits.length-2;i>=0;i--)
      if(hits[i+1].lblY-hits[i].lblY<GAP)hits[i].lblY=hits[i+1].lblY-GAP;
    const onRight=mx<MARGIN.left+cW*0.62;
    hits.forEach(h=>{
      // Dot at actual intersection
      ovX.beginPath();ovX.arc(mx,h.dotY,4,0,Math.PI*2);
      ovX.fillStyle=h.sc.color;ovX.fill();
      // Label with background
      const lbl=h.sc.name+': '+fmtVal(h.v)+' '+h.sc.pType;
      ovX.font='12px monospace';
      const lw=ovX.measureText(lbl).width;
      const lx=onRight?mx+8:mx-8-lw;
      const ly=Math.max(MARGIN.top+8,Math.min(MARGIN.top+cH+2,h.lblY));
      ovX.fillStyle='rgba(255,255,255,0.88)';
      ovX.fillRect(lx-2,ly-12,lw+4,15);
      ovX.fillStyle=h.sc.color;ovX.textAlign='left';
      ovX.fillText(lbl,lx,ly);
    });
  }
}

wrap.addEventListener('mousemove',e=>{
  const r=ovC.getBoundingClientRect();
  drawOverlay(e.clientX-r.left,e.clientY-r.top);
});
wrap.addEventListener('mouseleave',()=>{
  ovX.clearRect(0,0,W,H);
  if(hovered!==-1){hovered=-1;drawBg(-1);}
});
window.addEventListener('resize',resize);
resize();
</script></body></html>
`)
	return os.WriteFile(outputPath, []byte(b.String()), 0644)
}

// ── SVG generator ────────────────────────────────────────────────────────────
// Line chart — each scenario as a separate colored line.
// Y axis: individual max per scenario (not stacked — exact values).
// Graceful ramp-down: dashed line.

func generateSVG(scenarios map[string]Scenario, names []string, outputPath string) error {
	profiles := make(map[string]*Profile, len(names))
	totalEnd := 0.0
	for _, name := range names {
		p := buildProfile(scenarios[name])
		if p != nil {
			profiles[name] = p
			if p.endTime > totalEnd {
				totalEnd = p.endTime
			}
		}
	}
	if totalEnd == 0 {
		return fmt.Errorf("cannot determine test duration")
	}

	// Y axis: max value across all scenarios (line chart — not stacked)
	yMax := 0.0
	for _, p := range profiles {
		if p.maxVal > yMax {
			yMax = p.maxVal
		}
	}
	if yMax == 0 {
		yMax = 1
	}

	// ── Dynamic SVG height based on legend row count ─────────────────────────
	const (
		chartW       = svgW - svgL - svgR // 1470 px
		chartH       = 560               // fixed chart area height
		legendCols   = 2
		legendRowH   = 28
		xAxisH       = 38 // space for X axis labels
		legendGapTop = 20
		footerH      = 30
	)
	hasGraceful := false
	for _, p := range profiles {
		if p != nil && p.gracefulStart >= 0 {
			hasGraceful = true
			break
		}
	}
	legendRows := (len(names) + legendCols - 1) / legendCols
	gracefulNoteH := 0
	if hasGraceful {
		gracefulNoteH = legendRowH
	}
	bottomH := xAxisH + legendGapTop + legendRows*legendRowH + gracefulNoteH + footerH + 10
	totalH := svgT + chartH + bottomH

	const samples = 1000
	dt := totalEnd / samples

	toX := func(t float64) float64 {
		return float64(svgL) + t/totalEnd*float64(chartW)
	}
	toY := func(v float64) float64 {
		return float64(svgT+chartH) - v/yMax*float64(chartH)
	}
	var b strings.Builder

	fmt.Fprintf(&b, `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">
`, svgW, totalH, svgW, totalH)

	// ── Background (light theme) ─────────────────────────────────────────────
	fmt.Fprintf(&b, `  <rect width="%d" height="%d" fill="#ffffff"/>
`, svgW, totalH)

	// Oblast grafu
	fmt.Fprintf(&b, `  <rect x="%d" y="%d" width="%d" height="%d" fill="#f8fafc" rx="4" stroke="#e2e8f0" stroke-width="1"/>
`, svgL, svgT, chartW, chartH)

	// Titulek
	fmt.Fprintf(&b, `  <text x="%d" y="46" text-anchor="middle" fill="#0f172a" font-size="22" font-family="'Courier New',Courier,monospace" font-weight="bold">K6 Load Profile Preview</text>
`, svgW/2)

	// ── Grid — horizontal lines (Y axis) ─────────────────────────────────────
	const gridH = 6
	for i := 0; i <= gridH; i++ {
		gy := float64(svgT) + float64(i)/float64(gridH)*float64(chartH)
		val := yMax * float64(gridH-i) / float64(gridH)
		strokeCol := "#e2e8f0"
		if i == gridH {
			strokeCol = "#94a3b8"
		}
		fmt.Fprintf(&b, `  <line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1"/>
`, svgL, gy, svgL+chartW, gy, strokeCol)
		lbl := fmtVal(val)
		fmt.Fprintf(&b, `  <text x="%d" y="%.1f" text-anchor="end" fill="#64748b" font-size="13" font-family="'Courier New',Courier,monospace">%s</text>
`, svgL-8, gy+5, lbl)
	}

	// ── Grid — vertical lines (X axis / time) ────────────────────────────────
	const gridV = 8
	for i := 0; i <= gridV; i++ {
		t := totalEnd * float64(i) / float64(gridV)
		gx := toX(t)
		gridCol := "#e2e8f0"
		if i == 0 || i == gridV {
			gridCol = "#94a3b8"
		}
		fmt.Fprintf(&b, `  <line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1"/>
`, gx, svgT, gx, svgT+chartH, gridCol)
		lbl := fmtDur(t)
		fmt.Fprintf(&b, `  <text x="%.1f" y="%d" text-anchor="middle" fill="#475569" font-size="13" font-family="'Courier New',Courier,monospace">%s</text>
`, gx, svgT+chartH+22, lbl)
	}

	// Y axis (left vertical border)
	fmt.Fprintf(&b, `  <line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#94a3b8" stroke-width="2"/>
`, svgL, svgT, svgL, svgT+chartH)

	// ── Lines per scenario ────────────────────────────────────────────────────
	type svgPt struct{ x, y float64 }

	for idx, name := range names {
		p := profiles[name]
		if p == nil {
			continue
		}
		st := svgStyleFor(idx)

		pts := make([]svgPt, 0, samples+1)
		for s := 0; s <= samples; s++ {
			t := float64(s) * dt
			if t > totalEnd {
				t = totalEnd
			}
			pts = append(pts, svgPt{toX(t), toY(p.get(t))})
		}

		// Split into solid and graceful ramp-down segments
		var solidPts, gracePts []svgPt
		for _, pt := range pts {
			t := (pt.x - float64(svgL)) / float64(chartW) * totalEnd
			if p.gracefulStart >= 0 && t >= p.gracefulStart {
				gracePts = append(gracePts, pt)
			} else {
				solidPts = append(solidPts, pt)
			}
		}
		if len(gracePts) > 0 && len(solidPts) > 0 {
			gracePts = append([]svgPt{solidPts[len(solidPts)-1]}, gracePts...)
		}

		// Main line (solid or styled)
		if len(solidPts) > 1 {
			var path strings.Builder
			fmt.Fprintf(&path, "M %.2f,%.2f", solidPts[0].x, solidPts[0].y)
			for _, pt := range solidPts[1:] {
				fmt.Fprintf(&path, " L %.2f,%.2f", pt.x, pt.y)
			}
			dashAttr := ""
			if st.dash != "" {
				dashAttr = fmt.Sprintf(` stroke-dasharray="%s"`, st.dash)
			}
			fmt.Fprintf(&b, `  <path d="%s" fill="none" stroke="%s" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"%s/>
`, path.String(), st.color, dashAttr)
		}

		// Graceful ramp-down — same color, tighter dot pattern to distinguish from main style
		if len(gracePts) > 1 {
			var path strings.Builder
			fmt.Fprintf(&path, "M %.2f,%.2f", gracePts[0].x, gracePts[0].y)
			for _, pt := range gracePts[1:] {
				fmt.Fprintf(&path, " L %.2f,%.2f", pt.x, pt.y)
			}
			fmt.Fprintf(&b, `  <path d="%s" fill="none" stroke="%s" stroke-width="1.5" stroke-dasharray="4,4" stroke-linecap="round" opacity="0.6"/>
`, path.String(), st.color)
		}
	}

	// ── Legend below chart ────────────────────────────────────────────────────
	legendY := svgT + chartH + xAxisH + legendGapTop
	legendColW := chartW / legendCols

	for idx, name := range names {
		p := profiles[name]
		sc := scenarios[name]
		if p == nil {
			continue
		}
		col := idx % legendCols
		row := idx / legendCols
		lx := svgL + col*legendColW
		ly := legendY + row*legendRowH
		st := svgStyleFor(idx)

		// Line swatch — shows actual color + dash style
		dashAttr := ""
		if st.dash != "" {
			dashAttr = fmt.Sprintf(` stroke-dasharray="%s"`, st.dash)
		}
		fmt.Fprintf(&b, `  <line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5" stroke-linecap="round"%s/>
`, lx, ly+7, lx+30, ly+7, st.color, dashAttr)
		// Name (bold) + executor + max
		fmt.Fprintf(&b, `  <text x="%d" y="%d" font-family="'Courier New',Courier,monospace" font-size="13">`, lx+38, ly+11)
		fmt.Fprintf(&b, `<tspan fill="#0f172a" font-weight="bold">%s</tspan>`, name)
		fmt.Fprintf(&b, `<tspan fill="#64748b">  %s  max %s %s</tspan>`, sc.Executor, fmtVal(p.maxVal), p.pType)
		fmt.Fprintf(&b, "</text>\n")
	}

	// Graceful ramp-down note
	if hasGraceful {
		noteY := legendY + legendRows*legendRowH + 6
		fmt.Fprintf(&b, `  <line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#64748b" stroke-width="2" stroke-dasharray="10,5" stroke-linecap="round"/>
  <text x="%d" y="%d" fill="#64748b" font-size="12" font-family="'Courier New',Courier,monospace">= graceful ramp-down phase</text>
`, svgL, noteY+5, svgL+34, noteY+5, svgL+42, noteY+9)
	}

	// Footer
	fmt.Fprintf(&b, `  <text x="%d" y="%d" text-anchor="middle" fill="#cbd5e1" font-size="12" font-family="'Courier New',Courier,monospace">Author: Radim Daniel Pánek (rdpanek@canarytrace.com)  k6.canarytrace.com</text>
`, svgW/2, totalH-10)

	fmt.Fprintf(&b, `</svg>
`)

	return os.WriteFile(outputPath, []byte(b.String()), 0644)
}

// ── k6 inspect ───────────────────────────────────────────────────────────────

func runInspect(scriptPath string) (map[string]Scenario, []string) {
	cmd := exec.Command("k6", "inspect", scriptPath)
	out, err := cmd.Output()
	if err != nil {
		var stderr string
		if ee, ok := err.(*exec.ExitError); ok {
			stderr = string(ee.Stderr)
		}
		fmt.Fprintf(os.Stderr, "\n  %sError running k6 inspect:%s\n", bold, reset)
		if stderr != "" {
			lines := strings.SplitN(stderr, "\n", 2)
			fmt.Fprintf(os.Stderr, "  %s\n", lines[0])
		} else {
			fmt.Fprintf(os.Stderr, "  %v\n", err)
		}
		fmt.Fprintf(os.Stderr, "  Is k6 installed and available in PATH?\n\n")
		os.Exit(1)
	}

	var result InspectOutput
	if err := json.Unmarshal(out, &result); err != nil {
		fmt.Fprintf(os.Stderr, "\n  Cannot parse k6 inspect output as JSON: %v\n\n", err)
		os.Exit(1)
	}

	if len(result.Scenarios) > 0 {
		names := orderedNames(result.Scenarios)
		return result.Scenarios, names
	}

	if len(result.Stages) > 0 {
		sc := Scenario{
			Executor: "ramping-vus",
			StartVUs: result.VUs,
			Stages:   result.Stages,
		}
		gr := "30s"
		sc.GracefulRampDown = &gr
		return map[string]Scenario{"default": sc}, []string{"default"}
	}

	if result.VUs > 0 && result.Duration != nil {
		sc := Scenario{
			Executor: "constant-vus",
			VUs:      result.VUs,
			Duration: result.Duration,
		}
		return map[string]Scenario{"default": sc}, []string{"default"}
	}

	fmt.Fprintf(os.Stderr, "\n  Script contains no scenarios or recognizable configuration.\n\n")
	os.Exit(1)
	return nil, nil
}

// orderedNames sorts scenarios by startTime
func orderedNames(scenarios map[string]Scenario) []string {
	names := make([]string, 0, len(scenarios))
	for n := range scenarios {
		names = append(names, n)
	}
	for i := 0; i < len(names); i++ {
		for j := i + 1; j < len(names); j++ {
			si := parseDur(ptrStr(scenarios[names[i]].StartTime))
			sj := parseDur(ptrStr(scenarios[names[j]].StartTime))
			if sj < si {
				names[i], names[j] = names[j], names[i]
			}
		}
	}
	return names
}

// ── Help ──────────────────────────────────────────────────────────────────────

func printHelp() {
	fmt.Printf(`
%sK6 Load Profile Preview%s
%sVisualizes the load profile of a k6 script before running it.%s
Reads configuration via 'k6 inspect' and renders it as a chart.
No external dependencies — Go stdlib and k6 in PATH only.

%sUSAGE%s

  go run tools/k6-load-preview.go <script.js> [options]

%sOPTIONS%s

  -o <file>         Generate an output file:
                      .html  Interactive HTML chart (recommended).
                             Open in any browser. Hover anywhere to see a
                             crosshair with values for all active scenarios.
                             Hover close to a specific line to highlight it.
                      .svg   Static SVG line chart.
                             Open in browser or Inkscape.
                             PDF: Ctrl+P → Save as PDF (Chrome/Firefox).

%sEXAMPLES%s

  # CLI visualization (ASCII chart in terminal)
  go run tools/k6-load-preview.go demos/executors/09-workload-model.js

  # Interactive HTML chart
  go run tools/k6-load-preview.go demos/executors/09-workload-model.js -o chart.html

  # Build and run
  go build -o k6-load-preview tools/k6-load-preview.go
  ./k6-load-preview demos/executors/11-kafka-8h-soak.js -o kafka-profile.html

%sHOW CLI VISUALIZATION WORKS (ASCII chart)%s

  Displays load over time as a stacked bar chart.
  Each scenario has its own color (see legend below the chart).

  Symbols:
    █  = active load (VUs or RPS at that point in time)
    ▒  = graceful ramp-down phase — executor waits for in-flight
         iterations to finish before reducing the VU count
    ·  = scenario not yet started (waiting for startTime)

  Y axis:
    Normalized value (0–100%%) of the stacked sum of all scenarios.
    Absolute values (VUs or RPS) are listed in the table below the chart.

  X axis:
    Time axis from 0 to the total test duration.

  Scenario table:
    Start  = scenario start time (startTime)
    End    = finish time (including graceful ramp-down)
    Max    = peak value (VUs or RPS)

  Mixed scenarios (VUs + RPS):
    When a test combines constant-vus and constant-arrival-rate,
    the Y axis is labeled "VUs/RPS" — values are normalized to the
    maximum; absolute numbers are in the table.

%sHOW HTML VISUALIZATION WORKS (interactive chart)%s

  Generates a self-contained HTML file with a Canvas 2D chart.
  Open it in any browser — no server or internet connection required.

  Interaction:
    Move mouse anywhere in the chart area:
      A vertical crosshair appears. At each scenario line intersection,
      a colored dot and label show the scenario name and current value.
      Labels are automatically deconflicted to avoid overlap.

    Move mouse close to a specific line (within ~14 px):
      All other lines fade out. Only the hovered line is highlighted
      with a bold label showing its name and current value.

    Move mouse out of chart:
      Returns to normal view — all lines at full opacity.

  Legend below the chart shows each scenario's line style (color + dash).

%sHOW SVG VISUALIZATION WORKS (static chart)%s

  Generates an SVG file (1600 px wide, dynamic height).
  Each scenario is a separate colored+styled line — values are not stacked.

  SVG → PDF: open in Chrome → Ctrl+P → Save as PDF → Landscape.

%sEXECUTORS AND HOW THEY APPEAR%s

  constant-vus          Flat line — constant VU count throughout.
  ramping-vus           Rising/falling line following stages.
                        Graceful ramp-down = dashed line at the end.
  constant-arrival-rate Flat line — constant RPS (Open Model).
  ramping-arrival-rate  Rising/falling RPS line following stages.
  shared-iterations     Flat line for maxDuration.
  per-vu-iterations     Flat line for maxDuration.
  externally-controlled Flat line (shows maxVUs as capacity ceiling).

%sAUTHOR%s
  Radim Daniel Pánek (rdpanek@canarytrace.com)
  k6.canarytrace.com

`,
		bold, reset,
		dim, reset,
		bold, reset,
		bold, reset,
		bold, reset,
		bold, reset,
		bold, reset,
		bold, reset,
		bold, reset,
		bold, reset,
	)
}

// ── main ─────────────────────────────────────────────────────────────────────

func main() {
	// No arguments → show help
	if len(os.Args) < 2 {
		printHelp()
		fmt.Printf("  %sTip:%s  run without arguments to show this help.\n\n", dim, reset)
		os.Exit(0)
	}

	// Script is the first positional argument; options are parsed after it
	scriptArg := os.Args[1]

	// If the first argument looks like a flag, show help
	if strings.HasPrefix(scriptArg, "-") {
		printHelp()
		os.Exit(0)
	}

	// Parse options from remaining arguments
	fs := flag.NewFlagSet("k6-load-preview", flag.ExitOnError)
	outputPath := fs.String("o", "", "output SVG file")
	fs.Parse(os.Args[2:]) //nolint

	scriptPath, err := filepath.Abs(scriptArg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "\n  Cannot resolve absolute path: %v\n\n", err)
		os.Exit(1)
	}

	if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "\n  File not found: %s\n\n", scriptPath)
		os.Exit(1)
	}

	scenarios, names := runInspect(scriptPath)

	// Always render CLI chart
	render(scenarios, names)

	// Export if output path was provided
	if *outputPath != "" {
		ext := strings.ToLower(filepath.Ext(*outputPath))
		if ext == ".html" || ext == ".htm" {
			if err := generateHTML(scenarios, names, *outputPath); err != nil {
				fmt.Fprintf(os.Stderr, "  HTML generation error: %v\n\n", err)
				os.Exit(1)
			}
			fmt.Printf("  %sHTML saved:%s %s%s%s\n", bold, reset, bold, *outputPath, reset)
			fmt.Printf("  %sOpen in any browser. Hover over the chart to explore scenarios interactively.%s\n\n", dim, reset)
		} else {
			if err := generateSVG(scenarios, names, *outputPath); err != nil {
				fmt.Fprintf(os.Stderr, "  SVG generation error: %v\n\n", err)
				os.Exit(1)
			}
			fmt.Printf("  %sSVG saved:%s %s%s%s\n", bold, reset, bold, *outputPath, reset)
			fmt.Printf("  %sOpen in browser or Inkscape. PDF: Ctrl+P → Save as PDF.%s\n\n", dim, reset)
		}
	} else {
		fmt.Printf("  %sTip:%s  Interactive HTML: go run tools/k6-load-preview.go %s %s-o chart.html%s\n", dim, reset, os.Args[1], bold, reset)
		fmt.Printf("  %sTip:%s  Help:             go run tools/k6-load-preview.go\n\n", dim, reset)
	}
}
