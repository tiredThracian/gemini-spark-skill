@echo off
chcp 65001 >nul
echo ==========================================================
echo    Gemini Spark ve Deep Research Yetenekleri Kurulum Aracı
echo ==========================================================
echo.

:: 1. Node.js Kontrolü
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js bilgisayarınızda yüklü bulunamadı!
    echo Lütfen önce https://nodejs.org/ adresinden Node.js indirip kurun.
    echo.
    pause
    exit /b 1
)

:: 2. Global Dizinlerin Tanımlanması
set "GLOBAL_SPARK_DIR=%USERPROFILE%\.gemini\config\skills\gemini-spark"
set "GLOBAL_DEEP_DIR=%USERPROFILE%\.gemini\config\skills\gemini-deep-research"

echo [1/4] Yetenek dosyaları global dizinlere yükleniyor...
echo Spark Hedef: %GLOBAL_SPARK_DIR%
echo Deep Research Hedef: %GLOBAL_DEEP_DIR%

:: Geçici hariç tutma dosyaları oluştur
echo \node_modules\ > "%temp%\exclude_spark.txt"
echo \chrome-profile\ >> "%temp%\exclude_spark.txt"
echo \.git\ >> "%temp%\exclude_spark.txt"
echo last-chat-url.txt >> "%temp%\exclude_spark.txt"
echo last-chat-list.json >> "%temp%\exclude_spark.txt"

echo \.git\ > "%temp%\exclude_deep.txt"

:: Hedef klasörleri oluştur
if not exist "%GLOBAL_SPARK_DIR%" mkdir "%GLOBAL_SPARK_DIR%"
if not exist "%GLOBAL_DEEP_DIR%" mkdir "%GLOBAL_DEEP_DIR%"

:: Dosyaları kopyala
xcopy /E /I /Y /EXCLUDE:%temp%\exclude_spark.txt "%~dp0gemini-spark\*" "%GLOBAL_SPARK_DIR%" >nul
xcopy /E /I /Y /EXCLUDE:%temp%\exclude_deep.txt "%~dp0gemini-deep-research\*" "%GLOBAL_DEEP_DIR%" >nul

del "%temp%\exclude_spark.txt"
del "%temp%\exclude_deep.txt"

echo [OK] Dosyalar başarıyla kopyalandı!
echo.

:: 3. Bağımlılıkların Yüklenmesi
cd /d "%GLOBAL_SPARK_DIR%\scripts"

echo [2/4] Bağımlılıklar yükleniyor (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [HATA] Bağımlılıklar yüklenirken hata oluştu!
    pause
    exit /b 1
)

echo [3/4] Playwright tarayıcı bileşenleri kuruluyor...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo [HATA] Tarayıcı bileşenleri kurulurken hata oluştu!
    pause
    exit /b 1
)

echo.
echo [4/4] Google Oturum Açma Ekranı Hazırlanıyor...
echo.
echo ==========================================================
echo TALİMATLAR:
echo 1. Açılacak Chrome penceresinde Google hesabınızla giriş yapın.
echo 2. gemini.google.com sayfasına giderek sohbet ekranını görün.
echo 3. Giriş tamamlandıktan sonra o açılan Chrome penceresini KAPATIN.
echo 4. Tarayıcıyı kapattıktan sonra buradaki tuşa basarak kurulumu bitirin.
echo ==========================================================
echo.
pause

:: Chrome'u özel profil ve debugging portuyla başlat
start chrome --remote-debugging-port=9222 --user-data-dir="%GLOBAL_SPARK_DIR%\chrome-profile"

echo.
echo Giriş yaptıysanız ve Chrome penceresini kapattıysanız...
pause

echo.
echo ==========================================================
echo [TEBRİKLER] Gemini Spark ve Deep Research Yetenekleri Yüklendi!
echo.
echo Artık Antigravity üzerinden her iki yeteneği de
echo kullanmaya başlayabilirsiniz.
echo ==========================================================
echo.
pause
