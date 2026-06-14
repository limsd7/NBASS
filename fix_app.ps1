# Fix App.tsx - Add MenuViews import and navigation logic

$path = 'c:\SN1\App.tsx'

# Read file with proper encoding
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Add MenuViews import after Layout import
$oldImport = "import { Layout } from './components/Layout';"
$newImport = "import { Layout } from './components/Layout';
import { DashboardView, HistoryView, ResourcesView } from './components/MenuViews';"

if ($content -notmatch "MenuViews") {
  $content = $content.Replace($oldImport, $newImport)
}

# 2. Add menu view logic before toggleSnsSymptom
$oldFunc = "const toggleSnsSymptom = (s: string) => {"
$newLogic = @"
  // --- Menu Views ---
  if (activeMenu === 'dashboard') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu}><DashboardView onStartClick={() => { setActiveMenu('assessment'); setStep('register'); }} onHistoryClick={() => setActiveMenu('history')} onResourcesClick={() => setActiveMenu('resources')} history={history} /></Layout>;
  }
  if (activeMenu === 'history') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu}><HistoryView history={history} onStartClick={() => { setActiveMenu('assessment'); setStep('register'); }} /></Layout>;
  }
  if (activeMenu === 'resources') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu}><ResourcesView /></Layout>;
  }
  // ------------------

  const toggleSnsSymptom = (s: string) => {
"@

if ($content -notmatch "// --- Menu Views ---") {
  $content = $content.Replace($oldFunc, $newLogic)
}

# Write file with UTF8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "Done - App.tsx updated successfully"
