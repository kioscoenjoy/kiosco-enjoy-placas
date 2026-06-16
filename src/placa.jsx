/* global React */
/* =========================================================================
   Kiosco Enjoy — Motor de composición de placas (paramétrico por ESTRUCTURA)
   Una sola placa se describe con cfg.struct (layout) + contenido editable.
   Autoría a 1080px; el host la escala.
   ========================================================================= */
function logoSrc(ink, color) {
  const r = window.__resources || {};
  let which = color;
  if (!which || which === "auto") which = ink === "dark" ? "red" : "white";
  if (which === "red") return r.logoRed || "assets/logo-red.svg";
  if (which === "black") return r.logoBlack || "assets/logo-black.svg";
  return r.logoWhite || "assets/logo-white.svg";
}

const COL = { red: "var(--coke-red)", dark: "var(--black-c)", white: "var(--brilliant-white)", cream: "#E7E4E0", yellow: "var(--promo)", celeste: "#5AA0DC", celesteDeep: "#2E6CB0" };
const ARG_STRIPES = `linear-gradient(180deg, ${COL.celeste} 0 33.33%, #fff 33.33% 66.66%, ${COL.celeste} 66.66% 100%)`;

function ML({ text }) {
  const lines = String(text == null ? "" : text).split("\n");
  return lines.map((l, i) => <React.Fragment key={i}>{i > 0 ? <br /> : null}{l}</React.Fragment>);
}

function inkColors(ink) {
  return ink === "dark"
    ? { fg: "var(--black-c)", sub: "var(--ink-700)", accent: "var(--coke-red)", muted: "var(--ink-500)" }
    : { fg: "#fff", sub: "rgba(255,255,255,.86)", accent: "var(--promo)", muted: "rgba(255,255,255,.6)" };
}

const BRAND_COL = { red: "var(--coke-red)", black: "var(--black-c)", white: "#fff", yellow: "var(--promo)", celeste: "#5AA0DC" };
function txCol(token, fallback) {
  return token && token !== "auto" ? (BRAND_COL[token] || fallback) : fallback;
}
function txOn(cfg, key) { return cfg[key + "Show"] !== false; }

