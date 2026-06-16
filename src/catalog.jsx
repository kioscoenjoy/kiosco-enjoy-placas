/* =========================================================================
   Kiosco Enjoy — Catálogo de plantillas (clasificado por USO) + datos
   · Categorías = para qué sirve la placa (no "familia de diseño").
   · Precio: botón redondeado (sin etiqueta con muesca).
   · Sin marcos tipo "Cartel & Etiqueta".
   · Cualquier plantilla acepta foto de fondo full-bleed (cfg.bgImage).
   Expone: window.freshCfg, CATEGORIES, CATALOG, TEMPLATE_LIST,
           PRODUCTS, THEME_SETS, formatPrice
   ========================================================================= */
(function () {
  // ---- contenido placeholder neutro (igual en todas las estructuras) ----
  function base() {
    return {
      template: "composite", structName: "", struct: null, bg: "red",
      title: "Nombre del\nProducto", subtitle: "Detalle, sabor o variante",
      badge: "OFERTA", badgeShow: true, badgeStyle: "yellow",
      showPrice: true, priceFormat: "auto", priceEyebrow: "SOLO", priceMain: "$0.000", priceUnit: "", priceStrike: "$0.000",
      cta: "Pedí por la app", handle: "@kioscoenjoy",
      logoPos: "tl", logoShow: true, logoColor: "auto", logoSize: 1,
      photo: null, photoView: { s: 1, x: 0, y: 0, fit: "contain" },
      bgImage: null, bgView: { s: 1, x: 0, y: 0 }, bgInk: "light",
      // capas de texto: color por elemento (token de marca o "auto"); show por elemento
      titleColor: "auto", subColor: "auto", priceColor: "auto", ctaColor: "auto", handleColor: "auto",
      titleShow: true, subShow: true, ctaShow: true, handleShow: true,
      rows: [
        { name: "Producto uno", price: "$0.000", flag: "" },
        { name: "Producto dos", price: "$0.000", flag: "2x1" },
        { name: "Producto tres", price: "$0.000", flag: "" },
        { name: "Producto cuatro", price: "$0.000", flag: "" },
      ],
    };
  }
  function freshCfg() { return base(); }

  // ---- categorías = USO ------------------------------------------------
  const CATEGORIES = [
    { key: "oferta", name: "Ofertas & Promos", icon: "flame" },
    { key: "producto", name: "Producto & Precio", icon: "bottle" },
    { key: "combo", name: "Combos & Packs", icon: "combo" },
    { key: "frase", name: "Frases & Anuncios", icon: "quote" },
    { key: "info", name: "Info & Horarios", icon: "clock" },
    { key: "mundial", name: "Mundial 2026", icon: "star" },
    { key: "lista", name: "Listas & Cartelera", icon: "list" },
  ];

  function inkFor(bg) { return (bg === "white" || bg === "cream" || bg === "celeste") ? "dark" : "light"; }

  let _id = 0;
  function S(cat, name, struct, content) {
    const st = { ...struct };
    const bg = st.bg || "red";
    if (st.ink === undefined) st.ink = inkFor(bg);
    const cfg = { ...base(), ...(content || {}), bg, structName: name, template: cat, struct: st, logoPos: st.logo || "tl" };
    if (st.badge === "none") cfg.badgeShow = false;
    if (st.price === "none") cfg.showPrice = false;
    if (st.kind === "list" || st.kind === "grid") cfg.showPrice = false;
    return { id: "s" + (++_id), cat, name, cfg };
  }

  const C = {};

  /* ============== A · OFERTAS & PROMOS ============== */
  C.oferta = [
    S("oferta", "Burst amarillo + producto", { photo: "right", price: "burst", burstPos: "tr", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "none", bg: "red" }),
    S("oferta", "Precio gigante centrado", { photo: "none", stackH: "c", stackV: "m", price: "stack", title: "m", badge: "tr", bg: "red" }),
    S("oferta", "Antes / Ahora centrado", { photo: "none", price: "strike", stackH: "c", stackV: "m", title: "m", badge: "tr", bg: "dark" }),
    S("oferta", "Promo botón inferior", { photo: "center", price: "btn", stackH: "c", stackV: "b", title: "m", badge: "tr", bg: "red" }),
    S("oferta", "Burst centrado", { photo: "none", price: "burst", burstPos: "c", stackH: "c", stackV: "t", title: "m", badge: "none", bg: "dark" }),
    S("oferta", "Diagonal + producto", { photo: "right", block: "diag", blockColor: "dark", stackH: "l", stackV: "b", stackW: 0.5, price: "btn", title: "l", badge: "tl", bg: "red" }),
    S("oferta", "Mitad inferior + precio", { photo: "none", block: "half-b", blockColor: "dark", price: "stack", stackH: "c", stackV: "b", title: "m", badge: "tr", bg: "red", ink: "light" }),
    S("oferta", "2x1 tipográfico", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "inline", bg: "red" }, { badge: "2x1", title: "2x1\nen la previa" }),
    S("oferta", "Burst esquina · claro", { photo: "right", price: "burst", burstPos: "tr", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "none", bg: "white" }),
    S("oferta", "Promo botón · negro", { photo: "right", price: "btn", stackH: "l", stackV: "b", stackW: 0.5, title: "l", badge: "tr", bg: "dark" }),
    S("oferta", "Precio + arco", { photo: "none", deco: "arc-bl", blockColor: "dark", price: "stack", stackH: "l", stackV: "m", stackW: 0.7, title: "m", badge: "tr", bg: "red" }),
    S("oferta", "% OFF gigante", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "stack", title: "m", sub: true, badge: "tr", bg: "dark" }, { priceEyebrow: "HASTA", priceMain: "30% OFF", title: "Súper\nofertas" }),
    S("oferta", "Burst inferior izquierda", { photo: "left", price: "burst", burstPos: "bl", stackH: "r", stackV: "t", stackW: 0.5, title: "l", badge: "none", bg: "red" }),
    S("oferta", "Promo banda lateral", { photo: "right", block: "side-l", blockColor: "dark", stackH: "l", stackV: "m", stackW: 0.32, price: "none", title: "m", badge: "none", bg: "red" }),
    S("oferta", "Antes/Ahora · producto", { photo: "right", price: "strike", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "inline", bg: "dark" }, { badge: "🔥 OFERTA" }),
    S("oferta", "Precio botón + título arriba", { photo: "none", price: "btn", stackH: "c", stackV: "b", title: "l", badge: "inline", bg: "red" }),
  ];

  /* ============== B · PRODUCTO & PRECIO ============== */
  C.producto = [
    S("producto", "Producto derecha · botón", { photo: "right", stackH: "l", stackV: "b", stackW: 0.5, price: "btn", title: "xl", badge: "tr", bg: "red" }),
    S("producto", "Producto izquierda · stack", { photo: "left", stackH: "r", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tl", bg: "red" }),
    S("producto", "Producto centrado · precio abajo", { photo: "center", stackH: "c", stackV: "b", price: "plain", title: "l", badge: "tr", bg: "dark" }),
    S("producto", "Producto abajo · título arriba", { photo: "bottom", stackH: "l", stackV: "t", stackW: 0.86, price: "none", title: "xl", badge: "tr", bg: "red" }),
    S("producto", "Producto arriba · precio abajo", { photo: "top", stackH: "c", stackV: "b", price: "stack", title: "m", badge: "tr", bg: "white" }),
    S("producto", "Producto en círculo derecha", { photo: "circle-r", stackH: "l", stackV: "m", stackW: 0.48, price: "stack", title: "l", badge: "tl", bg: "red" }),
    S("producto", "Producto círculo centrado", { photo: "circle-c", stackH: "c", stackV: "b", price: "btn", title: "m", badge: "tr", bg: "dark" }),
    S("producto", "Producto derecha + arco", { photo: "right", deco: "arc-tr", blockColor: "dark", stackH: "l", stackV: "b", stackW: 0.5, price: "btn", title: "l", bg: "red", badge: "tl" }),
    S("producto", "Producto derecha · fondo claro", { photo: "right", stackH: "l", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tr", bg: "white" }),
    S("producto", "Producto centrado · título arriba", { photo: "center", stackH: "c", stackV: "t", price: "none", title: "l", badge: "inline", sub: true, bg: "red" }),
    S("producto", "Producto izquierda + círculo deco", { photo: "left", deco: "circle-tr", stackH: "r", stackV: "b", stackW: 0.5, price: "btn", title: "l", bg: "red", badge: "tr" }),
    S("producto", "Producto abajo · banda superior", { photo: "bottom", block: "third-t", blockColor: "dark", stackH: "c", stackV: "t", price: "none", title: "l", bg: "red", badge: "none" }),
    S("producto", "Producto derecha · botón negro", { photo: "right", stackH: "l", stackV: "b", stackW: 0.5, price: "btn", title: "l", badge: "tr", bg: "dark" }),
    S("producto", "Producto círculo + burst", { photo: "circle-r", price: "burst", burstPos: "bl", stackH: "l", stackV: "t", stackW: 0.5, title: "l", badge: "none", bg: "red" }),
    S("producto", "Producto derecha · doble línea", { photo: "right", stackH: "l", stackV: "m", stackW: 0.5, price: "stack", title: "l", sub: true, badge: "tl", bg: "dark" }),
    S("producto", "Producto izquierda · botón", { photo: "left", stackH: "r", stackV: "b", stackW: 0.5, price: "btn", title: "l", badge: "tr", bg: "red" }),
    S("producto", "Producto centrado claro · botón", { photo: "center", stackH: "c", stackV: "b", price: "btn", title: "m", badge: "tr", bg: "white" }),
    S("producto", "Producto círculo centro · stack", { photo: "circle-c", stackH: "c", stackV: "b", price: "stack", title: "m", badge: "tl", bg: "red" }),
    S("producto", "Split 50/50 · producto", { photo: "right", block: "half-r", blockColor: "dark", stackH: "l", stackV: "m", stackW: 0.46, price: "stack", title: "l", badge: "tl", bg: "red" }),
    S("producto", "Split invertido · producto", { photo: "left", block: "half-l", blockColor: "dark", stackH: "r", stackV: "m", stackW: 0.46, price: "stack", title: "l", badge: "tr", bg: "red" }),
  ];

  /* ============== C · COMBOS & PACKS ============== */
  C.combo = [
    S("combo", "Antes/Ahora · producto", { photo: "right", price: "strike", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "inline", bg: "dark", badgeStyle: "yellow" }, { badge: "🔥 COMBO" }),
    S("combo", "Combo centrado · tachado", { photo: "center", price: "strike", stackH: "c", stackV: "b", title: "m", badge: "tr", bg: "dark" }, { badge: "COMBO" }),
    S("combo", "Pack precio botón", { photo: "right", price: "btn", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "inline", bg: "red" }, { badge: "🔥 PACK" }),
    S("combo", "Combo + burst ahorro", { photo: "left", price: "burst", burstPos: "tr", stackH: "r", stackV: "b", stackW: 0.55, title: "l", badge: "none", bg: "dark" }),
    S("combo", "Combo lista de items", { kind: "list", badge: "tr", bg: "dark", ink: "light" }, { title: "Armá tu\nCombo", badge: "COMBO" }),
    S("combo", "Combo grilla 2×2", { kind: "grid", badge: "tr", bg: "red", ink: "light" }, { title: "Elegí tu\nCombo", badge: "PROMO" }),
    S("combo", "Antes/Ahora fondo claro", { photo: "right", price: "strike", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "tl", bg: "white", ink: "dark" }),
    S("combo", "Combo diagonal", { photo: "right", block: "diag", blockColor: "red", price: "strike", stackH: "l", stackV: "b", stackW: 0.5, title: "l", badge: "tl", bg: "dark", ink: "light" }),
    S("combo", "Pack círculo + tachado", { photo: "circle-r", price: "strike", stackH: "l", stackV: "m", stackW: 0.5, title: "l", badge: "tl", bg: "dark" }),
    S("combo", "Combo CTA destacado", { photo: "bottom", price: "strike", stackH: "l", stackV: "t", stackW: 0.86, cta: "pill", title: "l", badge: "tr", bg: "red" }),
    S("combo", "3x2 burst", { photo: "right", price: "burst", burstPos: "tr", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "none", bg: "red" }, { priceMain: "3x2" }),
    S("combo", "Combo previa · botón", { photo: "right", price: "btn", stackH: "l", stackV: "b", stackW: 0.55, title: "l", sub: true, badge: "inline", bg: "dark" }, { badge: "COMBO PREVIA", title: "Combo\nPrevia" }),
    S("combo", "Pack centrado claro", { photo: "center", price: "btn", stackH: "c", stackV: "b", title: "m", badge: "tr", bg: "white" }),
    S("combo", "Combo grilla negra", { kind: "grid", badge: "tl", bg: "dark", ink: "light" }, { title: "Combos\ndestacados", badge: "COMBOS" }),
  ];

  /* ============== D · FRASES & ANUNCIOS ============== */
  C.frase = [
    S("frase", "Frase gigante centrada", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", badge: "none", bg: "red" }),
    S("frase", "Título + bajada izquierda", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "xl", sub: true, badge: "none", bg: "dark" }),
    S("frase", "Anuncio con etiqueta", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "inline", bg: "red" }),
    S("frase", "Saludo centrado claro", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", badge: "none", bg: "white" }),
    S("frase", "Título XL + CTA", { photo: "none", stackH: "l", stackV: "b", stackW: 0.86, price: "none", cta: "pill", title: "xl", sub: true, badge: "tr", bg: "dark" }),
    S("frase", "Frase + arco", { photo: "none", deco: "arc-tr", blockColor: "dark", stackH: "l", stackV: "m", stackW: 0.8, price: "none", title: "xl", badge: "none", bg: "red" }),
    S("frase", "Dos líneas grandes", { photo: "none", stackH: "l", stackV: "m", stackW: 0.9, price: "none", title: "xl", sub: true, badge: "tl", bg: "dark", deco: "circle-bl" }),
    S("frase", "Anuncio con bajada larga", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "l", sub: true, badge: "none", bg: "white" }),
    S("frase", "Frase sobre split", { photo: "none", block: "half-b", blockColor: "dark", stackH: "c", stackV: "m", price: "none", title: "l", sub: true, badge: "none", bg: "red" }),
    S("frase", "Título + CTA texto", { photo: "none", stackH: "l", stackV: "b", stackW: 0.86, price: "none", cta: "text", title: "xl", sub: true, badge: "tl", bg: "dark" }),
    S("frase", "Frase centrada · celeste", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "none", bg: "celeste" }),
    S("frase", "Frase + banda superior", { photo: "none", block: "third-t", blockColor: "dark", stackH: "l", stackV: "b", stackW: 0.9, price: "none", title: "xl", sub: true, badge: "none", bg: "red" }),
    S("frase", "Frase mínima · negro", { photo: "none", stackH: "c", stackV: "m", price: "none", title: "xl", badge: "none", bg: "dark" }),
    S("frase", "Anuncio + arco inferior", { photo: "none", deco: "arc-bl", blockColor: "red", logo: "tc", stackH: "c", stackV: "t", price: "none", title: "l", sub: true, badge: "none", bg: "dark" }),
  ];

  /* ============== E · INFO & HORARIOS ============== */
  C.info = [
    S("info", "Aviso horario centrado", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "inline", bg: "dark" }),
    S("info", "Horario claro", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "l", sub: true, badge: "inline", bg: "white" }),
    S("info", "Info + banda inferior", { photo: "none", block: "third-b", blockColor: "dark", stackH: "c", stackV: "b", price: "none", title: "l", sub: true, badge: "none", bg: "red", ink: "light" }),
    S("info", "Medios de pago", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "inline", bg: "dark" }, { badge: "INFO", title: "Todos los\nmedios de pago" }),
    S("info", "Delivery · celeste", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", cta: "pill", title: "xl", sub: true, badge: "none", bg: "celeste" }),
    S("info", "Aviso + arco", { photo: "none", deco: "arc-tr", blockColor: "dark", stackH: "l", stackV: "m", stackW: 0.8, price: "none", title: "l", sub: true, badge: "inline", bg: "red" }),
    S("info", "Info dos líneas claro", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "tl", bg: "white" }),
    S("info", "24 horas · negro", { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "inline", bg: "dark" }, { badge: "24 H", title: "Abierto\nlas 24 horas" }),
    S("info", "Servicios anexos", { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "inline", bg: "red" }, { badge: "SERVICIOS", title: "También\nimprimimos" }),
    S("info", "Info + CTA", { photo: "none", stackH: "l", stackV: "b", stackW: 0.86, price: "none", cta: "pill", title: "l", sub: true, badge: "tr", bg: "dark" }),
  ];

  /* ============== F · MUNDIAL 2026 · ARGENTINA ============== */
  C.mundial = [
    S("mundial", "¡Vamos Argentina! · rayos + estrellas", { photo: "none", deco: "rays stars3", logo: "tc", stackH: "c", stackV: "b", price: "none", title: "xl", sub: true, badge: "none", bg: "red" },
      { title: "¡Vamos\nArgentina!", subtitle: "Viví el Mundial 2026 en Kiosco Enjoy", handle: "@kioscoenjoy" }),
    S("mundial", "Combo Mundial · panel bandera", { photo: "right", block: "flag-r", stackH: "l", stackV: "b", stackW: 0.5, price: "btn", title: "l", badge: "tl", bg: "red", ink: "light" },
      { title: "Combo\nMundial", subtitle: "Todo para ver el partido", badge: "🔥 PROMO", badgeStyle: "celeste", priceEyebrow: "LLEVÁ x", priceMain: "$0.000", priceUnit: "combo", handle: "@kioscoenjoy" }),
    S("mundial", "Precio sobre celeste · estrellas", { photo: "right", deco: "stars3", logo: "tl", stackH: "l", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tl", bg: "celeste", ink: "dark" },
      { title: "Promo\nde la fecha", badge: "MUNDIAL", badgeStyle: "red", priceEyebrow: "SOLO", priceMain: "$0.000", priceUnit: "c/u", handle: "@kioscoenjoy" }),
    S("mundial", "Banderines · arranca el Mundial", { photo: "none", deco: "pennants", logo: "tl", stackH: "c", stackV: "b", price: "none", cta: "pill", title: "xl", sub: true, badge: "none", bg: "red" },
      { title: "¡Arranca el\nMundial!", subtitle: "Armá la previa con todo", cta: "Pedí por la app", handle: "@kioscoenjoy" }),
    S("mundial", "Combo hincha · antes/ahora", { photo: "right", deco: "rays", stackH: "l", stackV: "b", stackW: 0.55, price: "strike", title: "l", badge: "inline", bg: "dark", ink: "light", badgeStyle: "celeste" },
      { title: "Combo\nHincha", badge: "🔥 COMBO MUNDIAL", priceStrike: "$0.000", priceMain: "$0.000", handle: "@kioscoenjoy" }),
    S("mundial", "Hoy juega Argentina · foto", { photo: "full", grad: true, block: "arg-band-b", stackH: "l", stackV: "b", stackW: 0.82, price: "none", title: "xl", sub: true, badge: "tr", bg: "dark", ink: "light" },
      { title: "Hoy juega\nArgentina", subtitle: "Mirá el partido y pedí tu combo", badge: "VAMOS", badgeStyle: "celeste", handle: "@kioscoenjoy" }),
    S("mundial", "Producto · panel bandera izq.", { photo: "left", block: "flag-l", stackH: "r", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tr", bg: "red", ink: "light" },
      { title: "Promo\nSelección", subtitle: "Mientras dure el stock", badge: "OFERTA", badgeStyle: "celeste", priceEyebrow: "SOLO", priceMain: "$0.000", priceUnit: "c/u", handle: "@kioscoenjoy" }),
    S("mundial", "Campeones · estrellas claro", { photo: "none", deco: "stars3", block: "arg-band-b", logo: "tl", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "none", bg: "white", ink: "dark" },
      { title: "Campeones\ndel mundo", subtitle: "Festejá con Kiosco Enjoy", handle: "@kioscoenjoy" }),
    S("mundial", "Grilla combos Mundial · celeste", { kind: "grid", logo: "tl", badge: "tr", bg: "celeste", ink: "dark" },
      { title: "Elegí tu\nCombo Mundial", badge: "COMBOS", badgeStyle: "red" }),
    S("mundial", "Precios de la fecha · lista", { kind: "list", deco: "rays", badge: "tr", bg: "red", ink: "light" },
      { title: "Precios\nde la fecha", badge: "MUNDIAL", badgeStyle: "celeste" }),
    S("mundial", "Aguante · celeste tipográfica", { photo: "none", deco: "stars3", logo: "tc", stackH: "c", stackV: "b", price: "none", cta: "pill", title: "xl", sub: true, badge: "none", bg: "celeste", ink: "dark" },
      { title: "Aguante\nla Scaloneta", subtitle: "Sumate al Mundial con Enjoy", cta: "Ver combos", handle: "@kioscoenjoy" }),
    S("mundial", "Combo + burst ahorro", { photo: "right", deco: "rays", price: "burst", burstPos: "tr", stackH: "l", stackV: "b", stackW: 0.55, title: "l", sub: true, badge: "none", bg: "dark", ink: "light" },
      { title: "Combo\nPrevia Mundial", subtitle: "Birra + snacks + hielo", priceEyebrow: "AHORRÁ", priceMain: "25%", handle: "@kioscoenjoy" }),
  ];

  /* ============== G · LISTAS & CARTELERA ============== */
  C.lista = [
    S("lista", "Lista de precios (cartelera)", { kind: "list", badge: "tr", bg: "white", ink: "dark" }, { title: "Ofertas\nde la semana", badge: "HOY" }),
    S("lista", "Lista sobre rojo", { kind: "list", badge: "tr", bg: "red", ink: "light" }, { title: "Precios\nde hoy", badge: "HOY" }),
    S("lista", "Lista sobre negro", { kind: "list", badge: "tr", bg: "dark", ink: "light" }, { title: "Carta\nde precios", badge: "MENÚ" }),
    S("lista", "Grilla 2×2 clara", { kind: "grid", badge: "tr", bg: "white", ink: "dark" }, { title: "Destacados", badge: "OFERTAS" }),
    S("lista", "Grilla 2×2 roja", { kind: "grid", badge: "tr", bg: "red", ink: "light" }, { title: "Lo más\npedido", badge: "TOP" }),
    S("lista", "Grilla 2×2 negra", { kind: "grid", badge: "tl", bg: "dark", ink: "light" }, { title: "Combos\ndestacados", badge: "COMBOS" }),
    S("lista", "Lista + banda superior", { kind: "list", block: "third-t", blockColor: "dark", badge: "none", bg: "white", ink: "dark" }, { title: "Lista de\nprecios" }),
    S("lista", "Lista clara título rojo", { kind: "list", badge: "tl", bg: "cream", ink: "dark" }, { title: "Almacén\nofertas", badge: "SEMANA" }),
    S("lista", "Grilla 2×2 · celeste", { kind: "grid", badge: "tr", bg: "celeste", ink: "dark" }, { title: "Promos\nde la semana", badge: "NUEVO" }),
    S("lista", "Lista + banda inferior", { kind: "list", block: "third-b", blockColor: "red", badge: "none", bg: "dark", ink: "light" }, { title: "Precios\nde hoy" }),
  ];

  // assemble
  const CATALOG = {};
  let LIST = [];
  CATEGORIES.forEach((c) => { CATALOG[c.key] = C[c.key] || []; LIST = LIST.concat(CATALOG[c.key]); });

  /* =====================================================================
     DATOS para Rellenos rápidos inteligentes
     ===================================================================== */
  // formatea un número o string a precio AR ($ + miles con punto)
  function formatPrice(input) {
    if (input == null) return "";
    let s = String(input).trim();
    if (!s) return "";
    const digits = s.replace(/[^\d]/g, "");
    if (!digits) return s;
    const n = parseInt(digits, 10);
    return "$" + n.toLocaleString("es-AR");
  }

  // Productos reales (marca + precio sugerido editable). cat para filtrar/iconos.
  const PRODUCTS = [
    { name: "Coca-Cola 2.25L", brand: "Coca-Cola", price: "$2.150", unit: "2.25L", cat: "Bebidas", emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola 1.5L", brand: "Coca-Cola", price: "$1.750", unit: "1.5L", cat: "Bebidas", emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola lata", brand: "Coca-Cola", price: "$850", unit: "354ml", cat: "Bebidas", emoji: "🥤", dot: "#F40000" },
    { name: "Pepsi 1.5L", brand: "Pepsi", price: "$1.500", unit: "1.5L", cat: "Bebidas", emoji: "🥤", dot: "#004B93" },
    { name: "Sprite 1.5L", brand: "Sprite", price: "$1.500", unit: "1.5L", cat: "Bebidas", emoji: "🥤", dot: "#1E9E54" },
    { name: "Fanta 1.5L", brand: "Fanta", price: "$1.500", unit: "1.5L", cat: "Bebidas", emoji: "🥤", dot: "#F58220" },
    { name: "Agua mineral 2L", brand: "Villavicencio", price: "$1.100", unit: "2L", cat: "Bebidas", emoji: "💧", dot: "#5AA0DC" },
    { name: "Jugo Cepita 1L", brand: "Cepita", price: "$1.250", unit: "1L", cat: "Bebidas", emoji: "🧃", dot: "#F58220" },
    { name: "Quilmes 1L", brand: "Quilmes", price: "$1.890", unit: "1L", cat: "Cervezas", emoji: "🍺", dot: "#1B5E20" },
    { name: "Quilmes porrón", brand: "Quilmes", price: "$1.050", unit: "330ml", cat: "Cervezas", emoji: "🍺", dot: "#1B5E20" },
    { name: "Schneider porrón", brand: "Schneider", price: "$1.100", unit: "473ml", cat: "Cervezas", emoji: "🍺", dot: "#C8102E" },
    { name: "Stella Artois", brand: "Stella Artois", price: "$1.450", unit: "473ml", cat: "Cervezas", emoji: "🍺", dot: "#B11116" },
    { name: "Fernet Branca 750", brand: "Branca", price: "$8.900", unit: "750ml", cat: "Bebidas", emoji: "🥃", dot: "#1B3A1F" },
    { name: "Vino Rumipal", brand: "Rumipal", price: "$2.300", unit: "750ml", cat: "Bebidas", emoji: "🍷", dot: "#6E1023" },
    { name: "Leche La Serenísima 1L", brand: "La Serenísima", price: "$1.320", unit: "1L", cat: "Lácteos", emoji: "🥛", dot: "#0033A0" },
    { name: "Yogur La Serenísima", brand: "La Serenísima", price: "$1.450", unit: "1L", cat: "Lácteos", emoji: "🥛", dot: "#0033A0" },
    { name: "Manteca 200g", brand: "La Serenísima", price: "$1.600", unit: "200g", cat: "Lácteos", emoji: "🧈", dot: "#E3B23C" },
    { name: "Pan lactal", brand: "Bimbo", price: "$1.900", unit: "x1", cat: "Almacén", emoji: "🍞", dot: "#C8102E" },
    { name: "Galletitas Oreo", brand: "Oreo", price: "$1.200", unit: "x1", cat: "Golosinas", emoji: "🍪", dot: "#1A2A6C" },
    { name: "Alfajor Jorgito", brand: "Jorgito", price: "$650", unit: "c/u", cat: "Golosinas", emoji: "🍫", dot: "#5A3210" },
    { name: "Golosinas Arcor", brand: "Arcor", price: "$350", unit: "c/u", cat: "Golosinas", emoji: "🍬", dot: "#E2231A" },
    { name: "Papas fritas Lay's", brand: "Lay's", price: "$1.800", unit: "x1", cat: "Snacks", emoji: "🥔", dot: "#F0C419" },
    { name: "Maní salado", brand: "Pehuamar", price: "$900", unit: "x1", cat: "Snacks", emoji: "🥜", dot: "#B07A2A" },
    { name: "Hielo 3kg", brand: "Kiosco Enjoy", price: "$1.900", unit: "3kg", cat: "Varios", emoji: "🧊", dot: "#7DC4E8" },
    { name: "Carbón 3kg", brand: "Kiosco Enjoy", price: "$2.400", unit: "3kg", cat: "Varios", emoji: "🔥", dot: "#2D2926" },
    { name: "Cigarrillos", brand: "—", price: "$2.800", unit: "x20", cat: "Varios", emoji: "🚬", dot: "#8A8580" },
    { name: "Helado Frigor", brand: "Frigor", price: "$1.500", unit: "c/u", cat: "Varios", emoji: "🍦", dot: "#E04E8A" },
    { name: "Café La Virginia", brand: "La Virginia", price: "$2.100", unit: "250g", cat: "Almacén", emoji: "☕", dot: "#6E3B1E" },
  ];

  // Sets temáticos de un toque: completan título/precio/etiqueta coherentes.
  const THEME_SETS = [
    {
      key: "previa", name: "Previa", emoji: "🍻", dot: "#FFD400",
      f: { title: "Combo\nPrevia", subtitle: "Birras + papas + maní bien frío 🍻", showPrice: true, priceEyebrow: "COMBO", priceMain: "$9.500", priceUnit: "", badge: "🔥 COMBO", badgeShow: true, badgeStyle: "yellow", cta: "Pedí por la app", handle: "@kioscoenjoy" },
    },
    {
      key: "asado", name: "Asado", emoji: "🔥", dot: "#C20000",
      f: { title: "Todo para\nel asado 🔥", subtitle: "Carbón, hielo, vino y fernet", showPrice: true, priceEyebrow: "DESDE", priceMain: "$2.400", priceUnit: "", badge: "FINDE", badgeShow: true, badgeStyle: "yellow", cta: "Pasá a buscarlo", handle: "@kioscoenjoy" },
    },
    {
      key: "mundial", name: "Mundial", emoji: "🇦🇷", dot: "#5AA0DC",
      f: { title: "¡Vamos\nArgentina!", subtitle: "Viví el Mundial 2026 en el kiosco 🎉", showPrice: false, badge: "MUNDIAL", badgeShow: true, badgeStyle: "celeste", cta: "Armá tu combo", handle: "@kioscoenjoy" },
    },
    {
      key: "finde", name: "Finde", emoji: "🎉", dot: "#F40000",
      f: { title: "Ofertas\nde finde", subtitle: "Aprovechá todo el fin de semana", showPrice: true, priceEyebrow: "HASTA", priceMain: "30% OFF", priceUnit: "", badge: "FINDE", badgeShow: true, badgeStyle: "yellow", cta: "Pedí por la app", handle: "@kioscoenjoy" },
    },
    {
      key: "frio", name: "Bien frío", emoji: "🧊", dot: "#5AA0DC",
      f: { title: "Bebidas\nbien frías 🧊", subtitle: "Gaseosas, cervezas y agua heladas", showPrice: true, priceEyebrow: "DESDE", priceMain: "$850", priceUnit: "", badge: "FRÍO", badgeShow: true, badgeStyle: "celeste", cta: "Pasá y llevá", handle: "@kioscoenjoy" },
    },
    {
      key: "horario", name: "Horario", emoji: "🕗", dot: "#2D2926",
      f: { title: "Horario\nde atención", subtitle: "Lun a Sáb: 8 a 22 h\nDom: 9 a 14 h", showPrice: false, badge: "ABIERTO", badgeShow: true, badgeStyle: "white", cta: "Te esperamos", handle: "@kioscoenjoy" },
    },
    {
      key: "delivery", name: "Delivery", emoji: "🛵", dot: "#F40000",
      f: { title: "Hacemos\ndelivery 🛵", subtitle: "Pedí y te lo llevamos a casa", showPrice: false, badge: "DELIVERY", badgeShow: true, badgeStyle: "white", cta: "Pedí por WhatsApp", handle: "@kioscoenjoy" },
    },
    {
      key: "pago", name: "Medios de pago", emoji: "💳", dot: "#2A6FDB",
      f: { title: "Todos los\nmedios de pago", subtitle: "Efectivo · débito · crédito · QR · transferencia", showPrice: false, badge: "INFO", badgeShow: true, badgeStyle: "white", cta: "", handle: "@kioscoenjoy" },
    },
  ];

  window.freshCfg = freshCfg;
  window.CATEGORIES = CATEGORIES;
  window.CATALOG = CATALOG;
  window.TEMPLATE_LIST = LIST;
  window.PRODUCTS = PRODUCTS;
  window.THEME_SETS = THEME_SETS;
  window.formatPrice = formatPrice;
})();
