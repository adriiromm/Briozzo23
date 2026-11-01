(function () {
  const negocio = window.BRIOZZO;
  const actividad = window.BRIOZZO_ACTIVIDAD;
  const productos = negocio.productos;
  const $ = (id) => document.getElementById(id);
  const SVG = "http://www.w3.org/2000/svg";

  const METRICAS = [
    { id: "visitas", nombre: "Visitas a la web" },
    { id: "whatsapp", nombre: "Consultas por WhatsApp" },
    { id: "modelos", nombre: "Modelos vistos" },
    { id: "cursos", nombre: "Consultas por cursos" },
    { id: "instagram", nombre: "Clics en Instagram" },
    { id: "mapa", nombre: "Clics en Google Maps" }
  ];

  const ANCHO = 320, ALTO = 120, ARRIBA = 8, ABAJO = 4, COSTADO = 4, LINEAS = 4;
  const estado = { dias: 7, vista: "linea" };

  const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" });
  const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });
  const numero = (n) => n.toLocaleString("es-AR");

  function clave(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  function ultimosDias(cantidad) {
    const hoy = new Date();
    return Array.from({ length: cantidad }, (_, i) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (cantidad - 1 - i)));
  }

  function serie(metrica, dias) {
    const datos = actividad[metrica.id] || {};
    return dias.map((fecha) => ({ fecha, valor: datos[clave(fecha)] || 0 }));
  }

  // El tope del gráfico se redondea para que las líneas guía caigan en números enteros.
  function tope(puntos) {
    const maximo = Math.max(...puntos.map((p) => p.valor));
    return maximo === 0 ? LINEAS : Math.ceil(maximo / LINEAS) * LINEAS;
  }

  function elemento(nombre, atributos) {
    const el = document.createElementNS(SVG, nombre);
    Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function dibujar(svg, puntos) {
    const base = ALTO - ABAJO;
    const alto = base - ARRIBA;
    const ancho = ANCHO - COSTADO * 2;
    const maximo = tope(puntos);
    const x = (i) => COSTADO + (puntos.length === 1 ? 0 : (i * ancho) / (puntos.length - 1));
    const y = (v) => base - (v / maximo) * alto;

    for (let i = 1; i <= LINEAS; i++) {
      const altura = base - (i * alto) / LINEAS;
      svg.append(elemento("line", { class: "guia", x1: COSTADO, x2: ANCHO - COSTADO, y1: altura, y2: altura }));
    }

    if (estado.vista === "barras") {
      svg.append(elemento("line", { class: "base", x1: COSTADO, x2: ANCHO - COSTADO, y1: base, y2: base }));
      const paso = ancho / puntos.length;
      const grosor = Math.min(16, Math.max(1.5, paso - 2));
      puntos.forEach((p, i) => {
        if (p.valor === 0) return;
        const izquierda = COSTADO + i * paso + (paso - grosor) / 2;
        const cima = y(p.valor);
        const r = Math.min(4, grosor / 2, base - cima);
        const d = `M${izquierda} ${base}V${cima + r}Q${izquierda} ${cima} ${izquierda + r} ${cima}H${izquierda + grosor - r}Q${izquierda + grosor} ${cima} ${izquierda + grosor} ${cima + r}V${base}Z`;
        svg.append(elemento("path", { class: "barra-dato", d }));
      });
    } else {
      const d = puntos.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.valor)}`).join("");
      svg.append(elemento("path", { class: "linea-dato", d }));
    }

    return { x, y, base };
  }

  function activarLectura(svg, marco, puntos, escala) {
    const cruz = elemento("line", { class: "cruz", y1: ARRIBA, y2: escala.base, visibility: "hidden" });
    const punto = elemento("circle", { class: "marca", r: 4.5, visibility: "hidden" });
    svg.append(cruz, punto);
    const globo = document.createElement("p");
    globo.className = "globo";
    globo.hidden = true;
    marco.append(globo);

    function leer(e) {
      const r = svg.getBoundingClientRect();
      const avance = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const i = Math.round(avance * (puntos.length - 1));
      const { fecha, valor } = puntos[i];
      const px = escala.x(i);
      cruz.setAttribute("x1", px);
      cruz.setAttribute("x2", px);
      punto.setAttribute("cx", px);
      punto.setAttribute("cy", escala.y(valor));
      cruz.setAttribute("visibility", "visible");
      punto.setAttribute("visibility", "visible");
      globo.textContent = `${fechaCorta.format(fecha)}: ${numero(valor)}`;
      globo.hidden = false;
      const lugar = (px / ANCHO) * 100;
      globo.style.left = `${Math.min(78, Math.max(22, lugar))}%`;
    }

    function ocultar() {
      cruz.setAttribute("visibility", "hidden");
      punto.setAttribute("visibility", "hidden");
      globo.hidden = true;
    }

    svg.addEventListener("pointerdown", leer);
    svg.addEventListener("pointermove", leer);
    svg.addEventListener("pointerleave", ocultar);
    svg.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") ocultar(); });
  }

  function crearTabla(puntos) {
    const contenedor = document.createElement("div");
    contenedor.className = "tabla";
    const tabla = document.createElement("table");
    const encabezado = tabla.createTHead().insertRow();
    ["Fecha", "Cantidad"].forEach((t) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = t;
      encabezado.append(th);
    });
    const cuerpo = tabla.createTBody();
    [...puntos].reverse().forEach((p) => {
      const fila = cuerpo.insertRow();
      fila.insertCell().textContent = fechaLarga.format(p.fecha);
      fila.insertCell().textContent = numero(p.valor);
    });
    contenedor.append(tabla);
    return contenedor;
  }

  function crearTarjeta(metrica, dias) {
    const puntos = serie(metrica, dias);
    const total = puntos.reduce((suma, p) => suma + p.valor, 0);
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const titulo = document.createElement("h2");
    titulo.textContent = metrica.nombre;
    const cifra = document.createElement("p");
    cifra.className = "cifra";
    cifra.textContent = numero(total);
    tarjeta.append(titulo, cifra);

    if (estado.vista === "tabla") {
      tarjeta.append(crearTabla(puntos));
      return tarjeta;
    }

    const marco = document.createElement("div");
    marco.className = "grafico";
    const svg = elemento("svg", {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label": `${metrica.nombre}: ${numero(total)} en total. La vista en tabla muestra cada día.`
    });
    marco.append(svg);
    activarLectura(svg, marco, puntos, dibujar(svg, puntos));

    const fechas = document.createElement("p");
    fechas.className = "fechas";
    const desde = document.createElement("span");
    desde.textContent = fechaLarga.format(dias[0]);
    const hasta = document.createElement("span");
    hasta.textContent = fechaLarga.format(dias[dias.length - 1]);
    fechas.append(desde, hasta);

    tarjeta.append(marco, fechas);
    return tarjeta;
  }

  // Tarjeta de stock: se completa sola cuando el catálogo tenga talles.
  function crearTarjetaStock() {
    const talles = productos.flatMap((p) => Object.values(p.talles));
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    const titulo = document.createElement("h2");
    titulo.textContent = "Stock por talle";
    tarjeta.append(titulo);

    if (talles.length === 0) {
      tarjeta.classList.add("tarjeta-vacia");
      const fuerte = document.createElement("h3");
      fuerte.textContent = "Sin talles cargados";
      const texto = document.createElement("p");
      texto.textContent = "Cargá los talles para ver qué modelos se están por agotar.";
      const boton = document.createElement("a");
      boton.className = "boton";
      boton.href = "#catalogo";
      boton.textContent = "Ver pendientes";
      tarjeta.append(fuerte, texto, boton);
      return tarjeta;
    }

    const cuenta = (e) => talles.filter((t) => t === e).length;
    const lista = document.createElement("div");
    lista.className = "filas";
    pintarFilas(lista, [["Hay stock", cuenta("hay")], ["Últimos pares", cuenta("pocos")], ["Agotados", cuenta("agotado")]]);
    tarjeta.append(lista);
    return tarjeta;
  }

  function pintarActividad() {
    const dias = ultimosDias(estado.dias);
    const hayDatos = METRICAS.some((m) => Object.keys(actividad[m.id] || {}).length > 0);
    $("aviso").hidden = hayDatos;
    $("tarjetas").replaceChildren(...METRICAS.map((m) => crearTarjeta(m, dias)), crearTarjetaStock());
    document.querySelectorAll("[data-vista]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.vista === estado.vista));
    });
  }

  function exportar() {
    const dias = ultimosDias(estado.dias);
    const encabezado = ["Fecha", ...METRICAS.map((m) => m.nombre)].join(";");
    const filas = dias.map((fecha) => {
      const valores = METRICAS.map((m) => (actividad[m.id] || {})[clave(fecha)] || 0);
      return [clave(fecha), ...valores].join(";");
    });
    const archivo = new Blob([`﻿${[encabezado, ...filas].join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `briozzo-actividad-${estado.dias}-dias.csv`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  // Catálogo: datos reales de la web
  function crearCifra(nombre, valor) {
    const caja = document.createElement("article");
    caja.className = "tarjeta caja";
    const titulo = document.createElement("h2");
    titulo.textContent = nombre;
    const cifra = document.createElement("p");
    cifra.className = "cifra";
    cifra.textContent = valor;
    caja.append(titulo, cifra);
    return caja;
  }

  function pintarFilas(contenedor, filas) {
    const maximo = Math.max(1, ...filas.map(([, valor]) => valor));
    contenedor.replaceChildren(...filas.map(([nombre, valor]) => {
      const fila = document.createElement("div");
      fila.className = "fila";
      const etiqueta = document.createElement("span");
      etiqueta.textContent = nombre;
      const pista = document.createElement("span");
      pista.className = "fila-pista";
      const relleno = document.createElement("span");
      relleno.style.width = `${(valor / maximo) * 100}%`;
      pista.append(relleno);
      const cifra = document.createElement("span");
      cifra.className = "fila-cifra";
      cifra.textContent = numero(valor);
      fila.append(etiqueta, pista, cifra);
      return fila;
    }));
  }

  function pendientesDe(p) {
    const faltan = [];
    if (p.precio == null) faltan.push("precio");
    if (Object.keys(p.talles).length === 0) faltan.push("talles");
    return faltan;
  }

  function pintarCatalogo() {
    const total = productos.length;
    const conPrecio = productos.filter((p) => p.precio != null).length;
    const conTalles = productos.filter((p) => Object.keys(p.talles).length > 0).length;
    $("cifras").replaceChildren(
      crearCifra("Modelos", numero(total)),
      crearCifra("Con precio", `${numero(conPrecio)}/${numero(total)}`),
      crearCifra("Con talles", `${numero(conTalles)}/${numero(total)}`)
    );

    pintarFilas($("por-tipo"), negocio.tipos.map((t) => [t, productos.filter((p) => p.tipo === t).length]));
    pintarFilas($("por-color"), Object.keys(negocio.colores).map((c) => [c, productos.filter((p) => p.colores.includes(c)).length]));

    const conFaltantes = productos.filter((p) => pendientesDe(p).length > 0);
    if (conFaltantes.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Todos los modelos tienen precio y talles.";
      $("pendientes").replaceChildren(li);
      return;
    }
    $("pendientes").replaceChildren(...conFaltantes.map((p) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = `../${p.foto}`;
      img.alt = "";
      img.loading = "lazy";
      const texto = document.createElement("span");
      const nombre = document.createElement("strong");
      nombre.textContent = p.nombre;
      const falta = document.createElement("small");
      falta.textContent = `Falta ${pendientesDe(p).join(" y ")}`;
      texto.append(nombre, falta);
      li.append(img, texto);
      return li;
    }));
  }

  function mostrarPestana() {
    const actual = location.hash === "#catalogo" ? "catalogo" : "actividad";
    $("actividad").hidden = actual !== "actividad";
    $("catalogo").hidden = actual !== "catalogo";
    $("titulo").textContent = actual === "catalogo" ? "Catálogo" : "Actividad";
    document.querySelectorAll(".pestanas a").forEach((a) => {
      if (a.hash === `#${actual}`) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    scrollTo(0, 0);
  }

  $("periodo").addEventListener("change", (e) => {
    estado.dias = Number(e.target.value);
    pintarActividad();
  });
  document.querySelectorAll("[data-vista]").forEach((b) => {
    b.addEventListener("click", () => {
      estado.vista = b.dataset.vista;
      pintarActividad();
    });
  });
  $("exportar").addEventListener("click", exportar);
  addEventListener("hashchange", mostrarPestana);

  pintarActividad();
  pintarCatalogo();
  mostrarPestana();
})();
