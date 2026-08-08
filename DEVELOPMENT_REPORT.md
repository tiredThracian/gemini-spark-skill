# 📊 Geliştirme Raporu: Thracian Skills (Antigravity Çoklu Yetenek Deposu)

Bu rapor, Google Antigravity için tasarlanan **Thracian Skills** deposunda yapılan mimari dönüşümü, yeni geliştirilen yetenekleri ve araştırma sentezlerini detaylandırmaktadır.

---

## 1. Mimari Yapı: Thracian Skills Koleksiyonu (Multi-Skill Monorepo)
Proje, modüler ve genel amaçlı bir **Thracian Skills** koleksiyonu halinde yapılandırılmıştır:
*   **Klasör Yapısı:** Tüm yetenekler `skills/` dizini altında bağımsız klasörler halinde barındırılır:
    *   `skills/eli5/`: Basitleştirilmiş açıklama ve benzetim yeteneği (ELI5 Skill).
    *   `skills/gemini-spark/`: Gemini Spark Playwright otomasyon motoru.
*   **Esnek Kurulum Aracı (`setup.bat`):**
    *   `setup.bat` veya `setup.bat all`: Depodaki tüm yetenekleri otomatik kurar.
    *   `setup.bat <yetenek_adi>`: Sadece belirtilen yeteneği (ör. `setup.bat eli5`) hedef Antigravity dizinine (`.gemini/config/skills/<yetenek_adi>`) kurar.
    *   `setup.bat list`: Depoda mevcut tüm yetenekleri listeler.

---

## 2. ELI5 Yeteneği (`skills/eli5`)
*   **Derin Araştırma ve Sentez:** Gemini Spark kullanılarak Cognitive Load Theory (CLT), Gentner'in Structure-Mapping Theory (SMT) ve Feynman Tekniği üzerine derin araştırma yapılmış, sentezlenen rehber `skills/eli5/references/ELI5_RESEARCH_GUIDE.md` dosyasına aktarılmıştır.
*   **5 Aşamalı Düzen:** Her açıklama 💡 Tek Cümlelik Benzetim, 📖 Hikaye/Analoji, ⚙️ Gerçekte Nasıl Çalışır (Köprü), 🚀 Neden Önemli ve ❓ Hızlı Kontrol soru yapısıyla sunulur.
*   **Çalıştırma Modları:** `--child` (Ages 5-8), `--beginner` (Lise seviyesi), `--progressive` (3 seviyeli derinlik) ve `--analogy-only` (Birebir benzetim tablosu).

---

## 3. Gemini Spark Yeteneği Özellikleri (`skills/gemini-spark`)
*   **Çoklu Hesap Desteği (`--account`):** Farklı Google hesapları (`work`, `personal`, `research`) ile profil izoleli çalışma.
*   **CDP Paralel Sekme Desteği (`--cdp`):** Aynı Google hesabında birden fazla görevi eşzamanlı paralel sekmelerde yürütme.
*   **Birebir Yanıt Modu (`verbatim`):** Yanıtların özetlenmeden tam kopyasının aktarılması.
*   **Başlık Yeniden Adlandırma (`rename`):** Sohbet ve görev kartı başlıklarını güncelleme.
*   **Toplu Silme (`delete`):** Çoklu ID silme ve güncel kalan görev listesini otomatik döndürme.
*   **Google Workspace Exporters:** Docs (.txt), Sheets (.xlsx), Slides (.pptx) ve üretilen görselleri otomatik yerel dizine indirme.
