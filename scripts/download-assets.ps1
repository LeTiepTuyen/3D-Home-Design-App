# Download Reference Assets Script
# Downloads assets from OrangeAVA/Interactive-Web-Development-With-Three.js-and-A-Frame

$baseUrl = "https://raw.githubusercontent.com/OrangeAVA/Interactive-Web-Development-With-Three.js-and-A-Frame/main/chapter09/06_home_design_app"
$projectRoot = $PSScriptRoot

# Create directories if they don't exist
$dirs = @(
    "$projectRoot/public/assets/bg",
    "$projectRoot/public/assets/models/furniture",
    "$projectRoot/public/assets/images/furniture",
    "$projectRoot/public/assets/ui"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "Downloading HDRI background..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$baseUrl/assets/bg/pisa.hdr" -OutFile "$projectRoot/public/assets/bg/pisa.hdr"

Write-Host "Downloading UI icons..." -ForegroundColor Cyan
$uiFiles = @("addlight.svg", "close-btn.svg", "delete.svg", "rotate.svg", "scale.svg", "translate.svg")
foreach ($file in $uiFiles) {
    Invoke-WebRequest -Uri "$baseUrl/assets/ui/$file" -OutFile "$projectRoot/public/assets/ui/$file"
}

Write-Host "Downloading furniture models (this may take a while)..." -ForegroundColor Cyan
$models = @(
    "armchair01", "armchair02", "armchair03",
    "bathroom_sink01", "bathroom_sink02", "bathroom_sink03",
    "bed_full01", "bed_full02", "bed_single01", "bed_single02",
    "cabinet01", "cabinet02",
    "chair01", "chair02", "chair03",
    "cooktop01",
    "couch01", "couch02", "couch03",
    "fireplace01", "fireplace02",
    "floorpiece",
    "fridge01", "fridge02",
    "kitchen_cupboard01", "kitchen_sink01",
    "lighting01", "lighting02", "lighting03",
    "small_table01",
    "stove01", "stove02",
    "table01", "table02", "table03", "table04",
    "toilet01",
    "tv_stand01", "tv_stand02", "tv_stand03",
    "wallpiece",
    "wardrobe01", "wardrobe02"
)

$total = $models.Count
$current = 0
foreach ($model in $models) {
    $current++
    Write-Progress -Activity "Downloading models" -Status "$model.glb" -PercentComplete (($current / $total) * 100)
    Invoke-WebRequest -Uri "$baseUrl/assets/models/furniture/$model.glb" -OutFile "$projectRoot/public/assets/models/furniture/$model.glb"
}

Write-Host "Downloading furniture thumbnails..." -ForegroundColor Cyan
# Note: Thumbnails have same names as models + structure.jpg
$thumbs = $models + @("structure")
$total = $thumbs.Count
$current = 0
foreach ($thumb in $thumbs) {
    $current++
    Write-Progress -Activity "Downloading thumbnails" -Status "$thumb.jpg" -PercentComplete (($current / $total) * 100)
    try {
        Invoke-WebRequest -Uri "$baseUrl/assets/images/furniture/$thumb.jpg" -OutFile "$projectRoot/public/assets/images/furniture/$thumb.jpg" -ErrorAction SilentlyContinue
    } catch {
        Write-Host "  Skipped: $thumb.jpg (not found)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Assets download complete!" -ForegroundColor Green
Write-Host "Run 'npm install' then 'npm run dev' to start the app." -ForegroundColor Cyan
