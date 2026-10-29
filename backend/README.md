# MYANMAR RECAP AI - Python Flask Backend Setup

ဤ Backend သည် မြန်မာဇာတ်လမ်းအကျဉ်း ချုပ်ဗီဒီယို (Myanmar Movie Recap) များ အလိုအလျောက် ထုတ်လုပ်ရန်အတွက် Faster-Whisper, Edge-TTS (မြန်မာအသံ), Google Gemini API, OpenCV (Watermark/Subtitle blur) နှင့် FFmpeg တို့ကို အသုံးပြုထားပါသည်။

---

## 🚀 စတင်တပ်ဆင်နည်း (Local Setup)

### ၁။ လိုအပ်ချက်များ (Prerequisites)
- Python 3.10 သို့မဟုတ် 3.11
- FFmpeg (system package အနေဖြင့် တပ်ဆင်ရန် လိုအပ်သည်)
  - Ubuntu/Debian: `sudo apt update && sudo apt install ffmpeg`
  - MacOS: `brew install ffmpeg`
  - Windows: `winget install Gyan.FFmpeg`

### ၂။ Dependency များသွင်းခြင်း
```bash
cd backend
python -m venv venv
# Linux / Mac
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### ၃။ Environment Variables သတ်မှတ်ခြင်း
`.env.example` ကို `.env` အဖြစ် ကူးယူပြီး သင့် Gemini API Key ကို ထည့်ပါ:
```bash
cp .env.example .env
```
`.env` ဖိုင်ထဲတွင်:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=5000
```

### ၄။ Backend Run ခြင်း
```bash
python app.py
```
Server သည် `http://localhost:5000` တွင် စတင်လည်ပတ်ပါမည်။

---

## 🐳 Docker ဖြင့် Run ခြင်း (အလွယ်ကူဆုံးနည်းလမ်း)
FFmpeg နှင့် Python dependencies အားလုံး အသင့်ပါဝင်သော Docker container:
```bash
docker build -t myanmar-recap-backend .
docker run -p 5000:5000 -e GEMINI_API_KEY="သင့်_API_KEY" myanmar-recap-backend
```

---

## 🌐 Cloud Deployment (Render / Railway / Google Cloud Run)
1. GitHub repo သို့ push လုပ်ပါ။
2. **Render.com** သို့သွားပြီး "New Web Service" ကို Dockerfile ဖြင့် ရွေးချယ်ပါ။
3. Environment Variable တွင် `GEMINI_API_KEY` ထည့်ပါ။
4. ရရှိလာသော Public URL (ဥပမာ `https://my-backend.onrender.com`) ကို MYANMAR RECAP ဝဘ်ဆိုက်၏ Settings စာမျက်နှာတွင် ထည့်သွင်းချိတ်ဆက်နိုင်ပါသည်။
