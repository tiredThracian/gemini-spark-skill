# Geliştirme Raporu: Gemini Spark ve Deep Research Yetenekleri

Bu rapor, Google Antigravity için tasarlanan Gemini Spark ve Deep Research (Extended Thinking) tarayıcı otomasyonu skill projelerinde yapılan tüm yapısal dönüşümleri, hata düzeltmelerini ve yeni özellikleri detaylandırmaktadır.

---

## 1. Mimari Dönüşüm: Tekli Depo (Unified Repository) Birleştirmesi
Eski yapıda iki ayrı GitHub reposu olarak tutulan projeler, kod tekrarını önlemek ve bakımı kolaylaştırmak adına tek bir çatı altında birleştirildi:
*   **Klasör Yapısı:** `gemini-spark-skill` deposunun altında `gemini-spark` (çekirdek otomasyon motoru) ve `gemini-deep-research` (sarmalayıcı/wrapper) klasörleri yan yana konumlandırıldı.
*   **Göreli (Relative) Wrapper:** `gemini-deep-research/scripts/index.js` içerisindeki mutlak yollar kaldırıldı. `path.resolve(__dirname, '../../gemini-spark/scripts/index.js')` kullanılarak göreli bir yönlendirme yapıldı. Bu sayede repo nereye klonlanırsa klonlansın, iki klasör yan yana olduğu sürece sistem çalışabilmektedir.
*   **Ortak Yükleyici (setup.bat):** Proje kök dizinine her iki yeteneği de tek tıkla kullanıcının global Antigravity profil dizinine (`.gemini/config/skills/`) kuran, bağımlılıkları yükleyen ve ilk Google oturumunu açan tek bir `setup.bat` aracı eklendi.

---

## 2. Derin Araştırma ve Genişletilmiş Düşünme Desteği (Deep Research / Extended Thinking)
Gemini'ın yeni "Derin Araştırma" kabiliyeti, otomasyon sistemine kararlı bir şekilde entegre edildi:
*   **Model Seçimi ("Extended thinking"):** Kurumsal/Workspace hesaplarında Deep Research özelliği arayüzde bir model seçeneği olarak yer almaktadır. Koda eklenen dinamik seçici ile model dropdown'ı açılarak **"Extended thinking"** seçeneği otomatik olarak seçilir.
*   **Planlama Onay Aşaması ("Başla" Butonu):** Derin araştırma modunda prompt gönderildiğinde Gemini önce bir araştırma planı sunar ve kullanıcı onayı bekler. Otomasyon döngüsüne eklenen tarama ile arayüzdeki "Start research", "Araştırmayı başlat" veya **"Başla"** butonu otomatik olarak tespit edilip tıklanır.
*   **Dinamik İzleme ve 5 Saniye Optimizasyonu:** Araştırma başladıktan sonra ağ gecikmelerini ve Gemini'ın internet tarama duraklamalarını tolere edebilmek için kontrol aralığı **5 saniyeye**, kararlılık eşiği ise **30 saniyeye (6 ardışık kontrol)** çıkarıldı. Maksimum deneme sayısı 120 (10 dakika) olarak revize edildi.

---

## 3. Google Workspace Otomatik İndirici Geliştirmeleri (Docs, Sheets, Slides)
Sohbet sonunda üretilen Google belgelerini yerel sisteme çekme altyapısı genişletildi:
*   **Link Ayrıştırma İyileştirmesi:** Eskiden sadece düz metin (innerText) taranırken, artık model yanıtı içerisindeki HTML link etiketlerinin (`a[href]`) öznitelikleri doğrudan taranarak maskelenmiş bağlantılar da yakalanmaktadır.
*   **Çoklu Format Desteği:**
    *   **Google Docs:** Plain Text (.txt) formatında indirilir.
    *   **Google Sheets:** Excel (.xlsx) formatında dışa aktarılır.
    *   **Google Slides:** PowerPoint (.pptx) formatında dışa aktarılır.
*   **Aktif Dizin Kopyalama:** İndirilen dosyalar, komutun çalıştırıldığı aktif dizine (`process.cwd()`) anında kopyalanır. `.gitignore` güncellenerek bu test dosyalarının git geçmişini kirletmesi önlendi.

---

## 4. Kararlılık ve Hata Düzeltmeleri
*   **Sohbete Devam Etme (Continue) Çakışması:** `--continue` bayrağının ardından gelen sorgu metinlerinin sohbet ID'si veya indeksiyle çakışması, katı regex kontrolleri (`/^\d+$/` ve `/^[a-f0-9]{16}$/`) eklenerek çözüldü.
*   **Eski Mesajların Sayılması:** Sohbet devam ettirildiğinde sayfada zaten var olan eski yanıt elemanları nedeniyle sistemin kararlılık döngüsünden erken çıkması engellendi. Gönderim öncesinde sayfadaki aktif elemanların sayısı çıkarılarak, sadece yeni eklenen yanıt elemanının stabilliği izlenir hale getirildi.
