# Conectar la planilla de la banda con la página

Se hace una sola vez, con la cuenta de Google de la banda. Tarda unos 10 minutos.

## 1. Crear la planilla

1. Entrá a <https://sheets.google.com> con la cuenta de la banda.
2. Creá una **hoja en blanco** y ponele de nombre `Recover Music – Página web`.

## 2. Pegar el script

1. En la planilla: **Extensiones → Apps Script**.
2. Borrá todo lo que aparece en el editor.
3. Pegá el contenido de [`Codigo.gs`](https://raw.githubusercontent.com/valenrassio/Recover-Music/main/google-sheets/Codigo.gs) (abrí el link, **Ctrl + A**, **Ctrl + C** y pegalo).
4. Tocá el ícono del disquete para **guardar**.

## 3. Armar la planilla

1. Arriba, en el selector de funciones, elegí **`configurar`** y tocá **Ejecutar**.
2. Google va a pedir permisos:
   - **Revisar permisos** → elegí la cuenta de la banda.
   - Si aparece *"Google no verificó esta app"*: **Configuración avanzada → Ir a … (no seguro)**. Es normal: el script es de ustedes y solo trabaja sobre esta planilla.
   - **Permitir**.
3. Volvé a la planilla: van a estar las solapas **LEEME, Fechas, Repertorio, Sugerencias y Más pedidos**, con los datos actuales de la página.

## 4. Publicar el script para la página

1. En Apps Script: **Implementar → Nueva implementación**.
2. En el engranaje de *Seleccionar tipo*, elegí **Aplicación web**.
3. Completá:
   - **Ejecutar como:** Yo (la cuenta de la banda)
   - **Quién tiene acceso:** Cualquier persona
4. **Implementar** y copiá la **URL de la aplicación web** (termina en `/exec`).

> "Cualquier persona" no hace pública la planilla: solo permite que la página pida las fechas y el repertorio y mande sugerencias. Las sugerencias no se pueden leer desde afuera.

## 5. Conectar la página

La URL va en [`js/config.js`](../js/config.js), en `sheetsApi`. Después hay que subir el cambio a GitHub.

---

### Si más adelante se cambia el script

Después de editar `Codigo.gs`: **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL sigue siendo la misma.
