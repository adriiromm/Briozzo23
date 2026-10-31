(function () {
  const datos = window.BRIOZZO;
  const productos = datos.productos;
  const $ = (id) => document.getElementById(id);

  const ETIQUETA_ESTADO = { hay: "hay stock", pocos: "últimos pares", agotado: "agotado" };

  // Siluetas de línea que se usan mientras un producto no tiene foto.
  const SILUETAS = {
    zapato: {
      caja: "0 0 640 300",
      trazos: [
        "M58 226 C50 190 54 140 62 104 C65 92 76 86 90 86 C118 88 150 88 176 84 C186 83 192 90 198 100 C214 128 248 146 290 160 C350 180 420 188 486 198 C540 206 588 216 596 244 L58 226 Z",
        "M50 226 L596 244 C604 256 596 266 578 266 L346 266 C314 266 298 252 268 250 L200 248 L200 272 L64 272 C54 272 48 264 50 254 Z"
      ],
      detalles: [
        "M198 100 C196 134 214 176 262 212 M290 160 C282 180 276 196 262 212 M262 212 C330 226 430 232 596 244",
        "M224 124 L256 104 M244 138 L276 118 M266 150 L298 130 M290 160 L322 140"
      ]
    },
    bota: {
      caja: "0 0 640 400",
      trazos: [
        "M94 318 C90 240 96 130 92 40 C92 28 100 22 112 22 L270 22 C282 22 288 30 288 42 C288 110 288 170 300 206 C316 240 370 256 440 270 C510 284 572 296 586 334 L94 318 Z",
        "M86 318 L586 334 C594 346 586 356 568 356 L346 356 C316 356 300 342 272 340 L216 338 L216 368 L100 368 C90 368 84 360 86 350 Z"
      ],
      detalles: [
        "M92 62 L288 62",
        "M216 62 C210 130 214 200 240 250 C256 280 262 300 268 326",
        "M300 206 C290 240 280 280 268 326"
      ]
    },
    zapatilla: {
      caja: "0 0 640 300",
      trazos: [
        "M60 214 C52 176 56 130 66 98 C72 84 88 80 100 88 C116 100 142 104 170 90 C180 84 190 88 198 98 C226 134 268 148 322 164 C392 182 452 170 518 186 C560 196 590 210 592 232 L60 214 Z",
        "M50 214 L594 232 C606 244 602 274 574 274 L80 268 C52 266 42 240 50 214 Z"
      ],
      detalles: [
        "M44 240 L602 254",
        "M236 134 L268 106 M260 148 L292 120 M286 158 L318 130 M312 164 L344 138",
        "M150 216 C210 180 260 170 300 168 C350 170 400 200 440 222"
      ]
    },
    sandalia: {
      caja: "0 0 640 340",
      trazos: [
        "M92 226 C120 214 180 216 260 236 C340 256 430 262 560 256 C590 256 604 268 596 280 C590 288 576 290 560 290 C440 294 340 288 270 264 C210 244 150 238 118 244 C100 248 88 238 92 226 Z",
        "M118 244 L96 318 L142 318 C146 288 168 262 198 244"
      ],
      detalles: [
        "M400 262 C420 214 480 210 520 258",
        "M452 260 C462 232 500 232 540 258",
        "M200 226 C200 170 180 130 130 108 C112 100 108 76 128 72 C166 66 216 96 240 150 C252 180 256 212 260 236"
      ]
    }
  };

  function silueta(tipo, conClases) {
    const s = SILUETAS[tipo] || SILUETAS.zapato;
    const claseTrazo = conClases ? ' class="trazo"' : "";
    const claseDetalle = conClases ? ' class="trazo trazo-detalle"' : "";
    const trazos = s.trazos.map((d) => `<path${claseTrazo} pathLength="1" d="${d}"/>`).join("");
    const detalles = s.detalles.map((d) => `<path${claseDetalle} pathLength="1" d="${d}" stroke-width="1.5"/>`).join("");
    return `<svg viewBox="${s.caja}" fill="none" stroke="#d0a94f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos}${detalles}</svg>`;
  }

  function imagen(p) {
    if (!p.foto) return silueta(p.tipo);
    const img = document.createElement("img");
    img.src = p.foto;
    img.alt = p.nombre;
    img.loading = "lazy";
    return img.outerHTML;
  }

  function precio(p) {
    if (p.precio == null) return "Consultar precio";
    return `${datos.moneda} ${p.precio.toLocaleString("es-AR")}`;
  }

  const tallesDe = (p) => Object.keys(p.talles).map(Number).sort((a, b) => a - b);
  const tieneStock = (p) => Object.values(p.talles).some((e) => e !== "agotado");

  function enlaceWhatsApp(mensaje) {
    const texto = encodeURIComponent(mensaje);
    return datos.whatsapp ? `https://wa.me/${datos.whatsapp}?text=${texto}` : `https://wa.me/?text=${texto}`;
  }

  // Catálogo y filtros
  const filtro = { categoria: "Todos", talle: null, texto: "", soloStock: false };

  function coincide(p) {
    if (filtro.categoria !== "Todos" && p.categoria !== filtro.categoria) return false;
    if (filtro.texto && !p.nombre.toLowerCase().includes(filtro.texto)) return false;
    if (filtro.soloStock && !tieneStock(p)) return false;
    if (filtro.talle !== null) {
      const estado = p.talles[filtro.talle];
      if (!estado || estado === "agotado") return false;
    }
    return true;
  }

  function crearTarjeta(p) {
    const li = document.createElement("li");
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "tarjeta";
    tarjeta.dataset.agotado = String(!tieneStock(p));

    const figura = document.createElement("div");
    figura.className = "tarjeta-imagen";
    figura.innerHTML = imagen(p);

    const cuerpo = document.createElement("div");
    cuerpo.className = "tarjeta-cuerpo";

    const categoria = document.createElement("span");
    categoria.className = "tarjeta-categoria";
    categoria.textContent = p.categoria;

    const nombre = document.createElement("span");
    nombre.className = "tarjeta-nombre";
    nombre.textContent = p.nombre;

    const valor = document.createElement("span");
    valor.className = "tarjeta-precio";
    valor.textContent = precio(p);

    const talles = document.createElement("span");
    talles.className = "tarjeta-talles";
    if (tieneStock(p)) {
      tallesDe(p).forEach((t) => {
        const talle = document.createElement("span");
        talle.className = "talle";
        talle.textContent = t;
        talle.dataset.estado = p.talles[t];
        talle.dataset.filtrado = String(t === filtro.talle);
        talle.title = `Talle ${t}: ${ETIQUETA_ESTADO[p.talles[t]]}`;
        talles.append(talle);
      });
    } else {
      const sello = document.createElement("span");
      sello.className = "sello-agotado";
      sello.textContent = "Agotado";
      talles.append(sello);
    }

    const resumen = tallesDe(p).map((t) => `${t} ${ETIQUETA_ESTADO[p.talles[t]]}`).join(", ");
    tarjeta.setAttribute("aria-label", `${p.nombre}, ${precio(p)}. Talles: ${resumen}`);

    cuerpo.append(categoria, nombre, valor, talles);
    tarjeta.append(figura, cuerpo);
    tarjeta.addEventListener("click", () => abrirFicha(p));
    li.append(tarjeta);
    return li;
  }

  function pintarCatalogo() {
    const visibles = productos.filter(coincide);
    $("grilla").replaceChildren(...visibles.map(crearTarjeta));
    $("vacio").hidden = visibles.length > 0;
    const palabra = visibles.length === 1 ? "modelo" : "modelos";
    $("resultado").textContent = filtro.talle === null
      ? `${visibles.length} ${palabra}`
      : `${visibles.length} ${palabra} en talle ${filtro.talle}`;
    $("quitar-talle").hidden = filtro.talle === null;
    pintarPulsados();
  }

  function pintarPulsados() {
    document.querySelectorAll("#categorias button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.textContent === filtro.categoria));
    });
    document.querySelectorAll("#hero-talles button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.textContent) === filtro.talle));
    });
  }

  function iniciarFiltros() {
    ["Todos", ...new Set(productos.map((p) => p.categoria))].forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c;
      b.addEventListener("click", () => { filtro.categoria = c; pintarCatalogo(); });
      $("categorias").append(b);
    });

    [...new Set(productos.flatMap(tallesDe))].sort((a, b) => a - b).forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t;
      b.setAttribute("aria-label", `Ver modelos en talle ${t}`);
      b.addEventListener("click", () => {
        const yaElegido = filtro.talle === t;
        filtro.talle = yaElegido ? null : t;
        pintarCatalogo();
        if (!yaElegido) $("catalogo").scrollIntoView();
      });
      $("hero-talles").append(b);
    });

    $("buscar").addEventListener("input", (e) => {
      filtro.texto = e.target.value.trim().toLowerCase();
      pintarCatalogo();
    });
    $("solo-stock").addEventListener("change", (e) => {
      filtro.soloStock = e.target.checked;
      pintarCatalogo();
    });
    $("quitar-talle").addEventListener("click", () => { filtro.talle = null; pintarCatalogo(); });
    $("limpiar").addEventListener("click", () => {
      Object.assign(filtro, { categoria: "Todos", talle: null, texto: "", soloStock: false });
      $("buscar").value = "";
      $("solo-stock").checked = false;
      pintarCatalogo();
    });
  }

  // Ficha del producto
  function elegirTalle(p, talle) {
    const enlace = $("ficha-whatsapp");
    document.querySelectorAll("#ficha-talles button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.textContent) === talle));
    });
    if (talle === null) {
      enlace.removeAttribute("href");
      enlace.setAttribute("aria-disabled", "true");
      $("ficha-estado").textContent = tieneStock(p) ? "Elegí un talle para consultar." : "Este modelo está agotado.";
      return;
    }
    enlace.href = enlaceWhatsApp(`Hola, quiero consultar por ${p.nombre} en talle ${talle}.`);
    enlace.removeAttribute("aria-disabled");
    $("ficha-estado").textContent = p.talles[talle] === "pocos" ? `Quedan los últimos pares en talle ${talle}.` : `Hay stock en talle ${talle}.`;
  }

  function abrirFicha(p) {
    $("ficha-imagen").innerHTML = imagen(p);
    $("ficha-categoria").textContent = p.categoria;
    $("ficha-nombre").textContent = p.nombre;
    $("ficha-precio").textContent = precio(p);
    $("ficha-descripcion").textContent = p.descripcion || "";

    const botones = tallesDe(p).map((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t;
      b.dataset.estado = p.talles[t];
      b.disabled = p.talles[t] === "agotado";
      b.setAttribute("aria-label", `Talle ${t}, ${ETIQUETA_ESTADO[p.talles[t]]}`);
      b.addEventListener("click", () => elegirTalle(p, t));
      return b;
    });
    $("ficha-talles").replaceChildren(...botones);

    const disponible = filtro.talle !== null && p.talles[filtro.talle] && p.talles[filtro.talle] !== "agotado";
    elegirTalle(p, disponible ? filtro.talle : null);
    $("ficha").showModal();
  }

  $("ficha-cerrar").addEventListener("click", () => $("ficha").close());
  $("ficha").addEventListener("click", (e) => { if (e.target === $("ficha")) $("ficha").close(); });

  // Contacto
  function iniciarContacto() {
    const filas = [["Dirección", datos.direccion], ["Horarios", datos.horarios]].filter(([, valor]) => valor);
    filas.forEach(([titulo, valor]) => {
      const dt = document.createElement("dt");
      dt.textContent = titulo;
      const dd = document.createElement("dd");
      dd.textContent = valor;
      $("contacto-datos").append(dt, dd);
    });

    $("contacto-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const mensaje = `Hola, soy ${form.get("nombre")}. ${form.get("consulta")}`;
      window.open(enlaceWhatsApp(mensaje), "_blank", "noopener");
    });
  }

  $("aviso-pruebas").hidden = !datos.pruebas;
  $("hero-zapato").innerHTML = silueta("zapato", true);
  $("anio").textContent = new Date().getFullYear();
  iniciarFiltros();
  iniciarContacto();
  pintarCatalogo();
})();
