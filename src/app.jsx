/* global React, ReactDOM, Placa, safeInsets,
   useTweaks, TweaksPanel, TweakSection, TweakRadio,
   freshCfg, CATEGORIES, CATALOG, TEMPLATE_LIST, formatPrice,
   REEL_TEMPLATES, REEL_CATS, ReelStage, ReelThumb, exportReelVideo */
/* =============================================================================
   Kiosco Enjoy — Generador de Placas v2
   Layout: sidebar plantillas | canvas central | panel props con tabs
   ============================================================================= */
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const APP_LOGO_W = (window.__resources && window.__resources.logoWhite) || "assets/logo-white.svg";
const APP_LOGO_R = (window.__resources && window.__resources.logoRed)   || "assets/logo-red.svg";

/* ── iconos ─────────────────────────────────────────────────────────────────── */
const I = {
  dl:   ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  img:  ["M3 3h18v18H3z","M8.5 8.5a1.5 1.5 0 1 1-3 0","m21 15-5-5L5 21"],
  x:    ["M18 6 6 18","M6 6l12 12"],
  srch: ["M11 11m-8 0a8 8 0 1 0 16 0","M21 21l-4.35-4.35"],
  plus: ["M5 12h14","M12 5v14"],
  sq:   ["M3 3h18v18H3z"],
  stry: ["M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
  car:  ["M2 7h2v10H2z","M20 7h2v10h-2z","M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"],
  film: ["M3 4h18v16H3z","M7 4v16","M17 4v16","M3 9h4","M17 9h4","M3 15h4","M17 15h4"],
  page: ["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z","M15 2v5h5"],
  pin:  ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z","M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"],
  lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  unlk: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 9.9-1"],
  undo: ["M9 14 4 9l5-5","M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"],
  redo: ["M15 14l5-5-5-5","M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"],
  chk:  ["M20 6 9 17l-5-5"],
  ref2: ["M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 8","M21 3v5h-5"],
  eye:  ["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  flame:["M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-1.5.5-2.5 1.2-3.3C8.6 10 9 11 9 12c.7-.5 1-1.6 1-3 0-2.5 1-4.5 2-7z"],
  botl: ["M9 2h6","M10 2v3.5a4 4 0 0 1-1 2.6L8 9.5A4 4 0 0 0 7 12v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8a4 4 0 0 0-1-2.5l-1-1.4a4 4 0 0 1-1-2.6V2","M7 14h10"],
  combo:["M3 6h18","M3 12h18","M3 18h18","M7 3v3","M17 9v3","M11 15v3"],
  quot: ["M3 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2-1 0-1 .008-1 1.031V20c0 1 0 1 1 1z","M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"],
  clck: ["M12 2a10 10 0 1 0 0 20","M12 6v6l4 2"],
  star: ["M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"],
  list: ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
};
const CATICONS = { datos:I.pin,oferta:I.flame,producto:I.botl,combo:I.combo,frase:I.quot,info:I.clck,mundial:I.star,lista:I.list };
function Ic({ d, size=16, cls="" }) {
  return (
    <svg className={"ic"+(cls?" "+cls:"")} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
    </svg>
  );
}

/* ── utilidades de formato ───────────────────────────────────────────────── */
function dimsFor(fmt, r) {
  if (fmt==="historia"||fmt==="reel") return {W:1080,H:1920};
  if (fmt==="carrusel") return r==="4:5"?{W:1080,H:1350}:{W:1080,H:1080};
  if (fmt==="a4"||fmt==="a3") return {W:1080,H:1527};
  return {W:1080,H:1080};
}
function exportScale(fmt) { return fmt==="a4"?2480/1080:fmt==="a3"?3508/1080:1; }

/* ── controles UI base ───────────────────────────────────────────────────── */
function Toggle({ v, on }) {
  return <button className="switch" aria-pressed={!!v} onClick={()=>on(!v)}></button>;
}
function Slider({ v, min, max, step, on }) {
  const [local, setLocal] = React.useState(v);
  const dragging = React.useRef(false);
  const rafRef = React.useRef(null);
  const onRef = React.useRef(on);
  React.useEffect(() => { onRef.current = on; }, [on]);
  // Solo sincronizar desde fuera si NO está arrastrando
  React.useEffect(() => { if (!dragging.current) setLocal(v); }, [v]);
  function handleChange(e) {
    const val = parseFloat(e.target.value);
    dragging.current = true;
    setLocal(val);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => { onRef.current(val); });
  }
  function handleUp() { dragging.current = false; }
  return <input className="range" type="range" min={min} max={max} step={step||1}
    value={local} onChange={handleChange} onPointerUp={handleUp} onPointerCancel={handleUp}/>;
}
const BC = {auto:"linear-gradient(135deg,#bbb 50%,#555 50%)",red:"#F40000",black:"#2D2926",white:"#F0F0F1",yellow:"#FFD400",celeste:"#5AA0DC"};
function BrandPicker({ v, on, sm }) {
  return (
    <div className="brand-picker">
      {["auto","red","black","white","yellow","celeste"].map(c=>(
        <button key={c} className={"brand-sw"+((v||"auto")===c?" is-on":"")} title={c}
          style={{background:BC[c],width:sm?20:24,height:sm?20:24}} onClick={()=>on(c)}/>
      ))}
    </div>
  );
}
/* ── FmtPicker — selector visual de formato ─────────────────────────────── */
const PRICE_FMTS = [
  ["auto",     "Auto",    {background:"var(--ink-200)",borderRadius:7}],
  ["solo",     "Texto",   {color:"var(--coke-red)",fontWeight:900,fontStyle:"italic",fontSize:14,lineHeight:"18px"},"$"],
  ["pill",     "Píldora", {background:"var(--coke-red)",borderRadius:999}],
  ["rect",     "Rect.",   {background:"var(--coke-red)",borderRadius:7}],
  ["sharp",    "Sharp",   {background:"var(--coke-red)",borderRadius:2}],
  ["recuadro", "Borde",   {background:"var(--coke-red)",borderRadius:7,boxShadow:"inset 0 0 0 2.5px rgba(255,255,255,.9)"}],
  ["strike",   "Tachado", {color:"var(--coke-red)",fontWeight:800,fontStyle:"italic",fontSize:11,textDecoration:"line-through"},"$X"],
];
const CTA_FMTS = [
  ["auto",    "Auto",     {background:"var(--ink-200)",borderRadius:7}],
  ["pill",    "Píldora",  {background:"var(--coke-red)",borderRadius:999}],
  ["rect",    "Rect.",    {background:"var(--coke-red)",borderRadius:7}],
  ["sharp",   "Sharp",    {background:"var(--coke-red)",borderRadius:2}],
  ["outline", "Contorno", {background:"transparent",border:"2px solid var(--coke-red)",borderRadius:999}],
  ["text",    "Texto",    {color:"var(--coke-red)",fontWeight:800,fontStyle:"italic",fontSize:11},"CTA"],
];
const BADGE_SHAPES = [
  ["diag",  "Diagonal", {background:"var(--promo)",borderRadius:7,transform:"rotate(-7deg)"}],
  ["rect",  "Rect.",    {background:"var(--promo)",borderRadius:7}],
  ["pill",  "Píldora",  {background:"var(--promo)",borderRadius:999}],
  ["sharp", "Sharp",    {background:"var(--promo)",borderRadius:2}],
];
function FmtPicker({ options, value, onChange }) {
  return (
    <div className="fmtpk">
      {options.map(([key, label, demoSt, demoTxt]) => (
        <button key={key} className={"fmtpk-opt"+(value===key?" is-on":"")} onClick={()=>onChange(key)}>
          <span className="fmtpk-demo" style={demoSt}>{demoTxt||""}</span>
          <span className="fmtpk-lbl">{label}</span>
        </button>
      ))}
    </div>
  );
}
const LDOT = {tl:{top:4,left:4},tc:{top:4,left:"50%",transform:"translateX(-50%)"},tr:{top:4,right:4},bl:{bottom:4,left:4},bc:{bottom:4,left:"50%",transform:"translateX(-50%)"},br:{bottom:4,right:4}};
function LogoGrid({ v, on }) {
  return (
    <div className="logopos">
      {["tl","tc","tr","bl","bc","br"].map(p=>(
        <button key={p} className="logopos-cell" aria-pressed={(v||"tl")===p} onClick={()=>on(p)}>
          <span className="logopos-dot" style={LDOT[p]}></span>
        </button>
      ))}
    </div>
  );
}

/* ── MiniPlaca ───────────────────────────────────────────────────────────── */
function MiniPlaca({ cfg, W, H, cls, sty }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const m=()=>setW(el.clientWidth); m();
    const ro=new ResizeObserver(m); ro.observe(el);
    return ()=>ro.disconnect();
  },[]);
  const sc = w?w/W:0;
  return (
    <div ref={ref} className={cls} style={{aspectRatio:`${W}/${H}`,overflow:"hidden",position:"relative",...(sty||{})}}>
      {sc?<div style={{position:"absolute",top:0,left:0,width:W,height:H,transform:`scale(${sc})`,transformOrigin:"top left"}}>
        <Placa cfg={cfg} W={W} H={H} editor={false}/>
      </div>:null}
    </div>
  );
}

