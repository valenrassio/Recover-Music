/**
 * Recover Music — planilla de la banda
 *
 * Este script vive dentro de la planilla de Google de la banda y hace de "puente" con la página:
 *   - doGet:  le pasa a la página las próximas fechas y el repertorio.
 *   - doPost: recibe los temas que sugiere la gente y los anota en la solapa "Sugerencias".
 *   - configurar: arma la planilla la primera vez (no borra nada si las solapas ya existen).
 *
 * La planilla NO se hace pública: la página solo ve lo que este script devuelve.
 */

const ZONA = 'America/Argentina/Buenos_Aires';
const SEGUNDOS_CACHE = 60; // los cambios de la banda aparecen en la página en hasta 1 minuto

const HOJAS = {
  leeme: 'LEEME',
  fechas: 'Fechas',
  repertorio: 'Repertorio',
  sugerencias: 'Sugerencias',
  pedidos: 'Más pedidos',
};

/* ==========================================================================
   Para la página
   ========================================================================== */

function doGet() {
  const cache = CacheService.getScriptCache();
  let json = cache.get('contenido');
  if (!json) {
    json = JSON.stringify({ fechas: leerFechas_(), repertorio: leerRepertorio_() });
    cache.put('contenido', json, SEGUNDOS_CACHE);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let datos = {};
  try {
    datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return responder_({ ok: false, error: 'formato' });
  }

  // Campo trampa: la gente no lo ve, los bots lo completan.
  if (datos.web) return responder_({ ok: true });

  const tema = limpiar_(datos.tema, 120);
  const artista = limpiar_(datos.artista, 120);
  const nombre = limpiar_(datos.nombre, 60);
  if (!tema) return responder_({ ok: false, error: 'falta_tema' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    hoja_(HOJAS.sugerencias).appendRow([new Date(), tema, artista, nombre]);
  } finally {
    lock.releaseLock();
  }
  return responder_({ ok: true });
}

/* ==========================================================================
   Lectura de la planilla
   ========================================================================== */

function leerFechas_() {
  return filas_(HOJAS.fechas)
    .map((f) => {
      const dia = f['fecha'];
      if (!(dia instanceof Date)) return null;
      const hora = horaTexto_(f['hora']);
      return {
        inicio: Utilities.formatDate(dia, ZONA, 'yyyy-MM-dd') + 'T' + hora + ':00-03:00',
        lugar: String(f['lugar'] || '').trim(),
        mapa: String(f['link google maps'] || '').trim(),
        texto: String(f['texto (opcional)'] || '').trim(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

function leerRepertorio_() {
  const lados = { A: [], B: [] };
  filas_(HOJAS.repertorio).forEach((f) => {
    const lado = String(f['lado'] || '').trim().toUpperCase();
    const tema = String(f['tema'] || '').trim();
    if (!lados[lado] || !tema) return;
    lados[lado].push({
      tema: tema,
      artista: String(f['artista'] || '').trim(),
      duracion: duracionTexto_(f['duración']),
    });
  });
  return lados;
}

/** Devuelve las filas de una solapa como objetos { encabezado en minúsculas: valor }. */
function filas_(nombre) {
  const valores = hoja_(nombre).getDataRange().getValues();
  const encabezados = valores.shift().map((h) => String(h).trim().toLowerCase());
  return valores
    .filter((fila) => fila.some((v) => v !== ''))
    .map((fila) => Object.fromEntries(encabezados.map((h, i) => [h, fila[i]])));
}

function horaTexto_(valor) {
  if (valor instanceof Date) return Utilities.formatDate(valor, ZONA, 'HH:mm');
  const m = String(valor || '').match(/(\d{1,2})(?:[:.](\d{2}))?/);
  if (!m) return '21:00';
  return ('0' + Math.min(23, Number(m[1]))).slice(-2) + ':' + (m[2] || '00');
}

function duracionTexto_(valor) {
  if (valor instanceof Date) return Utilities.formatDate(valor, ZONA, 'm:ss');
  return String(valor || '').trim();
}

/* ==========================================================================
   Utilidades
   ========================================================================== */

function hoja_(nombre) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!hoja) throw new Error('Falta la solapa "' + nombre + '". Corré la función configurar.');
  return hoja;
}

/** Recorta, limita el largo y evita que un texto se interprete como fórmula. */
function limpiar_(valor, max) {
  return String(valor || '').replace(/\s+/g, ' ').trim().slice(0, max).replace(/^[=+\-@]+/, '');
}

function responder_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ==========================================================================
   Armado inicial de la planilla (correr una sola vez)
   ========================================================================== */

function configurar() {
  const libro = SpreadsheetApp.getActive();
  libro.setSpreadsheetTimeZone(ZONA);

  crear_(libro, HOJAS.leeme, (h) => {
    h.getRange(1, 1, LEEME.length, 1).setValues(LEEME.map((l) => [l]));
    h.getRange('A1').setFontSize(16).setFontWeight('bold');
    h.getRange('A1:A' + LEEME.length).setWrap(true);
    h.setColumnWidth(1, 720);
  });

  crear_(libro, HOJAS.fechas, (h) => {
    encabezado_(h, ['Fecha', 'Hora', 'Lugar', 'Link Google Maps', 'Texto (opcional)'], [110, 70, 220, 280, 380]);
    h.getRange('B:B').setNumberFormat('@'); // la hora queda como texto, ej. 17:00
    h.getRange('A:A').setNumberFormat('dd/mm/yyyy');
    h.getRange(2, 1, 1, 5).setValues([[new Date(2026, 10, 15), '17:00', 'Plaza Azcuénaga', '', '']]);
    h.getRange('A2:A').setDataValidation(
      SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false)
        .setHelpText('Escribí la fecha como 15/11/2026').build());
  });

  crear_(libro, HOJAS.repertorio, (h) => {
    encabezado_(h, ['Lado', 'Tema', 'Artista', 'Duración'], [60, 300, 240, 90]);
    h.getRange('D:D').setNumberFormat('@');
    h.getRange(2, 1, REPERTORIO.length, 4).setValues(REPERTORIO);
    h.getRange('A2:A').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(['A', 'B'], true).setAllowInvalid(false)
        .setHelpText('A = Internacional, B = Nacional').build());
  });

  crear_(libro, HOJAS.sugerencias, (h) => {
    encabezado_(h, ['Recibido', 'Tema', 'Artista', 'Nombre'], [150, 300, 240, 160]);
    h.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  });

  crear_(libro, HOJAS.pedidos, (h) => {
    h.getRange('A1').setFormula(
      '=QUERY(Sugerencias!B2:C, "select B, C, count(B) where B is not null group by B, C ' +
      'order by count(B) desc label B \'Tema\', C \'Artista\', count(B) \'Pedidos\'", 0)');
    h.getRange('1:1').setFontWeight('bold');
    h.setColumnWidths(1, 3, 240);
  });

  libro.setActiveSheet(libro.getSheetByName(HOJAS.leeme));
  const sobrante = libro.getSheetByName('Hoja 1') || libro.getSheetByName('Sheet1');
  if (sobrante && sobrante.getLastRow() === 0) libro.deleteSheet(sobrante);
}

function crear_(libro, nombre, armar) {
  if (libro.getSheetByName(nombre)) return; // ya existe: no se toca
  armar(libro.insertSheet(nombre));
}

function encabezado_(hoja, titulos, anchos) {
  hoja.getRange(1, 1, 1, titulos.length).setValues([titulos])
    .setFontWeight('bold').setBackground('#FF5A36').setFontColor('#0D0D0F');
  hoja.setFrozenRows(1);
  anchos.forEach((ancho, i) => hoja.setColumnWidth(i + 1, ancho));
}

const REPERTORIO = [
  ['A', 'Crazy Little Thing Called Love', 'Queen', '2:43'],
  ['A', 'The Best', 'Tina Turner', '4:00'],
  ['A', 'Heart of Glass', 'Blondie', '3:30'],
  ['A', 'María Magdalena', 'Sandra', '4:05'],
  ['A', 'What a Feeling', 'Irene Cara', '3:33'],
  ['A', 'Gimme! Gimme! Gimme!', 'ABBA', '3:20'],
  ['A', 'Hot Stuff', 'Donna Summer', '4:05'],
  ['A', 'Beat It', 'Michael Jackson', '4:15'],
  ['A', 'Self Control', 'Laura Branigan', '4:10'],
  ['A', 'Material Girl', 'Madonna', '4:00'],
  ['B', 'La muralla', 'Enanitos Verdes', '2:41'],
  ['B', 'Lunes por la madrugada', 'Los Abuelos de la Nada', '3:14'],
  ['B', 'Prófugos', 'Soda Stereo', '5:50'],
  ['B', 'Tirá para arriba', 'Miguel Mateos', '5:00'],
];

const LEEME = [
  'Planilla de Recover Music',
  'Lo que cambien acá aparece solo en la página web en menos de un minuto. No hace falta tocar código.',
  '',
  'FECHAS — una fila por show.',
  '• Fecha: escribila como 15/11/2026.  • Hora: como 17:00.  • Lugar: el nombre del lugar.',
  '• Link Google Maps (opcional): si lo dejan vacío, el botón "Cómo llegar" busca el lugar en Maps.',
  '• Texto (opcional): una frase para ese show. Si queda vacío se usa un texto genérico.',
  'La página muestra la cuenta regresiva del próximo show. Cuando termina, pasa sola al siguiente. Si no hay ninguno por delante, la sección se oculta.',
  '',
  'REPERTORIO — una fila por tema, en el orden en que quieren que aparezcan.',
  '• Lado: A (Internacional) o B (Nacional).  • Tema, Artista y Duración (ej. 3:45).',
  'Para sacar un tema, borren la fila entera. Para agregar uno, sumen una fila.',
  '',
  'SUGERENCIAS — se llena sola con los temas que pide la gente desde la página. Pueden ordenar o filtrar, pero no cambien los títulos de las columnas.',
  'MÁS PEDIDOS — cuenta automáticamente cuántas veces pidieron cada tema.',
  '',
  'IMPORTANTE: no cambien los nombres de las solapas ni los títulos de la primera fila.',
];
