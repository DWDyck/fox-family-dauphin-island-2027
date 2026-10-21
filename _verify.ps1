$e = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$root = (Get-Location).Path -replace '\\','/'
foreach ($h in '', 'calendar', 'map', 'map/fox-house', 'meals', 'houses', 'houses/fox-house', 'family', 'gallery', 'memories', 'more') {
  $o = & $e --headless --disable-gpu --virtual-time-budget=8000 --dump-dom "file:///$root/index.html#/$h" 2>$null | Out-String
  $h1 = [regex]::Match($o, '<h1[^>]*>[^<]*').Value
  $cards = [regex]::Matches($o, 'class="card').Count
  $pins = [regex]::Matches($o, 'class="pin').Count
  "{0,-18} {1,-45} cards={2} pins={3} err={4}" -f $h, $h1, $cards, $pins, ($o -match 'Uncaught|undefined|NaN')
}
