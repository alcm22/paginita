export function formatearTiempo(fecha: Date): string {
  const ahora = Date.now();
  const diferencia = Math.max(0, ahora - fecha.getTime());

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (segundos < 60) {
    return "Hace unos segundos";
  }

  if (minutos < 60) {
    return `Hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  }

  if (horas < 24) {
    return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  }

  if (dias < 7) {
    return `Hace ${dias} ${dias === 1 ? "día" : "días"}`;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(fecha);
}