function safeInsets(W, H) {
  const r = H / W;
  if (r > 1.6) {
    return { kind: "story", top: Math.round(H * 0.135), bottom: Math.round(H * 0.185), left: 64, right: 64, blW: 0, blH: 0 };
  }
  if (r > 1.33 && r < 1.55) {
    const m = Math.round(W * 0.09);
    return { kind: "print", top: Math.round(H * 0.075), bottom: Math.round(H * 0.075), left: m, right: m, blW: 0, blH: 0 };
  }
  const blH = r >= 1.18 ? Math.round(H * 0.17) : Math.round(H * 0.22);
  return { kind: "feed", top: 64, bottom: 64, left: 64, right: 64, blW: Math.round(W * 0.42), blH };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SISTEMA DE DRAG-TO-REPOSITION
   Contexto, hook y componente wrapper para mover elementos libremente en el
   lienzo. En modo editor cada elemento muestra handles de arrastre; en modo
   exportación (editor=false) los offsets se aplican igual para que el PNG
   exporte con las posiciones que el usuario definió.
   ═══════════════════════════════════════════════════════════════════════════ */
const PlacaEditorCtx = React.createContext(null);

/* ═══════════════════════════════════════════════════════════════════════════
   SISTEMA DE DRAG v2
   · Snap magnético a centro, tercios y bordes de área segura (8 px threshold)
   · Click para seleccionar → resaltado + panel Posición en sidebar
   · Lock por elemento → no se puede mover accidentalmente
   · Coordenadas vivas mientras draggea
   ═══════════════════════════════════════════════════════════════════════════ */
function useDragOffset(offKey) {
  const ctx = React.useContext(PlacaEditorCtx);
  const elRef = React.useRef(null);
  const savedX = ctx && ctx.cfg && ctx.cfg[offKey] ? ctx.cfg[offKey].x : 0;
  const savedY = ctx && ctx.cfg && ctx.cfg[offKey] ? ctx.cfg[offKey].y : 0;
  const [liveOff, setLiveOff] = React.useState({ x: savedX, y: savedY });
  const dragging = React.useRef(false);

  React.useEffect(() => {
    if (!dragging.current) setLiveOff({ x: savedX, y: savedY });
  }, [savedX, savedY]);

  const isEditor  = !!(ctx && ctx.editor && ctx.onMove);
  const isSelected = !!(ctx && ctx.selectedEl === offKey);
  const isLocked   = !!(ctx && ctx.lockedEls && ctx.lockedEls.has(offKey));

  function onClick(e) {
    if (!isEditor || dragging.current) return;
    e.stopPropagation();
    if (ctx.setSelectedEl) ctx.setSelectedEl(isSelected ? null : offKey);
  }

  function onMouseDown(e) {
    if (!isEditor || isLocked) return;
    e.preventDefault(); e.stopPropagation();
    if (ctx.setSelectedEl) ctx.setSelectedEl(offKey);
    dragging.current = true;
    const startX = e.clientX, startY = e.clientY;
    const baseX = savedX, baseY = savedY;

    function calcSnap(rawDx, rawDy) {
      let nx = Math.round(baseX + rawDx);
      let ny = Math.round(baseY + rawDy);
      const guides = [];
      const snapTargets = (ctx && ctx.snapTargets) || [];
      const THRESH = 8;
      if (elRef.current && ctx && ctx.placaRef && ctx.placaRef.current) {
        const er = elRef.current.getBoundingClientRect();
        const pr = ctx.placaRef.current.getBoundingClientRect();
        const sc = ctx.scale || 1;
        const elCX = ((er.left + er.right)  / 2 - pr.left) / sc;
        const elCY = ((er.top  + er.bottom) / 2 - pr.top)  / sc;
        let snX = false, snY = false;
        for (const tgt of snapTargets) {
          if (tgt.x !== undefined && !snX) {
            const d = elCX - tgt.x;
            if (Math.abs(d) < THRESH) { nx -= Math.round(d); guides.push({ type: 'v', pos: tgt.x }); snX = true; }
          }
          if (tgt.y !== undefined && !snY) {
            const d = elCY - tgt.y;
            if (Math.abs(d) < THRESH) { ny -= Math.round(d); guides.push({ type: 'h', pos: tgt.y }); snY = true; }
          }
        }
      }
      return { x: nx, y: ny, guides };
    }

    function onMove(ev) {
      const sc = ctx.scale || 1;
      const { x, y, guides } = calcSnap((ev.clientX - startX) / sc, (ev.clientY - startY) / sc);
      setLiveOff({ x, y });
      if (ctx.setSnapGuides)  ctx.setSnapGuides(guides);
      if (ctx.setLiveCoords)  ctx.setLiveCoords({ x, y, offKey });
    }
    function onUp(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const sc = ctx.scale || 1;
      const { x, y } = calcSnap((ev.clientX - startX) / sc, (ev.clientY - startY) / sc);
      setLiveOff({ x, y });
      ctx.onMove(offKey, { x, y });
      if (ctx.setSnapGuides)  ctx.setSnapGuides([]);
      if (ctx.setLiveCoords)  ctx.setLiveCoords(null);
      requestAnimationFrame(() => { dragging.current = false; });
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function onDoubleClick(e) {
    if (!isEditor || isLocked) return;
    e.preventDefault(); e.stopPropagation();
    setLiveOff({ x: 0, y: 0 });
    ctx.onMove(offKey, { x: 0, y: 0 });
  }

  return { off: liveOff, isEditor, isSelected, isLocked, elRef, onMouseDown, onDoubleClick, onClick };
}

function DragHandle({ offKey, children }) {
  const { off, isEditor, isSelected, isLocked, elRef, onMouseDown, onDoubleClick, onClick } = useDragOffset(offKey);
  const cls = isEditor
    ? ['drag-el', isSelected && 'drag-selected', isLocked && 'drag-locked'].filter(Boolean).join(' ')
    : '';
  return (
    <div
      ref={elRef}
      data-offkey={offKey}
      className={cls}
      style={{ transform: `translate(${off.x}px,${off.y}px)` }}
      onMouseDown={isEditor && !isLocked ? onMouseDown : undefined}
      onDoubleClick={isEditor && !isLocked ? onDoubleClick : undefined}
      onClick={isEditor ? onClick : undefined}
      title={isLocked ? 'Bloqueado · desbloqueá desde panel Posición' : isEditor ? 'Arrastrá · clic para seleccionar · doble clic para centrar' : undefined}
    >
      {children}
    </div>
  );
}

/* Overlays de editor — SOLO visibles en modo editor, NUNCA se exportan */
function SnapGuidesOverlay() {
  const ctx = React.useContext(PlacaEditorCtx);
  const guides = (ctx && ctx.snapGuides) || [];
  if (!guides.length) return null;
  return (
    <React.Fragment>
      {guides.map((g, i) =>
        g.type === 'v'
          ? <div key={i} className="p snap-guide-v" style={{ left: g.pos }} />
          : <div key={i} className="p snap-guide-h" style={{ top: g.pos }} />
      )}
    </React.Fragment>
  );
}
function ThirdsGrid({ W, H }) {
  return (
    <React.Fragment>
      <div className="p thirds-line-v" style={{ left: Math.round(W / 3)     }} />
      <div className="p thirds-line-v" style={{ left: Math.round(W * 2 / 3) }} />
      <div className="p thirds-line-h" style={{ top:  Math.round(H / 3)     }} />
      <div className="p thirds-line-h" style={{ top:  Math.round(H * 2 / 3) }} />
    </React.Fragment>
  );
}

/* ───────── background blocks ───────── */
function BgBlocks({ bg, block, blockColor, W, H }) {
  const base = COL[bg] || COL.red;
  const bc = COL[blockColor] || COL.dark;
  const out = [<div key="b" className="p" style={{ inset: 0, background: base }}></div>];
  const add = (k, st) => out.push(<div key={k} className="p" style={st}></div>);
  switch (block) {
    case "half-r": add("h", { top: 0, bottom: 0, right: 0, width: W * 0.5, background: bc }); break;
    case "half-l": add("h", { top: 0, bottom: 0, left: 0, width: W * 0.5, background: bc }); break;
    case "half-t": add("h", { top: 0, left: 0, right: 0, height: H * 0.5, background: bc }); break;
    case "half-b": add("h", { bottom: 0, left: 0, right: 0, height: H * 0.5, background: bc }); break;
    case "third-b": add("h", { bottom: 0, left: 0, right: 0, height: H * 0.36, background: bc }); break;
    case "third-t": add("h", { top: 0, left: 0, right: 0, height: H * 0.34, background: bc }); break;
    case "side-l": add("h", { top: 0, bottom: 0, left: 0, width: W * 0.40, background: bc }); break;
    case "diag": add("h", { inset: 0, background: bc, clipPath: "polygon(0 0, 100% 0, 100% 58%, 0 100%)" }); break;
    case "diag-b": add("h", { inset: 0, background: bc, clipPath: "polygon(0 72%, 100% 48%, 100% 100%, 0 100%)" }); break;
    case "arc-tr": add("h", { width: W * 1.05, height: W * 1.05, right: -W * 0.32, top: -W * 0.38, borderRadius: "50%", background: bc }); break;
    case "arc-bl": add("h", { width: W * 1.05, height: W * 1.05, left: -W * 0.34, bottom: -W * 0.40, borderRadius: "50%", background: bc }); break;
    case "frame": add("h", { inset: 44, border: `10px solid ${bc}`, borderRadius: 18 }); break;
    case "frame-double": add("h", { inset: 40, border: `6px solid ${bc}`, borderRadius: 14 }); add("h2", { inset: 58, border: `3px solid ${bc}`, borderRadius: 8 }); break;
    case "flag-r": add("f", { top: 0, bottom: 0, right: 0, width: W * 0.42, background: ARG_STRIPES }); break;
    case "flag-l": add("f", { top: 0, bottom: 0, left: 0, width: W * 0.42, background: ARG_STRIPES }); break;
    case "arg-band-b": add("f", { left: 0, right: 0, bottom: 0, height: H * 0.11, background: ARG_STRIPES }); break;
    case "arg-band-t": add("f", { left: 0, right: 0, top: 0, height: H * 0.11, background: ARG_STRIPES }); break;
    default: break;
  }
  return <React.Fragment>{out}</React.Fragment>;
}

/* ───────── decorative shapes ───────── */
const STAR_CLIP = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
function DecoOne({ deco, W, H }) {
  if (deco === "circle-tr") return <div className="p" style={{ width: 560, height: 560, right: -150, top: -150, borderRadius: "50%", background: "rgba(255,255,255,.10)" }}></div>;
  if (deco === "circle-bl") return <div className="p" style={{ width: 520, height: 520, left: -160, bottom: -160, borderRadius: "50%", background: "rgba(255,255,255,.08)" }}></div>;
  if (deco === "ring-tr") return <div className="p" style={{ width: 480, height: 480, right: -120, top: -140, borderRadius: "50%", border: "26px solid rgba(255,255,255,.12)" }}></div>;
  if (deco === "ribbon") return (
    <div className="p" style={{ left: -70, top: 60, width: 360, transform: "rotate(-45deg)", background: "var(--promo)", color: "var(--black-c)", textAlign: "center", fontWeight: 800, fontStyle: "italic", fontSize: 34, padding: "14px 0", boxShadow: "0 8px 20px rgba(0,0,0,.25)" }}>OFERTA</div>
  );
  if (deco === "rays") return (
    <div className="p" style={{ inset: 0, background: "repeating-conic-gradient(from 0deg at 50% 18%, rgba(255,255,255,.07) 0deg 4.2deg, transparent 4.2deg 10deg)", WebkitMaskImage: "radial-gradient(125% 95% at 50% 18%, #000 28%, transparent 76%)", maskImage: "radial-gradient(125% 95% at 50% 18%, #000 28%, transparent 76%)" }}></div>
  );
  if (deco === "stars3") return (
    <div className="p" style={{ top: H * 0.135, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: H > W ? 30 : 24 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: i === 1 ? 74 : 60, height: i === 1 ? 74 : 60, background: "var(--promo)", clipPath: STAR_CLIP, filter: "drop-shadow(0 6px 12px rgba(0,0,0,.22))" }}></div>
      ))}
    </div>
  );
  if (deco === "pennants") {
    const n = 9;
    return (
      <div className="p" style={{ top: 0, left: W * 0.30, right: 0, height: 110 }}>
        <div className="p" style={{ top: 16, left: 0, right: 0, height: 5, borderRadius: 5, background: "rgba(255,255,255,.55)" }}></div>
        <div className="p" style={{ top: 18, left: 0, right: 0, display: "flex", gap: 8 }}>
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 78, clipPath: "polygon(0 0,100% 0,50% 100%)", background: i % 2 ? "#fff" : COL.celeste, boxShadow: "0 6px 10px rgba(0,0,0,.12)" }}></div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
function Deco({ deco, W, H }) {
  if (!deco) return null;
  const toks = String(deco).split(/\s+/).filter(Boolean);
  return <React.Fragment>{toks.map((t, i) => <DecoOne key={i} deco={t} W={W} H={H} />)}</React.Fragment>;
}

/* ───────── photo layers ───────── */
function photoBox(mode, W, H, tall) {
  const m = {
    right: tall ? { right: -10, top: H * 0.30, width: W * 0.66, height: H * 0.40 } : { right: -10, top: H * 0.16, width: W * 0.60, height: H * 0.66 },
    left: tall ? { left: -10, top: H * 0.30, width: W * 0.66, height: H * 0.40 } : { left: -10, top: H * 0.16, width: W * 0.60, height: H * 0.66 },
    center: tall ? { left: W * 0.14, right: W * 0.14, top: H * 0.30, height: H * 0.34 } : { left: W * 0.16, right: W * 0.16, top: H * 0.14, height: H * 0.46 },
    bottom: tall ? { left: W * 0.06, right: W * 0.06, bottom: H * 0.02, height: H * 0.42 } : { left: W * 0.08, right: W * 0.08, bottom: -10, height: H * 0.54 },
    top: tall ? { left: W * 0.10, right: W * 0.10, top: H * 0.10, height: H * 0.34 } : { left: W * 0.14, right: W * 0.14, top: H * 0.05, height: H * 0.40 },
  };
  return m[mode] || m.right;
}

function PhotoLayer({ cfg, mode, W, H, editor }) {
  const v = cfg.photoView || { s: 1, x: 0, y: 0 };
  const tall = H > W;
  const photo = cfg.photo;

  if (mode === "full") {
    if (!photo) return editor ? <Ghost full label="Arrastrá una foto" /> : <div className="p" style={{ inset: 0, background: "var(--black-c)" }}></div>;
    return (
      <div className="p" style={{ inset: 0, overflow: "hidden" }}>
        <img src={photo} alt="" crossOrigin="anonymous" style={{ position: "absolute", left: "50%", top: "50%", width: "100%", height: "100%", objectFit: "cover", transform: `translate(-50%,-50%) translate(${v.x}%, ${v.y}%) scale(${v.s})` }} />
      </div>
    );
  }
  if (mode === "circle-r" || mode === "circle-c" || mode === "circle-t") {
    const size = mode === "circle-c" ? W * 0.52 : mode === "circle-t" ? W * 0.46 : W * 0.50;
    const pos = mode === "circle-c"
      ? { left: "50%", top: tall ? H * 0.30 : "50%", transform: "translate(-50%,-50%)" }
      : mode === "circle-t"
        ? { left: "50%", top: tall ? H * 0.18 : H * 0.14, transform: "translateX(-50%)" }
        : { right: 70, top: "50%", transform: "translateY(-50%)" };
    return (
      <div className="p" style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,.30)", border: "10px solid #fff", ...pos }}>
        {photo
          ? <img src={photo} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${v.x}%, ${v.y}%) scale(${v.s})` }} />
          : (editor ? <GhostInner /> : null)}
      </div>
    );
  }
  const box = photoBox(mode, W, H, tall);
  if (!photo) return editor ? <Ghost box={box} label={"Arrastrá tu\nproducto (PNG)"} /> : null;
  const cover = v.fit === "cover";
  return (
    <div className="p" style={cover
      ? { ...box, overflow: "hidden", borderRadius: 28, boxShadow: "0 26px 50px rgba(0,0,0,.32)" }
      : { ...box }}>
      <img src={photo} alt="" crossOrigin="anonymous" style={{
        width: "100%", height: "100%",
        objectFit: cover ? "cover" : "contain",
        filter: cover ? "none" : "drop-shadow(0 26px 36px rgba(0,0,0,.38))",
        transform: `translate(${v.x}%, ${v.y}%) scale(${v.s})`,
      }} />
    </div>
  );
}

function GhostInner() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(45,41,38,.30)" }}>
      <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
    </div>
  );
}
function Ghost({ box, full, label }) {
  const st = full ? { inset: 0, borderRadius: 0 } : { ...box, borderRadius: 26 };
  return (
    <div className="p" style={{ ...st, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "rgba(255,255,255,.62)", border: "4px dashed rgba(255,255,255,.34)", background: "rgba(255,255,255,.06)", textAlign: "center", padding: 36 }}>
      <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
      <div style={{ fontWeight: 800, fontStyle: "italic", fontSize: 36, lineHeight: 1.05 }}><ML text={label} /></div>
    </div>
  );
}

/* ───────── price button ───────── */
function PriceButton({ cfg, ink, tall }) {
  const pc = cfg.priceColor;
  let bg, fg;
  if (pc && pc !== "auto") {
    bg = BRAND_COL[pc] || "var(--coke-red)";
    fg = (pc === "yellow" || pc === "white") ? "var(--black-c)" : "#fff";
  } else {
    const onLight = ink === "dark";
    bg = onLight ? "var(--coke-red)" : "#fff";
    fg = onLight ? "#fff" : "var(--coke-red)";
  }
  const big = cfg.priceFontSize || (tall ? 100 : 90);
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 14, background: bg, color: fg, padding: tall ? "22px 44px" : "18px 40px", borderRadius: 22, boxShadow: "0 16px 34px rgba(45,41,38,.22)", fontStyle: "italic", fontWeight: 800, lineHeight: 1 }}>
      {cfg.priceEyebrow ? <span style={{ fontSize: Math.round(big * 0.4), opacity: .82 }}>{cfg.priceEyebrow}</span> : null}
      <span style={{ fontSize: big, lineHeight: .9 }}>{cfg.priceMain}</span>
      {cfg.priceUnit ? <span style={{ fontSize: Math.round(big * 0.34), opacity: .78 }}>{cfg.priceUnit}</span> : null}
    </span>
  );
}

function PricePlate({ cfg, ink, tall, fmt }) {
  const pc = cfg.priceColor;
  const big = cfg.priceFontSize || (tall ? 104 : 92);
  const c = inkColors(ink);
  const eyebrow = cfg.priceEyebrow ? <span style={{ fontSize: Math.round(big * 0.4), opacity: .82 }}>{cfg.priceEyebrow}</span> : null;
  const unit = cfg.priceUnit ? <span style={{ fontSize: Math.round(big * 0.34), opacity: .78 }}>{cfg.priceUnit}</span> : null;
  const main = <span style={{ fontSize: big, lineHeight: .9 }}>{cfg.priceMain}</span>;
  const inner = { display: "inline-flex", alignItems: "baseline", gap: 14, fontStyle: "italic", fontWeight: 800, lineHeight: 1 };

  // Shared fill colors
  let bg, fg;
  if (pc && pc !== "auto") {
    bg = BRAND_COL[pc] || "var(--coke-red)";
    fg = (pc === "yellow" || pc === "white") ? "var(--black-c)" : "#fff";
  } else {
    const onLight = ink === "dark";
    bg = onLight ? "var(--coke-red)" : "#fff";
    fg = onLight ? "#fff" : "var(--coke-red)";
  }
  const shadow = "0 16px 34px rgba(45,41,38,.22)";
  const padV = tall ? "24px 54px" : "20px 48px";

  // ── solo: plain colored text, no background ──
  if (fmt === "solo") {
    const col = txCol(pc, null) || (ink === "dark" ? "var(--coke-red)" : "#fff");
    const soloBig = cfg.priceFontSize || (tall ? 150 : 132);
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", color: col }}>
        {cfg.priceEyebrow ? <span style={{ fontWeight: 700, fontStyle: "italic", fontSize: 44, opacity: .85 }}>{cfg.priceEyebrow}</span> : null}
        <span style={{ fontWeight: 800, fontStyle: "italic", fontSize: soloBig, lineHeight: 1 }}>{cfg.priceMain}</span>
        {cfg.priceUnit ? <span style={{ fontWeight: 700, fontStyle: "italic", fontSize: 38, opacity: .85 }}>{cfg.priceUnit}</span> : null}
      </div>
    );
  }

  // ── stack: apilado eyebrow / price / unit ──
  if (fmt === "stack") {
    const col = txCol(pc, null) || (ink === "dark" ? "var(--coke-red)" : "#fff");
    const stackBig = cfg.priceFontSize || (tall ? 150 : 132);
    return (
      <div>
        {cfg.priceEyebrow ? <div style={{ color: c.accent, fontWeight: 800, fontStyle: "italic", fontSize: 38, letterSpacing: ".04em" }}>{cfg.priceEyebrow}</div> : null}
        <div style={{ color: col, fontWeight: 800, fontStyle: "italic", fontSize: stackBig, lineHeight: .86 }}>{cfg.priceMain}</div>
        {cfg.priceUnit ? <div style={{ color: c.sub, fontWeight: 700, fontStyle: "italic", fontSize: 36 }}>{cfg.priceUnit}</div> : null}
      </div>
    );
  }

  // ── strike: con precio anterior tachado ──
  if (fmt === "strike") {
    const col = txCol(pc, null) || (ink === "dark" ? "var(--coke-red)" : "#fff");
    const strikeBig = cfg.priceFontSize || (tall ? 150 : 132);
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
        {cfg.priceStrike ? <span style={{ color: c.muted, fontWeight: 700, fontStyle: "italic", fontSize: 56, textDecoration: "line-through" }}>{cfg.priceStrike}</span> : null}
        <span style={{ color: col, fontWeight: 800, fontStyle: "italic", fontSize: strikeBig, lineHeight: .9 }}>{cfg.priceMain}</span>
        {cfg.priceUnit ? <span style={{ color: c.sub, fontWeight: 700, fontStyle: "italic", fontSize: 36 }}>{cfg.priceUnit}</span> : null}
      </div>
    );
  }

  // ── pill: totalmente redondeado (default) ──
  if (fmt === "pill") {
    return (
      <div><span style={{ ...inner, background: bg, color: fg, padding: padV, borderRadius: 999, boxShadow: shadow }}>{eyebrow}{main}{unit}</span></div>
    );
  }

  // ── rect: rectángulo con radio medio ──
  if (fmt === "rect") {
    return (
      <div><span style={{ ...inner, background: bg, color: fg, padding: padV, borderRadius: 16, boxShadow: shadow }}>{eyebrow}{main}{unit}</span></div>
    );
  }

  // ── sharp: esquinas casi cuadradas ──
  if (fmt === "sharp") {
    return (
      <div><span style={{ ...inner, background: bg, color: fg, padding: padV, borderRadius: 4, boxShadow: shadow }}>{eyebrow}{main}{unit}</span></div>
    );
  }

  // ── recuadro: rectángulo con borde blanco interior ──
  if (fmt === "recuadro") {
    return (
      <div><span style={{ ...inner, background: bg, color: fg, border: "7px solid rgba(255,255,255,.88)", padding: tall ? "17px 40px" : "15px 36px", borderRadius: 16, boxShadow: shadow }}>{eyebrow}{main}{unit}</span></div>
    );
  }

  // fallback → pill
  return (
    <div><span style={{ ...inner, background: bg, color: fg, padding: padV, borderRadius: 999, boxShadow: shadow }}>{eyebrow}{main}{unit}</span></div>
  );
}

function PriceBlock({ cfg, style, ink, tall }) {
  if (!cfg.showPrice) return null;
  if (cfg.priceFormat && cfg.priceFormat !== "auto") {
    return <PricePlate cfg={cfg} ink={ink} tall={tall} fmt={cfg.priceFormat} />;
  }
  const c = inkColors(ink);
  const big = cfg.priceFontSize || (tall ? 150 : 132);
  const mainCol = txCol(cfg.priceColor, null);
  if (style === "tag" || style === "btn" || style === "pill") {
    return <div style={{ alignSelf: ink ? undefined : undefined }}><PriceButton cfg={cfg} ink={ink} tall={tall} /></div>;
  }
  if (style === "strike") return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
      {cfg.priceStrike ? <span style={{ color: c.muted, fontWeight: 700, fontStyle: "italic", fontSize: 56, textDecoration: "line-through" }}>{cfg.priceStrike}</span> : null}
      <span style={{ color: mainCol || c.fg, fontWeight: 800, fontStyle: "italic", fontSize: big, lineHeight: .9 }}>{cfg.priceMain}</span>
    </div>
  );
  if (style === "stack") return (
    <div>
      {cfg.priceEyebrow ? <div style={{ color: c.accent, fontWeight: 800, fontStyle: "italic", fontSize: 38, letterSpacing: ".04em" }}>{cfg.priceEyebrow}</div> : null}
      <div style={{ color: mainCol || c.fg, fontWeight: 800, fontStyle: "italic", fontSize: big, lineHeight: .86 }}>{cfg.priceMain}</div>
      {cfg.priceUnit ? <div style={{ color: c.sub, fontWeight: 700, fontStyle: "italic", fontSize: 36 }}>{cfg.priceUnit}</div> : null}
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
      {cfg.priceEyebrow ? <span style={{ color: c.sub, fontWeight: 700, fontStyle: "italic", fontSize: 42 }}>{cfg.priceEyebrow}</span> : null}
      <span style={{ color: mainCol || (ink === "dark" ? "var(--coke-red)" : "#fff"), fontWeight: 800, fontStyle: "italic", fontSize: big, lineHeight: 1 }}>{cfg.priceMain}</span>
      {cfg.priceUnit ? <span style={{ color: c.sub, fontWeight: 700, fontStyle: "italic", fontSize: 36 }}>{cfg.priceUnit}</span> : null}
    </div>
  );
}

/* ───────── price burst (floated circle) — DRAGGABLE ───────── */
function PriceBurst({ cfg, W, H, pos }) {
  const { off, isEditor, isSelected, isLocked, elRef, onMouseDown, onDoubleClick, onClick } = useDragOffset("burstOff");
  if (!cfg.showPrice) return null;
  const S = safeInsets(W, H);
  const tall = H > W;
  const size = tall ? 460 : 400;
  const topR = Math.max(tall ? 120 : 90, S.top + 14);
  let botL = Math.max(90, S.bottom + 14);
  if (S.kind === "feed") botL = Math.max(botL, S.blH + 16);
  const place = pos === "c" ? { left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-7deg)" }
    : pos === "bl" ? { left: Math.max(56, S.left), bottom: botL, transform: "rotate(-7deg)" }
      : { right: Math.max(56, S.right), top: topR, transform: "rotate(-7deg)" };
  const baseTrf = place.transform || "";
  const finalTrf = `${baseTrf} translate(${off.x}px,${off.y}px)`;
  return (
    <div
      ref={elRef}
      data-offkey="burstOff"
      className={["p", isEditor && "drag-el", isSelected && "drag-selected", isLocked && "drag-locked"].filter(Boolean).join(" ")}
      style={{ width: size, height: size, borderRadius: "50%", background: "var(--promo)", boxShadow: "0 22px 44px rgba(0,0,0,.30)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", ...place, transform: finalTrf }}
      onMouseDown={isEditor && !isLocked ? onMouseDown : undefined}
      onDoubleClick={isEditor && !isLocked ? onDoubleClick : undefined}
      onClick={isEditor ? onClick : undefined}
      title={isLocked ? "Bloqueado" : isEditor ? "Arrastrá precio circular · clic para seleccionar" : undefined}
    >
      {cfg.priceEyebrow ? <span style={{ color: "var(--black-c)", fontWeight: 800, fontStyle: "italic", fontSize: 38, opacity: .8 }}>{cfg.priceEyebrow}</span> : null}
      <span style={{ color: txCol(cfg.priceColor, "var(--coke-red)"), fontWeight: 900, fontStyle: "italic", fontSize: cfg.priceFontSize || (tall ? 132 : 116), lineHeight: .82 }}><ML text={cfg.priceMain} /></span>
      {cfg.priceUnit ? <span style={{ color: "var(--black-c)", fontWeight: 700, fontStyle: "italic", fontSize: 34 }}>{cfg.priceUnit}</span> : null}
    </div>
  );
}

/* ───────── badge — DRAGGABLE ───────── */
function badgeClass(style) { return "eyebrow-tag " + (style || "yellow"); }
function FloatBadge({ cfg, pos, W, H }) {
  const { off, isEditor, isSelected, isLocked, elRef, onMouseDown, onDoubleClick, onClick } = useDragOffset("badgeOff");
  if (!cfg.badgeShow || !cfg.badge) return null;
  const S = safeInsets(W, H);
  const tall = H > W;
  const top = Math.max(tall ? 84 : 64, S.top + 14);
  const place = pos === "tl" ? { top, left: Math.max(56, S.left) } : { top, right: Math.max(56, S.right) };
  const trf = `translate(${off.x}px,${off.y}px)`;
  const shape = cfg.badgeShape || "diag";
  const isDiag = shape === "diag";
  const shapeInline = shape === "pill" ? { borderRadius: 999 } : shape === "sharp" ? { borderRadius: 3 } : shape === "rect" ? { borderRadius: 10 } : {};
  return (
    <div
      ref={elRef}
      data-offkey="badgeOff"
      className={["p", isDiag && "diag", isEditor && "drag-el", isSelected && "drag-selected", isLocked && "drag-locked"].filter(Boolean).join(" ")}
      style={{ ...place, transform: trf }}
      onMouseDown={isEditor && !isLocked ? onMouseDown : undefined}
      onDoubleClick={isEditor && !isLocked ? onDoubleClick : undefined}
      onClick={isEditor ? onClick : undefined}
      title={isLocked ? "Bloqueado" : isEditor ? "Arrastrá etiqueta · clic para seleccionar" : undefined}
    >
      <span className={badgeClass(cfg.badgeStyle)} style={{ ...(cfg.badgeFontSize ? { fontSize: cfg.badgeFontSize } : {}), ...shapeInline }}><ML text={cfg.badge} /></span>
    </div>
  );
}

/* ───────── logo — DRAGGABLE ───────── */
function LogoLayer({ cfg, ink, W, H }) {
  const { off, isEditor, isSelected, isLocked, elRef, onMouseDown, onDoubleClick, onClick } = useDragOffset("logoOff");
  if (cfg.logoShow === false) return null;
  const S = safeInsets(W, H);
  const tall = H > W;
  const pos = cfg.logoPos || "tl";
  const vEdge = pos[0] || "t";
  const hEdge = pos[1] || "l";
  const src = logoSrc(ink, cfg.logoColor);
  const size = cfg.logoSize || 1;
  const baseH = Math.round((tall ? 104 : 88) * size);
  const topOff = Math.max(tall ? 70 : 56, S.top + 12);
  const botOff = Math.max(tall ? 70 : 56, S.bottom + 12);
  const sideL = Math.max(tall ? 70 : 56, S.left + 8);
  const sideR = Math.max(tall ? 70 : 56, S.right + 8);
  const st = {};
  if (vEdge === "b") {
    st.bottom = (S.kind === "feed" && hEdge !== "r") ? Math.max(botOff, S.blH + 12) : botOff;
  } else {
    st.top = topOff;
  }
  if (hEdge === "c") { st.left = 0; st.right = 0; st.textAlign = "center"; }
  else if (hEdge === "r") { st.right = sideR; }
  else { st.left = sideL; }
  const imgStyle = { height: baseH, width: "auto" };
  if (hEdge === "c") { imgStyle.margin = "0 auto"; imgStyle.display = "inline-block"; }
  const trf = `translate(${off.x}px,${off.y}px)`;
  return (
    <div
      ref={elRef}
      data-offkey="logoOff"
      className={["p", isEditor && "drag-el", isSelected && "drag-selected", isLocked && "drag-locked"].filter(Boolean).join(" ")}
      style={{ ...st, transform: trf }}
      onMouseDown={isEditor && !isLocked ? onMouseDown : undefined}
      onDoubleClick={isEditor && !isLocked ? onDoubleClick : undefined}
      onClick={isEditor ? onClick : undefined}
      title={isLocked ? "Bloqueado" : isEditor ? "Arrastrá logo · clic para seleccionar" : undefined}
    >
      <img className="placa-logo" src={src} alt="" crossOrigin="anonymous" style={imgStyle} />
    </div>
  );
}

/* ───────── CTA renderer — respeta cfg.ctaFormat o s.cta del template ──────── */
function CtaEl({ cfg, effectiveFmt, ink, tall }) {
  const text = cfg.cta;
  const ctaSize = cfg.ctaFontSize || (tall ? 50 : 42);
  const colToken = cfg.ctaColor;
  const c = inkColors(ink);

  if (effectiveFmt === "text") {
    return <span style={{ color: txCol(colToken, c.sub), fontWeight: 700, fontStyle: "italic", fontSize: ctaSize }}>{text}</span>;
  }

  const bg = txCol(colToken, ink === "dark" ? "var(--coke-red)" : "#fff");
  const fg = (colToken === "yellow" || colToken === "white") ? "var(--black-c)" : (ink === "dark" ? "#fff" : "var(--coke-red)");
  const pad = tall ? "22px 48px" : "18px 42px";
  const base = { fontWeight: 800, fontStyle: "italic", fontSize: ctaSize, display: "inline-block", lineHeight: 1 };
  const shadow = "0 14px 30px rgba(45,41,38,.22)";

  if (effectiveFmt === "outline") {
    return <span style={{ ...base, background: "transparent", border: `4px solid ${bg}`, color: bg, padding: tall ? "18px 44px" : "14px 38px", borderRadius: 999 }}>{text}</span>;
  }
  const radius = effectiveFmt === "sharp" ? 4 : effectiveFmt === "rect" ? 16 : 999;
  return <span style={{ ...base, background: bg, color: fg, padding: pad, borderRadius: radius, boxShadow: shadow }}>{text}</span>;
}

/* ───────── content stack — cada elemento DRAGGABLE individualmente ───────── */
function ContentStack({ cfg, s, W, H }) {
  const tall = H > W;
  const c = inkColors(s.ink);
  const S = safeInsets(W, H);
  const st = { position: "absolute", display: "flex", flexDirection: "column", zIndex: 5, gap: tall ? 30 : 26 };
  if (s.stackH === "l") { st.left = S.left; st.alignItems = "flex-start"; st.textAlign = "left"; if (s.stackW) st.width = W * s.stackW; }
  else if (s.stackH === "r") { st.right = S.right; st.alignItems = "flex-end"; st.textAlign = "right"; if (s.stackW) st.width = W * s.stackW; }
  else { st.left = S.left; st.right = S.right; st.alignItems = "center"; st.textAlign = "center"; }
  if (s.stackV === "t") {
    st.top = Math.max(tall ? 200 : 124, S.top + (S.kind === "story" ? 140 : 12));
  } else if (s.stackV === "m") {
    st.top = "50%"; st.transform = "translateY(-50%)";
  } else {
    let bottom = Math.max(tall ? 150 : 94, S.bottom + 12);
    if (S.kind === "feed" && s.stackH !== "r") bottom = Math.max(bottom, S.blH + 28);
    st.bottom = bottom;
  }

  const titleSize = cfg.titleFontSize || (tall ? { m: 104, l: 132, xl: 168 } : { m: 88, l: 116, xl: 150 })[s.title] || 116;
  const titleCol = txCol(cfg.titleColor, c.fg);
  const subCol = txCol(cfg.subColor, c.sub);
  // handle @ eliminado

  return (
    <div style={st}>
      {s.badge === "inline" && cfg.badgeShow && cfg.badge ? (
        <span className={badgeClass(cfg.badgeStyle)} style={{ fontSize: cfg.badgeFontSize || 36, padding: "10px 24px" }}><ML text={cfg.badge} /></span>
      ) : null}
      {txOn(cfg, "title") ? (
        <DragHandle offKey="titleOff">
          <div className="big-italic" style={{ fontSize: titleSize, color: titleCol, lineHeight: .94 }}><ML text={cfg.title} /></div>
        </DragHandle>
      ) : null}
      {s.sub && cfg.subtitle && txOn(cfg, "sub") ? (
        <DragHandle offKey="subOff">
          <div style={{ color: subCol, fontWeight: 600, fontStyle: "italic", fontSize: cfg.subFontSize || (tall ? 48 : 40), lineHeight: 1.32 }}><ML text={cfg.subtitle} /></div>
        </DragHandle>
      ) : null}
      {s.price && s.price !== "none" && s.price !== "burst" ? (
        <DragHandle offKey="priceOff">
          <PriceBlock cfg={cfg} style={s.price} ink={s.ink} tall={tall} />
        </DragHandle>
      ) : null}
      {(()=>{
        const ef = (cfg.ctaFormat && cfg.ctaFormat !== "auto") ? cfg.ctaFormat : (s.cta || null);
        if (!cfg.cta || !txOn(cfg, "cta") || !ef || ef === "none") return null;
        return (
          <DragHandle offKey="ctaOff">
            <CtaEl cfg={cfg} effectiveFmt={ef} ink={s.ink} tall={tall} />
          </DragHandle>
        );
      })()}
    </div>
  );
}

/* ───────── list / grid (multi-item) ───────── */
function ListPlaca({ cfg, s, W, H }) {
  const ctx = React.useContext(PlacaEditorCtx);
  const editor = !!(ctx && ctx.editor);
  const tall = H > W;
  const rows = cfg.rows || [];
  const c = inkColors(s.ink);
  const S = safeInsets(W, H);
  const sideL = Math.max(56, S.left), sideR = Math.max(56, S.right);
  const titleTop = Math.max(tall ? 300 : 220, S.top + (S.kind === "story" ? 150 : 14));
  let rowsBottom = Math.max(90, S.bottom + 14);
  if (S.kind === "feed") rowsBottom = Math.max(rowsBottom, S.blH + 20);
  return (
    <React.Fragment>
      {cfg.bgImage ? <FullBgPhoto cfg={cfg} ink={s.ink} /> : <BgBlocks bg={cfg.bg} block={s.block} blockColor={s.blockColor} W={W} H={H} />}
      <Deco deco={s.deco} W={W} H={H} />
      <LogoLayer cfg={cfg} ink={s.ink} W={W} H={H} />
      <FloatBadge cfg={cfg} pos={s.badge === "tl" ? "tl" : "tr"} W={W} H={H} />
      <div className="p" style={{ top: titleTop, left: sideL, right: sideR }}>
        {txOn(cfg, "title") ? (
          <DragHandle offKey="titleOff">
            <div className="big-italic" style={{ fontSize: cfg.titleFontSize || (tall ? 132 : 104), color: txCol(cfg.titleColor, c.fg), lineHeight: .94 }}><ML text={cfg.title} /></div>
          </DragHandle>
        ) : null}
      </div>
      <div className="p" style={s.kind === "grid"
        ? { left: sideL, right: sideR, bottom: rowsBottom, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }
        : { left: sideL, right: sideR, bottom: rowsBottom }}>
        {rows.map((r, i) => {
          const rowNameCol = txCol(cfg.titleColor, c.fg);
          const rowPriceCol = txCol(cfg.priceColor, s.ink === "dark" ? "var(--coke-red)" : "var(--promo)");
          return s.kind === "grid" ? (
          <div key={i} style={{ background: s.ink === "dark" ? "#fff" : "rgba(255,255,255,.12)", borderRadius: 16, padding: "26px 28px" }}>
            <div style={{ fontWeight: 700, fontStyle: "italic", fontSize: 44, color: rowNameCol }}>{r.name}</div>
            <div style={{ fontWeight: 800, fontStyle: "italic", fontSize: 64, color: rowPriceCol }}>{r.price}</div>
          </div>
        ) : (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, borderBottom: `3px solid ${s.ink === "dark" ? "var(--ink-300)" : "rgba(255,255,255,.25)"}`, padding: "22px 0" }}>
            <span style={{ flex: 1, fontWeight: 700, fontStyle: "italic", fontSize: 52, color: rowNameCol }}>{r.name}</span>
            {r.flag ? <span style={{ background: "var(--promo)", color: "var(--black-c)", fontWeight: 800, fontStyle: "italic", fontSize: 32, padding: "6px 18px", borderRadius: 8 }}>{r.flag}</span> : null}
            <span style={{ fontWeight: 800, fontStyle: "italic", fontSize: 64, color: rowPriceCol }}>{r.price}</span>
          </div>
        );})}
      </div>
      {editor && ctx && ctx.showGrid ? <ThirdsGrid W={W} H={H} /> : null}
      {editor ? <SnapGuidesOverlay /> : null}
    </React.Fragment>
  );
}

/* ───────── full-bleed background photo ───────── */
function FullBgPhoto({ cfg, ink }) {
  const v = cfg.bgView || { s: 1, x: 0, y: 0 };
  const scrim = ink !== "dark"
    ? "linear-gradient(180deg, rgba(20,18,16,.32) 0%, rgba(20,18,16,.05) 38%, rgba(20,18,16,.68) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.04) 40%, rgba(255,255,255,.58) 100%)";
  return (
    <React.Fragment>
      <div className="p" style={{ inset: 0, overflow: "hidden", background: "var(--black-c)" }}>
        <img src={cfg.bgImage} alt="" crossOrigin="anonymous" style={{ position: "absolute", left: "50%", top: "50%", width: "100%", height: "100%", objectFit: "cover", transform: `translate(-50%,-50%) translate(${v.x}%, ${v.y}%) scale(${v.s})` }} />
      </div>
      <div className="p" style={{ inset: 0, background: scrim }}></div>
    </React.Fragment>
  );
}

/* ───────── composite ───────── */
function CompositePlaca({ cfg, s, W, H, editor }) {
  const ctx = React.useContext(PlacaEditorCtx);
  const bgPhoto = !!cfg.bgImage;
  return (
    <React.Fragment>
      {bgPhoto ? <FullBgPhoto cfg={cfg} ink={s.ink} /> : <BgBlocks bg={cfg.bg} block={s.block} blockColor={s.blockColor} W={W} H={H} />}
      <Deco deco={s.deco} W={W} H={H} />
      {!bgPhoto && s.photo && s.photo !== "none" ? <PhotoLayer cfg={cfg} mode={s.photo} W={W} H={H} editor={editor} /> : null}
      {!bgPhoto && s.photo === "full" && s.grad ? <div className={"p " + (H > W ? "placa-grad-full" : "placa-grad-bottom")}></div> : null}
      <LogoLayer cfg={cfg} ink={s.ink} W={W} H={H} />
      {s.badge === "tr" || s.badge === "tl" ? <FloatBadge cfg={cfg} pos={s.badge} W={W} H={H} /> : null}
      {s.price === "burst" ? <PriceBurst cfg={cfg} W={W} H={H} pos={s.burstPos || "tr"} /> : null}
      <ContentStack cfg={cfg} s={s} W={W} H={H} />
      {editor && ctx && ctx.showGrid ? <ThirdsGrid W={W} H={H} /> : null}
      {editor ? <SnapGuidesOverlay /> : null}
    </React.Fragment>
  );
}

const STRUCT_DEFAULT = {
  block: null, blockColor: "dark", photo: "none", grad: false, logo: "tl",
  badge: "tr", stackV: "b", stackH: "l", stackW: 0.62, title: "l", sub: false,
  price: "btn", cta: "none", ink: "light", deco: null, kind: "composite", burstPos: "tr",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Placa — raíz. Provee el contexto de drag a todos los hijos.
   Nuevas props: onMove(offKey, {x,y}) y editorScale (factor de escala del
   preview, necesario para convertir píxeles de pantalla a px del lienzo).
   ═══════════════════════════════════════════════════════════════════════════ */
function Placa({ cfg, W, H, editor, onMove, editorScale,
  selectedEl, setSelectedEl, lockedEls, setSnapGuides, setLiveCoords,
  snapTargets, placaRef, showGrid, snapGuides }) {
  const ctxVal = {
    cfg, scale: editorScale || 1, onMove: onMove || null, editor: !!editor,
    selectedEl: selectedEl || null,
    setSelectedEl: setSelectedEl || null,
    lockedEls: lockedEls || new Set(),
    setSnapGuides: setSnapGuides || null,
    setLiveCoords: setLiveCoords || null,
    snapTargets: snapTargets || [],
    placaRef: placaRef || null,
    showGrid: !!showGrid,
    snapGuides: snapGuides || [],
    W, H,
  };
  const s = { ...STRUCT_DEFAULT, ...(cfg.struct || {}) };
  const sEff = cfg.bgImage ? { ...s, ink: cfg.bgInk || "light" } : s;
  const base = COL[cfg.bg] || COL.red;
  if (s.kind === "list" || s.kind === "grid") {
    return (
      <PlacaEditorCtx.Provider value={ctxVal}>
        <div className="placa" style={{ width: W, height: H, background: base }}>
          <ListPlaca cfg={cfg} s={sEff} W={W} H={H} />
        </div>
      </PlacaEditorCtx.Provider>
    );
  }
  return (
    <PlacaEditorCtx.Provider value={ctxVal}>
      <div className="placa" style={{ width: W, height: H, background: base }}>
        <CompositePlaca cfg={cfg} s={sEff} W={W} H={H} editor={editor} />
      </div>
    </PlacaEditorCtx.Provider>
  );
}

Object.assign(window, { Placa, STRUCT_DEFAULT, safeInsets });
