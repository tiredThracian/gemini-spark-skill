# 📊 Geliştirme Raporu: Thracian Skills (Antigravity Çoklu Yetenek Deposu)

Bu rapor, Google Antigravity için tasarlanan **Thracian Skills** deposunda yapılan mimari dönüşümü, yeni geliştirilen yetenekleri ve araştırma sentezlerini detaylandırmaktadır.

---

## 1. Mimari Yapı: Thracian Skills Koleksiyonu (Multi-Skill Monorepo)
Proje, modüler ve genel amaçlı bir **Thracian Skills** koleksiyonu halinde yapılandırılmıştır:
*   **Klasör Yapısı:** Tüm yetenekler `skills/` dizini altında bağımsız klasörler halinde barındırılır:
    *   `skills/engineering-eli5/`: Üst Düzey Mühendislik & Hibet/Yatırım Sunum Yeteneği.
    *   `skills/eli5/`: Genel basitleştirilmiş açıklama ve benzetim yeteneği.
    *   `skills/gemini-spark/`: Gemini Spark Playwright otomasyon motoru.
*   **Esnek Kurulum Aracı (`setup.bat`):**
    *   `setup.bat` veya `setup.bat all`: Depodaki tüm yetenekleri otomatik kurar.
    *   `setup.bat <yetenek_adi>`: Sadece belirtilen yeteneği (ör. `setup.bat engineering-eli5`) hedef Antigravity dizinine (`.gemini/config/skills/<yetenek_adi>`) kurar.
    *   `setup.bat list`: Depoda mevcut tüm yetenekleri listeler.

---

## 2. Üst Düzey Mühendislik ELI5 Yeteneği (`skills/engineering-eli5`)
*   **Yönetici ve Ar-Ge Direktörü Persona Odaklı:** Karmaşık mühendislik ve Ar-Ge projelerini teknik değerini yitirmeden Yönetim Kurulu, Hibe Değerlendirme Komiteleri ve Genel İzleyici kitlesine sunma altyapısı.
*   **Üç Farklı Çalıştırma Modu:**
    1.  **`--executive` / `--director` (Varsayılan):** CO-STAR Çerçevesi ile Sezgisel Operasyonel Benzetim ➔ Mimari Darboğaz & Çözüm 📊 Stratejik ve Finansal ROI.
    2.  **`--grant` (Hibe ve Başvuru Modu):** DARPA Heilmeier Catechism + RISEN Çerçevesi ile Hedefler ➔ Mevcut Teknolojik Kısıtlar ➔ Teknik Yenilik 📈 TRL İlerleme Yolu (örn. TRL 3 ➔ TRL 6) 📊 Karşılaştırmalı Metrik Tablosu 🛡️ Risk Azaltma ve Ekonomik Etki.
    3.  **`--pitch` (Yatırımcı ve Paydaş Sunumu Modu):** NABC Çerçevesi ile Pazar İhtiyacı 🛡️ Teknolojik Hendek (Proprietary IP) 💰 Ölçülebilir Müşteri Faydası / Birim Ekonomisi 🏰 Patent ve Savunulabilirlik 🚀 Ticarileşme Yol Haritası.
*   **Rehber Doküman:** `skills/engineering-eli5/references/EXECUTIVE_ENGINEERING_FRAMEWORK.md`.

---

## 3. Genel ELI5 Yeteneği (`skills/eli5`)
*   **Derin Araştırma ve Sentez:** Cognitive Load Theory (CLT), Gentner'in Structure-Mapping Theory (SMT) ve Feynman Tekniği sentezi (`skills/eli5/references/ELI5_RESEARCH_GUIDE.md`).
*   **Çalıştırma Modları:** `--child` (Ages 5-8), `--beginner` (Lise seviyesi), `--progressive` (3 seviyeli derinlik) ve `--analogy-only`.

---

## 4. Gemini Spark Yeteneği Özellikleri (`skills/gemini-spark`)
*   **Çoklu Hesap Desteği (`--account`):** Profil izoleli çalışma (`work`, `personal`, `research`).
*   **CDP Paralel Sekme Desteği (`--cdp`):** Eşzamanlı paralel sekmeler.
*   **Birebir Yanıt Modu (`verbatim`):** Yanıtların tam kopyası.
*   **Başlık Yeniden Adlandırma (`rename`):** Sohbet ve görev kartı başlıklarını güncelleme.
*   **Toplu Silme (`delete`):** Çoklu ID silme ve güncel liste çıktısı.
*   **Workspace Exporters:** Docs (.txt), Sheets (.xlsx), Slides (.pptx) ve görselleri indirme.
