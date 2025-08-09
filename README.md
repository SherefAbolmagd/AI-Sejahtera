## Deploying to Render

This app is configured to deploy as a single service that serves both the React build and the Node API.

Steps:
1. Push this repo to GitHub.
2. Go to Render and create a new Web Service from the repo.
3. Render will auto-detect `render.yaml`.
4. Set environment variables as needed:
   - `OPENAI_API_KEY` (optional, enables real analysis)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (optional, email)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (optional, WhatsApp)
   - `DID_API_KEY`, `DID_AVATAR_IMAGE_URL` (optional, avatar video)
5. Deploy. The service will run `npm run build` then `npm run server`.

Local production test:
```
npm install
npm run build
npm run server
# open http://localhost:4000
```
## Web Health Demo

This app captures user images/audio, sends them to a Node/Express backend for AI-powered analysis with OpenAI Vision, and renders a comprehensive health report with options to download as PDF, email, or send via WhatsApp.

## Features

- **Health Data Capture**: Capture images of face, eyes, tongue, skin, and nails
- **Audio Recording**: Record voice samples for analysis
- **AI-Powered Analysis**: Uses OpenAI GPT-4 Vision for comprehensive health insights
- **Multi-language Avatar Guide**: 3D avatar provides guidance in English, Malay, Tamil, and Chinese
- **Medical Term Tooltips**: Interactive tooltips explaining medical terminology with accuracy metrics
- **Research & Accuracy Information**: Detailed research methodology, clinical validation, and accuracy metrics
- **Enhanced Results Page**: Modern UI with gradient backgrounds, animations, and comprehensive health insights
- **Report Generation**: Download PDF reports, email, or send to WhatsApp
- **Modern UI/UX**: Beautiful, responsive design with animations and medical-grade interface

### Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference. Minimum required:

```
OPENAI_API_KEY=sk-...
# optional for email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM=reports@example.com
# optional for WhatsApp via Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

3) Run the app (frontend + backend)

```bash
npm run dev:all
```

The frontend runs at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:4000`.

### Notes

- The backend lives in `server/index.js` and exposes:
  - `POST /api/analyze/:type` where type ∈ `face|eyes|tongue|skin|nails`
  - `POST /api/analyze/audio`
  - `POST /api/report/pdf` (returns application/pdf)
  - `POST /api/report/email`
  - `POST /api/report/whatsapp`
- The client service in `src/services/healthAnalysis.js` handles multipart uploads and report export/share utilities.
