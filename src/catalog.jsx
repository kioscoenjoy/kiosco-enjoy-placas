/* =========================================================================
   Kiosco Enjoy — Catálogo v3 (basado en placas reales de Drive)
   · 3 categorías: oferta, lista, tematico
   · 9 plantillas en total (3 + 3 + 3)
   · Handle @ eliminado — no se usa nunca
   Expone: window.freshCfg, CATEGORIES, CATALOG, TEMPLATE_LIST,
           PRODUCTS, formatPrice
   ========================================================================= */
(function () {
  // ---- contenido placeholder neutro ----
  function base() {
    return {
      template: "composite", structName: "", struct: null, bg: "red",
      title: "Nombre del\nProducto", subtitle: "Detalle o descripción",
      badge: "OFERTA", badgeShow: true, badgeStyle: "yellow",
      showPrice: true, priceFormat: "auto", priceEyebrow: "SOLO", priceMain: "$0.000", priceUnit: "", priceStrike: "",
      cta: "Pedí por la app", ctaShow: false, ctaColor: "auto", ctaFormat: "btn", ctaFontSize: null,
      logoPos: "tl", logoShow: true, logoColor: "auto", logoSize: 1,
      photo: null, photoView: { s: 1, x: 0, y: 0, fit: "contain" },
      bgImage: null, bgView: { s: 1, x: 0, y: 0 }, bgInk: "light",
      titleColor: "auto", subColor: "auto", priceColor: "auto",
      titleShow: true, subShow: false,
      titleFontSize: null, subFontSize: null, priceFontSize: null, badgeFontSize: null,
      rows: [
        { name: "Producto uno",    price: "$0.000", flag: "" },
        { name: "Producto dos",    price: "$0.000", flag: "2x1" },
        { name: "Producto tres",   price: "$0.000", flag: "" },
        { name: "Producto cuatro", price: "$0.000", flag: "" },
      ],
    };
  }
  function freshCfg() { return base(); }

  // ---- 3 categorías ----
  const CATEGORIES = [
    { key: "oferta",   name: "Oferta",   icon: "bottle" },
    { key: "lista",    name: "Lista",    icon: "list"   },
    { key: "tematico", name: "Temático", icon: "clock"  },
  ];

  function inkFor(bg) {
    return (bg === "white" || bg === "cream" || bg === "celeste") ? "dark" : "light";
  }

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

  /* ============== OFERTA — placa de 1 producto con precio ============== */
  C.oferta = [
    /* 1 — Foto ocupa el centro/hero, texto y precio abajo.
           Ideal para subir la foto del producto como protagonista (Milka, cerveza, pack). */
    S("oferta", "Foto de fondo",
      { photo: "center", stackH: "c", stackV: "b", price: "btn", title: "c", badge: "tr", bg: "dark" },
      { title: "Nombre del\nProducto", badge: "OFERTA" }),

    /* 2 — Foto del producto a la derecha, texto + precio a la izquierda.
           Para packaging que se reconoce de costado (Trio, Quento, etc.) */
    S("oferta", "Foto lateral",
      { photo: "right", stackH: "l", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tr", bg: "red" },
      { title: "Nombre del\nProducto", badge: "OFERTA" }),

    /* 3 — Sin foto. Precio tipográfico gigante. Para flash sales o precios de impacto. */
    S("oferta", "Solo precio",
      { photo: "none", stackH: "c", stackV: "m", price: "stack", title: "c", badge: "tr", bg: "red" },
      { priceEyebrow: "SOLO", priceMain: "$0.000", title: "Nombre del Producto" }),
  ];

  /* ============== LISTA — varios productos de una categoría ============== */
  C.lista = [
    /* 1 — Lista limpia: título de categoría + filas nombre/precio.
           Almacén, Limpieza, Galletitas, etc. */
    S("lista", "Lista simple",
      { kind: "list", badge: "tr", bg: "dark", ink: "light" },
      { title: "Categoría", badge: "OFERTA", badgeStyle: "yellow",
        rows: [
          { name: "Producto A", price: "$0.000", flag: "" },
          { name: "Producto B", price: "$0.000", flag: "" },
          { name: "Producto C", price: "$0.000", flag: "" },
          { name: "Producto D", price: "$0.000", flag: "" },
        ]}),

    /* 2 — Lista con titular creativo arriba.
           "¿Te avisaron que viene tu suegra?", "Para la previa", etc. */
    S("lista", "Lista con titular",
      { kind: "list", badge: "tr", bg: "red", ink: "light" },
      { title: "El titular\ncreativo va acá", badge: "OFERTA", badgeStyle: "yellow",
        rows: [
          { name: "Producto A", price: "$0.000", flag: "" },
          { name: "Producto B", price: "$0.000", flag: "" },
          { name: "Producto C", price: "$0.000", flag: "" },
        ]}),

    /* 3 — Grilla 2×2: 4 celdas con foto y precio. */
    S("lista", "Grilla 2×2",
      { kind: "grid", badge: "tr", bg: "dark", ink: "light" },
      { title: "Elegí tu\nfavorito", badge: "OFERTA" }),
  ];

  /* ============== TEMÁTICO — engagement, info, avisos ============== */
  C.tematico = [
    /* 1 — Foto de ambiente como fondo + título/pregunta grande.
           Posts de engagement: picada, partido, temporada. */
    S("tematico", "Foto + texto",
      { photo: "none", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "none", bg: "dark" },
      { title: "¿Qué le ponés\nvos a la picada?", subtitle: "Contanos en los comentarios",
        badgeShow: false, showPrice: false, subShow: true }),

    /* 2 — Badge "DATITA" + título + bajada. Sin foto ni precio.
           Info institucional: medios de pago, sin recargos, etc. */
    S("tematico", "Datita",
      { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "inline", bg: "dark" },
      { badge: "DATITA", badgeStyle: "yellow",
        title: "Sin\nrecargos, siempre",
        subtitle: "Efectivo, tarjeta, QR, débito, crédito.\nSiempre el mismo precio.",
        showPrice: false, subShow: true }),

    /* 3 — Horarios reales de Kiosco Enjoy, pre-cargados. */
    S("tematico", "Horarios KE",
      { kind: "list", badge: "tr", bg: "dark", ink: "light" },
      { title: "Horario\nde atención", badge: "HORARIOS", badgeStyle: "yellow",
        rows: [
          { name: "Lun a Sáb",      price: "8:00 a 14:00",  flag: "☀️" },
          { name: "",               price: "17:00 a 22:00", flag: "🌙" },
          { name: "Dom y feriados", price: "10:00 a 14:00", flag: "☀️" },
          { name: "",               price: "18:00 a 22:00", flag: "🌙" },
        ]}),
  ];

  // ---- assemblar catálogo ----
  const CATALOG = {};
  let LIST = [];
  CATEGORIES.forEach(c => { CATALOG[c.key] = C[c.key] || []; LIST = LIST.concat(CATALOG[c.key]); });

  // ---- formatear precio AR ----
  function formatPrice(input) {
    if (input == null) return "";
    let s = String(input).trim();
    if (!s) return "";
    const digits = s.replace(/[^\d]/g, "");
    if (!digits) return s;
    const n = parseInt(digits, 10);
    return "$" + n.toLocaleString("es-AR");
  }

  // ---- productos reales ----
  const PRODUCTS = [
    { name: "Coca-Cola 2.25L",      brand: "Coca-Cola",      price: "$2.150", unit: "2.25L",  cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola 1.5L",       brand: "Coca-Cola",      price: "$1.750", unit: "1.5L",   cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola lata",        brand: "Coca-Cola",      price: "$850",   unit: "354ml",  cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Pepsi 1.5L",            brand: "Pepsi",          price: "$1.500", unit: "1.5L",   cat: "Bebidas",  emoji: "🥤", dot: "#004B93" },
    { name: "Quilmes porrón",         brand: "Quilmes",        price: "$1.050", unit: "330ml",  cat: "Cervezas", emoji: "🍺", dot: "#1B5E20" },
    { name: "Schneider porrón",       brand: "Schneider",      price: "$1.100", unit: "473ml",  cat: "Cervezas", emoji: "🍺", dot: "#C8102E" },
    { name: "Fernet Branca 750",      brand: "Branca",         price: "$8.900", unit: "750ml",  cat: "Bebidas",  emoji: "🥃", dot: "#1B3A1F" },
    { name: "Galletitas Oreo",        brand: "Oreo",           price: "$1.200", unit: "x1",     cat: "Golosinas",emoji: "🍪", dot: "#1A2A6C" },
    { name: "Papas fritas Lay's",     brand: "Lay's",          price: "$1.800", unit: "x1",     cat: "Snacks",   emoji: "🥔", dot: "#F0C419" },
    { name: "Hielo 3kg",              brand: "Kiosco Enjoy",   price: "$1.900", unit: "3kg",    cat: "Varios",   emoji: "🧊", dot: "#7DC4E8" },
  ];

  window.freshCfg      = freshCfg;
  window.CATEGORIES    = CATEGORIES;
  window.CATALOG       = CATALOG;
  window.TEMPLATE_LIST = LIST;
  window.PRODUCTS      = PRODUCTS;
  window.formatPrice   = formatPrice;
})();
