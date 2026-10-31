// Datos del negocio y del catálogo.
// Estado de cada talle: "hay", "pocos" o "agotado". La parte pública nunca recibe cantidades exactas.
// Para usar una foto real, agregá foto: "fotos/nombre.jpg" al producto.
window.BRIOZZO = {
  pruebas: true, // Muestra el aviso de datos de prueba. Pasar a false con el catálogo real.
  whatsapp: "", // Solo números, con código de país. Ejemplo: "5491112345678"
  direccion: "",
  horarios: "",
  moneda: "$",
  productos: [
    { id: "prueba-1", nombre: "Modelo de prueba 1", categoria: "Hombre", tipo: "zapato", precio: 89900, descripcion: "Producto ficticio para probar la página.", talles: { 40: "hay", 41: "pocos", 42: "hay", 43: "agotado", 44: "hay" } },
    { id: "prueba-2", nombre: "Modelo de prueba 2", categoria: "Hombre", tipo: "bota", precio: 124900, descripcion: "Producto ficticio para probar la página.", talles: { 40: "agotado", 41: "hay", 42: "pocos", 43: "hay", 44: "agotado" } },
    { id: "prueba-3", nombre: "Modelo de prueba 3", categoria: "Hombre", tipo: "zapatilla", precio: 74900, descripcion: "Producto ficticio para probar la página.", talles: { 39: "hay", 40: "hay", 41: "hay", 42: "pocos", 43: "pocos" } },
    { id: "prueba-4", nombre: "Modelo de prueba 4", categoria: "Mujer", tipo: "sandalia", precio: 69900, descripcion: "Producto ficticio para probar la página.", talles: { 35: "pocos", 36: "hay", 37: "hay", 38: "agotado", 39: "hay" } },
    { id: "prueba-5", nombre: "Modelo de prueba 5", categoria: "Mujer", tipo: "bota", precio: 134900, descripcion: "Producto ficticio para probar la página.", talles: { 36: "hay", 37: "pocos", 38: "hay", 39: "hay", 40: "agotado" } },
    { id: "prueba-6", nombre: "Modelo de prueba 6", categoria: "Mujer", tipo: "zapatilla", precio: 79900, descripcion: "Producto ficticio para probar la página.", talles: { 35: "hay", 36: "hay", 37: "agotado", 38: "pocos", 39: "hay", 40: "hay" } },
    { id: "prueba-7", nombre: "Modelo de prueba 7", categoria: "Mujer", tipo: "zapato", precio: null, descripcion: "Producto ficticio para probar la página, sin precio publicado.", talles: { 36: "agotado", 37: "agotado", 38: "agotado", 39: "agotado" } },
    { id: "prueba-8", nombre: "Modelo de prueba 8", categoria: "Hombre", tipo: "zapato", precio: 99900, descripcion: "Producto ficticio para probar la página.", talles: { 41: "pocos", 42: "hay", 43: "hay", 44: "pocos", 45: "hay" } }
  ]
};