/* ── BgRepositioner — arrastrá para encuadrar la foto de fondo ───────────── */
function BgRepositioner({ src, view, W, H, onChange }) {
  const MW=250, MH=Math.round(MW*H/W);
  const v = view||{s:1,x:0,y:0};
  const cbRef = useRef(onChange);
  useEffect(()=>{cbRef.current=onChange;},[onChange]);

  function onPD(e) {
    if (e.button!==0) return;
    e.preventDefault();
    const frame=e.currentTarget;
    frame.setPointerCapture(e.pointerId);
    const sx=e.clientX, sy=e.clientY, sv={...v};
    function onPM(ev) {
      const dx=(ev.clientX-sx)/MW*100/sv.s;
      const dy=(ev.clientY-sy)/MH*100/sv.s;
      cbRef.current({...sv,x:sv.x+dx,y:sv.y+dy});
    }
    function onPU() {
      frame.removeEventListener("pointermove",onPM);
      frame.removeEventListener("pointerup",onPU);
    }
    frame.addEventListener("pointermove",onPM);
    frame.addEventListener("pointerup",onPU);
  }

  return (
    <div className="bg-repo">
      <div className="bg-repo-frame" style={{width:MW,height:MH}} onPointerDown={onPD}>
        <img src={src} alt="" className="bg-repo-img"
          style={{transform:`translate(-50%,-50%) translate(${v.x}%,${v.y}%) scale(${v.s})`}}/>
        <div className="bg-repo-gv"/><div className="bg-repo-gh"/>
        <span className="bg-repo-hint">↕↔ Arrastrá para encuadrar</span>
      </div>
      <div className="bg-repo-footer">
        <span className="bg-lbl">Zoom</span>
        <Slider v={v.s} min={0.5} max={4} step={0.02} on={s=>onChange({...v,s})}/>
        <span className="bg-pct">{Math.round(v.s*100)}%</span>
        <button className="bg-rst" onClick={()=>onChange({s:1,x:0,y:0})}>Centrar</button>
      </div>
    </div>
  );
}

/* ── captureSlide + descarga ─────────────────────────────────────────────── */
function loadImg(src) {
  return new Promise((res,rej)=>{
    const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error("img")); i.src=src;
  });
}
async function captureSlide(cfg, W, H, pr=1) {
  const host=document.createElement("div");
  host.style.cssText="position:fixed;left:-99999px;top:0;z-index:-1;";
  document.body.appendChild(host);
  const root=ReactDOM.createRoot(host);
  root.render(React.createElement(Placa,{cfg,W,H,editor:false}));
  await document.fonts.ready.catch(()=>{});
  const node=host.firstChild;
  try {
    const PFX="data:image/svg+xml;charset=utf-8,";
    let svg=decodeURIComponent((await window.htmlToImage.toSvg(node)).slice(PFX.length));
    const tw=Math.round(W*pr), th=Math.round(H*pr);
    svg=svg.replace(`width="${W}" height="${H}"`,`width="${tw}" height="${th}"`);
    const img=await loadImg(PFX+encodeURIComponent(svg));
    const cv=document.createElement("canvas"); cv.width=tw; cv.height=th;
    cv.getContext("2d").drawImage(img,0,0,tw,th);
    return cv.toDataURL("image/png");
  } finally { root.unmount(); host.remove(); }
}
function dlUrl(url,name){const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}

/* ── SafeZone overlay ────────────────────────────────────────────────────── */
function fpct(W,H){const r=H/W;if(r>1.6)return{t:13.5,b:18.5,l:5.9,ri:5.9};if(r>1.33&&r<1.55)return{t:7.5,b:7.5,l:9,ri:9};return{t:5.9,b:5.9,l:5.9,ri:5.9};}
function SafeZone({ fmt, W, H }) {
  const f=fpct(W,H);
  const isTall=fmt==="reel"||fmt==="historia";
  const isPrint=fmt==="a4"||fmt==="a3";
  return (
    <div className="sz-overlay" aria-hidden="true">
      <div className="sz-frame" style={{top:f.t+"%",bottom:f.b+"%",left:f.l+"%",right:f.ri+"%"}}>
        <span className="sz-frame-lbl">Área segura</span>
      </div>
      {isTall&&!isPrint?<>
        <div className="sz-danger" style={{top:0,left:0,right:0,height:"13%"}}><span className="sz-dlbl">Barra superior</span></div>
        <div className="sz-danger" style={{bottom:0,left:0,right:0,height:"18%"}}><span className="sz-dlbl">Acciones · pie</span></div>
      </>:null}
      {!isTall&&!isPrint?
        <div className="sz-danger corner-tr" style={{left:0,bottom:0,width:"42%",height:"22%"}}><span className="sz-dlbl">UI del post</span></div>
      :null}
    </div>
  );
}

/* ── Panel de plantillas (sidebar izquierda) ─────────────────────────────── */
function TemplatePanel({ baseCfg, W, H, onApply }) {
  const [cat, setCat] = useState(CATEGORIES[0].key);
  const [q, setQ] = useState("");
  const tq = q.trim().toLowerCase();
  const items = tq
    ? TEMPLATE_LIST.filter(it=>(it.name+" "+(it.cfg.title||"")).toLowerCase().includes(tq))
    : (CATALOG[cat]||[]);

  // Para plantillas "datos": mostrá el contenido pre-cargado de la plantilla (no del cfg actual)
  function mkCfg(item) {
    const it=item.cfg, ns=(it.struct&&it.struct.photo)||"none";
    const isDatos = item.cat === "datos";
    return {
      ...it,
      title:isDatos?it.title:baseCfg.title,
      subtitle:isDatos?it.subtitle:baseCfg.subtitle,
      badge:isDatos?it.badge:baseCfg.badge,
      priceEyebrow:isDatos?it.priceEyebrow:baseCfg.priceEyebrow,
      priceMain:isDatos?it.priceMain:baseCfg.priceMain,
      priceUnit:isDatos?it.priceUnit:baseCfg.priceUnit,
      priceStrike:isDatos?it.priceStrike:baseCfg.priceStrike,
      cta:isDatos?it.cta:baseCfg.cta,
      handle:isDatos?it.handle:baseCfg.handle,
      rows:isDatos?it.rows:baseCfg.rows,
      badgeStyle:isDatos?it.badgeStyle:baseCfg.badgeStyle,
      badgeShow:isDatos?it.badgeShow:baseCfg.badgeShow,
      showPrice:baseCfg.showPrice,
      logoShow:baseCfg.logoShow, logoPos:baseCfg.logoPos, logoColor:baseCfg.logoColor, logoSize:baseCfg.logoSize,
      bgImage:baseCfg.bgImage, bgView:baseCfg.bgView,
      titleColor:baseCfg.titleColor, subColor:baseCfg.subColor,
      titleShow:baseCfg.titleShow, subShow:baseCfg.subShow,
      photo:(baseCfg.photo&&ns!=="none")?baseCfg.photo:null, photoView:baseCfg.photoView,
      titleFontSize:baseCfg.titleFontSize, subFontSize:baseCfg.subFontSize,
      ctaFontSize:baseCfg.ctaFontSize, handleFontSize:baseCfg.handleFontSize,
      priceFontSize:baseCfg.priceFontSize, badgeFontSize:baseCfg.badgeFontSize,
    };
  }

  return (
    <div className="tmpl-panel">
      <div className="tmpl-search-row">
        <div className="tmpl-search-box">
          <Ic d={I.srch} size={13}/>
          <input className="tmpl-search-inp" placeholder="Buscar plantilla…" value={q} onChange={e=>setQ(e.target.value)}/>
          {q?<button className="tmpl-search-x" onClick={()=>setQ("")}><Ic d={I.x} size={12}/></button>:null}
        </div>
      </div>
      {!tq?(
        <div className="cat-pills-scroll">
          <div className="cat-pills">
            {CATEGORIES.map(c=>(
              <button key={c.key} className={"cat-pill"+(cat===c.key?" is-on":"")} onClick={()=>setCat(c.key)}>
                <Ic d={CATICONS[c.key]||I.sq} size={12}/>
                {c.name}
                <em>{(CATALOG[c.key]||[]).length}</em>
              </button>
            ))}
          </div>
        </div>
      ):null}
      <div className="tmpl-scroll">
        <div className="tmpl-grid">
          {items.map(it=>(
            <button key={it.id} className={"tmpl-card"+(it.cat==="datos"?" tmpl-card-datos":"")} title={it.name} onClick={()=>onApply(it)}>
              <MiniPlaca cfg={mkCfg(it)} W={W} H={H} cls="tmpl-thumb"/>
              <span className="tmpl-name">{it.name}</span>
            </button>
          ))}
          {!items.length?<p className="tmpl-empty">Sin resultados</p>:null}
        </div>
      </div>
    </div>
  );
}

