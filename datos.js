// Datos del negocio y del catálogo.
// precio: número, o null para mostrar "Consultar precio".
// talles: { 38: "hay", 39: "pocos", 40: "agotado" }. Vacío mientras no estén cargados.
window.BRIOZZO = {
  whatsapp: "5492915744781", // Solo números, con código de país: 2915 74-4781
  instagram: "briozzocalzados", // Solo el usuario, sin @
  direccion: "Aguado 87, Bahía Blanca",
  horarios: "",
  moneda: "$",
  masVendidos: [ // Productos de la portada. encuadre: qué parte de la foto se prioriza al recortar.
    { id: "zapatillas-negras-rosa", encuadre: "center 62%" },
    { id: "sandalias-amarillas-fucsia", encuadre: "center 58%" },
    { id: "sandalias-cobre-negras", encuadre: "26% 62%" }
  ],
  tipos: ["Zapatillas", "Sandalias", "Stilettos", "Chatitas", "Ojotas"], // Orden del catálogo
  colores: {
    Negro: "#000000",
    Blanco: "#ffffff",
    Dorado: "#d0a94f",
    Plateado: "#c4c7cc",
    Rosa: "#d9608a",
    Nude: "#d9a988"
  },
  productos: [
    { id: "zapatillas-negras-amarillas", nombre: "Zapatillas negras y amarillas", tipo: "Zapatillas", colores: ["Negro"], foto: "fotos/zapatillas-negras-amarillas.jpg", precio: null, talles: {} },
    { id: "sandalias-cobre-negras", nombre: "Sandalias cobre y negras", tipo: "Sandalias", colores: ["Dorado", "Negro"], foto: "fotos/sandalias-cobre-negras.jpg", precio: null, talles: {} },
    { id: "zapatillas-blancas-rosa", nombre: "Zapatillas blancas y rosa", tipo: "Zapatillas", colores: ["Blanco", "Rosa"], foto: "fotos/zapatillas-blancas-rosa.jpg", precio: null, talles: {} },
    { id: "ojotas-negras-strass", nombre: "Ojotas negras con strass", tipo: "Ojotas", colores: ["Negro"], foto: "fotos/ojotas-negras-strass.jpg", precio: null, talles: {} },
    { id: "sandalias-amarillas-fucsia", nombre: "Sandalias amarillas y fucsia", tipo: "Sandalias", colores: ["Rosa"], foto: "fotos/sandalias-amarillas-fucsia.jpg", precio: null, talles: {} },
    { id: "chatitas-nude", nombre: "Chatitas nude", tipo: "Chatitas", colores: ["Nude"], foto: "fotos/chatitas-nude.jpg", precio: null, talles: {} },
    { id: "zapatillas-negras-rosa", nombre: "Zapatillas negras y rosa", tipo: "Zapatillas", colores: ["Negro", "Rosa"], foto: "fotos/zapatillas-negras-rosa.jpg", precio: null, talles: {} },
    { id: "sandalias-plateadas", nombre: "Sandalias plateadas", tipo: "Sandalias", colores: ["Plateado"], foto: "fotos/sandalias-plateadas.jpg", precio: null, talles: {} },
    { id: "stilettos-blancos-strass", nombre: "Stilettos blancos con strass", tipo: "Stilettos", colores: ["Blanco"], foto: "fotos/stilettos-blancos-strass.jpg", precio: null, talles: {} },
    { id: "sandalias-cobre-beige", nombre: "Sandalias cobre y beige", tipo: "Sandalias", colores: ["Dorado", "Nude"], foto: "fotos/sandalias-cobre-beige.jpg", precio: null, talles: {} }
  ]
};
