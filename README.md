# Air Battle

Sunucu otoriter, gerçek zamanlı Three.js çok oyunculu uçak oyunu. İstemci yalnızca kontrol, nişan ve ateş niyetini iletir; konum, mermi, çarpışma, hasar, skor ve yeniden doğma Node.js sunucusunda hesaplanır.

## Çalıştırma

```bash
npm install
npm run dev
```

Oyunu `http://localhost:5173` adresinde açın. İkinci bir tarayıcı sekmesiyle multiplayer davranışını test edebilirsiniz.

Üretim için:

```bash
npm run build
npm start
```

Bu komutlar derlenen istemciyi Express üzerinden `http://localhost:3000` adresinden sunar. Ortam değişkenlerini `.env.example` dosyasından kopyalayarak ayarlayabilirsiniz.

## Kontroller

| Tuş | İşlev |
| --- | --- |
| W / S | Hızlan / yavaşla |
| A / D | Dön |
| Mouse yukarı / aşağı | Yüksel / alçal |
| Mouse | Nişan al |
| Sol tık | Ateş et |
| Space | Nitro |

Mobil cihazlarda ekrandaki dokunmatik yön, hız, irtifa, nitro ve ateş kontrolleri otomatik görünür.

## Mimari

- `server/src/game`: sabit tick oyun döngüsü, hareket, mermi havuzu ve savaş kuralları
- `server/src/network`: oyuncu oturum ve otoriter durum kaydı
- `client/src/render`: Three.js sahnesi, uçaklar, mermi instancing ve efektler
- `client/src/game`: istemci input ve snapshot durumu
- `client/src/ui`: HUD, skor tablosu ve Web Audio efektleri
- `shared`: ağ olayları ve oyun sabitleri