/* ── TF — campo de texto con toggle, color y slider de tamaño ───────────── */
/* CRÍTICO: definido FUERA de ContentPanel para que React no remonte al editar */
function TF({ cfg, patch, label, fk, sk, ck, multi, notUsed, szKey, szDef=60, szMin=18, szMax=280 }) {
  const show = cfg[sk] !== false;
  return (
    <div className="cp-field">
      <div className="cp-fhead">
        <span className="cp-label">{label}{notUsed ? <span className="cp-tag-off">sin uso</span> : null}</span>
        <div className="cp-fhead-r">
          {ck ? <BrandPicker sm v={cfg[ck]} on={v => patch({[ck]: v})}/> : null}
          {sk ? <Toggle v={show} on={v => patch({[sk]: v})}/> : null}
        </div>
      </div>
      {show ? (
        <>
          {multi
            ? <textarea className="cp-ta" rows={2} value={cfg[fk]||""} placeholder={label+"…"} onChange={e => patch({[fk]: e.target.value})}/>
            : <input className="cp-in" value={cfg[fk]||""} placeholder={label+"…"} onChange={e => patch({[fk]: e.target.value})}/>}
          {szKey ? (
            <div className="cp-size-row">
              <span className="cp-size-lbl">Tamaño</span>
              <Slider v={cfg[szKey]||szDef} min={szMin} max={szMax} step={1} on={v => patch({[szKey]: v})}/>
              <span className="cp-size-val">{cfg[szKey]||szDef}px</span>
              {cfg[szKey] ? <button className="cp-size-rst" onClick={() => patch({[szKey]: null})} title="Restablecer">↩</button> : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/* ── Panel de contenido (tab Texto) ──────────────────────────────────────── */
function ContentPanel({ cfg, patch }) {
  const s = cfg.struct||{};
  const isList = s.kind==="list"||s.kind==="grid";

  return (
    <div className="cp-scroll">
      {/* ── Texto ── */}
      <div className="cp-sec">
        <div className="cp-sec-lbl">TEXTO</div>
        <TF cfg={cfg} patch={patch} label="Título" fk="title" sk="titleShow" ck="titleColor" multi notUsed={false} szKey="titleFontSize" szDef={116} szMin={32} szMax={320}/>
        <TF cfg={cfg} patch={patch} label="Bajada" fk="subtitle" sk="subShow" ck="subColor" multi notUsed={!s.sub} szKey="subFontSize" szDef={40} szMin={16} szMax={130}/>
        <TF cfg={cfg} patch={patch} label="CTA / botón" fk="cta" sk="ctaShow" ck="ctaColor" notUsed={!s.cta||s.cta==="none"} szKey="ctaFontSize" szDef={42} szMin={16} szMax={110}/>
        {cfg.ctaShow !== false ? (
          <div className="cp-field">
            <div className="cp-label" style={{marginBottom:6}}>Formato del botón</div>
            <FmtPicker options={CTA_FMTS} value={cfg.ctaFormat||"auto"} onChange={v=>patch({ctaFormat:v})}/>
          </div>
        ) : null}
        <TF cfg={cfg} patch={patch} label="Handle / @arroba" fk="handle" sk="handleShow" ck="handleColor" notUsed={s.handle===false} szKey="handleFontSize" szDef={28} szMin={14} szMax={72}/>
      </div>

      {/* ── Precio ── */}
      <div className="cp-sec">
        <div className="cp-sec-head"><span className="cp-sec-lbl">PRECIO</span><Toggle v={cfg.showPrice} on={v=>patch({showPrice:v})}/></div>
        {cfg.showPrice?(
          <div>
            <div className="cp-field">
              <div className="cp-label" style={{marginBottom:6}}>Formato del precio</div>
              <FmtPicker options={PRICE_FMTS} value={cfg.priceFormat||"auto"} onChange={v=>patch({priceFormat:v})}/>
            </div>
            <div className="cp-row2">
              <div className="cp-field" style={{flex:1}}>
                <div className="cp-label">Eyebrow <span className="cp-hint-i">ej. SOLO</span></div>
                <input className="cp-in" value={cfg.priceEyebrow||""} placeholder="SOLO" onChange={e=>patch({priceEyebrow:e.target.value})}/>
              </div>
              <div className="cp-field" style={{flex:1}}>
                <div className="cp-label">Unidad <span className="cp-hint-i">ej. 1.5L</span></div>
                <input className="cp-in" value={cfg.priceUnit||""} placeholder="c/u" onChange={e=>patch({priceUnit:e.target.value})}/>
              </div>
            </div>
            <div className="cp-field">
              <div className="cp-fhead">
                <span className="cp-label">Precio principal</span>
                <BrandPicker sm v={cfg.priceColor} on={v=>patch({priceColor:v})}/>
              </div>
              <input className="cp-in cp-price-in" value={cfg.priceMain||""} placeholder="$0.000" onChange={e=>patch({priceMain:e.target.value})}/>
              <div className="cp-size-row">
                <span className="cp-size-lbl">Tamaño</span>
                <Slider v={cfg.priceFontSize||90} min={30} max={260} step={2} on={v=>patch({priceFontSize:v})}/>
                <span className="cp-size-val">{cfg.priceFontSize||90}px</span>
                {cfg.priceFontSize?<button className="cp-size-rst" onClick={()=>patch({priceFontSize:null})} title="Restablecer">↩</button>:null}
              </div>
            </div>
            <div className="cp-field">
              <div className="cp-label">Precio anterior (tachado)</div>
              <input className="cp-in" value={cfg.priceStrike||""} placeholder="$0.000" onChange={e=>patch({priceStrike:e.target.value})}/>
            </div>
          </div>
        ):null}
      </div>

      {/* ── Etiqueta / Badge ── */}
      <div className="cp-sec">
        <div className="cp-sec-head"><span className="cp-sec-lbl">ETIQUETA</span><Toggle v={cfg.badgeShow} on={v=>patch({badgeShow:v})}/></div>
        {cfg.badgeShow?(
          <div>
            <div className="cp-field">
              <input className="cp-in" value={cfg.badge||""} placeholder="OFERTA" onChange={e=>patch({badge:e.target.value})}/>
              <div className="cp-size-row">
                <span className="cp-size-lbl">Tamaño</span>
                <Slider v={cfg.badgeFontSize||40} min={18} max={110} step={1} on={v=>patch({badgeFontSize:v})}/>
                <span className="cp-size-val">{cfg.badgeFontSize||40}px</span>
                {cfg.badgeFontSize?<button className="cp-size-rst" onClick={()=>patch({badgeFontSize:null})} title="Restablecer">↩</button>:null}
              </div>
            </div>
            <div className="cp-field">
              <div className="cp-label" style={{marginBottom:8}}>Color de la etiqueta</div>
              <div className="badge-colors">
                {[["yellow","#FFD400","#2D2926","Amarillo"],["red","#F40000","#fff","Rojo"],["white","#F0F0F1","#F40000","Blanco"],["dark","#2D2926","#fff","Negro"],["celeste","#5AA0DC","#fff","Celeste"]].map(([k,bg,fg,lbl])=>(
                  <button key={k} className={"badge-sw"+(cfg.badgeStyle===k?" is-on":"")}
                    style={{background:bg,color:fg,borderColor:cfg.badgeStyle===k?"var(--accent)":"transparent"}}
                    onClick={()=>patch({badgeStyle:k})}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="cp-field">
              <div className="cp-label" style={{marginBottom:6}}>Forma de la etiqueta</div>
              <FmtPicker options={BADGE_SHAPES} value={cfg.badgeShape||"diag"} onChange={v=>patch({badgeShape:v})}/>
            </div>
          </div>
        ):null}
      </div>

      {/* ── Logo ── */}
      <div className="cp-sec">
        <div className="cp-sec-head"><span className="cp-sec-lbl">LOGO</span><Toggle v={cfg.logoShow!==false} on={v=>patch({logoShow:v})}/></div>
        {cfg.logoShow!==false?(
          <div className="cp-row2" style={{alignItems:"flex-start"}}>
            <div>
              <div className="cp-label" style={{marginBottom:6}}>Posición</div>
              <LogoGrid v={cfg.logoPos} on={v=>patch({logoPos:v})}/>
            </div>
            <div style={{flex:1}}>
              <div className="cp-label" style={{marginBottom:6}}>Color logo</div>
              <div style={{display:"flex",gap:5,marginBottom:10}}>
                {[["auto","var(--ink-200)","Auto"],["white","#F0F0F1","Blco"],["red","#F40000","Rojo"],["black","#2D2926","Negro"]].map(([k,bg,lbl])=>(
                  <button key={k} aria-pressed={cfg.logoColor===k} title={lbl}
                    style={{width:24,height:24,borderRadius:5,border:"2px solid",borderColor:cfg.logoColor===k?"var(--accent)":"rgba(0,0,0,.12)",background:bg,cursor:"pointer",flexShrink:0}}
                    onClick={()=>patch({logoColor:k})}/>
                ))}
              </div>
              <div className="cp-label" style={{marginBottom:4}}>Tamaño {Math.round((cfg.logoSize||1)*100)}%</div>
              <Slider v={cfg.logoSize||1} min={0.4} max={2} step={0.05} on={v=>patch({logoSize:v})}/>
            </div>
          </div>
        ):null}
      </div>

      {/* ── Lista de items (para plantillas lista/grilla) ── */}
      {isList?(
        <div className="cp-sec">
          <div className="cp-sec-lbl">ITEMS DE LA LISTA</div>
          {(cfg.rows||[]).map((r,i)=>(
            <div key={i} className="cp-row-item">
              <span className="cp-row-n">{i+1}</span>
              <input className="cp-in" style={{flex:2}} value={r.name||""} placeholder="Producto"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,name:e.target.value};patch({rows:rws});}}/>
              <input className="cp-in cp-price-in" style={{flex:1}} value={r.price||""} placeholder="$0.000"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,price:e.target.value};patch({rows:rws});}}/>
              <input className="cp-in" style={{width:52}} value={r.flag||""} placeholder="2x1"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,flag:e.target.value};patch({rows:rws});}}/>
            </div>
          ))}
          <button className="cp-add-row" onClick={()=>patch({rows:[...(cfg.rows||[]),{name:"",price:"$0.000",flag:""}]})}>
            <Ic d={I.plus} size={13}/> Agregar ítem
          </button>
        </div>
      ):null}
    </div>
  );
}

/* ── Panel de fondo (tab Fondo) ──────────────────────────────────────────── */
function BgPanel({ cfg, W, H, patch, patchBgView, patchPhotoView, onBgFile, onPhotoFile }) {
  const bgRef=useRef(null), phRef=useRef(null);
  const s = cfg.struct||{};
  const hasSlot = s.photo&&s.photo!=="none";

  return (
    <div className="cp-scroll">
      {/* color de fondo */}
      <div className="cp-sec">
        <div className="cp-sec-lbl">COLOR DE FONDO</div>
        <div className="bg-colors">
          {[["red","#F40000","Rojo"],["dark","#2D2926","Negro"],["white","#F0F0F1","Blanco"],
            ["yellow","#FFD400","Amarillo"],["celeste","#5AA0DC","Celeste"],["cream","#E7E4E0","Crema"]].map(([k,bg,lbl])=>(
            <button key={k} className={"bg-col"+(cfg.bg===k?" is-on":"")} onClick={()=>patch({bg:k})}>
              <span className="bg-col-sw" style={{background:bg}}></span>{lbl}
            </button>
          ))}
        </div>
      </div>

      {/* foto de fondo */}
      <div className="cp-sec">
        <div className="cp-sec-lbl">FOTO DE FONDO</div>
        {!cfg.bgImage?(
          <button className="cp-upload" onClick={()=>bgRef.current&&bgRef.current.click()}>
            <Ic d={I.img} size={22}/>
            <div><b>Subir foto de fondo</b><small>JPG, PNG, WebP · recomendado 1080 px o más</small></div>
          </button>
        ):(
          <div>
            <div className="cp-photo-row">
              <div className="cp-photo-tn" style={{backgroundImage:`url(${cfg.bgImage})`}}></div>
              <div className="cp-photo-meta">
                <b>Foto de fondo cargada</b>
                <div><button className="linkbtn" onClick={()=>bgRef.current&&bgRef.current.click()}>Cambiar</button>
                  <span style={{margin:"0 5px",color:"var(--fg3)"}}>·</span>
                  <button className="linkbtn" onClick={()=>patch({bgImage:null,bgView:{s:1,x:0,y:0}})}>Quitar</button></div>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <div className="cp-label" style={{marginBottom:8}}>ENCUADRE — arrastrá la foto para reposicionar</div>
              <BgRepositioner src={cfg.bgImage} view={cfg.bgView} W={W} H={H} onChange={patchBgView}/>
            </div>
            <div style={{marginTop:10}}>
              <div className="cp-label" style={{marginBottom:6}}>Ajuste de contraste</div>
              <div className="cp-pills">
                {[["light","Oscurecer (texto claro)"],["dark","Aclarar (texto oscuro)"]].map(([k,lbl])=>(
                  <button key={k} className={"cp-pill"+(cfg.bgInk===k?" is-on":"")} onClick={()=>patch({bgInk:k})}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        <input ref={bgRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(f)onBgFile(f);e.target.value="";}}/>
      </div>

      {/* foto de producto */}
      <div className="cp-sec">
        <div className="cp-sec-lbl">FOTO DE PRODUCTO</div>
        {!cfg.photo?(
          <button className={"cp-upload"+(hasSlot?"":" cp-upload-dim")} onClick={()=>phRef.current&&phRef.current.click()}>
            <Ic d={I.img} size={22}/>
            <div><b>Subir foto de producto</b>
              <small>{hasSlot?"PNG sin fondo recomendado":"Esta plantilla no tiene slot de producto"}</small></div>
          </button>
        ):(
          <div>
            <div className="cp-photo-row">
              <div className="cp-photo-tn" style={{backgroundImage:`url(${cfg.photo})`,backgroundSize:"contain",backgroundRepeat:"no-repeat"}}></div>
              <div className="cp-photo-meta">
                <b>Foto de producto</b>
                <div><button className="linkbtn" onClick={()=>phRef.current&&phRef.current.click()}>Cambiar</button>
                  <span style={{margin:"0 5px",color:"var(--fg3)"}}>·</span>
                  <button className="linkbtn" onClick={()=>patch({photo:null})}>Quitar</button></div>
              </div>
            </div>
            <div style={{marginTop:10}}>
              <div className="cp-fhead" style={{marginBottom:4}}>
                <span className="cp-label">Zoom del producto</span>
                <span className="cp-hint-i">{Math.round((cfg.photoView&&cfg.photoView.s||1)*100)}%</span>
              </div>
              <Slider v={(cfg.photoView&&cfg.photoView.s)||1} min={0.3} max={3} step={0.02}
                on={sv=>patchPhotoView({s:sv})}/>
              <div className="cp-pills" style={{marginTop:8}}>
                {[["contain","Contener"],["cover","Llenar"]].map(([k,lbl])=>(
                  <button key={k} className={"cp-pill"+((cfg.photoView&&cfg.photoView.fit)===k?" is-on":"")}
                    onClick={()=>patchPhotoView({fit:k})}>{lbl}</button>
                ))}
                <button className="cp-pill" onClick={()=>patchPhotoView({s:1,x:0,y:0})}>Centrar</button>
              </div>
            </div>
          </div>
        )}
        <input ref={phRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(f)onPhotoFile(f);e.target.value="";}}/>
      </div>
    </div>
  );
}

/* ── Panel de posición (tab Posición) ────────────────────────────────────── */
const ENAMES={titleOff:"Título",subOff:"Bajada",priceOff:"Precio",ctaOff:"CTA",handleOff:"Arroba",logoOff:"Logo",badgeOff:"Etiqueta",burstOff:"Precio circular"};
function PosPanel({ sel, cfg, W, H, scale, locked, toggleLock, patch, setSel }) {
  if (!sel) return (
    <div className="pos-empty-v2">
      <div className="pos-empty-ico"><Ic d={I.pin} size={24}/></div>
      <p>Hacé clic sobre cualquier elemento del lienzo para seleccionarlo y ajustar su posición con precisión.</p>
    </div>
  );
  const off=cfg[sel]||{x:0,y:0};
  const isLocked=locked.has(sel);
  const S=window.safeInsets?window.safeInsets(W,H):{top:64,bottom:64,left:64,right:64};

  function getM() {
    try {
      const c=document.querySelector(".preview-frame > div");
      if(!c) return null;
      const el=c.querySelector(`[data-offkey="${sel}"]`);
      if(!el) return null;
      const er=el.getBoundingClientRect(), cr=c.getBoundingClientRect();
      if(!cr.width) return null;
      return {cx:((er.left+er.right)/2-cr.left)/scale,cy:((er.top+er.bottom)/2-cr.top)/scale,w:er.width/scale,h:er.height/scale};
    }catch(e){return null;}
  }
  const align=fn=>{const m=getM();if(m)patch({[sel]:fn(m)});};
  const nudge=(dx,dy)=>patch({[sel]:{x:off.x+dx,y:off.y+dy}});

  return (
    <div className="cp-scroll">
      <div className="pos-header">
        <span className="pos-name">{ENAMES[sel]||sel}</span>
        <div className="pos-hdr-btns">
          <button className={"pos-hdr-btn"+(isLocked?" is-locked":"")} onClick={()=>toggleLock(sel)} title={isLocked?"Desbloquear":"Bloquear"}>
            <Ic d={isLocked?I.lock:I.unlk} size={13}/>
          </button>
          <button className="pos-hdr-btn" onClick={()=>patch({[sel]:{x:0,y:0}})} title="Restablecer"><Ic d={I.ref2} size={13}/></button>
          <button className="pos-hdr-btn" onClick={()=>setSel(null)}><Ic d={I.x} size={13}/></button>
        </div>
      </div>
      <div className="pos-coords">
        {[["X","x"],["Y","y"]].map(([lbl,k])=>(
          <div key={k} className="pos-coord">
            <span className="pos-coord-lbl">{lbl}</span>
            <input className="pos-coord-inp" type="number" value={off[k]||0}
              onChange={e=>patch({[sel]:{...off,[k]:parseInt(e.target.value)||0}})}/>
          </div>
        ))}
      </div>
      <div className="cp-label" style={{marginBottom:6}}>Alinear en el lienzo</div>
      <div className="pos-align-row">
        <button className="pos-align-btn" onClick={()=>align(m=>({x:Math.round(S.left+m.w/2-m.cx+off.x),y:off.y}))}>⬅ Izq</button>
        <button className="pos-align-btn" onClick={()=>align(m=>({x:Math.round(W/2-m.cx+off.x),y:Math.round(H/2-m.cy+off.y)}))}>⊞ Centro</button>
        <button className="pos-align-btn" onClick={()=>align(m=>({x:Math.round(W-S.right-m.w/2-m.cx+off.x),y:off.y}))}>Der ➡</button>
      </div>
      <div className="pos-align-row">
        <button className="pos-align-btn" onClick={()=>align(m=>({x:off.x,y:Math.round(S.top+m.h/2-m.cy+off.y)}))}>⬆ Arriba</button>
        <button className="pos-align-btn" onClick={()=>align(m=>({x:Math.round(W/2-m.cx+off.x),y:off.y}))}>↔ Centro H</button>
        <button className="pos-align-btn" onClick={()=>align(m=>({x:off.x,y:Math.round(H-S.bottom-m.h/2-m.cy+off.y)}))}>Abajo ⬇</button>
      </div>
      <div className="cp-label" style={{margin:"12px 0 5px"}}>Nudge fino</div>
      <div className="pos-nudge-row">
        {[[-50,0,"←50"],[-10,0,"←10"],[-1,0,"←1"],[1,0,"1→"],[10,0,"10→"],[50,0,"50→"]].map(([dx,dy,lbl])=>(
          <button key={lbl} className="pos-nudge-btn" onClick={()=>nudge(dx,dy)}>{lbl}</button>
        ))}
      </div>
      <div className="pos-nudge-row" style={{marginTop:4}}>
        {[[0,-50,"↑50"],[0,-10,"↑10"],[0,-1,"↑1"],[0,1,"↓1"],[0,10,"↓10"],[0,50,"↓50"]].map(([dx,dy,lbl])=>(
          <button key={lbl} className="pos-nudge-btn" onClick={()=>nudge(dx,dy)}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

/* ── QuickPanel — panel único de edición rápida ──────────────────────────── */
function QuickPanel({ cfg, patch, W, H, sel, setSel, scale, locked, toggleLock, patchPos,
                      patchBgView, patchPhotoView, onBgFile, onPhotoFile, advOpen, setAdvOpen }) {
  const bgRef = useRef(null), phRef = useRef(null);
  const s = cfg.struct || {};
  const isList = s.kind === "list" || s.kind === "grid";
  const hasPrice = !isList && s.price !== "none";

  return (
    <div className="qp-scroll">
      {/* ── Campos rápidos ── */}
      {isList ? (
        <div className="cp-sec">
          <TF cfg={cfg} patch={patch} label="Título" fk="title" sk="titleShow" ck="titleColor" multi szKey="titleFontSize" szDef={116} szMin={32} szMax={320}/>
          <div className="cp-sec-lbl" style={{marginTop:14,marginBottom:6}}>FILAS</div>
          {(cfg.rows||[]).map((r,i)=>(
            <div key={i} className="cp-row-item">
              <span className="cp-row-n">{i+1}</span>
              <input className="cp-in" style={{flex:2}} value={r.name||""} placeholder="Descripción"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,name:e.target.value};patch({rows:rws});}}/>
              <input className="cp-in" style={{flex:1}} value={r.price||""} placeholder="Valor"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,price:e.target.value};patch({rows:rws});}}/>
              <input className="cp-in" style={{width:44}} value={r.flag||""} placeholder="⭐"
                onChange={e=>{const rws=[...cfg.rows];rws[i]={...r,flag:e.target.value};patch({rows:rws});}}/>
            </div>
          ))}
          <button className="cp-add-row" onClick={()=>patch({rows:[...(cfg.rows||[]),{name:"",price:"",flag:""}]})}>
            <Ic d={I.plus} size={13}/> Agregar fila
          </button>
        </div>
      ) : (
        <div className="cp-sec">
          <TF cfg={cfg} patch={patch} label="Título" fk="title" sk="titleShow" ck="titleColor" multi szKey="titleFontSize" szDef={116} szMin={32} szMax={320}/>
          <TF cfg={cfg} patch={patch} label="Bajada" fk="subtitle" sk="subShow" ck="subColor" multi notUsed={!s.sub} szKey="subFontSize" szDef={40} szMin={16} szMax={130}/>
          {hasPrice ? (
            <div className="cp-field">
              <div className="cp-fhead">
                <span className="cp-label">Precio principal</span>
                <BrandPicker sm v={cfg.priceColor} on={v=>patch({priceColor:v})}/>
              </div>
              <input className="cp-in cp-price-in" value={cfg.priceMain||""} placeholder="$0.000" onChange={e=>patch({priceMain:e.target.value})}/>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Color de fondo + fotos ── */}
      <div className="cp-sec">
        <div className="cp-sec-lbl">COLOR DE FONDO</div>
        <div className="bg-colors">
          {[["red","#F40000","Rojo"],["dark","#2D2926","Negro"],["white","#F0F0F1","Blanco"],
            ["yellow","#FFD400","Amarillo"],["celeste","#5AA0DC","Celeste"],["cream","#E7E4E0","Crema"]].map(([k,bg,lbl])=>(
            <button key={k} className={"bg-col"+(cfg.bg===k?" is-on":"")} onClick={()=>patch({bg:k})}>
              <span className="bg-col-sw" style={{background:bg}}></span>{lbl}
            </button>
          ))}
        </div>
        <div className="qp-photo-row">
          <button className={"qp-photo-btn"+(cfg.bgImage?" is-has":"")}
            onClick={()=>bgRef.current&&bgRef.current.click()}>
            <Ic d={I.img} size={14}/>{cfg.bgImage?"Cambiar fondo":"+ Foto fondo"}
          </button>
          <button className={"qp-photo-btn"+(cfg.photo?" is-has":"")}
            onClick={()=>phRef.current&&phRef.current.click()}>
            <Ic d={I.botl} size={14}/>{cfg.photo?"Cambiar producto":"+ Foto producto"}
          </button>
        </div>
        {cfg.bgImage ? (
          <div style={{marginTop:8}}>
            <BgRepositioner src={cfg.bgImage} view={cfg.bgView} W={W} H={H} onChange={patchBgView}/>
            <button className="linkbtn" style={{marginTop:4,fontSize:11}} onClick={()=>patch({bgImage:null,bgView:{s:1,x:0,y:0}})}>Quitar foto de fondo</button>
          </div>
        ) : null}
        {cfg.photo ? (
          <div style={{marginTop:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
              <div className="cp-photo-tn" style={{backgroundImage:`url(${cfg.photo})`,backgroundSize:"contain",backgroundRepeat:"no-repeat"}}></div>
              <button className="linkbtn" style={{fontSize:11}} onClick={()=>patch({photo:null})}>Quitar foto</button>
            </div>
            <div className="cp-size-row">
              <span className="cp-size-lbl">Zoom foto</span>
              <Slider v={(cfg.photoView&&cfg.photoView.s)||1} min={0.3} max={3} step={0.02}
                on={s=>patchPhotoView({s})}/>
              <span className="cp-size-val">{Math.round(((cfg.photoView&&cfg.photoView.s)||1)*100)}%</span>
            </div>
          </div>
        ) : null}
        <input ref={bgRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(f)onBgFile(f);e.target.value="";}}/>
        <input ref={phRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(f)onPhotoFile(f);e.target.value="";}}/>
      </div>

      {/* ── Acordeón avanzado ── */}
      <button className="qp-adv-toggle" onClick={()=>setAdvOpen(o=>!o)}>
        {advOpen?"▴ Ocultar ajustes avanzados":"▾ Ajustes avanzados"}
      </button>
      {advOpen ? (
        <div className="cp-sec">
          {/* CTA */}
          <TF cfg={cfg} patch={patch} label="CTA / botón" fk="cta" sk="ctaShow" ck="ctaColor" notUsed={!s.cta||s.cta==="none"} szKey="ctaFontSize" szDef={42} szMin={16} szMax={110}/>
          {cfg.ctaShow !== false ? (
            <div className="cp-field">
              <div className="cp-label" style={{marginBottom:6}}>Formato del botón</div>
              <FmtPicker options={CTA_FMTS} value={cfg.ctaFormat||"auto"} onChange={v=>patch({ctaFormat:v})}/>
            </div>
          ) : null}
          <TF cfg={cfg} patch={patch} label="Handle / @arroba" fk="handle" sk="handleShow" ck="handleColor" notUsed={s.handle===false} szKey="handleFontSize" szDef={28} szMin={14} szMax={72}/>

          {/* Etiqueta */}
          <div className="cp-sec-head" style={{marginTop:10}}>
            <span className="cp-sec-lbl">ETIQUETA</span>
            <Toggle v={cfg.badgeShow} on={v=>patch({badgeShow:v})}/>
          </div>
          {cfg.badgeShow ? (
            <>
              <div className="cp-field">
                <input className="cp-in" value={cfg.badge||""} placeholder="OFERTA" onChange={e=>patch({badge:e.target.value})}/>
              </div>
              <div className="cp-field">
                <div className="badge-colors">
                  {[["yellow","#FFD400","#2D2926","Amarillo"],["red","#F40000","#fff","Rojo"],
                    ["white","#F0F0F1","#F40000","Blanco"],["dark","#2D2926","#fff","Negro"],
                    ["celeste","#5AA0DC","#fff","Celeste"]].map(([k,bg,fg,lbl])=>(
                    <button key={k} className={"badge-sw"+(cfg.badgeStyle===k?" is-on":"")}
                      style={{background:bg,color:fg,borderColor:cfg.badgeStyle===k?"var(--accent)":"transparent"}}
                      onClick={()=>patch({badgeStyle:k})}>{lbl}</button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* Precio avanzado (solo si hay precio) */}
          {hasPrice ? (
            <div style={{marginTop:8}}>
              <div className="cp-sec-head">
                <span className="cp-sec-lbl">PRECIO DETALLADO</span>
                <Toggle v={cfg.showPrice} on={v=>patch({showPrice:v})}/>
              </div>
              {cfg.showPrice ? (
                <>
                  <div className="cp-field">
                    <div className="cp-label" style={{marginBottom:6}}>Formato</div>
                    <FmtPicker options={PRICE_FMTS} value={cfg.priceFormat||"auto"} onChange={v=>patch({priceFormat:v})}/>
                  </div>
                  <div className="cp-row2">
                    <div className="cp-field" style={{flex:1}}>
                      <div className="cp-label">Eyebrow</div>
                      <input className="cp-in" value={cfg.priceEyebrow||""} placeholder="SOLO" onChange={e=>patch({priceEyebrow:e.target.value})}/>
                    </div>
                    <div className="cp-field" style={{flex:1}}>
                      <div className="cp-label">Unidad</div>
                      <input className="cp-in" value={cfg.priceUnit||""} placeholder="c/u" onChange={e=>patch({priceUnit:e.target.value})}/>
                    </div>
                  </div>
                  <div className="cp-field">
                    <div className="cp-label">Tachado</div>
                    <input className="cp-in" value={cfg.priceStrike||""} placeholder="$0.000" onChange={e=>patch({priceStrike:e.target.value})}/>
                  </div>
                  <div className="cp-size-row">
                    <span className="cp-size-lbl">Tamaño</span>
                    <Slider v={cfg.priceFontSize||90} min={30} max={260} step={2} on={v=>patch({priceFontSize:v})}/>
                    <span className="cp-size-val">{cfg.priceFontSize||90}px</span>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {/* Logo */}
          <div className="cp-sec-head" style={{marginTop:10}}>
            <span className="cp-sec-lbl">LOGO</span>
            <Toggle v={cfg.logoShow!==false} on={v=>patch({logoShow:v})}/>
          </div>
          {cfg.logoShow !== false ? (
            <div className="cp-row2" style={{alignItems:"flex-start"}}>
              <div>
                <div className="cp-label" style={{marginBottom:6}}>Posición</div>
                <LogoGrid v={cfg.logoPos} on={v=>patch({logoPos:v})}/>
              </div>
              <div style={{flex:1}}>
                <div className="cp-label" style={{marginBottom:6}}>Color logo</div>
                <div style={{display:"flex",gap:5,marginBottom:8}}>
                  {[["auto","var(--ink-200)","Auto"],["white","#F0F0F1","B"],["red","#F40000","R"],["black","#2D2926","N"]].map(([k,bg,lbl])=>(
                    <button key={k} aria-pressed={cfg.logoColor===k} title={lbl}
                      style={{width:24,height:24,borderRadius:5,border:"2px solid",borderColor:cfg.logoColor===k?"var(--accent)":"rgba(0,0,0,.12)",background:bg,cursor:"pointer"}}
                      onClick={()=>patch({logoColor:k})}/>
                  ))}
                </div>
                <div className="cp-label" style={{marginBottom:4}}>Tamaño {Math.round((cfg.logoSize||1)*100)}%</div>
                <Slider v={cfg.logoSize||1} min={0.4} max={2} step={0.05} on={v=>patch({logoSize:v})}/>
              </div>
            </div>
          ) : null}

          {/* Posición */}
          <div className="cp-sec-head" style={{marginTop:10}}>
            <span className="cp-sec-lbl">POSICIÓN</span>
          </div>
          <PosPanel sel={sel} cfg={cfg} W={W} H={H} scale={scale}
            locked={locked} toggleLock={toggleLock} patch={patchPos} setSel={setSel}/>
        </div>
      ) : null}
    </div>
  );
}

/* ── Bottom tab bar móvil ────────────────────────────────────────────────── */
const MOB_TABS = [
  {id:"plantillas", label:"Plantillas", ic:I.sq},
  {id:"canvas",     label:"Canvas",     ic:I.eye},
  {id:"editar",     label:"Editar",     ic:I.chk},
  {id:"avanzado",   label:"Avanzado",   ic:I.pin},
];
function MobTabBar({ active, onTab }) {
  return (
    <nav className="mob-tab-bar">
      {MOB_TABS.map(({id,label,ic})=>(
        <button key={id} className={active===id?"is-on":""} onClick={()=>onTab(id)}>
          <Ic d={ic} size={22}/>{label}
        </button>
      ))}
    </nav>
  );
}
function MobSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="mob-sheet-backdrop" onClick={onClose}/>
      <div className="mob-sheet">
        <div className="mob-sheet-handle"><span/></div>
        <div className="mob-sheet-inner">{children}</div>
      </div>
    </>
  );
}

/* ── App principal ───────────────────────────────────────────────────────── */
const TDEFS = {studio:"claro"};

function App() {
  useEffect(() => { window.__hideSplash && window.__hideSplash(); }, []);
  const [t] = useTweaks(TDEFS);
  const [fmt, setFmt]     = useState("carrusel");
  const [cRatio, setCR]   = useState("1:1");
  const [slides, setSlides] = useState([freshCfg()]);
  const [active, setActive] = useState(0);
  const [scale, setScale]   = useState(0.4);
  const [busy, setBusy]     = useState(false);
  const [pct, setPct]       = useState(-1);
  const [toast, setToast]   = useState("");
  const [dragOver, setDO]   = useState(false);
  const [safeOn, setSafeOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [sel, setSel]       = useState(null);
  const [locked, setLocked] = useState(new Set());
  const [snaps, setSnaps]   = useState([]);
  const [liveXY, setLiveXY] = useState(null);
  const [canUndo, setCanU]  = useState(false);
  const [canRedo, setCanR]  = useState(false);
  const [reelCat, setRC]    = useState("precio");
  const [reelTmpl, setRT]   = useState("precio-estalla");
  const [mobTab, setMobTab] = useState("canvas");
  const stageRef=useRef(null), placaRef=useRef(null);
  const hRef=useRef([]), fRef=useRef([]), slRef=useRef(slides), ttRef=useRef(null);

  useEffect(()=>{slRef.current=slides;},[slides]);
  const {W,H}=dimsFor(fmt,cRatio);
  const isMulti=fmt==="carrusel"||fmt==="historia";
  const isReel=fmt==="reel";
  const cfg=slides[Math.min(active,slides.length-1)]||slides[0];

  const snTargets=useMemo(()=>{
    const S=window.safeInsets?window.safeInsets(W,H):{top:64,bottom:64,left:64,right:64};
    return [{x:Math.round(W/2)},{y:Math.round(H/2)},{x:Math.round(W/3)},{x:Math.round(W*2/3)},
      {y:Math.round(H/3)},{y:Math.round(H*2/3)},{x:S.left},{x:W-S.right},{y:S.top},{y:H-S.bottom}];
  },[W,H]);

  const showToast=useCallback(msg=>{setToast(msg);clearTimeout(ttRef.current);ttRef.current=setTimeout(()=>setToast(""),2400);},[]);
  const patch=useCallback(p=>{setSlides(a=>a.map((s,i)=>i===active?{...s,...p}:s));},[active]);
  const patchBgView=useCallback(v=>{setSlides(a=>a.map((s,i)=>i===active?{...s,bgView:v}:s));},[active]);
  const patchPhotoView=useCallback(p=>{setSlides(a=>a.map((s,i)=>i===active?{...s,photoView:{...(s.photoView||{s:1,x:0,y:0}),...p}}:s));},[active]);

  const handleMove=useCallback((offKey,off)=>{
    hRef.current=[...hRef.current.slice(-29),slRef.current];fRef.current=[];
    setCanU(true);setCanR(false);
    setSlides(a=>a.map((s,i)=>i===active?{...s,[offKey]:off}:s));
  },[active]);

  const undo=useCallback(()=>{
    const h=hRef.current;if(!h.length)return;
    fRef.current=[slRef.current,...fRef.current.slice(0,29)];hRef.current=h.slice(0,-1);
    setCanU(hRef.current.length>0);setCanR(true);setSlides(h[h.length-1]);
  },[]);
  const redo=useCallback(()=>{
    const f=fRef.current;if(!f.length)return;
    hRef.current=[...hRef.current,slRef.current];fRef.current=f.slice(1);
    setCanU(true);setCanR(fRef.current.length>0);setSlides(f[0]);
  },[]);
  const toggleLock=useCallback(k=>{setLocked(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;});},[]);

  useEffect(()=>{
    const fn=e=>{
      const mod=e.ctrlKey||e.metaKey;
      if(mod&&!e.shiftKey&&e.key.toLowerCase()==="z"){e.preventDefault();undo();}
      if(mod&&(e.key.toLowerCase()==="y"||(e.shiftKey&&e.key.toLowerCase()==="z"))){e.preventDefault();redo();}
    };
    document.addEventListener("keydown",fn);return()=>document.removeEventListener("keydown",fn);
  },[undo,redo]);

  const OFFKEYS=["titleOff","subOff","priceOff","ctaOff","handleOff","logoOff","badgeOff","burstOff"];
  const applyTmpl=useCallback(item=>{
    const it=item.cfg,ns=(it.struct&&it.struct.photo)||"none";
    const isDatos = item.cat === "datos";
    const next={
      ...it,
      // Para plantillas "datos": conservar su contenido pre-cargado; para otras: conservar el del usuario
      title:isDatos?it.title:cfg.title,
      subtitle:isDatos?it.subtitle:cfg.subtitle,
      badge:isDatos?it.badge:cfg.badge,
      priceEyebrow:isDatos?it.priceEyebrow:cfg.priceEyebrow,
      priceMain:isDatos?it.priceMain:cfg.priceMain,
      priceUnit:isDatos?it.priceUnit:cfg.priceUnit,
      priceStrike:isDatos?it.priceStrike:cfg.priceStrike,
      cta:isDatos?it.cta:cfg.cta,
      handle:isDatos?it.handle:cfg.handle,
      rows:isDatos?it.rows:cfg.rows,
      badgeStyle:isDatos?it.badgeStyle:cfg.badgeStyle,
      badgeShow:isDatos?it.badgeShow:cfg.badgeShow,
      showPrice:cfg.showPrice,
      logoShow:cfg.logoShow,logoPos:cfg.logoPos,logoColor:cfg.logoColor,logoSize:cfg.logoSize,
      bgImage:cfg.bgImage,bgView:cfg.bgView,bgInk:cfg.bgInk,
      titleColor:cfg.titleColor,subColor:cfg.subColor,priceColor:cfg.priceColor,
      ctaColor:cfg.ctaColor,handleColor:cfg.handleColor,
      titleShow:cfg.titleShow,subShow:cfg.subShow,ctaShow:cfg.ctaShow,handleShow:cfg.handleShow,
      titleFontSize:cfg.titleFontSize,subFontSize:cfg.subFontSize,
      ctaFontSize:cfg.ctaFontSize,handleFontSize:cfg.handleFontSize,
      priceFontSize:cfg.priceFontSize,badgeFontSize:cfg.badgeFontSize,
    };
    if(cfg.photo&&ns!=="none"){next.photo=cfg.photo;next.photoView=cfg.photoView;}
    OFFKEYS.forEach(k=>{next[k]=null;});
    setSlides(a=>a.map((s,i)=>i===active?next:s));
    showToast("Plantilla aplicada ✓");
  },[cfg,active,showToast]);

  const loadBg=useCallback(f=>{
    if(!f||!/^image\//.test(f.type))return;
    const rd=new FileReader();
    rd.onload=()=>{patch({bgImage:rd.result,bgVideo:null,bgView:{s:1,x:0,y:0}});showToast("Foto de fondo cargada");};
    rd.readAsDataURL(f);
  },[patch,showToast]);

  const loadPh=useCallback(f=>{
    if(!f||!/^image\//.test(f.type))return;
    const rd=new FileReader();
    rd.onload=()=>{patch({photo:rd.result,photoView:{s:1,x:0,y:0,fit:"contain"}});showToast("Foto de producto cargada");};
    rd.readAsDataURL(f);
  },[patch,showToast]);

  const onDrop=useCallback(e=>{e.preventDefault();setDO(false);const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f)loadBg(f);},[loadBg]);

  useEffect(()=>{
    const el=stageRef.current;if(!el)return;
    const fit=()=>{const pad=48,aw=el.clientWidth-pad*2,ah=el.clientHeight-pad*2;if(aw>0&&ah>0)setScale(Math.min(aw/W,ah/H,0.62));};
    fit();const ro=new ResizeObserver(fit);ro.observe(el);return()=>ro.disconnect();
  },[W,H]);

  const doDownload=useCallback(async()=>{
    setBusy(true);const pr=exportScale(fmt);
    try {
      if(isMulti&&slides.length>1){
        for(let i=0;i<slides.length;i++){const url=await captureSlide(slides[i],W,H,pr);dlUrl(url,`kiosco-enjoy-${String(i+1).padStart(2,"0")}.png`);await new Promise(r=>setTimeout(r,250));}
        showToast(`${slides.length} slides descargados`);
      } else {
        const url=await captureSlide(cfg,W,H,pr);dlUrl(url,"kiosco-enjoy-placa.png");showToast("Placa descargada ✓");
      }
    }catch(err){console.error(err);showToast("Error al exportar");}
    finally{setBusy(false);}
  },[fmt,isMulti,slides,cfg,W,H,showToast]);

  const doReel=useCallback(async()=>{
    if(!window.exportReelVideo){showToast("Motor no disponible");return;}
    setBusy(true);setPct(0);
    try{
      const{blob,ext}=await window.exportReelVideo(cfg,reelTmpl,{fps:30,onProgress:p=>setPct(p)});
      const url=URL.createObjectURL(blob);dlUrl(url,`kiosco-enjoy-reel.${ext}`);
      setTimeout(()=>URL.revokeObjectURL(url),4000);showToast("Reel descargado ✓");
    }catch(err){console.error(err);showToast("Error al exportar");}
    finally{setBusy(false);setPct(-1);}
  },[cfg,reelTmpl,showToast]);

  const addSlide=()=>{setSlides(a=>[...a,{...cfg,photo:null,photoView:{s:1,x:0,y:0}}]);setActive(slides.length);};
  const delSlide=i=>{setSlides(a=>a.length<=1?a:a.filter((_,j)=>j!==i));setActive(p=>Math.max(0,p>i?p-1:p));};

  const studio=t.studio==="oscuro"?"oscuro":"claro";
  const patchPos=p=>{hRef.current=[...hRef.current.slice(-29),slRef.current];fRef.current=[];setCanU(true);setCanR(false);setSlides(a=>a.map((s,i)=>i===active?{...s,...p}:s));};

  const ReelStageC = window.ReelStage;
  const ReelThumbC = window.ReelThumb;

  return (
    <div className="app" data-studio={studio}>
      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="tb-brand">
          <img className="tb-logo" src={studio==="oscuro"?APP_LOGO_W:APP_LOGO_R} alt="Kiosco Enjoy"/>
          <div className="tb-title">Generador de Placas<small>Kiosco Enjoy</small></div>
        </div>
        <div className="fmt-tabs" role="tablist">
          {[["carrusel",I.car,"Post / Carrusel"],["historia",I.stry,"Historia"],["reel",I.film,"Reel"],["a4",I.page,"Afiche A4"]].map(([id,ic,lbl])=>(
            <button key={id} role="tab" aria-selected={fmt===id} onClick={()=>{setFmt(id);setActive(0);}}>
              <Ic d={ic} size={15}/>{lbl}
            </button>
          ))}
          {fmt==="carrusel"?<>
            <div className="fmt-sep"></div>
            {["1:1","4:5"].map(r=><button key={r} role="tab" aria-selected={cRatio===r} onClick={()=>setCR(r)}>{r}</button>)}
          </>:null}
        </div>
        <div className="tb-spacer"></div>
        <div className="undo-redo">
          <button className="undo-redo-btn" disabled={!canUndo} onClick={undo} title="Deshacer Ctrl+Z"><Ic d={I.undo} size={14}/></button>
          <button className="undo-redo-btn" disabled={!canRedo} onClick={redo} title="Rehacer Ctrl+Y"><Ic d={I.redo} size={14}/></button>
        </div>
        <button className="btn btn-primary" disabled={busy} onClick={isReel?doReel:doDownload}>
          <Ic d={I.dl} size={16}/>
          {busy?(pct>=0?`${Math.round(pct*100)}%…`:"Exportando…"):isReel?"Descargar Reel":"Descargar PNG"}
        </button>
      </header>

      {/* ── CUERPO 3 COLUMNAS ── */}
      <div className="app-body-3">

        {/* IZQUIERDA: plantillas */}
        <aside className="app-left">
          <TemplatePanel baseCfg={cfg} W={W} H={H} onApply={applyTmpl}/>
        </aside>

        {/* CENTRO: canvas */}
        <main className="app-center">
          <div className="stage" ref={stageRef}
            data-drag={dragOver?"1":"0"}
            onDragOver={e=>{e.preventDefault();setDO(true);}}
            onDragLeave={()=>setDO(false)} onDrop={onDrop}>
            <div className="stage-inner">
              <div className="preview-frame" style={{width:W*scale,height:H*scale,borderRadius:fmt==="a4"||fmt==="a3"?4:10}}>
                <div ref={placaRef} style={{width:W,height:H,transform:`scale(${scale})`,transformOrigin:"top left",position:"relative"}}>
                  {isReel&&ReelStageC?(
                    <ReelStageC cfg={cfg} tmplId={reelTmpl} scale={1} playing={true}/>
                  ):(
                    <Placa cfg={cfg} W={W} H={H} editor={true}
                      onMove={handleMove} editorScale={scale}
                      selectedEl={sel} setSelectedEl={setSel}
                      lockedEls={locked} setSnapGuides={setSnaps}
                      setLiveCoords={setLiveXY} snapTargets={snTargets}
                      placaRef={placaRef} showGrid={gridOn} snapGuides={snaps}/>
                  )}
                  {safeOn&&!isReel?<SafeZone fmt={fmt} W={W} H={H}/>:null}
                </div>
              </div>
            </div>
            <div className="dropzone"><Ic d={I.img} size={40}/><span>Soltá la foto de fondo acá</span></div>
            {/* barra de herramientas del canvas */}
            <div className="stage-bar">
              <button className="sz-toggle" aria-pressed={safeOn} onClick={()=>setSafeOn(p=>!p)}>
                <Ic d={I.eye} size={13}/>Zona segura
              </button>
              <button className="sz-toggle" aria-pressed={gridOn} onClick={()=>setGridOn(p=>!p)}>Tercios</button>
              {liveXY?<span className="live-coords-badge" style={{position:"static",transform:"none",animation:"none"}}>
                X:<strong>{liveXY.x}</strong> Y:<strong>{liveXY.y}</strong>
              </span>:null}
            </div>
          </div>

          {/* Reel: selector de animación */}
          {isReel?(
            <div className="reel-wrap">
              <div className="reel-cats-row">
                {(window.REEL_CATS||[]).map(c=>(
                  <button key={c.key} className={"reel-cat-btn"+(reelCat===c.key?" is-on":"")} onClick={()=>setRC(c.key)}>{c.name}</button>
                ))}
              </div>
              <div className="reel-tmpl-row">
                {(window.REEL_TEMPLATES||[]).filter(r=>r.cat===reelCat).map(r=>(
                  <button key={r.id} className={"reel-tc"+(reelTmpl===r.id?" is-on":"")} onClick={()=>setRT(r.id)}>
                    {ReelThumbC?<ReelThumbC cfg={cfg} tmplId={r.id} w={72}/>:null}
                    <span>{r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ):null}

          {/* Carrusel/Historia: rail de slides */}
          {isMulti?(
            <div className="railwrap">
              <span className="rail-label">Slides</span>
              {slides.map((s,i)=>(
                <div key={i} className="slide-thumb" data-active={i===active?"1":"0"} onClick={()=>setActive(i)}>
                  <span className="tnum">{i+1}</span>
                  <button className="tdel" onClick={e=>{e.stopPropagation();delSlide(i);}}>×</button>
                  <MiniPlaca cfg={s} W={W} H={H} sty={{width:"100%",height:"100%"}}/>
                </div>
              ))}
              <button className="slide-add" onClick={addSlide} title="Agregar slide"><Ic d={I.plus} size={20}/></button>
            </div>
          ):null}
        </main>

        {/* DERECHA: quick panel */}
        <aside className="app-right">
          <QuickPanel cfg={cfg} patch={patch} W={W} H={H}
            sel={sel} setSel={setSel} scale={scale}
            locked={locked} toggleLock={toggleLock} patchPos={patchPos}
            patchBgView={patchBgView} patchPhotoView={patchPhotoView}
            onBgFile={loadBg} onPhotoFile={loadPh}
            advOpen={advOpen} setAdvOpen={setAdvOpen}/>
        </aside>
      </div>

      {/* TOAST */}
      <div className="toast" data-show={toast?"1":"0"}><Ic d={I.chk} size={17}/>{toast}</div>

      {/* MÓVIL: bottom tab bar + sheets */}
      <MobTabBar active={mobTab} onTab={id=>{setMobTab(id);}}/>
      <MobSheet open={mobTab==="plantillas"} onClose={()=>setMobTab("canvas")}>
        <TemplatePanel baseCfg={cfg} W={W} H={H} onApply={t=>{applyTmpl(t);setMobTab("canvas");}}/>
      </MobSheet>
      <MobSheet open={mobTab==="editar"} onClose={()=>setMobTab("canvas")}>
        <QuickPanel cfg={cfg} patch={patch} W={W} H={H}
          sel={sel} setSel={setSel} scale={scale}
          locked={locked} toggleLock={toggleLock} patchPos={patchPos}
          patchBgView={patchBgView} patchPhotoView={patchPhotoView}
          onBgFile={loadBg} onPhotoFile={loadPh}
          advOpen={false} setAdvOpen={()=>{setMobTab("avanzado");}}/>
      </MobSheet>
      <MobSheet open={mobTab==="avanzado"} onClose={()=>setMobTab("canvas")}>
        <QuickPanel cfg={cfg} patch={patch} W={W} H={H}
          sel={sel} setSel={setSel} scale={scale}
          locked={locked} toggleLock={toggleLock} patchPos={patchPos}
          patchBgView={patchBgView} patchPhotoView={patchPhotoView}
          onBgFile={loadBg} onPhotoFile={loadPh}
          advOpen={true} setAdvOpen={()=>{setMobTab("editar");}}/>
      </MobSheet>

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Apariencia">
          <TweakRadio id="studio" label="Estudio" options={["claro","oscuro"]}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
