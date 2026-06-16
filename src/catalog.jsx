/* =========================================================================
   Kiosco Enjoy — Catálogo simplificado
   · 3 categorías: precio, combo, info
   · 14 plantillas en total (5 + 4 + 5)
   · Plantillas "info" vienen pre-cargadas con datos reales de Kiosco Enjoy
   Expone: window.freshCfg, CATEGORIES, CATALOG, TEMPLATE_LIST,
           PRODUCTS, formatPrice
   ========================================================================= */
(function () {
  // ---- contenido placeholder neutro ----
  function base() {
    return {
      template: "composite", structName: "", struct: null, bg: "red",
      title: "Nombre del\nProducto", subtitle: "Detalle, sabor o variante",
      badge: "OFERTA", badgeShow: true, badgeStyle: "yellow",
      showPrice: true, priceFormat: "auto", priceEyebrow: "SOLO", priceMain: "$0.000", priceUnit: "", priceStrike: "",
      cta: "Pedí por la app", handle: "@kioscoenjoy",
      logoPos: "tl", logoShow: true, logoColor: "auto", logoSize: 1,
      photo: null, photoView: { s: 1, x: 0, y: 0, fit: "contain" },
      bgImage: null, bgView: { s: 1, x: 0, y: 0 }, bgInk: "light",
      titleColor: "auto", subColor: "auto", priceColor: "auto", ctaColor: "auto", handleColor: "auto",
      titleShow: true, subShow: true, ctaShow: true, handleShow: true,
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
    { key: "precio", name: "Precio",  icon: "bottle" },
    { key: "combo",  name: "Combo",   icon: "combo"  },
    { key: "info",   name: "Info",    icon: "clock"  },
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

  /* ============== PRECIO — 5 plantillas ============== */
  C.precio = [
    /* 1 — El layout más clásico: foto a la derecha, texto y precio a la izquierda */
    S("precio", "Foto derecha",
      { photo: "right", stackH: "l", stackV: "b", stackW: 0.5, price: "stack", title: "l", badge: "tr", bg: "red" }),

    /* 2 — Producto como protagonista centrado, precio abajo */
    S("precio", "Foto centrada",
      { photo: "center", stackH: "c", stackV: "b", price: "btn", title: "l", badge: "tr", bg: "dark" }),

    /* 3 — Sin foto, precio tipográfico gigante */
    S("precio", "Solo precio",
      { photo: "none", stackH: "c", stackV: "m", price: "stack", title: "m", badge: "tr", bg: "red" },
      { priceEyebrow: "SOLO", priceMain: "$0.000" }),

    /* 4 — Precio tachado + precio nuevo (descuento) */
    S("precio", "Descuento",
      { photo: "right", price: "strike", stackH: "l", stackV: "b", stackW: 0.55, title: "l", badge: "inline", bg: "dark" },
      { badge: "🔥 OFERTA" }),

    /* 5 — Foto circular, más limpio y premium */
    S("precio", "Foto circular",
      { photo: "circle-r", stackH: "l", stackV: "m", stackW: 0.5, price: "stack", title: "l", badge: "tl", bg: "red" }),
  ];

  /* ============== COMBO — 4 plantillas ============== */
  C.combo = [
    /* 1 — Lista de items con nombre + precio + tag */
    S("combo", "Lista de items",
      { kind: "list", badge: "tr", bg: "dark", ink: "light" },
      { title: "Precios\nde hoy", badge: "HOY" }),

    /* 2 — Grilla 2×2 */
    S("combo", "Grilla 2×2",
      { kind: "grid", badge: "tr", bg: "red", ink: "light" },
      { title: "Elegí tu\ncombo", badge: "COMBOS" }),

    /* 3 — Foto del pack + nombre del combo + precio */
    S("combo", "Foto + combo",
      { photo: "right", stackH: "l", stackV: "b", stackW: 0.55, price: "btn", title: "l", sub: true, badge: "inline", bg: "dark" },
      { badge: "🔥 COMBO", title: "Combo\nPrevia", subtitle: "Birras + papas + maní" }),

    /* 4 — Sin foto, título XL + precio impactante */
    S("combo", "Combo tipográfico",
      { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "stack", title: "xl", sub: true, badge: "inline", bg: "red" },
      { badge: "COMBO", title: "Combo\nPrevia", subtitle: "Birras + snacks + hielo" }),
  ];

  /* ============== INFO — 5 plantillas (datos pre-cargados de Kiosco Enjoy) ============== */
  C.info = [
    /* 1 — Horarios reales de Kiosco Enjoy */
    S("info", "Horarios semana",
      { kind: "list", badge: "tr", bg: "dark", ink: "light" },
      { title: "Horario\nde atención", badge: "HORARIOS", badgeStyle: "yellow",
        rows: [
          { name: "Lun a Sáb",      price: "8:00 a 14:00",  flag: "☀️" },
          { name: "",               price: "17:00 a 22:00", flag: "🌙" },
          { name: "Dom y feriados", price: "10:00 a 14:00", flag: "☀️" },
          { name: "",               price: "18:00 a 22:00", flag: "🌙" },
        ],
        handle: "@kioscoenjoy" }),

    /* 2 — Medios de pago */
    S("info", "Medios de pago",
      { kind: "list", badge: "tr", bg: "dark", ink: "light" },
      { title: "Medios\nde pago", badge: "INFO",
        rows: [
          { name: "Efectivo",    price: "✓", flag: "" },
          { name: "Débito",      price: "✓", flag: "" },
          { name: "Crédito",     price: "✓", flag: "" },
          { name: "MercadoPago", price: "✓", flag: "💚" },
          { name: "Naranja X",   price: "✓", flag: "🟠" },
        ],
        handle: "@kioscoenjoy" }),

    /* 3 — Datos del local: dirección, WhatsApp, Instagram, horarios */
    S("info", "Datos del local",
      { kind: "list", badge: "tr", bg: "red", ink: "light" },
      { title: "Kiosco\nEnjoy", badge: "INFO",
        rows: [
          { name: "📍 Dirección", price: "Ituzaingo 1410", flag: "" },
          { name: "📞 WhatsApp",  price: "358 422-3636",  flag: "" },
          { name: "📸 Instagram", price: "@kioscoenjoy",  flag: "" },
          { name: "⏰ Horarios",  price: "Lun-Sáb 8-22",  flag: "" },
        ],
        handle: "@kioscoenjoy" }),

    /* 4 — Anuncio centrado vacío (usuario llena) */
    S("info", "Anuncio centrado",
      { photo: "none", logo: "tc", stackH: "c", stackV: "m", price: "none", title: "xl", sub: true, badge: "none", bg: "dark" },
      { title: "Título del\nanuncio", subtitle: "Escribí aquí tu mensaje", handle: "@kioscoenjoy" }),

    /* 5 — Aviso / alerta con badge llamativo */
    S("info", "Aviso / alerta",
      { photo: "none", stackH: "l", stackV: "m", stackW: 0.86, price: "none", title: "l", sub: true, badge: "inline", bg: "red" },
      { badge: "⚠️ ATENCIÓN", title: "Título del\naviso", subtitle: "Escribí aquí tu mensaje", handle: "@kioscoenjoy" }),
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

  // ---- productos reales (para relleno rápido futuro) ----
  const PRODUCTS = [
    { name: "Coca-Cola 2.25L",      brand: "Coca-Cola",      price: "$2.150", unit: "2.25L",  cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola 1.5L",       brand: "Coca-Cola",      price: "$1.750", unit: "1.5L",   cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Coca-Cola lata",        brand: "Coca-Cola",      price: "$850",   unit: "354ml",  cat: "Bebidas",  emoji: "🥤", dot: "#F40000" },
    { name: "Pepsi 1.5L",            brand: "Pepsi",          price: "$1.500", unit: "1.5L",   cat: "Bebidas",  emoji: "🥤", dot: "#004B93" },
    { name: "Sprite 1.5L",           brand: "Sprite",         price: "$1.500", unit: "1.5L",   cat: "Bebidas",  emoji: "🥤", dot: "#1E9E54" },
    { name: "Agua mineral 2L",        brand: "Villavicencio",  price: "$1.100", unit: "2L",     cat: "Bebidas",  emoji: "💧", dot: "#5AA0DC" },
    { name: "Quilmes porrón",         brand: "Quilmes",        price: "$1.050", unit: "330ml",  cat: "Cervezas", emoji: "🍺", dot: "#1B5E20" },
    { name: "Schneider porrón",       brand: "Schneider",      price: "$1.100", unit: "473ml",  cat: "Cervezas", emoji: "🍺", dot: "#C8102E" },
    { name: "Fernet Branca 750",      brand: "Branca",         price: "$8.900", unit: "750ml",  cat: "Bebidas",  emoji: "🥃", dot: "#1B3A1F" },
    { name: "Leche La Serenísima 1L", brand: "La Serenísima",  price: "$1.320", unit: "1L",     cat: "Lácteos",  emoji: "🥛", dot: "#0033A0" },
    { name: "Galletitas Oreo",        brand: "Oreo",           price: "$1.200", unit: "x1",     cat: "Golosinas",emoji: "🍪", dot: "#1A2A6C" },
    { name: "Papas fritas Lay's",     brand: "Lay's",          price: "$1.800", unit: "x1",     cat: "Snacks",   emoji: "🥔", dot: "#F0C419" },
    { name: "Hielo 3kg",              brand: "Kiosco Enjoy",   price: "$1.900", unit: "3kg",    cat: "Varios",   emoji: "🧊", dot: "#7DC4E8" },
    { name: "Carbón 3kg",             brand: "Kiosco Enjoy",   price: "$2.400", unit: "3kg",    cat: "Varios",   emoji: "🔥", dot: "#2D2926" },
  ];

  window.freshCfg     = freshCfg;
  window.CATEGORIES   = CATEGORIES;
  window.CATALOG      = CATALOG;
  window.TEMPLATE_LIST = LIST;
  window.PRODUCTS     = PRODUCTS;
  window.formatPrice  = formatPrice;
})();
