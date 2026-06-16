/* global React */
/* =========================================================================
   Kiosco Enjoy — Motor de REELS (9:16 animado, canvas 2D)
   - Plantillas animadas deterministas: cada cuadro es función del tiempo t (s).
   - Mismo cfg que las placas (title, subtitle, precio, badge, cta, handle…).
   - Exporta a MP4 (WebCodecs + mp4-muxer) con fallback a MediaRecorder/WebM.
   Expone: window.REEL_TEMPLATES, REEL_CATS, ReelStage, ReelThumb,
           exportReelVideo, REEL_DUR, REEL_W, REEL_H
   ========================================================================= */
(function () {
  const { useRef, useEffect, useState } = React;

  const REEL_W = 1080, REEL_H = 1920, REEL_DUR = 5.4; // segundos
  const FONT = '"Exo 2"';

  /* paleta resuelta a hex (canvas no entiende var(--*)) */
  const C = {
    red: "#F40000", redDeep: "#C20000", red700: "#A30202",
    dark: "#2D2926", ink: "#2D2926", white: "#F0F0F1", pure: "#FFFFFF",
    yellow: "#FFD400", celeste: "#5AA0DC", celesteDeep: "#2E6CB0",
    sub: "rgba(255,255,255,.88)", subDark: "#5C5550",
    cream: "#E7E4E0",
  };

  /* ───────── logos precargados como Image ───────── */
  const LOGOS = {};
  let logosReady = false;
  function preloadLogos() {
    const r = window.__resources || {};
    const map = { white: r.logoWhite || "assets/logo-white.svg", red: r.logoRed || "assets/logo-red.svg", black: r.logoBlack || "assets/logo-black.svg" };
    const proms = Object.keys(map).map((k) => new Promise((res) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => { LOGOS[k] = img; res(); };
      img.onerror = () => res();
      img.src = map[k];
    }));
    return Promise.all(proms).then(() => { logosReady = true; });
  }
  preloadLogos();
  function logoFor(ink, color) {
    let which = color;
    if (!which || which === "auto") which = ink === "dark" ? "red" : "white";
    return LOGOS[which === "red" ? "red" : which === "black" ? "black" : "white"] || LOGOS.white;
  }

  /* ───────── easing & timeline ───────── */
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
  const easeOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  // progreso eased de t dentro de [s,e]
  function seg(t, s, e, ease) { const p = clamp01((t - s) / (e - s)); return (ease || easeOutCubic)(p); }
  // aparición que también sale al final del loop (in/out)
  function inout(t, s, e, dur, hold) {
    hold = hold == null ? 0.45 : hold;
    const ins = seg(t, s, e, easeOutCubic);
    const out = 1 - seg(t, dur - hold, dur - 0.08, easeOutCubic);
    return Math.min(ins, out);
  }

  /* ───────── primitivas de dibujo ───────── */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function setF(ctx, weight, size, italic) {
    ctx.font = (italic ? "italic " : "") + weight + " " + size + 'px ' + FONT;
  }
  // parte un texto (respeta \n) en líneas que entran en maxW con el font activo
  function wrap(ctx, text, maxW) {
    const out = [];
    (text || "").split("\n").forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(""); return; }
      let line = words[0];
      for (let i = 1; i < words.length; i++) {
        const test = line + " " + words[i];
        if (ctx.measureText(test).width > maxW) { out.push(line); line = words[i]; }
        else line = test;
      }
      out.push(line);
    });
    return out;
  }
  function drawLogoImg(ctx, img, cx, y, h, anchor) {
    if (!img) return;
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.55;
    const w = h * ratio;
    let x = cx - w / 2;
    if (anchor === "l") x = cx; else if (anchor === "r") x = cx - w;
    ctx.drawImage(img, x, y, w, h);
    return w;
  }
  // estrella (sol/Mundial)
  function star(ctx, cx, cy, R, fill, rot) {
    const spikes = 5, inner = R * 0.42;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0);
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? R : inner;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  }

  /* ───────── bloques reutilizables (componen las plantillas) ───────── */
  // logo en la franja segura superior, según cfg.logoPos (h o c) e ink
  function blockLogo(ctx, t, cfg, ink) {
    if (cfg.logoShow === false) return;
    const a = inout(t, 0.25, 0.95, REEL_DUR);
    if (a <= 0.001) return;
    const img = logoFor(ink, cfg.logoColor);
    const h = 120 * (cfg.logoSize || 1);
    const pos = cfg.logoPos || "tc";
    const hEdge = pos[1] || "c";
    let cx = REEL_W / 2, anchor = "c";
    if (hEdge === "l") { cx = 96; anchor = "l"; }
    else if (hEdge === "r") { cx = REEL_W - 96; anchor = "r"; }
    const y = 250 - (1 - a) * 26;
    ctx.save(); ctx.globalAlpha = a; drawLogoImg(ctx, img, cx, y, h, anchor); ctx.restore();
  }

  function badgeColors(style, ink) {
    if (style === "yellow") return { bg: C.yellow, fg: C.dark };
    if (style === "celeste") return { bg: C.celeste, fg: C.pure };
    if (style === "white") return { bg: C.pure, fg: C.red };
    if (style === "red") return { bg: C.red, fg: C.pure };
    return ink === "dark" ? { bg: C.red, fg: C.pure } : { bg: C.yellow, fg: C.dark };
  }
  // etiqueta tipo píldora/diagonal que “estalla”
  function blockBadge(ctx, t, cfg, ink, cy) {
    if (cfg.badgeShow === false || !cfg.badge) return 0;
    const a = inout(t, 0.55, 1.05, REEL_DUR);
    if (a <= 0.001) return 0;
    const pop = seg(t, 0.55, 1.15, easeOutBack);
    const bc = badgeColors(cfg.badgeStyle, ink);
    setF(ctx, 800, 52, true);
    const txt = cfg.badge.toUpperCase();
    const tw = ctx.measureText(txt).width;
    const padX = 40, h = 88, w = tw + padX * 2;
    ctx.save();
    ctx.translate(REEL_W / 2, cy);
    ctx.rotate(-0.045);
    ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
    ctx.globalAlpha = a;
    ctx.shadowColor = "rgba(0,0,0,.22)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
    rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = bc.bg; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = bc.fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    setF(ctx, 800, 52, true);
    ctx.fillText(txt, 0, 4);
    ctx.restore();
    return h;
  }

  // título cinético: palabras que suben + aparecen escalonadas
  function blockTitle(ctx, t, cfg, color, cy, opt) {
    opt = opt || {};
    const size = opt.size || 132;
    const maxW = opt.maxW || REEL_W * 0.78;
    setF(ctx, 800, size, true);
    const lines = wrap(ctx, cfg.title || "", maxW);
    const lh = size * 1.04;
    let idx = 0; let totalWords = 0;
    const lineWords = lines.map((ln) => { const ws = ln ? ln.split(" ") : [""]; totalWords += ws.length; return ws; });
    const startY = cy - (lines.length - 1) * lh / 2;
    const base = opt.start || 0.85, stepW = 0.085;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    lineWords.forEach((ws, li) => {
      // ancho total de la línea para centrar palabra a palabra
      const widths = ws.map((w) => ctx.measureText(w + " ").width);
      const lineW = widths.reduce((s, w) => s + w, 0) - ctx.measureText(" ").width;
      let x = REEL_W / 2 - lineW / 2;
      ws.forEach((w, wi) => {
        const s = base + idx * stepW;
        const ap = inout(t, s, s + 0.5, REEL_DUR, 0.5);
        const ry = (1 - seg(t, s, s + 0.55, easeOutCubic)) * 34;
        ctx.save();
        ctx.globalAlpha = ap;
        if (opt.shadow) { ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; }
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.fillText(w, x, startY + li * lh + ry);
        ctx.restore();
        x += widths[wi]; idx++;
      });
    });
    return { bottom: startY + (lines.length - 1) * lh + lh / 2, lines: lines.length };
  }

  function blockSubtitle(ctx, t, cfg, color, cy, maxW) {
    if (!cfg.subtitle) return;
    const a = inout(t, 1.25, 1.8, REEL_DUR);
    if (a <= 0.001) return;
    setF(ctx, 600, 50, false);
    const lines = wrap(ctx, cfg.subtitle, maxW || REEL_W * 0.74);
    const lh = 64, ry = (1 - seg(t, 1.25, 1.85, easeOutCubic)) * 18;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    lines.forEach((ln, i) => ctx.fillText(ln, REEL_W / 2, cy + i * lh + ry));
    ctx.restore();
    return cy + (lines.length - 1) * lh;
  }

  // precio que estalla (overshoot)
  function blockPrice(ctx, t, cfg, ink, cy, opt) {
    if (!cfg.showPrice) return 0;
    opt = opt || {};
    const a = inout(t, 1.55, 2.05, REEL_DUR);
    if (a <= 0.001) return 0;
    const pop = seg(t, 1.55, 2.2, easeOutBack);
    const onWhite = ink === "dark";
    const pillBg = opt.pillBg || (onWhite ? C.red : C.pure);
    const pillFg = opt.pillFg || (onWhite ? C.pure : C.red);
    setF(ctx, 800, 150, true);
    const main = cfg.priceMain || "";
    const mw = ctx.measureText(main).width;
    setF(ctx, 800, 46, true);
    const eb = (cfg.priceEyebrow || "").toUpperCase();
    const ew = eb ? ctx.measureText(eb).width + 24 : 0;
    const unit = cfg.priceUnit || "";
    const uw = unit ? ctx.measureText(unit).width + 20 : 0;
    const padX = 56, h = 196, w = Math.max(mw + ew + uw + padX * 2, 280);
    ctx.save();
    ctx.translate(REEL_W / 2, cy);
    ctx.scale(0.7 + 0.3 * pop, 0.7 + 0.3 * pop);
    ctx.globalAlpha = a;
    ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = pillBg; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.textBaseline = "middle";
    let x = -w / 2 + padX;
    ctx.textAlign = "left";
    if (eb) { setF(ctx, 800, 46, true); ctx.fillStyle = pillFg; ctx.globalAlpha = a * 0.85; ctx.fillText(eb, x, -4); x += ew; ctx.globalAlpha = a; }
    setF(ctx, 800, 150, true); ctx.fillStyle = pillFg; ctx.fillText(main, x, 2); x += mw + 12;
    if (unit) { setF(ctx, 700, 46, true); ctx.globalAlpha = a * 0.8; ctx.fillText(unit, x, 36); }
    ctx.restore();
    return h;
  }

  function blockCta(ctx, t, cfg, color, accent, cy) {
    const a = inout(t, 2.1, 2.6, REEL_DUR, 0.4);
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (cfg.cta) {
      setF(ctx, 700, 50, true);
      const tw = ctx.measureText(cfg.cta).width;
      const padX = 44, h = 96, w = tw + padX * 2;
      const ry = (1 - seg(t, 2.1, 2.7, easeOutCubic)) * 14;
      rr(ctx, REEL_W / 2 - w / 2, cy - h / 2 + ry, w, h, 999); ctx.fillStyle = accent; ctx.fill();
      ctx.fillStyle = (accent === C.yellow) ? C.dark : (accent === C.pure || accent === C.white || accent === "#fff") ? C.red : C.pure;
      ctx.fillText(cfg.cta, REEL_W / 2, cy + 4 + ry);
      cy += h / 2 + 56;
    }
    if (cfg.handle) {
      setF(ctx, 600, 40, false);
      ctx.fillStyle = color; ctx.globalAlpha = a * 0.9;
      ctx.fillText(cfg.handle, REEL_W / 2, cy);
    }
    ctx.restore();
  }

  // barra de progreso fina (acento de movimiento, dentro de zona segura)
  function blockProgress(ctx, t, color) {
    const p = clamp01(t / (REEL_DUR - 0.2));
    const y = 196, x0 = 96, x1 = REEL_W - 96;
    ctx.save();
    ctx.globalAlpha = 0.35; ctx.fillStyle = color;
    rr(ctx, x0, y, x1 - x0, 7, 4); ctx.fill();
    ctx.globalAlpha = 0.95;
    rr(ctx, x0, y, (x1 - x0) * p, 7, 4); ctx.fill();
    ctx.restore();
  }

  /* ───────── fondos animados ───────── */
  function bgSolid(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, REEL_W, REEL_H); }
  // círculos suaves que respiran
  function bgBubbles(ctx, t, base, accent) {
    bgSolid(ctx, base);
    const br = 1 + Math.sin(t * 0.9) * 0.04;
    ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(REEL_W * 0.86, REEL_H * 0.12, 360 * br, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(REEL_W * 0.12, REEL_H * 0.9, 420 * br, 0, 7); ctx.fill();
    ctx.restore();
  }
  // barrido diagonal de entrada
  function bgDiagWipe(ctx, t, base, top) {
    bgSolid(ctx, base);
    const p = seg(t, 0, 0.6, easeInOut);
    ctx.save();
    ctx.fillStyle = top;
    ctx.beginPath();
    const yy = REEL_H * (1.15 - p * 1.15);
    ctx.moveTo(0, yy); ctx.lineTo(REEL_W, yy - 220); ctx.lineTo(REEL_W, REEL_H + 10); ctx.lineTo(0, REEL_H + 10); ctx.closePath();
    ctx.fill(); ctx.restore();
  }
  // franjas argentinas que entran lateralmente + sol tenue
  function bgArgentina(ctx, t, base) {
    bgSolid(ctx, base);
    // rayos
    ctx.save();
    ctx.translate(REEL_W / 2, REEL_H * 0.2);
    ctx.globalAlpha = 0.06 + 0.02 * Math.sin(t * 1.2);
    for (let i = 0; i < 36; i++) {
      ctx.rotate((Math.PI * 2) / 36);
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, REEL_H); ctx.lineTo(-40, REEL_H); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function argStripesBand(ctx, t, y, h) {
    const p = seg(t, 0.1, 0.7, easeOutCubic);
    const w = REEL_W * p;
    ctx.save();
    ctx.fillStyle = C.celeste; ctx.fillRect(0, y, w, h / 3);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, y + h / 3, w, h / 3);
    ctx.fillStyle = C.celeste; ctx.fillRect(0, y + 2 * h / 3, w, h / 3);
    ctx.restore();
  }

  /* =====================================================================
     PLANTILLAS — cada una: { id, name, cat, ink, draw(ctx,t,cfg) }
     ink: 'light' (texto claro sobre fondo oscuro/rojo) | 'dark'
     ===================================================================== */
  /* =====================================================================
     MOTOR DECLARATIVO — fondos + estilos de título/precio se combinan en
     plantillas. Cada plantilla es una receta { bg, title, price, deco… }.
     ===================================================================== */
  function hexA(hex, a){ if(!hex || hex[0] !== '#') return hex; var n=parseInt(hex.slice(1),16); var r=(n>>16)&255,g=(n>>8)&255,b=n&255; return 'rgba('+r+','+g+','+b+','+a+')'; }

  function drawBg(ctx, t, bg){
    var base = bg.base, ac = bg.accent || '#FFFFFF';
    switch (bg.t){
      case 'bubbles': bgBubbles(ctx, t, base, ac); break;
      case 'diag': bgDiagWipe(ctx, t, base, ac); break;
      case 'arg': bgArgentina(ctx, t, base); break;
      case 'spot': { bgSolid(ctx, base); var g=ctx.createRadialGradient(REEL_W/2, REEL_H*0.34, 60, REEL_W/2, REEL_H*0.34, REEL_H*0.62); g.addColorStop(0, hexA(ac,0.30)); g.addColorStop(1, hexA(ac,0)); ctx.fillStyle=g; ctx.fillRect(0,0,REEL_W,REEL_H); break; }
      case 'stripe': { bgSolid(ctx, base); var off=(t*60)%190; ctx.save(); ctx.globalAlpha=0.07; ctx.fillStyle=ac; for(var x=-220+off; x<REEL_W+220; x+=190){ ctx.save(); ctx.translate(x,0); ctx.rotate(0.32); ctx.fillRect(0,-220,72,REEL_H+440); ctx.restore(); } ctx.restore(); break; }
      case 'grid': { bgSolid(ctx, base); var gp=74, o=(t*16)%gp; ctx.save(); ctx.globalAlpha=0.12; ctx.fillStyle=ac; for(var yy=-gp+o; yy<REEL_H+gp; yy+=gp) for(var xx=-gp+o; xx<REEL_W+gp; xx+=gp){ ctx.beginPath(); ctx.arc(xx,yy,4,0,7); ctx.fill(); } ctx.restore(); break; }
      case 'rings': { bgSolid(ctx, base); ctx.save(); ctx.globalAlpha=0.12; ctx.strokeStyle=ac; ctx.lineWidth=26; for(var ri=0;ri<5;ri++){ var r0=((t*70)+ri*160)%(REEL_H*0.85); ctx.beginPath(); ctx.arc(REEL_W*0.5, REEL_H*0.32, 50+r0, 0, 7); ctx.stroke(); } ctx.restore(); break; }
      case 'wave': { bgSolid(ctx, base); ctx.save(); ctx.globalAlpha=0.12; ctx.fillStyle=ac; for(var k=0;k<3;k++){ ctx.beginPath(); var yb=REEL_H*(0.52+k*0.16); ctx.moveTo(0,yb); for(var wx=0; wx<=REEL_W; wx+=22){ ctx.lineTo(wx, yb+Math.sin(wx/130 + t*1.5 + k)*28); } ctx.lineTo(REEL_W,REEL_H); ctx.lineTo(0,REEL_H); ctx.closePath(); ctx.fill(); } ctx.restore(); break; }
      case 'confetti': { bgSolid(ctx, base); var cols=[C.yellow, '#FFFFFF', ac]; ctx.save(); for(var c=0;c<64;c++){ var sx=((c*73)%101)/101*REEL_W; var spd=46+(c%5)*14; var cyy=(((c*131)%REEL_H)+t*spd)%(REEL_H+40)-20; ctx.save(); ctx.translate(sx,cyy); ctx.rotate(t*2+c); ctx.globalAlpha=0.85; ctx.fillStyle=cols[c%3]; ctx.fillRect(-9,-5,18,10); ctx.restore(); } ctx.restore(); break; }
      case 'split': { bgSolid(ctx, base); var ps=seg(t,0,0.6,easeInOut); ctx.save(); ctx.fillStyle=ac; var x0=-REEL_W*0.5 + ps*REEL_W*0.9; ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(REEL_W+200,0); ctx.lineTo(REEL_W+200,REEL_H); ctx.lineTo(x0-320,REEL_H); ctx.closePath(); ctx.fill(); ctx.restore(); break; }
      case 'arc': { bgSolid(ctx, base); var pa=seg(t,0,0.7,easeOutBack); ctx.save(); ctx.fillStyle=ac; ctx.beginPath(); ctx.arc(REEL_W*0.5, -REEL_W*0.12, REEL_W*0.98*pa, 0, 7); ctx.fill(); ctx.restore(); break; }
      case 'solid': default: bgSolid(ctx, base);
    }
  }

  function drawDeco(ctx, t, deco){
    if (deco === 'stars3'){ var sa=inout(t,0.5,1.1,REEL_DUR); if(sa<=0) return; ctx.save(); var gap=92, by=REEL_H*0.255; for(var i=-1;i<=1;i++){ var tw=0.6+0.4*Math.sin(t*3+i); ctx.globalAlpha=sa*tw; star(ctx, REEL_W/2+i*gap, by, (i===0?44:34), C.yellow, 0.05*Math.sin(t*2+i)); } ctx.restore(); }
    else if (deco === 'sparkles'){ ctx.save(); for(var sx2=0;sx2<7;sx2++){ var px=((sx2*97)%100)/100*REEL_W; var py=REEL_H*0.16+((sx2*53)%100)/100*REEL_H*0.62; var tw2=0.4+0.6*Math.abs(Math.sin(t*2+sx2)); ctx.globalAlpha=0.55*tw2; star(ctx, px, py, 10+(sx2%3)*5, '#FFFFFF', t+sx2); } ctx.restore(); }
    else if (deco === 'arg-bands'){ argStripesBand(ctx, t, 0, 24); argStripesBand(ctx, t, REEL_H-24, 24); }
    else if (deco === 'arg-floor'){ argStripesBand(ctx, t, REEL_H-150, 150); }
  }

  function blockTitleStyled(ctx, t, cfg, color, cy, opt){
    opt = opt || {}; var style = opt.style || 'words';
    if (style === 'words') return blockTitle(ctx, t, cfg, color, cy, opt);
    var size = opt.size || 130, maxW = opt.maxW || REEL_W*0.78, start = opt.start || 0.8;
    setF(ctx, 800, size, true);
    var lines = wrap(ctx, cfg.title || '', maxW);
    var lh = size*1.04, startY = cy - (lines.length-1)*lh/2;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    var shd = function(){ if(opt.shadow){ ctx.shadowColor='rgba(0,0,0,.18)'; ctx.shadowBlur=16; ctx.shadowOffsetY=6; } };
    if (style === 'pop'){
      var a=inout(t,start,start+0.5,REEL_DUR,0.5), pop=seg(t,start,start+0.6,easeOutBack);
      ctx.save(); ctx.globalAlpha=a; ctx.translate(REEL_W/2, cy); ctx.scale(0.82+0.18*pop, 0.82+0.18*pop); shd(); ctx.fillStyle=color; setF(ctx,800,size,true);
      for(var i=0;i<lines.length;i++) ctx.fillText(lines[i], 0, (i-(lines.length-1)/2)*lh); ctx.restore();
    } else if (style === 'mask'){
      for(var m=0;m<lines.length;m++){ var sm=start+m*0.13; var pm=seg(t,sm,sm+0.5,easeOutCubic); var am=inout(t,sm,sm+0.5,REEL_DUR,0.5); var yC=startY+m*lh;
        ctx.save(); ctx.beginPath(); ctx.rect(0, yC-lh*0.62, REEL_W, lh*1.24); ctx.clip(); ctx.globalAlpha=am; shd(); ctx.fillStyle=color; setF(ctx,800,size,true); ctx.fillText(lines[m], REEL_W/2, yC+(1-pm)*lh*0.95); ctx.restore(); }
    } else if (style === 'slide'){
      for(var sl=0;sl<lines.length;sl++){ var ss=start+sl*0.12; var pl=seg(t,ss,ss+0.5,easeOutCubic); var al=inout(t,ss,ss+0.5,REEL_DUR,0.5); var dx=(1-pl)*-220;
        ctx.save(); ctx.globalAlpha=al; shd(); ctx.fillStyle=color; setF(ctx,800,size,true); ctx.fillText(lines[sl], REEL_W/2+dx, startY+sl*lh); ctx.restore(); }
    } else if (style === 'stamp'){
      var a3=inout(t,start,start+0.4,REEL_DUR,0.5), pp=seg(t,start,start+0.45,easeOutCubic); var sc=1.28-0.28*pp, ro=(1-pp)*-0.05;
      ctx.save(); ctx.globalAlpha=a3; ctx.translate(REEL_W/2, cy); ctx.rotate(ro); ctx.scale(sc,sc); shd(); ctx.fillStyle=color; setF(ctx,800,size,true);
      for(var st=0;st<lines.length;st++) ctx.fillText(lines[st], 0, (st-(lines.length-1)/2)*lh); ctx.restore();
    }
    return { lines: lines.length, bottom: startY + (lines.length-1)*lh + lh/2 };
  }

  function blockPriceStyled(ctx, t, cfg, ink, cy, opt){
    if (!cfg.showPrice) return 0; opt = opt || {}; var style = opt.style || 'pill';
    if (style === 'pill') return blockPrice(ctx, t, cfg, ink, cy, { pillBg: opt.bg, pillFg: opt.fg });
    var a=inout(t,1.55,2.05,REEL_DUR), pop=seg(t,1.55,2.2,easeOutBack); if (a<=0.001) return 0;
    var main = cfg.priceMain || '', eb=(cfg.priceEyebrow||'').toUpperCase(), unit=cfg.priceUnit||'';
    if (style === 'burst'){
      var bg=opt.bg||C.yellow, fg=opt.fg||C.dark;
      ctx.save(); ctx.translate(REEL_W/2, cy); ctx.scale(0.7+0.3*pop,0.7+0.3*pop); ctx.globalAlpha=a;
      setF(ctx,800,150,true); var mw=ctx.measureText(main).width; var R=Math.max(mw*0.6+120, 240);
      ctx.save(); ctx.rotate(t*0.25); ctx.beginPath(); var spk=14; for(var bi=0;bi<spk*2;bi++){ var rad=(bi%2===0)?R:R*0.78; var ang=(Math.PI/spk)*bi; ctx[bi?'lineTo':'moveTo'](Math.cos(ang)*rad, Math.sin(ang)*rad*0.8); } ctx.closePath(); ctx.fillStyle=bg; ctx.shadowColor='rgba(0,0,0,.22)'; ctx.shadowBlur=26; ctx.shadowOffsetY=12; ctx.fill(); ctx.restore();
      ctx.shadowColor='transparent'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=fg;
      if (eb){ setF(ctx,800,46,true); ctx.fillText(eb, 0, -88); } setF(ctx,800,150,true); ctx.fillText(main, 0, 0); if (unit){ setF(ctx,700,44,true); ctx.fillText(unit, 0, 92); }
      ctx.restore(); return R;
    }
    if (style === 'stack'){
      var col=opt.color||(ink==='dark'?C.dark:'#FFFFFF'), acc=opt.accent||(ink==='dark'?C.red:C.yellow);
      ctx.save(); ctx.translate(REEL_W/2, cy); ctx.scale(0.8+0.2*pop,0.8+0.2*pop); ctx.globalAlpha=a; ctx.textAlign='center'; ctx.textBaseline='middle';
      if (eb){ setF(ctx,800,52,true); ctx.fillStyle=acc; ctx.fillText(eb, 0, -100); } setF(ctx,800,172,true); ctx.fillStyle=col; ctx.fillText(main, 0, 0); if (unit){ setF(ctx,700,50,true); ctx.fillStyle=acc; ctx.fillText(unit, 0, 110); }
      ctx.restore(); return 200;
    }
    if (style === 'underline'){
      var col2=opt.color||'#FFFFFF', acc2=opt.accent||C.yellow;
      ctx.save(); ctx.translate(REEL_W/2, cy); ctx.globalAlpha=a; ctx.textAlign='center'; ctx.textBaseline='middle';
      if (eb){ setF(ctx,800,46,true); ctx.fillStyle=acc2; ctx.fillText(eb, 0, -96); } setF(ctx,800,176,true); ctx.fillStyle=col2; ctx.fillText(main, 0, 0);
      setF(ctx,800,176,true); var mw2=ctx.measureText(main).width; var up=seg(t,1.8,2.5,easeOutCubic); ctx.fillStyle=acc2; rr(ctx, -mw2/2, 100, mw2*up, 16, 8); ctx.fill();
      if (unit){ setF(ctx,700,46,true); ctx.fillStyle=col2; ctx.globalAlpha=a*0.85; ctx.fillText(unit, 0, 152); }
      ctx.restore(); return 200;
    }
    return 0;
  }

  /* ───────── fondo de media (foto / video) full-bleed ───────── */
  var BRANDH = { red: C.red, black: C.dark, white: '#FFFFFF', yellow: C.yellow, celeste: C.celeste };
  function txc(token, fb) { return token && token !== 'auto' ? (BRANDH[token] || fb) : fb; }
  function txon(cfg, key) { return cfg[key + 'Show'] !== false; }
  var currentMedia = null;
  function drawCoverSource(ctx, src, zoom) {
    var iw = src.naturalWidth || src.videoWidth || 0;
    var ih = src.naturalHeight || src.videoHeight || 0;
    if (!iw || !ih) return false;
    var scale = Math.max(REEL_W / iw, REEL_H / ih) * (zoom || 1);
    var dw = iw * scale, dh = ih * scale;
    ctx.drawImage(src, (REEL_W - dw) / 2, (REEL_H - dh) / 2, dw, dh);
    return true;
  }
  function drawReelMediaBg(ctx, media, t, ink) {
    ctx.fillStyle = C.dark; ctx.fillRect(0, 0, REEL_W, REEL_H);
    var zoom = media.kind === 'video' ? 1 : (1 + 0.07 * (t / REEL_DUR)); // ken-burns sutil en foto
    try { drawCoverSource(ctx, media.el, zoom); } catch (e) {}
    var g = ctx.createLinearGradient(0, 0, 0, REEL_H);
    if (ink !== 'dark') { g.addColorStop(0, 'rgba(20,18,16,.32)'); g.addColorStop(0.4, 'rgba(20,18,16,.05)'); g.addColorStop(1, 'rgba(20,18,16,.72)'); }
    else { g.addColorStop(0, 'rgba(255,255,255,.30)'); g.addColorStop(0.4, 'rgba(255,255,255,.04)'); g.addColorStop(1, 'rgba(255,255,255,.60)'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, REEL_W, REEL_H);
  }

  function drawSpec(ctx, t, cfg, sp){
    var hasMedia = currentMedia && currentMedia.el;
    if (hasMedia) drawReelMediaBg(ctx, currentMedia, t, sp.ink);
    else drawBg(ctx, t, sp.bg);
    if (sp.deco) drawDeco(ctx, t, sp.deco);
    blockProgress(ctx, t, sp.prog || (sp.ink === 'dark' ? C.dark : '#FFFFFF'));
    blockLogo(ctx, t, cfg, sp.ink);
    var hasPrice = !!(sp.price && cfg.showPrice);
    if (sp.badge !== false) blockBadge(ctx, t, cfg, sp.ink, REEL_H*0.335);
    var subC = txc(cfg.subColor, sp.subColor || (sp.ink === 'dark' ? C.subDark : C.sub));
    var titleColor = txc(cfg.titleColor, (sp.title && sp.title.color) || (sp.ink === 'dark' ? C.dark : '#FFFFFF'));
    var tcy = hasPrice ? REEL_H*0.45 : REEL_H*0.475;
    var topt = Object.assign({ size: 130, shadow: sp.ink !== 'dark' }, sp.title || {});
    var ti = { bottom: tcy, lines: 1 };
    if (txon(cfg, 'title')) ti = blockTitleStyled(ctx, t, cfg, titleColor, tcy, topt);
    if (txon(cfg, 'sub')) blockSubtitle(ctx, t, cfg, subC, ti.bottom + 54, sp.subMaxW);
    if (hasPrice) blockPriceStyled(ctx, t, cfg, sp.ink, REEL_H*0.665, sp.price);
    var ctaAccent = txc(cfg.ctaColor, (sp.cta && sp.cta.accent) || (sp.ink === 'dark' ? C.red : '#FFFFFF'));
    var ctaColor = sp.ink === 'dark' ? C.subDark : '#FFFFFF';
    if (txon(cfg, 'cta')) blockCta(ctx, t, cfg, ctaColor, ctaAccent, hasPrice ? REEL_H*0.75 : REEL_H*0.72);
  }

  /* ===================== 54 plantillas (recetas) ===================== */
  var SPECS = [
    /* ── Precio (12) ── */
    { id:'precio-estalla', name:'Precio que estalla', cat:'precio', ink:'light', bg:{t:'bubbles',base:C.red,accent:'#FFFFFF'}, title:{style:'words',size:124}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:'#FFFFFF'} },
    { id:'precio-burst', name:'Precio estrella', cat:'precio', ink:'light', bg:{t:'spot',base:C.red,accent:'#FFFFFF'}, title:{style:'pop',size:130}, price:{style:'burst',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'precio-claro', name:'Precio sobre claro', cat:'precio', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.red}, title:{style:'words',size:128}, price:{style:'pill',bg:C.red,fg:'#FFFFFF'}, cta:{accent:C.red} },
    { id:'precio-stack-dark', name:'Precio apilado', cat:'precio', ink:'light', bg:{t:'grid',base:C.dark,accent:'#FFFFFF'}, title:{style:'slide',size:126}, price:{style:'stack',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },
    { id:'precio-underline', name:'Precio subrayado', cat:'precio', ink:'light', bg:{t:'split',base:C.red,accent:C.redDeep}, title:{style:'mask',size:130}, price:{style:'underline',color:'#FFFFFF',accent:C.yellow}, cta:{accent:'#FFFFFF'} },
    { id:'precio-spot-amarillo', name:'Foco amarillo', cat:'precio', ink:'light', bg:{t:'spot',base:C.dark,accent:C.yellow}, title:{style:'pop',size:128}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'precio-arc', name:'Arco rojo', cat:'precio', ink:'dark', bg:{t:'arc',base:C.white,accent:C.red}, title:{style:'stamp',size:130,color:'#FFFFFF'}, subColor:C.subDark, price:{style:'pill',bg:C.red,fg:'#FFFFFF'}, cta:{accent:C.red} },
    { id:'precio-rings', name:'Ondas de precio', cat:'precio', ink:'light', bg:{t:'rings',base:C.red,accent:'#FFFFFF'}, title:{style:'words',size:124}, price:{style:'burst',bg:'#FFFFFF',fg:C.red}, cta:{accent:'#FFFFFF'} },
    { id:'precio-wave', name:'Ola celeste', cat:'precio', ink:'light', bg:{t:'wave',base:C.celesteDeep,accent:'#FFFFFF'}, title:{style:'slide',size:126}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'precio-grande-claro', name:'Precio gigante', cat:'precio', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.celeste}, title:{style:'pop',size:134}, price:{style:'stack',color:C.dark,accent:C.red}, cta:{accent:C.red} },
    { id:'precio-diag', name:'Barrido diagonal', cat:'precio', ink:'light', bg:{t:'diag',base:C.yellow,accent:C.red}, title:{style:'words',size:128}, price:{style:'pill',bg:'#FFFFFF',fg:C.red}, cta:{accent:'#FFFFFF'} },
    { id:'precio-stripe', name:'Rayas dinámicas', cat:'precio', ink:'light', bg:{t:'stripe',base:C.dark,accent:'#FFFFFF'}, title:{style:'mask',size:126}, price:{style:'underline',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },

    /* ── Ofertas (12) ── */
    { id:'oferta-flash', name:'Oferta flash', cat:'oferta', ink:'light', bg:{t:'diag',base:C.yellow,accent:C.red}, title:{style:'words',size:130}, price:{style:'pill',bg:'#FFFFFF',fg:C.red}, cta:{accent:C.yellow} },
    { id:'oferta-combo', name:'Combo diagonal', cat:'oferta', ink:'light', bg:{t:'stripe',base:C.dark,accent:'#FFFFFF'}, title:{style:'slide',size:128}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.red} },
    { id:'oferta-2x1', name:'2x1 estrella', cat:'oferta', ink:'light', bg:{t:'spot',base:C.red,accent:'#FFFFFF'}, title:{style:'pop',size:132}, price:{style:'burst',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'oferta-confetti', name:'Confeti', cat:'oferta', ink:'light', bg:{t:'confetti',base:C.red,accent:'#FFFFFF'}, title:{style:'words',size:126}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:'#FFFFFF'} },
    { id:'oferta-rings', name:'Promo en ondas', cat:'oferta', ink:'light', bg:{t:'rings',base:C.red,accent:'#FFFFFF'}, title:{style:'mask',size:128}, price:{style:'stack',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },
    { id:'oferta-arc', name:'Arco promo', cat:'oferta', ink:'light', bg:{t:'arc',base:C.red,accent:C.yellow}, title:{style:'stamp',size:130}, price:{style:'pill',bg:'#FFFFFF',fg:C.red}, cta:{accent:'#FFFFFF'} },
    { id:'oferta-split', name:'Bloque diagonal', cat:'oferta', ink:'light', bg:{t:'split',base:C.dark,accent:C.red}, title:{style:'slide',size:128}, price:{style:'underline',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },
    { id:'oferta-grid', name:'Promo grilla', cat:'oferta', ink:'light', bg:{t:'grid',base:C.red,accent:'#FFFFFF'}, title:{style:'words',size:126}, price:{style:'burst',bg:'#FFFFFF',fg:C.red}, cta:{accent:'#FFFFFF'} },
    { id:'oferta-wave', name:'Ola de oferta', cat:'oferta', ink:'light', bg:{t:'wave',base:C.red,accent:C.yellow}, title:{style:'pop',size:128}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'oferta-spot-dark', name:'Foco oscuro', cat:'oferta', ink:'light', bg:{t:'spot',base:C.dark,accent:C.red}, title:{style:'mask',size:128}, price:{style:'stack',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.red} },
    { id:'oferta-claro', name:'Oferta sobre claro', cat:'oferta', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.red}, title:{style:'words',size:126}, price:{style:'pill',bg:C.red,fg:'#FFFFFF'}, cta:{accent:C.red} },
    { id:'oferta-relampago', name:'Relámpago', cat:'oferta', ink:'light', bg:{t:'diag',base:C.red,accent:C.yellow}, title:{style:'stamp',size:132}, price:{style:'burst',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },

    /* ── Frases (10) ── */
    { id:'frase-kinetica', name:'Frase kinética', cat:'frase', ink:'light', bg:{t:'bubbles',base:C.red,accent:'#FFFFFF'}, title:{style:'words',size:154,start:0.6}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-pop', name:'Frase pop', cat:'frase', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.celeste}, title:{style:'pop',size:148}, badge:false, cta:{accent:C.red} },
    { id:'frase-mask', name:'Frase revelada', cat:'frase', ink:'light', bg:{t:'grid',base:C.dark,accent:'#FFFFFF'}, title:{style:'mask',size:150}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-slide', name:'Frase deslizada', cat:'frase', ink:'light', bg:{t:'split',base:C.red,accent:C.redDeep}, title:{style:'slide',size:146}, badge:false, cta:{accent:'#FFFFFF'} },
    { id:'frase-stamp', name:'Frase sello', cat:'frase', ink:'light', bg:{t:'spot',base:C.red,accent:'#FFFFFF'}, title:{style:'stamp',size:150}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-rings', name:'Frase en ondas', cat:'frase', ink:'light', bg:{t:'rings',base:C.red,accent:'#FFFFFF'}, title:{style:'pop',size:148}, badge:false, cta:{accent:'#FFFFFF'} },
    { id:'frase-wave', name:'Frase ola', cat:'frase', ink:'light', bg:{t:'wave',base:C.celesteDeep,accent:'#FFFFFF'}, title:{style:'mask',size:148}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-arc', name:'Frase arco', cat:'frase', ink:'light', bg:{t:'arc',base:C.dark,accent:C.red}, title:{style:'slide',size:148}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-stripe', name:'Frase rayada', cat:'frase', ink:'light', bg:{t:'stripe',base:C.red,accent:'#FFFFFF'}, title:{style:'stamp',size:150}, badge:false, cta:{accent:C.yellow} },
    { id:'frase-claro-pop', name:'Frase clara', cat:'frase', ink:'dark', bg:{t:'spot',base:C.white,accent:C.red}, title:{style:'pop',size:148}, badge:false, cta:{accent:C.red} },

    /* ── Info & Horarios (10) ── */
    { id:'aviso-horario', name:'Aviso / Horario', cat:'info', ink:'light', bg:{t:'bubbles',base:C.dark,accent:C.red}, title:{style:'words',size:124}, badge:true, cta:{accent:C.red} },
    { id:'info-celeste', name:'Info celeste', cat:'info', ink:'light', bg:{t:'bubbles',base:C.celesteDeep,accent:'#FFFFFF'}, title:{style:'words',size:124}, badge:true, cta:{accent:C.yellow} },
    { id:'info-grid', name:'Info grilla', cat:'info', ink:'light', bg:{t:'grid',base:C.dark,accent:'#FFFFFF'}, title:{style:'mask',size:124}, badge:true, cta:{accent:C.red} },
    { id:'info-spot', name:'Info foco', cat:'info', ink:'light', bg:{t:'spot',base:C.dark,accent:C.celeste}, title:{style:'pop',size:124}, badge:true, cta:{accent:C.celeste} },
    { id:'horario-claro', name:'Horario claro', cat:'info', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.red}, title:{style:'slide',size:124}, badge:true, cta:{accent:C.red} },
    { id:'info-rings', name:'Info ondas', cat:'info', ink:'light', bg:{t:'rings',base:C.celesteDeep,accent:'#FFFFFF'}, title:{style:'words',size:124}, badge:true, cta:{accent:C.yellow} },
    { id:'aviso-split', name:'Aviso bloque', cat:'info', ink:'light', bg:{t:'split',base:C.dark,accent:C.red}, title:{style:'stamp',size:124}, badge:true, cta:{accent:C.red} },
    { id:'info-wave', name:'Info ola', cat:'info', ink:'light', bg:{t:'wave',base:C.dark,accent:C.celeste}, title:{style:'mask',size:124}, badge:true, cta:{accent:C.celeste} },
    { id:'horario-arc', name:'Horario arco', cat:'info', ink:'dark', bg:{t:'arc',base:C.white,accent:C.celeste}, title:{style:'pop',size:124}, badge:true, cta:{accent:C.celeste} },
    { id:'info-stripe', name:'Info rayada', cat:'info', ink:'light', bg:{t:'stripe',base:C.celesteDeep,accent:'#FFFFFF'}, title:{style:'slide',size:124}, badge:true, cta:{accent:C.yellow} },

    /* ── Mundial 2026 (10) ── */
    { id:'mundial-vamos', name:'¡Vamos Argentina!', cat:'mundial', ink:'light', bg:{t:'arg',base:C.celesteDeep}, deco:'arg-floor', title:{style:'words',size:142,start:0.7}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.celeste} },
    { id:'mundial-hoy', name:'Hoy juega Argentina', cat:'mundial', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.celeste}, deco:'arg-bands', title:{style:'words',size:132,color:C.celesteDeep}, subColor:C.subDark, price:{style:'pill',bg:C.celeste,fg:'#FFFFFF'}, cta:{accent:C.celeste} },
    { id:'mundial-estrellas', name:'Estrellas campeonas', cat:'mundial', ink:'light', bg:{t:'spot',base:C.celesteDeep,accent:'#FFFFFF'}, deco:'stars3', title:{style:'pop',size:138}, price:{style:'burst',bg:C.yellow,fg:C.dark}, cta:{accent:C.celeste} },
    { id:'mundial-confetti', name:'Festejo confeti', cat:'mundial', ink:'light', bg:{t:'confetti',base:C.celesteDeep,accent:'#FFFFFF'}, deco:'arg-floor', title:{style:'slide',size:136}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'mundial-rays', name:'Sol de mayo', cat:'mundial', ink:'light', bg:{t:'arg',base:C.celesteDeep}, deco:'sparkles', title:{style:'mask',size:138}, price:{style:'stack',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },
    { id:'mundial-claro', name:'Mundial claro', cat:'mundial', ink:'dark', bg:{t:'bubbles',base:C.white,accent:C.celeste}, deco:'arg-bands', title:{style:'stamp',size:134,color:C.celesteDeep}, subColor:C.subDark, price:{style:'pill',bg:C.celeste,fg:'#FFFFFF'}, cta:{accent:C.celeste} },
    { id:'mundial-bandera', name:'Bandera', cat:'mundial', ink:'light', bg:{t:'split',base:C.celesteDeep,accent:'#FFFFFF'}, deco:'arg-floor', title:{style:'words',size:138}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'mundial-rings', name:'Mundial ondas', cat:'mundial', ink:'light', bg:{t:'rings',base:C.celesteDeep,accent:'#FFFFFF'}, deco:'stars3', title:{style:'pop',size:136}, price:{style:'underline',color:'#FFFFFF',accent:C.yellow}, cta:{accent:C.yellow} },
    { id:'mundial-rojo', name:'Aguante en rojo', cat:'mundial', ink:'light', bg:{t:'bubbles',base:C.red,accent:'#FFFFFF'}, deco:'stars3', title:{style:'words',size:140}, price:{style:'pill',bg:C.yellow,fg:C.dark}, cta:{accent:C.yellow} },
    { id:'mundial-grito', name:'Grito de gol', cat:'mundial', ink:'light', bg:{t:'arc',base:C.celesteDeep,accent:'#FFFFFF'}, deco:'sparkles', title:{style:'stamp',size:140}, price:{style:'burst',bg:C.yellow,fg:C.dark}, cta:{accent:C.celeste} },
  ];

  const REEL_TEMPLATES = SPECS.map(function(sp){
    return { id: sp.id, name: sp.name, cat: sp.cat, ink: sp.ink, draw: function(ctx, t, cfg){ drawSpec(ctx, t, cfg, sp); } };
  });

  const REEL_CATS = [
    { key: "precio", name: "Precio", icon: "percent" },
    { key: "oferta", name: "Ofertas", icon: "flame" },
    { key: "frase", name: "Frases", icon: "quote" },
    { key: "info", name: "Info & Horarios", icon: "clock" },
    { key: "mundial", name: "Mundial 2026", icon: "star" },
  ];
  function tmplById(id) { return REEL_TEMPLATES.find((x) => x.id === id) || REEL_TEMPLATES[0]; }

  function drawFrame(ctx, tmpl, cfg, t, media) {
    currentMedia = media || null;
    ctx.save();
    ctx.clearRect(0, 0, REEL_W, REEL_H);
    tmpl.draw(ctx, t, cfg);
    ctx.restore();
    currentMedia = null;
  }

  /* media loaders (foto / video de fondo) */
  function loadImageEl(src) {
    return new Promise(function (res, rej) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); }; im.onerror = function () { rej(new Error('img')); };
      im.src = src;
    });
  }
  function loadVideoEl(src) {
    return new Promise(function (res, rej) {
      var v = document.createElement('video');
      v.src = src; v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'auto';
      v.onloadeddata = function () { res(v); }; v.onerror = function () { rej(new Error('video')); };
    });
  }
  function seekVideo(v, time) {
    return new Promise(function (res) {
      var on = function () { v.removeEventListener('seeked', on); res(); };
      v.addEventListener('seeked', on);
      try { v.currentTime = time; } catch (e) { v.removeEventListener('seeked', on); res(); }
    });
  }
  async function makeMedia(cfg) {
    try {
      if (cfg.bgVideo) return { kind: 'video', el: await loadVideoEl(cfg.bgVideo) };
      if (cfg.bgImage) return { kind: 'image', el: await loadImageEl(cfg.bgImage) };
    } catch (e) {}
    return null;
  }

  /* ───────── ReelStage: preview animado en vivo ───────── */
  function ReelStage({ cfg, tmplId, scale, playing, overlay }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const startRef = useRef(performance.now());
    const mediaRef = useRef(null);
    const tmpl = tmplById(tmplId);
    // cargar foto/video de fondo
    useEffect(() => {
      let m = null, alive = true;
      if (cfg.bgVideo) {
        const v = document.createElement("video");
        v.src = cfg.bgVideo; v.muted = true; v.playsInline = true; v.loop = true; v.autoplay = true;
        v.play().catch(() => {});
        m = { kind: "video", el: v };
      } else if (cfg.bgImage) {
        const im = new Image(); im.crossOrigin = "anonymous"; im.src = cfg.bgImage;
        m = { kind: "image", el: im };
      }
      mediaRef.current = alive ? m : null;
      return () => { alive = false; if (m && m.kind === "video") { try { m.el.pause(); } catch (e) {} } mediaRef.current = null; };
    }, [cfg.bgImage, cfg.bgVideo]);
    useEffect(() => {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      let alive = true;
      const loop = () => {
        if (!alive) return;
        let t;
        if (playing === false) { t = 3.0; }
        else { t = ((performance.now() - startRef.current) / 1000) % REEL_DUR; }
        drawFrame(ctx, tmpl, cfg, t, mediaRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      const kick = () => { startRef.current = performance.now(); loop(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick); else kick();
      return () => { alive = false; cancelAnimationFrame(rafRef.current); };
    }, [cfg, tmplId, playing]);
    const restart = () => { startRef.current = performance.now(); };
    return (
      <div className="reel-frame" style={{ width: REEL_W * scale, height: REEL_H * scale }}>
        <canvas ref={canvasRef} width={REEL_W} height={REEL_H}
          style={{ width: REEL_W * scale, height: REEL_H * scale, display: "block", borderRadius: 2 }}
          onClick={restart} title="Tocá para reiniciar la animación" />
        {overlay || null}
      </div>
    );
  }

  /* ───────── ReelThumb: miniatura (un cuadro fijo) ───────── */
  function ReelThumb({ cfg, tmplId, w }) {
    const canvasRef = useRef(null);
    const tmpl = tmplById(tmplId);
    const h = w * (REEL_H / REEL_W);
    useEffect(() => {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext("2d");
      const render = () => drawFrame(ctx, tmpl, cfg, 3.0);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(render); else render();
      const id = setTimeout(render, 120); // re-draw cuando los logos cargan
      return () => clearTimeout(id);
    }, [cfg, tmplId]);
    return <canvas ref={canvasRef} width={REEL_W} height={REEL_H} style={{ width: w, height: h, display: "block", borderRadius: 6 }} />;
  }

  /* ───────── Exportación a video ─────────
     1º WebCodecs + mp4-muxer → MP4 real (H.264).
     2º fallback: MediaRecorder en tiempo real → MP4 (Safari) o WebM. */
  async function pickAvcCodec(W, H, fps) {
    const cands = ["avc1.640028", "avc1.4d0028", "avc1.640034", "avc1.42001f"];
    if (!window.VideoEncoder || !window.VideoEncoder.isConfigSupported) return null;
    for (const codec of cands) {
      try {
        const r = await window.VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: 9_000_000, framerate: fps });
        if (r && r.supported) return codec;
      } catch (e) {}
    }
    return null;
  }

  async function exportReelVideo(cfg, tmplId, opts) {
    opts = opts || {};
    const fps = opts.fps || 30;
    const onProgress = opts.onProgress || (() => {});
    const tmpl = tmplById(tmplId);
    const W = REEL_W, H = REEL_H;
    const total = Math.round(REEL_DUR * fps);
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d", { alpha: false });
    try { await document.fonts.ready; } catch (e) {}
    if (!logosReady) { try { await preloadLogos(); } catch (e) {} }
    const media = await makeMedia(cfg);
    const vdur = media && media.kind === "video" && media.el.duration ? media.el.duration : 0;

    const codec = window.Mp4Muxer ? await pickAvcCodec(W, H, fps) : null;

    /* ── camino A: WebCodecs → MP4 ── */
    if (codec && window.Mp4Muxer) {
      const muxer = new window.Mp4Muxer.Muxer({
        target: new window.Mp4Muxer.ArrayBufferTarget(),
        video: { codec: "avc", width: W, height: H, frameRate: fps },
        fastStart: "in-memory",
      });
      const encoder = new window.VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error("VideoEncoder", e),
      });
      encoder.configure({ codec, width: W, height: H, bitrate: 9_000_000, framerate: fps });
      for (let i = 0; i < total; i++) {
        if (media && media.kind === "video" && vdur) { try { await seekVideo(media.el, (i / fps) % vdur); } catch (e) {} }
        drawFrame(ctx, tmpl, cfg, i / fps, media);
        const frame = new window.VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
        encoder.encode(frame, { keyFrame: i % fps === 0 });
        frame.close();
        onProgress(i / total);
        while (encoder.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 4));
      }
      await encoder.flush();
      muxer.finalize();
      onProgress(1);
      const blob = new Blob([muxer.target.buffer], { type: "video/mp4" });
      return { blob, ext: "mp4" };
    }

    /* ── camino B: MediaRecorder (tiempo real) ── */
    const mp4Mime = "video/mp4;codecs=avc1.640028";
    const webmMime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const useMp4 = window.MediaRecorder && MediaRecorder.isTypeSupported(mp4Mime);
    const mime = useMp4 ? mp4Mime : webmMime;
    const stream = canvas.captureStream(fps);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 9_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise((res) => { rec.onstop = res; });
    if (media && media.kind === "video") { try { media.el.loop = true; media.el.muted = true; await media.el.play(); } catch (e) {} }
    const t0 = performance.now();
    rec.start();
    await new Promise((resolve) => {
      const tick = () => {
        const el = (performance.now() - t0) / 1000;
        drawFrame(ctx, tmpl, cfg, Math.min(el, REEL_DUR), media);
        onProgress(Math.min(el / REEL_DUR, 1));
        if (el >= REEL_DUR) { rec.stop(); resolve(); }
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await done;
    if (media && media.kind === "video") { try { media.el.pause(); } catch (e) {} }
    onProgress(1);
    const ext = useMp4 ? "mp4" : "webm";
    return { blob: new Blob(chunks, { type: useMp4 ? "video/mp4" : "video/webm" }), ext };
  }

  Object.assign(window, {
    REEL_TEMPLATES, REEL_CATS, ReelStage, ReelThumb, exportReelVideo,
    REEL_DUR, REEL_W, REEL_H, reelTmplById: tmplById,
  });
})();
