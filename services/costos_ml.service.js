// services/ml.service.js
const ML_URL = process.env.ML_URL || "http://localhost:8000/predecir";

async function getFetch() {
  // Node 18+ ya trae fetch global
  if (typeof fetch !== "undefined") return fetch;
  // Node 14/16: usa node-fetch dinámico (no rompe ESM/CommonJS)
  const { default: nodeFetch } = await import("node-fetch");
  return nodeFetch;
}

/** Diferencia en minutos entre HH:MM (soporta cruce de medianoche) */
function diffMinutes(hIni, hFin) {
  if (!hIni || !hFin) return null;
  const [hi, mi] = hIni.split(":").map(Number);
  const [hf, mf] = hFin.split(":").map(Number);
  if ([hi, mi, hf, mf].some(v => Number.isNaN(v))) return null;

  const start = hi * 60 + mi;
  const end   = hf * 60 + mf;
  return end >= start ? end - start : (24 * 60 - start + end);
}

/** Calcula minutos (mínimo 60 si quieres respetar la HU) */
function calcTiempoMinutos(hIni, hFin) {
  const mins = diffMinutes(hIni, hFin);
  if (mins == null) return 60;      // default cuando no hay fin
  return Math.max(mins, 60);        // asegura al menos 60 min
}

/** Llama al API de ML y devuelve un número */
async function predecirCosto({ seccion, sub_categoria, tipo_solicitud, proceso, tiempo_promedio }) {
  if (typeof tiempo_promedio !== "number" || Number.isNaN(tiempo_promedio)) {
    throw new Error("tiempo_promedio debe ser numérico (minutos).");
  }
  const _fetch = await getFetch();

  const res = await _fetch(ML_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seccion: String(seccion ?? ""),
      sub_categoria: String(sub_categoria ?? ""),
      tipo_solicitud: String(tipo_solicitud ?? ""),
      proceso: String(proceso ?? ""),
      tiempo_promedio
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.detail) && data.detail[0]?.msg
      ? data.detail[0].msg
      : JSON.stringify(data);
    throw new Error(`ML ${res.status}: ${msg}`);
  }

  const v = data.costo_estimado ?? data.costo ?? data.prediccion;
  const num = Number(v);
  if (v == null || Number.isNaN(num)) {
    throw new Error("La respuesta del modelo no contiene un costo numérico.");
  }
  return num;
}

module.exports = {
  predecirCosto,
  calcTiempoMinutos,   // por si te sirve desde otros servicios
  diffMinutes          // utilitario
};
