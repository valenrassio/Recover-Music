$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080
try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
} catch {
  Write-Host "No se pudo iniciar el servidor local. Abro el sitio directo en el navegador." -ForegroundColor Yellow
  Write-Host $_.Exception.Message
  Start-Process (Join-Path $root "index.html")
  Read-Host "Enter para cerrar"
  exit
}
Write-Host ""
Write-Host "  Recover Music corriendo en http://localhost:$port" -ForegroundColor Yellow
Write-Host "  Cerra esta ventana para apagar el sitio."
Write-Host ""
Start-Process "http://localhost:$port/"
$types = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"
  ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".png"="image/png"; ".webp"="image/webp"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"
}
$rootFull = [System.IO.Path]::GetFullPath($root).TrimEnd('\') + '\'
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq "") { $path = "index.html" }
    # Solo se sirven archivos dentro de la carpeta del sitio (evita rutas con "..").
    $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
    if ($file.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
    $ctx.Response.Close()
  } catch { Write-Host $_.Exception.Message }
}
