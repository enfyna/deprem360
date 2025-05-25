# Deprem360 - Hayatınız İçin 360° Güvence

Deprem360, depremle ilgili verilere kapsamlı bir bakış sunan, yardım taleplerinin yönetilmesine olanak tanıyan ve kullanıcıların deprem bilincini artırmayı hedefleyen bir web uygulamasıdır.

---

## ✨ Temel Özellikler

### 🗺️ Ana Sayfa: İnteraktif Deprem Haritası
- **Veri Görselleştirme**: Harita üzerinde çeşitli depremle ilgili verileri (konum, büyüklük, derinlik vb.) anlık olarak inceleyin.
- **Filtreleme**: Depremleri tarih aralığına, büyüklüğüne ve diğer özelliklere göre filtreleyerek aradığınız bilgilere hızla ulaşın.
- **Duyurular**: Yöneticiler tarafından oluşturulan önemli duyuruları ve güncel bilgileri takip edin.

### 🤖 AI Destekli Sohbet Asistanı
- Sağ alt köşede bulunan **AI Chat** özelliği ile deprem hakkında merak ettiğiniz her şeyi sorabilir, anında ve doğru bilgilere ulaşabilirsiniz.

### 🆘 Yardım Talepleri
- **Talep İnceleme**: Depremzedeler tarafından oluşturulmuş yardım taleplerini görüntüleyin ve ihtiyaç sahiplerine ulaşın.
- **Talep Oluşturma (Üyelik Gerektirir)**: Üye olarak, ihtiyaç duyduğunuzda kolayca yardım talebi oluşturabilirsiniz.
- **AI Destekli Talep Yönetimi**:
    - **Otomatik Kontrol**: Oluşturulan talepler, yapay zeka (AI) agent tarafından incelenir.
    - **Onay/Ret**: AI, talebin uygunluğunu değerlendirerek onaylar veya reddeder.
- **Yorum Yapma**: Taleplere yorum bırakarak bilgi alışverişinde bulunabilir veya destek sağlayabilirsiniz.

###  Drills️ Deprem Tatbikatı (Üyelik Gerektirir)
- **Süreç İyileştirme**: "Tatbikat" sayfasında sayacı başlatarak evinizdeki hayat üçgenine en kısa sürede ulaşma pratiği yapın.
- **Performans Takibi**: Zaman içindeki tatbikat sürelerinizi çizgi grafik üzerinde görerek gelişiminizi takip edin.

### 🛠️ Yönetici Paneli (Admin)
- **İçerik Yönetimi**: Admin yetkisine sahip kullanıcılar, "Admin" sekmesinden duyuruları ve yardım taleplerini düzenleyebilir veya silebilirler.

---

## 💻 Kullanılan Teknolojiler

-   **Backend**: Express.js
-   **Frontend**: Next.js
-   **Otomasyon & AI Agent**: n8n
-   **Veritabanı**: PostGIS (PostgreSQL için coğrafi eklenti)

---

## 🚀 Kurulum ve Başlatma (Örnek)

*(Bu bölümü projenizin gerçek kurulum adımlarına göre doldurmanız gerekecektir)*

```bash
git clone [https://github.com/enfyna/deprem360.git](https://github.com/enfyna/deprem360.git)

cd deprem360
npm install

npm run dev