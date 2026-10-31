(function () {
  const datos = window.BRIOZZO;
  const productos = datos.productos;
  const $ = (id) => document.getElementById(id);
  const movimientoReducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const punteroFino = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const ETIQUETA_ESTADO = { hay: "hay stock", pocos: "últimos pares", agotado: "agotado" };

  function precio(p) {
    if (p.precio == null) return "Consultar precio";
    return `${datos.moneda} ${p.precio.toLocaleString("es-AR")}`;
  }

  const tallesDe = (p) => Object.keys(p.talles).map(Number).sort((a, b) => a - b);
  const tieneTalles = (p) => tallesDe(p).length > 0;
  const estaAgotado = (p) => tieneTalles(p) && Object.values(p.talles).every((e) => e === "agotado");
  const hayTallesCargados = productos.some(tieneTalles);

  function enlaceWhatsApp(mensaje) {
    const texto = encodeURIComponent(mensaje);
    return datos.whatsapp ? `https://wa.me/${datos.whatsapp}?text=${texto}` : `https://wa.me/?text=${texto}`;
  }

  // Morfa la foto entre la grilla y la ficha cuando el navegador lo permite.
  function transicion(cambio) {
    if (!document.startViewTransition || movimientoReducido) { cambio(); return; }
    document.startViewTransition(cambio);
  }

  // Portada con los más vendidos: las fotos se deslizan en una tira continua.
  const vitrina = (function () {
    const INTERVALO = 5000;
    const carrusel = $("carrusel");
    const pista = $("pista");
    const destacados = datos.masVendidos.map((d) => ({ ...productos.find((p) => p.id === d.id), encuadre: d.encuadre }));
    const total = destacados.length;
    let posicion = 0;
    let quietoHasta = 0;
    let enPantalla = true;
    let arrastre = null;

    function crearDiapositiva(p) {
      const diapositiva = document.createElement("div");
      diapositiva.className = "diapositiva";
      const img = document.createElement("img");
      img.src = p.foto;
      img.alt = "";
      img.draggable = false;
      img.style.objectPosition = p.encuadre;
      diapositiva.append(img);
      return diapositiva;
    }

    // Una copia en cada punta permite seguir en la misma dirección al dar la vuelta.
    pista.append(crearDiapositiva(destacados[total - 1]), ...destacados.map(crearDiapositiva), crearDiapositiva(destacados[0]));

    const puntos = destacados.map((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ver ${p.nombre}`);
      b.addEventListener("click", () => { detener(8000); ir(i); });
      $("vitrina-puntos").append(b);
      return b;
    });

    const indice = () => (posicion + total) % total;

    function colocar(animado, desplazamiento = 0) {
      pista.style.transition = animado ? "" : "none";
      pista.style.transform = `translate3d(calc(${-(posicion + 1) * 100}% + ${desplazamiento}px), 0, 0)`;
    }

    function pintar() {
      $("vitrina-nombre").textContent = destacados[indice()].nombre;
      puntos.forEach((b, i) => {
        if (i === indice()) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }

    // Vuelve de una copia a la foto real sin que se note.
    function normalizar() {
      if (posicion >= 0 && posicion < total) return;
      posicion = indice();
      colocar(false);
      void pista.offsetWidth;
    }

    function ir(destino) {
      normalizar();
      posicion = destino;
      colocar(true);
      pintar();
    }

    const mover = (cantidad) => { normalizar(); ir(posicion + cantidad); };
    function detener(ms) { quietoHasta = performance.now() + ms; }

    pista.addEventListener("transitionend", normalizar);

    setInterval(() => {
      if (enPantalla && !document.hidden && !arrastre && performance.now() > quietoHasta) mover(1);
    }, INTERVALO);

    // Arrastre con mouse o dedo
    carrusel.addEventListener("pointerdown", (e) => {
      normalizar();
      arrastre = { x: e.clientX, dx: 0 };
      carrusel.setPointerCapture(e.pointerId);
    });
    carrusel.addEventListener("pointermove", (e) => {
      if (!arrastre) return;
      arrastre.dx = e.clientX - arrastre.x;
      colocar(false, arrastre.dx);
    });
    function soltar(e) {
      if (!arrastre) return;
      const { dx } = arrastre;
      arrastre = null;
      detener(8000);
      if (Math.abs(dx) > carrusel.offsetWidth * 0.12) { mover(dx < 0 ? 1 : -1); return; }
      colocar(true);
      if (e.type === "pointerup" && Math.abs(dx) < 6) abrirFicha(destacados[indice()]);
    }
    carrusel.addEventListener("pointerup", soltar);
    carrusel.addEventListener("pointercancel", soltar);

    carrusel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { detener(8000); mover(-1); e.preventDefault(); }
      if (e.key === "ArrowRight") { detener(8000); mover(1); e.preventDefault(); }
      if (e.key === "Enter") abrirFicha(destacados[indice()]);
    });

    $("vitrina-anterior").addEventListener("click", () => { detener(8000); mover(-1); });
    $("vitrina-siguiente").addEventListener("click", () => { detener(8000); mover(1); });
    $("vitrina-ver").addEventListener("click", () => abrirFicha(destacados[indice()]));

    new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; }).observe(carrusel);

    colocar(false);
    pintar();
    return { detener };
  })();

  // Catálogo y filtros
  const FILTRO_INICIAL = { tipo: "Todos", color: null, talle: null, texto: "", soloStock: false };
  const filtro = { ...FILTRO_INICIAL };
  const catalogo = [...productos].sort((a, b) => datos.tipos.indexOf(a.tipo) - datos.tipos.indexOf(b.tipo));

  function coincide(p) {
    if (filtro.tipo !== "Todos" && p.tipo !== filtro.tipo) return false;
    if (filtro.color && !p.colores.includes(filtro.color)) return false;
    if (filtro.texto && !p.nombre.toLowerCase().includes(filtro.texto)) return false;
    if (filtro.soloStock && estaAgotado(p)) return false;
    if (filtro.talle !== null) {
      const estado = p.talles[filtro.talle];
      if (!estado || estado === "agotado") return false;
    }
    return true;
  }

  function inclinar(tarjeta) {
    if (!punteroFino) return;
    tarjeta.addEventListener("pointermove", (e) => {
      const r = tarjeta.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      tarjeta.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
      tarjeta.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
      tarjeta.style.setProperty("--mx", `${x * 100}%`);
      tarjeta.style.setProperty("--my", `${y * 100}%`);
    });
    tarjeta.addEventListener("pointerleave", () => {
      tarjeta.style.setProperty("--ry", "0deg");
      tarjeta.style.setProperty("--rx", "0deg");
    });
  }

  function crearTarjeta(p) {
    const li = document.createElement("li");
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "tarjeta";
    tarjeta.dataset.id = p.id;

    const img = document.createElement("img");
    img.src = p.foto;
    img.alt = "";
    img.loading = "lazy";

    const texto = document.createElement("span");
    texto.className = "tarjeta-texto";

    const tipo = document.createElement("span");
    tipo.className = "tarjeta-tipo";
    tipo.textContent = estaAgotado(p) ? `${p.tipo}, agotado` : p.tipo;

    const nombre = document.createElement("span");
    nombre.className = "tarjeta-nombre";
    nombre.textContent = p.nombre;
    texto.append(tipo, nombre);

    if (p.precio != null) {
      const valor = document.createElement("span");
      valor.className = "tarjeta-precio";
      valor.textContent = precio(p);
      texto.append(valor);
    }

    if (tieneTalles(p)) {
      const talles = document.createElement("span");
      talles.className = "tarjeta-talles";
      tallesDe(p).forEach((t) => {
        const talle = document.createElement("span");
        talle.className = "talle";
        talle.textContent = t;
        talle.dataset.estado = p.talles[t];
        talles.append(talle);
      });
      texto.append(talles);
    }

    const resumen = tallesDe(p).map((t) => `${t} ${ETIQUETA_ESTADO[p.talles[t]]}`).join(", ");
    tarjeta.setAttribute("aria-label", `${p.nombre}, ${precio(p)}${resumen ? `. Talles: ${resumen}` : ""}`);

    tarjeta.append(img, texto);
    tarjeta.addEventListener("click", () => abrirFicha(p, img));
    inclinar(tarjeta);
    li.append(tarjeta);
    return li;
  }

  function pintarCatalogo() {
    const visibles = catalogo.filter(coincide);
    $("grilla").replaceChildren(...visibles.map(crearTarjeta));
    $("vacio").hidden = visibles.length > 0;
    const palabra = visibles.length === 1 ? "modelo" : "modelos";
    $("resultado").textContent = filtro.talle === null
      ? `${visibles.length} ${palabra}`
      : `${visibles.length} ${palabra} en talle ${filtro.talle}`;
    $("quitar-filtros").hidden = visibles.length === 0
      || (filtro.tipo === "Todos" && !filtro.color && filtro.talle === null && !filtro.texto && !filtro.soloStock);
    pintarPulsados();
  }

  function pintarPulsados() {
    document.querySelectorAll("#categorias button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.textContent === filtro.tipo));
    });
    document.querySelectorAll("#colores button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.color === filtro.color));
    });
    document.querySelectorAll("#filtro-talles button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.textContent) === filtro.talle));
    });
  }

  function limpiarFiltros() {
    Object.assign(filtro, FILTRO_INICIAL);
    $("buscar").value = "";
    $("solo-stock").checked = false;
    pintarCatalogo();
  }

  function iniciarFiltros() {
    ["Todos", ...datos.tipos].forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t;
      b.addEventListener("click", () => { filtro.tipo = t; pintarCatalogo(); });
      $("categorias").append(b);
    });

    Object.entries(datos.colores).forEach(([nombre, hex]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.color = nombre;
      b.style.background = hex;
      b.title = nombre;
      b.setAttribute("aria-label", `Color ${nombre}`);
      b.addEventListener("click", () => {
        filtro.color = filtro.color === nombre ? null : nombre;
        pintarCatalogo();
      });
      $("colores").append(b);
    });

    if (hayTallesCargados) {
      $("filtro-stock").hidden = false;
      $("catalogo-nota").hidden = true;
      [...new Set(productos.flatMap(tallesDe))].sort((a, b) => a - b).forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t;
        b.setAttribute("aria-label", `Ver modelos en talle ${t}`);
        b.addEventListener("click", () => {
          filtro.talle = filtro.talle === t ? null : t;
          pintarCatalogo();
        });
        $("filtro-talles").append(b);
      });
    }

    $("buscar").addEventListener("input", (e) => {
      filtro.texto = e.target.value.trim().toLowerCase();
      pintarCatalogo();
    });
    $("solo-stock").addEventListener("change", (e) => {
      filtro.soloStock = e.target.checked;
      pintarCatalogo();
    });
    $("limpiar").addEventListener("click", limpiarFiltros);
    $("quitar-filtros").addEventListener("click", limpiarFiltros);
  }

  // Ficha del producto
  let fichaActual = null;
  let fotoOrigen = null;

  function elegirTalle(p, talle) {
    const enlace = $("ficha-whatsapp");
    document.querySelectorAll("#ficha-talles button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.textContent) === talle));
    });

    if (!tieneTalles(p)) {
      enlace.href = enlaceWhatsApp(`Hola, quiero consultar por ${p.nombre}.`);
      enlace.removeAttribute("aria-disabled");
      $("ficha-estado").textContent = "Consultanos por los talles disponibles.";
      return;
    }
    if (talle === null) {
      enlace.removeAttribute("href");
      enlace.setAttribute("aria-disabled", "true");
      $("ficha-estado").textContent = estaAgotado(p) ? "Este modelo está agotado." : "Elegí un talle para consultar.";
      return;
    }
    enlace.href = enlaceWhatsApp(`Hola, quiero consultar por ${p.nombre} en talle ${talle}.`);
    enlace.removeAttribute("aria-disabled");
    $("ficha-estado").textContent = p.talles[talle] === "pocos" ? `Quedan los últimos pares en talle ${talle}.` : `Hay stock en talle ${talle}.`;
  }

  function cargarFicha(p) {
    fichaActual = p;
    $("ficha-foto").src = p.foto;
    $("ficha-foto").alt = p.nombre;
    $("ficha-tipo").textContent = p.tipo;
    $("ficha-nombre").textContent = p.nombre;
    $("ficha-precio").textContent = precio(p);
    $("ficha-stock").hidden = !tieneTalles(p);

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
  }

  function abrirFicha(p, foto) {
    vitrina.detener(60000);
    fotoOrigen = foto || null;
    if (fotoOrigen) fotoOrigen.style.viewTransitionName = "foto-activa";
    transicion(() => {
      if (fotoOrigen) fotoOrigen.style.viewTransitionName = "";
      $("ficha-foto").style.viewTransitionName = "foto-activa";
      cargarFicha(p);
      $("ficha").showModal();
    });
  }

  function cerrarFicha() {
    const visible = fotoOrigen && fichaActual && fotoOrigen.isConnected
      && fotoOrigen.closest(".tarjeta").dataset.id === fichaActual.id;
    if (!visible) $("ficha-foto").style.viewTransitionName = "";
    transicion(() => {
      $("ficha-foto").style.viewTransitionName = "";
      if (visible) fotoOrigen.style.viewTransitionName = "foto-activa";
      $("ficha").close();
    });
    vitrina.detener(0);
  }

  function pasarFicha(cantidad) {
    const i = catalogo.indexOf(fichaActual);
    cargarFicha(catalogo[(i + cantidad + catalogo.length) % catalogo.length]);
  }

  function iniciarFicha() {
    const ficha = $("ficha");
    $("ficha-cerrar").addEventListener("click", cerrarFicha);
    $("ficha-anterior").addEventListener("click", () => pasarFicha(-1));
    $("ficha-siguiente").addEventListener("click", () => pasarFicha(1));
    ficha.addEventListener("click", (e) => { if (e.target === ficha) cerrarFicha(); });
    ficha.addEventListener("cancel", (e) => { e.preventDefault(); cerrarFicha(); });
    ficha.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") pasarFicha(-1);
      if (e.key === "ArrowRight") pasarFicha(1);
    });
    ficha.addEventListener("close", () => {
      document.querySelectorAll(".tarjeta img").forEach((img) => { img.style.viewTransitionName = ""; });
    });

    if (punteroFino) {
      const marco = $("ficha-imagen");
      const foto = $("ficha-foto");
      marco.addEventListener("pointerenter", () => { marco.dataset.zoom = "true"; });
      marco.addEventListener("pointerleave", () => { marco.dataset.zoom = "false"; });
      marco.addEventListener("pointermove", (e) => {
        const r = marco.getBoundingClientRect();
        foto.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      });
    }
  }

  // Cada apartado es una página: el menú queda fijo y cambia todo el contenido.
  function iniciarPaginas() {
    const paginas = [...document.querySelectorAll("main > section")];
    const claras = ["cursos", "como-comprar"];
    let primeraVez = true;

    function mostrar() {
      const pedida = location.hash.slice(1);
      const actual = paginas.find((p) => p.id === pedida) || paginas[0];

      paginas.forEach((p) => { p.hidden = p !== actual; });
      document.body.dataset.tema = claras.includes(actual.id) ? "claro" : "oscuro";
      document.querySelectorAll(".nav nav a").forEach((a) => {
        if (a.hash === `#${actual.id}`) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });

      const titulo = actual.querySelector("h2");
      document.title = actual === paginas[0] ? "Briozzo Calzados" : `${titulo.textContent} | Briozzo Calzados`;
      scrollTo({ top: 0, behavior: "instant" });

      if (!primeraVez) {
        const destino = actual === paginas[0] ? $("carrusel") : titulo;
        if (actual !== paginas[0]) titulo.tabIndex = -1;
        destino.focus({ preventScroll: true });
      }
      primeraVez = false;
    }

    addEventListener("hashchange", mostrar);
    mostrar();
  }

  function iniciarCurso() {
    $("curso-consultar").href = enlaceWhatsApp("Hola, quiero consultar por el curso de confección de calzado.");
  }

  // Contacto
  function iniciarContacto() {
    $("pie-instagram").href = `https://www.instagram.com/${encodeURIComponent(datos.instagram)}/`;
    $("pie-instagram").setAttribute("aria-label", `Seguinos en Instagram: @${datos.instagram}`);
    $("pie-usuario").textContent = `@${datos.instagram}`;
    $("pie-direccion").textContent = datos.direccion;
    $("pie-local").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${datos.direccion}, Argentina`)}`;
    $("pie-local").setAttribute("aria-label", `Ver en el mapa: ${datos.direccion}`);

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

  $("anio").textContent = new Date().getFullYear();
  iniciarFiltros();
  iniciarFicha();
  iniciarPaginas();
  iniciarCurso();
  iniciarContacto();
  pintarCatalogo();
})();
