# 📊 Geliştirme Raporu: Gemini Spark Yeteneği

Bu rapor, Google Antigravity için tasarlanan **Gemini Spark** tarayıcı otomasyonu skill projesinde gerçekleştirilen tüm mimari dönüşümleri, yeni özellikleri ve kararlılık geliştirmelerini detaylandırmaktadır.

---

## 1. Mimari Yapı: Odaklanmış Gemini Spark Otomasyonu
*   **Doğrudan Spark Yönlendirmesi:** Sistem varsayılan olarak `https://gemini.google.com/spark` ve `https://gemini.google.com/spark/tasks` adreslerini kullanarak doğrudan Spark modeli üzerinde işlem yapar.
*   **Tekli Yükleyici (setup.bat):** Proje kök dizinindeki `setup.bat` aracı, `gemini-spark` yeteneğini Antigravity profil dizinine (`.gemini/config/skills/gemini-spark`) kurar, bağımlılıkları yükler ve ilk Google oturumunu açar.

---

## 2. Çoklu Hesap & Profil Yönetimi (`--account` / `accounts`)
*   **Birincil Hesap Desteği (`--account <name>` / `-a`):** Farklı Google hesapları (örn. `work`, `personal`, `research`) arasında geçiş yapılmasını sağlar.
*   **İzole Profil Hafızası:** Her hesap kendi tarayıcı çerezlerini, oturum jetonlarını ve aktif sohbet hafızasını (`last-chat-url.txt` ve `last-chat-list.json`) bağımsız olarak korur.
*   **Hesap Listeleme Subcommand (`accounts` / `profiles`):** Yapılandırılmış tüm hesap profillerini ve aktif oturum durumlarını anında tarayıp listeler.

---

## 3. CDP Paralel Çalıştırma Modu (`--cdp`)
*   **Aynı Hesapta Paralel Sekme Desteği:** Chrome DevTools Protocol (`--cdp 9222`) bağlantısı sayesinde birden fazla Playwright betiğinin **aynı Google hesabında aynı anda paralel sekmeler açarak** çalışmasını sağlar. Profil kilitleme (file-lock) çakışmaları tamamen önlenir.

---

## 4. Birebir (Verbatim) Yanıt Modu (`verbatim` / `--verbatim`)
*   **Tam Yanıt Aktarımı:** Modele `--verbatim` bayrağı veya `verbatim` komut modifikatörü verildiğinde, yanıtın özetlenmeden veya değiştirilmeden ham haliyle aktarılacağını belirten `"verbatim": true` özniteliği JSON çıktısına eklenir.

---

## 5. Başlık Yeniden Adlandırma (`rename`)
*   **Sohbet ve Görev Kartı Adlandırma:** `rename [id_veya_indeks] "Yeni Başlık"` komutu ile Gemini yan panelindeki sohbet başlıkları veya Spark görev kartları web arayüzü üzerinden otomatik olarak yeniden adlandırılır.

---

## 6. Toplu Silme ve Otomatik Listeleme (`delete`)
*   **Çoklu ID Silme:** `delete id1, id2, id3` formatı ile birden fazla sohbet veya görev kartı tek geçişte silinir.
*   **Otomatik Güncel Liste Çıktısı:** Silme işlemi tamamlandıktan hemen sonra güncel kalan görev listesi otomatik olarak taranır ve JSON/konsol çıktısında sunulur.

---

## 7. Google Workspace Otomatik İndirici (Docs, Sheets, Slides)
*   **Çoklu Format Desteği:**
    *   **Google Docs:** Plain Text (.txt) formatında dışa aktarılır.
    *   **Google Sheets:** Excel (.xlsx) formatında dışa aktarılır.
    *   **Google Slides:** PowerPoint (.pptx) formatında dışa aktarılır.
*   **Aktif Dizin Kopyalama:** İndirilen dosyalar ve üretilen görseller doğrudan komutun çalıştırıldığı aktif dizine (`process.cwd()`) aktarılır.

---

## 8. Doğrudan Yükleme Kuralları (Native Uploads)
*   **Metin Ayıklama Kısıtlaması:** PDF, Word, Excel, PowerPoint, Görsel, Ses/Video ve Kod dosyalarında verileri yerelde metne dönüştürme yaklaşımı kaldırılmış, tüm desteklenen formatların `--file` parametresi ile doğrudan Gemini arayüzüne yüklenmesi kurala bağlanmıştır.
