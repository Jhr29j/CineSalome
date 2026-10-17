/* Configuración automática para local y producción */
(() => {
  const host = window.location.hostname;

  const esLocal =
    host === "localhost" ||
    host === "127.0.0.1";

  window.CINE_API_URL =
    window.CINE_API_URL ||
    (esLocal ? "http://127.0.0.1:8000" 
        : "https://cine-salome.vercel.app");
})();