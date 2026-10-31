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

  // Vitrina giratoria
  const vitrina = (function () {
    const escena = $("escena");
    const anillo = $("anillo");
    const paso = 360 / productos.length;
    let angulo = 0;
    let objetivo = 0;
    let radio = 0;
    let frente = -1;
    let enPantalla = true;
    let quietoHasta = 0;

    const cartas = productos.map((p) => {
      const carta = document.createElement("div");
      carta.className = "carta";
      const img = document.createElement("img");
      img.src = p.foto;
      img.alt = "";
      img.draggable = false;
      carta.append(img);
      anillo.append(carta);
      return carta;
    });

    function colocar() {
      const ancho = cartas[0].offsetWidth;
      radio = Math.round((ancho / 2 / Math.tan(Math.PI / productos.length)) * 1.14);
      cartas.forEach((c, i) => { c.style.transform = `rotateY(${i * paso}deg) translateZ(${radio}px)`; });
    }

    const indiceDelFrente = () => {
      const i = Math.round(-angulo / paso) % productos.length;
      return (i + productos.length) % productos.length;
    };

    function pintar() {
      anillo.style.transform = `translateZ(${-radio}px) rotateY(${angulo}deg)`;
      cartas.forEach((c, i) => {
        const cercania = Math.max(0, Math.cos(((i * paso + angulo) * Math.PI) / 180));
        c.style.filter = `brightness(${(0.22 + 0.78 * cercania ** 2).toFixed(3)})`;
      });
      const actual = indiceDelFrente();
      if (actual !== frente) {
        frente = actual;
        $("vitrina-nombre").textContent = productos[frente].nombre;
        $("vitrina-luz").style.setProperty("--luz", productos[frente].luz);
      }
    }

    function cuadro(ahora) {
      if (enPantalla) {
        if (!movimientoReducido && ahora > quietoHasta) objetivo -= 0.05;
        angulo += (objetivo - angulo) * 0.09;
        pintar();
      }
      requestAnimationFrame(cuadro);
    }

    function detener(ms) { quietoHasta = performance.now() + ms; }
    function alinear() { objetivo = Math.round(objetivo / paso) * paso; }
    function mover(cantidad) { detener(7000); alinear(); objetivo -= cantidad * paso; }

    function irA(i) {
      detener(7000);
      const destino = -i * paso;
      const vueltas = Math.round((objetivo - destino) / 360);
      objetivo = destino + vueltas * 360;
    }

    // Arrastre con mouse o dedo
    let inicio = null;
    escena.addEventListener("pointerdown", (e) => {
      inicio = { x: e.clientX, y: e.clientY, ultimo: e.clientX, movido: false };
      escena.setPointerCapture(e.pointerId);
      detener(7000);
    });
    escena.addEventListener("pointermove", (e) => {
      if (!inicio) return;
      const dx = e.clientX - inicio.ultimo;
      inicio.ultimo = e.clientX;
      if (Math.abs(e.clientX - inicio.x) > 6) inicio.movido = true;
      objetivo += dx * 0.22;
      detener(7000);
    });
    function soltar(e) {
      if (!inicio) return;
      const fueClic = !inicio.movido;
      inicio = null;
      if (!fueClic) { alinear(); return; }
      if (e.type !== "pointerup") return;
      const elemento = document.elementFromPoint(e.clientX, e.clientY);
      const carta = elemento && elemento.closest(".carta");
      if (!carta) return;
      const i = cartas.indexOf(carta);
      if (i === frente) abrirFicha(productos[i]);
      else irA(i);
    }
    escena.addEventListener("pointerup", soltar);
    escena.addEventListener("pointercancel", soltar);

    escena.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { mover(-1); e.preventDefault(); }
      if (e.key === "ArrowRight") { mover(1); e.preventDefault(); }
      if (e.key === "Enter") abrirFicha(productos[frente]);
    });
    escena.addEventListener("focus", () => detener(60000));

    $("vitrina-anterior").addEventListener("click", () => mover(-1));
    $("vitrina-siguiente").addEventListener("click", () => mover(1));
    $("vitrina-ver").addEventListener("click", () => abrirFicha(productos[frente]));

    new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; }).observe(escena);
    addEventListener("resize", colocar);

    colocar();
    pintar();
    requestAnimationFrame(cuadro);
    return { detener };
  })();

  // Catálogo y filtros
  const FILTRO_INICIAL = { tipo: "Todos", color: null, talle: null, texto: "", soloStock: false };
  const filtro = { ...FILTRO_INICIAL };

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
    tarjeta.dataset.cursor = "Ver";
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
    const visibles = productos.filter(coincide);
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
    ["Todos", ...new Set(productos.map((p) => p.tipo))].forEach((t) => {
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
    const i = productos.indexOf(fichaActual);
    cargarFicha(productos[(i + cantidad + productos.length) % productos.length]);
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

  // El cursor sigue al puntero y anuncia la acción de lo que tiene debajo.
  function iniciarCursor() {
    if (!punteroFino) return;
    const cursor = $("cursor");
    let x = -100, y = -100, cx = -100, cy = -100;
    addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      const objetivo = e.target.closest && e.target.closest("[data-cursor]");
      cursor.dataset.activo = String(Boolean(objetivo));
      if (objetivo) $("cursor-texto").textContent = objetivo.dataset.cursor;
    });
    addEventListener("scroll", () => { cursor.dataset.activo = "false"; }, { passive: true });
    (function seguir() {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(seguir);
    })();
  }

  // La página pasa a blanco en "Cómo comprar".
  function iniciarTema() {
    new IntersectionObserver(([e]) => {
      document.body.dataset.tema = e.isIntersecting ? "claro" : "oscuro";
    }, { rootMargin: "-45% 0px -45% 0px" }).observe($("como-comprar"));
  }

  // Contacto
  function iniciarContacto() {
    $("pie-instagram").href = `https://www.instagram.com/${encodeURIComponent(datos.instagram)}/`;
    $("pie-instagram").textContent = `@${datos.instagram}`;
    $("pie-direccion").textContent = datos.direccion;

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
  iniciarCursor();
  iniciarTema();
  iniciarContacto();
  pintarCatalogo();
})();
