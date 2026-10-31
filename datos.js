// Datos del negocio y del catálogo.
// precio: número, o null para mostrar "Consultar precio".
// talles: { 38: "hay", 39: "pocos", 40: "agotado" }. Vacío mientras no estén cargados.
// luz: color del brillo de fondo en la vitrina.
window.BRIOZZO = {
  whatsapp: "", // Solo números, con código de país. Ejemplo: "5491112345678"
  instagram: "briozzocalzados", // Solo el usuario, sin @
  direccion: "Aguado 87",
  horarios: "",
  moneda: "$",
  colores: {
    Negro: "#000000",
    Blanco: "#ffffff",
    Dorado: "#d0a94f",
    Plateado: "#c4c7cc",
    Rosa: "#d9608a",
    Nude: "#d9a988"
  },
  productos: [
    { id: "zapatillas-negras-amarillas", nombre: "Zapatillas negras y amarillas", tipo: "Zapatillas", colores: ["Negro"], foto: "fotos/zapatillas-negras-amarillas.jpg", luz: "#7a6614", precio: null, talles: {} },
    { id: "sandalias-cobre-negras", nombre: "Sandalias cobre y negras", tipo: "Sandalias", colores: ["Dorado", "Negro"], foto: "fotos/sandalias-cobre-negras.jpg", luz: "#8a5a1e", precio: null, talles: {} },
    { id: "zapatillas-blancas-rosa", nombre: "Zapatillas blancas y rosa", tipo: "Zapatillas", colores: ["Blanco", "Rosa"], foto: "fotos/zapatillas-blancas-rosa.jpg", luz: "#8a4a5c", precio: null, talles: {} },
    { id: "ojotas-negras-strass", nombre: "Ojotas negras con strass", tipo: "Ojotas", colores: ["Negro"], foto: "fotos/ojotas-negras-strass.jpg", luz: "#5a4a30", precio: null, talles: {} },
    { id: "sandalias-amarillas-fucsia", nombre: "Sandalias amarillas y fucsia", tipo: "Sandalias", colores: ["Rosa"], foto: "fotos/sandalias-amarillas-fucsia.jpg", luz: "#8a2a5a", precio: null, talles: {} },
    { id: "chatitas-nude", nombre: "Chatitas nude", tipo: "Chatitas", colores: ["Nude"], foto: "fotos/chatitas-nude.jpg", luz: "#8a5a3a", precio: null, talles: {} },
    { id: "zapatillas-negras-rosa", nombre: "Zapatillas negras y rosa", tipo: "Zapatillas", colores: ["Negro", "Rosa"], foto: "fotos/zapatillas-negras-rosa.jpg", luz: "#7a3a50", precio: null, talles: {} },
    { id: "sandalias-plateadas", nombre: "Sandalias plateadas", tipo: "Sandalias", colores: ["Plateado"], foto: "fotos/sandalias-plateadas.jpg", luz: "#5a5c62", precio: null, talles: {} },
    { id: "stilettos-blancos-strass", nombre: "Stilettos blancos con strass", tipo: "Stilettos", colores: ["Blanco"], foto: "fotos/stilettos-blancos-strass.jpg", luz: "#7a6a58", precio: null, talles: {} },
    { id: "sandalias-cobre-beige", nombre: "Sandalias cobre y beige", tipo: "Sandalias", colores: ["Dorado", "Nude"], foto: "fotos/sandalias-cobre-beige.jpg", luz: "#8a5226", precio: null, talles: {} }
  ]
};
