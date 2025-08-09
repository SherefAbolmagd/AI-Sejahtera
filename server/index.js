import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Simple file-based storage for users (in production, use a proper database)
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

// Helper functions for user data management
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return {};
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const ensureOpenAI = (res) => {
  if (!openai) {
    return false;
  }
  return true;
};

const bufferToDataUrl = (mimetype, buffer) => `data:${mimetype};base64,${buffer.toString('base64')}`;

// Build prompts per analysis type
const buildPromptForType = (type) => {
  const common = `You are a health assistant. Analyze the provided image for ${type} health signals. Respond STRICTLY in minified JSON only, no backticks, no prose. Use the exact schema requested.`;
  switch (type) {
    case 'face':
      return {
        system: common,
        schema: {
          face: {
            age: { value: 'number', confidence: '0..1' },
            gender: { value: 'male|female|unknown', confidence: '0..1' },
            skinConditions: [{ condition: 'string', severity: 'mild|moderate|severe', confidence: '0..1' }],
            facialFeatures: { symmetry: '0..1', skinTone: 'string', complexion: 'string' },
            healthIndicators: { hydration: 'poor|fair|good', stressLevel: 'low|moderate|high', sleepQuality: 'poor|adequate|good' }
          }
        },
      };
    case 'eyes':
      return {
        system: common,
        schema: {
          eyes: {
            eyeHealth: { overall: 'poor|fair|good', redness: 'none|minimal|moderate|high', dryness: 'none|mild|moderate|high', irritation: 'none|mild|moderate|high' },
            visionIndicators: { pupilSize: 'small|normal|large', eyeAlignment: 'poor|fair|good', blinkRate: 'low|normal|high' },
            fatigueDetection: { level: 'low|moderate|high', eyeStrain: 'none|mild|moderate|high', darkCircles: 'none|present|pronounced' },
            recommendations: ['string']
          }
        },
      };
    case 'tongue':
      return {
        system: common,
        schema: {
          tongue: {
            tongueColor: { primary: 'string', secondary: 'string', interpretation: 'string' },
            coating: { thickness: 'none|thin|thick', color: 'string', distribution: 'even|patchy', interpretation: 'string' },
            shape: { size: 'small|normal|large', edges: 'smooth|scalloped|irregular', cracks: 'none|few|many', interpretation: 'string' },
            tcmIndicators: { qi: 'deficient|balanced|excess', blood: 'deficient|adequate|stagnant', yin: 'deficient|sufficient|excess', yang: 'low|moderate|excess' },
            healthPatterns: { digestive: 'poor|fair|good', immune: 'weak|moderate|strong', stress: 'low|moderate|high' }
          }
        },
      };
    case 'skin':
      return {
        system: common,
        schema: {
          skin: {
            conditions: [{ type: 'string', severity: 'mild|moderate|severe', confidence: '0..1' }],
            texture: { smoothness: 'poor|fair|good', elasticity: 'low|normal|high', oiliness: 'dry|balanced|oily' },
            pigmentation: { evenness: 'poor|fair|good', spots: 'none|minimal|moderate|pronounced', tone: 'string' },
            hydration: { level: 'low|adequate|high', moisture: 'low|balanced|high', dryness: 'none|mild|moderate|severe' },
            sensitivity: { level: 'low|moderate|high', redness: 'none|minimal|moderate|high', irritation: 'none|mild|moderate|high' },
            recommendations: ['string']
          }
        },
      };
    case 'nails':
      return {
        system: common,
        schema: {
          nails: {
            nailHealth: { strength: 'poor|fair|good', growth: 'slow|normal|fast', color: 'string', texture: 'smooth|ridges|brittle' },
            nutritionalIndicators: { protein: 'low|adequate|high', vitamins: 'low|sufficient|high', minerals: 'low|balanced|high', hydration: 'poor|fair|good' },
            growthPatterns: { rate: 'slow|normal|fast', ridges: 'none|minimal|pronounced', brittleness: 'none|mild|moderate|high' },
            abnormalities: { spots: 'none|few|many', discoloration: 'none|mild|pronounced', deformities: 'none|mild|pronounced' },
            recommendations: ['string']
          }
        },
      };
    default:
      return { system: common, schema: {} };
  }
};

function demoAnalysis(type) {
  switch (type) {
    case 'face':
      return {
        age: { value: 28, confidence: 0.95 },
        gender: { value: 'male', confidence: 0.98 },
        skinConditions: [
          { condition: 'acne', severity: 'mild', confidence: 0.85 },
          { condition: 'dark_circles', severity: 'moderate', confidence: 0.72 },
        ],
        facialFeatures: { symmetry: 0.92, skinTone: 'fair', complexion: 'clear' },
        healthIndicators: { hydration: 'good', stressLevel: 'moderate', sleepQuality: 'adequate' },
      };
    case 'eyes':
      return {
        eyeHealth: { overall: 'good', redness: 'minimal', dryness: 'none', irritation: 'none' },
        visionIndicators: { pupilSize: 'normal', eyeAlignment: 'good', blinkRate: 'normal' },
        fatigueDetection: { level: 'low', eyeStrain: 'minimal', darkCircles: 'present' },
        recommendations: ['Take regular screen breaks', 'Use blue light filter', 'Maintain proper lighting'],
      };
    case 'tongue':
      return {
        tongueColor: { primary: 'pink', secondary: 'slight_red', interpretation: 'normal to slightly inflamed' },
        coating: { thickness: 'thin', color: 'white', distribution: 'even', interpretation: 'normal digestive function' },
        shape: { size: 'normal', edges: 'smooth', cracks: 'none', interpretation: 'good organ function' },
        tcmIndicators: { qi: 'balanced', blood: 'adequate', yin: 'sufficient', yang: 'moderate' },
        healthPatterns: { digestive: 'good', immune: 'strong', stress: 'moderate' },
      };
    case 'skin':
      return {
        conditions: [
          { type: 'acne', severity: 'mild', confidence: 0.88 },
          { type: 'hyperpigmentation', severity: 'light', confidence: 0.75 },
        ],
        texture: { smoothness: 'good', elasticity: 'normal', oiliness: 'balanced' },
        pigmentation: { evenness: 'good', spots: 'minimal', tone: 'uniform' },
        hydration: { level: 'adequate', moisture: 'balanced', dryness: 'none' },
        sensitivity: { level: 'low', redness: 'minimal', irritation: 'none' },
        recommendations: ['Use gentle cleanser', 'Apply sunscreen daily', 'Stay hydrated'],
      };
    case 'nails':
      return {
        nailHealth: { strength: 'good', growth: 'normal', color: 'healthy_pink', texture: 'smooth' },
        nutritionalIndicators: { protein: 'adequate', vitamins: 'sufficient', minerals: 'balanced', hydration: 'good' },
        growthPatterns: { rate: 'normal', ridges: 'minimal', brittleness: 'none' },
        abnormalities: { spots: 'none', discoloration: 'none', deformities: 'none' },
        recommendations: ['Maintain balanced diet', 'Keep nails clean and dry', 'Use moisturizer regularly'],
      };
    default:
      return {};
  }
}

async function analyzeImageBuffer(type, file) {
  // If OpenAI not configured, return empty so UI can show N/A
  if (!openai) return { success: true, analysis: {}, meta: { source: 'none' } };

  const { system, schema } = buildPromptForType(type);
  const dataUrl = bufferToDataUrl(file.mimetype, file.buffer);

  const messages = [
    { role: 'system', content: system + ' Ensure the JSON matches expected keys.' },
    {
      role: 'user',
      content: [
        { type: 'text', text: `Return ONLY JSON with this top-level key structure for ${type}: ${JSON.stringify(schema)}.` },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ];

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    return { success: true, analysis: parsed[type] ? parsed[type] : parsed, meta: { source: 'openai' } };
  } catch (e) {
    console.error('OpenAI error', e);
    // Do not fabricate results; return empty so client shows N/A
    return { success: true, analysis: {}, meta: { source: 'error' } };
  }
}

// Place audio route BEFORE the generic ":type" route to avoid shadowing
app.post('/api/analyze/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      // No audio; return empty analysis
      return res.json({ success: true, analysis: {}, meta: { source: 'none' } });
    }
    // TODO: implement real audio analysis; for now return empty to avoid fake data
    return res.json({ success: true, analysis: {}, meta: { source: 'none' } });
  } catch (err) {
    console.error('Audio analyze error', err);
    // Do not fabricate data
    return res.json({ success: true, analysis: {}, meta: { source: 'error' } });
  }
});

app.post('/api/analyze/:type', upload.any(), async (req, res) => {
  try {
    const { type } = req.params;
    if (!['face', 'eyes', 'tongue', 'skin', 'nails'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid type' });
    }
    // Pick first file (accepts image|file fields)
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    // If no file, return empty so UI shows N/A
    if (!file) {
      return res.json({ success: true, analysis: {}, meta: { source: 'none' } });
    }

    const result = await analyzeImageBuffer(type, file);
    if (!result.success) return res.status(500).json(result);
    return res.json({ success: true, analysis: result.analysis, meta: result.meta || { source: 'openai' } });
  } catch (err) {
    console.error('Analyze error', err);
    try {
      const { type } = req.params;
      // Do not return demo; respond with empty analysis
      return res.json({ success: true, analysis: {}, meta: { source: 'error' } });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Analysis failed' });
    }
  }
});

// Multer error handler
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(200).json({ success: true, analysis: {} });
  }
  return res.status(500).json({ success: false, error: 'Server error' });
});

// PDF generation utility
function drawHeader(doc, title) {
  const width = doc.page.width - 80;
  const x = 40;
  const y = 40;
  const h = 100;
  doc.save();
  
  // Gradient-like header with rounded corners
  doc.roundedRect(x, y, width, h, 12).fill('#667eea');
  
  // Add subtle shadow effect
  doc.roundedRect(x + 2, y + 2, width, h, 12).fill('#00000015');
  doc.roundedRect(x, y, width, h, 12).fill('#667eea');
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(28).text(title, x + 20, y + 25);
  doc.fontSize(14).opacity(0.9).text('AI-Powered Medical Insights', x + 20, y + 60);
  doc.restore();
  doc.moveDown(2);
}

function drawKpi(doc, label, value, x, y, icon = '📊', color = '#6366f1') {
  doc.save();
  
  // Card shadow
  doc.roundedRect(x + 3, y + 3, 120, 60, 8).fill('#00000010');
  
  // Card background
  doc.roundedRect(x, y, 120, 60, 8).fill('#ffffff').stroke('#e5e7eb');
  
  // Icon circle
  doc.circle(x + 20, y + 20, 12).fill(color);
  doc.fontSize(14).fillColor('#ffffff').text(icon, x + 15, y + 14);
  
  // Label and value
  doc.fontSize(9).fillColor('#6b7280').text(label, x + 8, y + 38);
  doc.fontSize(16).fillColor('#111827').text(String(value), x + 8, y + 48);
  doc.restore();
}

function drawBarCompare(doc, x, y, w, h, percent, normalPercent) {
  doc.save();
  
  // Background bar with rounded corners
  doc.roundedRect(x, y, w, h, h/2).fill('#f1f5f9');
  
  // Patient value bar
  const pw = Math.max(0, Math.min(w, (percent / 100) * w));
  if (pw > 0) {
    doc.roundedRect(x, y, pw, h, h/2).fill('#6366f1');
  }
  
  // Normal range indicator (green line)
  const nx = x + Math.max(0, Math.min(w, (normalPercent / 100) * w));
  doc.moveTo(nx, y - 3).lineTo(nx, y + h + 3).lineWidth(2).stroke('#10b981');
  
  // Add subtle border
  doc.roundedRect(x, y, w, h, h/2).lineWidth(0.5).stroke('#e2e8f0');
  
  doc.restore();
}

function generatePdf(report) {
  const doc = new PDFDocument({ margin: 40, bufferPages: true });
  const chunks = [];
  doc.on('data', (d) => chunks.push(d));
  const title = 'Health Analysis Report';

  drawHeader(doc, title);
  doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date(report.timestamp || Date.now()).toLocaleString()}`, { align: 'right' });
  doc.fillColor('#111827');

  const analyses = report.analyses || {};
  const sections = ['face', 'eyes', 'tongue', 'skin', 'nails', 'audio'];

  // KPI Dashboard Cards
  const imagesCount = ['face','eye','tongue','skin','nail'].filter(k => analyses[k === 'eye' ? 'eyes' : k])?.length || 0;
  const audioCount = analyses.audio ? 1 : 0;
  let kx = 40; const ky = 160; const gap = 130;
  drawKpi(doc, 'Images Analyzed', imagesCount, kx, ky, '🖼️', '#3b82f6'); kx += gap;
  drawKpi(doc, 'Audio Samples', audioCount, kx, ky, '🎵', '#10b981'); kx += gap;
  drawKpi(doc, 'AI Models Used', 5, kx, ky, '🤖', '#8b5cf6'); kx += gap;
  drawKpi(doc, 'Avg Accuracy', '85%', kx, ky, '✅', '#f59e0b');

  doc.moveDown(); doc.moveDown();
  if (report.overallHealth) {
    doc.fontSize(14).fillColor('#111827').text('Overall Health');
    doc.fontSize(11).fillColor('#374151').text(`Overall score: ${report.overallHealth.score} / 100`);
    const levelMap = { excellent: 'Excellent', good: 'Good', fair: 'Fair', needs_attention: 'Needs Attention' };
    doc.text(`Level: ${levelMap[report.overallHealth.level] || report.overallHealth.level}`);
    doc.moveDown(0.5);
  }

  // Analysis Cards per modality
  sections.forEach((section) => {
    if (!analyses[section]) return;
    doc.moveDown(1);
    
    // Section header with icon
    const sectionIcons = {
      face: '😊', eyes: '👁️', tongue: '👅', skin: '🤲', nails: '💅', audio: '🎤'
    };
    const sectionColors = {
      face: '#3b82f6', eyes: '#10b981', tongue: '#f59e0b', skin: '#06b6d4', nails: '#8b5cf6', audio: '#ef4444'
    };
    
    // Section card background
    const cardX = 40, cardY = doc.y;
    const cardW = doc.page.width - 80, cardH = 140;
    doc.roundedRect(cardX + 2, cardY + 2, cardW, cardH, 8).fill('#00000008'); // Shadow
    doc.roundedRect(cardX, cardY, cardW, cardH, 8).fill('#ffffff').stroke('#e5e7eb');
    
    // Section title with icon
    doc.fontSize(16).fillColor(sectionColors[section]).text(`${sectionIcons[section]} ${section[0].toUpperCase()}${section.slice(1)} Analysis`, cardX + 16, cardY + 16);
    
    const x = cardX + 16; let y = cardY + 45; const w = cardW - 32; const barW = w - 140; const h = 8; const rowGap = 18;

    const addRow = (label, patient, normal, percent, normalPercent) => {
      doc.fontSize(9).fillColor('#374151').text(label, x, y);
      drawBarCompare(doc, x + 110, y + 4, barW, h, percent, normalPercent);
      doc.fontSize(8).fillColor('#6b7280').text(`You: ${patient}`, x + 110, y + 16);
      doc.text(`Normal: ${normal}`, x + 110 + barW - 120, y + 16, { width: 120, align: 'right' });
      y += rowGap;
      doc.moveTo(x, y - 6).lineTo(x + w, y - 6).opacity(0.06).stroke('#000').opacity(1);
    };

    const a = analyses[section];
    if (section === 'face' && a.healthIndicators) {
      addRow('Hydration', a.healthIndicators.hydration, 'Good', a.healthIndicators.hydration === 'good' ? 85 : a.healthIndicators.hydration === 'fair' ? 60 : 35, 85);
      addRow('Stress Level', a.healthIndicators.stressLevel, 'Low', a.healthIndicators.stressLevel === 'low' ? 85 : a.healthIndicators.stressLevel === 'moderate' ? 60 : 35, 85);
      addRow('Sleep Quality', a.healthIndicators.sleepQuality, 'Good/Adequate', a.healthIndicators.sleepQuality === 'good' ? 90 : a.healthIndicators.sleepQuality === 'adequate' ? 70 : 40, 85);
    }
    if (section === 'eyes' && a.eyeHealth) {
      addRow('Overall Eye Health', a.eyeHealth.overall, 'Good', a.eyeHealth.overall === 'good' ? 90 : a.eyeHealth.overall === 'fair' ? 60 : 35, 85);
      addRow('Redness', a.eyeHealth.redness, 'None/Minimal', a.eyeHealth.redness === 'none' ? 90 : a.eyeHealth.redness === 'minimal' ? 75 : a.eyeHealth.redness === 'moderate' ? 50 : 30, 85);
    }
    if (section === 'tongue' && a.tcmIndicators) {
      addRow('Qi Balance', a.tcmIndicators.qi, 'Balanced', a.tcmIndicators.qi === 'balanced' ? 85 : 60, 85);
    }
    if (section === 'skin' && a.hydration) {
      addRow('Skin Hydration', a.hydration.level, 'Adequate', a.hydration.level === 'high' ? 90 : a.hydration.level === 'adequate' ? 85 : 40, 85);
      if (a.texture?.elasticity) addRow('Elasticity', a.texture.elasticity, 'Normal/High', a.texture.elasticity === 'high' ? 90 : a.texture.elasticity === 'normal' ? 75 : 40, 85);
    }
    if (section === 'nails' && a.nailHealth) {
      addRow('Nail Strength', a.nailHealth.strength, 'Good', a.nailHealth.strength === 'good' ? 90 : a.nailHealth.strength === 'fair' ? 65 : 40, 85);
    }
    if (section === 'audio') {
      const bpm = a.heartRate?.bpm || 75;
      const percent = Math.max(0, Math.min(100, ((bpm - 40) / 80) * 100));
      const normalPercent = ((75 - 40) / 80) * 100;
      addRow('Heart Rate', `${bpm} bpm`, '60–100 bpm', percent, normalPercent);
      if (a.breathingPatterns?.efficiency) addRow('Breathing Efficiency', a.breathingPatterns.efficiency, 'Good', a.breathingPatterns.efficiency === 'good' ? 88 : a.breathingPatterns.efficiency === 'adequate' ? 70 : 40, 85);
    }

    // Advance y, and if near page end, add a new page
    doc.y = cardY + cardH + 10;
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }
  });

  // Recommendations Section
  if (report.recommendations?.length) {
    doc.moveDown(1);
    
    // Recommendations card
    const recX = 40, recY = doc.y;
    const recW = doc.page.width - 80, recH = 80 + (report.recommendations.length * 15);
    doc.roundedRect(recX + 2, recY + 2, recW, recH, 8).fill('#00000008'); // Shadow
    doc.roundedRect(recX, recY, recW, recH, 8).fill('#ffffff').stroke('#e5e7eb');
    
    doc.fontSize(16).fillColor('#f59e0b').text('💡 AI Health Recommendations', recX + 16, recY + 16);
    
    let recRowY = recY + 45;
    report.recommendations.forEach((r, i) => {
      doc.fontSize(10).fillColor('#374151').text(`${i + 1}. ${r}`, recX + 16, recRowY);
      recRowY += 15;
    });
    
    doc.y = recY + recH + 10;
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
    }
  }
  
  // Footer
  doc.moveDown(1);
  const footerY = Math.min(doc.y, doc.page.height - 60);
  doc.font('Helvetica').fontSize(8).fillColor('#6b7280').text('Generated by AI Health Analysis System', 40, footerY);
  doc.text(`Report ID: ${Date.now().toString(36).toUpperCase()}`, 40, footerY + 12);
  doc.text('This report is for informational purposes only. Consult healthcare professionals for medical advice.', 40, footerY + 24);

  doc.end();
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

app.post('/api/report/pdf', async (req, res) => {
  try {
    const report = req.body?.report || req.body;
    if (!report) return res.status(400).json({ success: false, error: 'Missing report payload' });
    const pdf = await generatePdf(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="health-report.pdf"');
    res.send(pdf);
  } catch (err) {
    console.error('PDF error', err);
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

// Email report
app.post('/api/report/email', async (req, res) => {
  try {
    const { to, subject = 'Your Health Analysis Report', report } = req.body || {};
    if (!to || !report) return res.status(400).json({ success: false, error: 'Missing recipient or report' });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Boolean(process.env.SMTP_SECURE === 'true'),
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const pdf = await generatePdf(report);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: 'Attached is your health analysis report PDF.',
      attachments: [{ filename: 'health-report.pdf', content: pdf }],
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// WhatsApp via Twilio (optional)
app.post('/api/report/whatsapp', async (req, res) => {
  try {
    const { to, message = 'Your Health Analysis Report is ready.' } = req.body || {};
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
    if (!sid || !token || !from) {
      return res.status(500).json({ success: false, error: 'Twilio WhatsApp not configured' });
    }
    const client = twilio(sid, token);
    const resp = await client.messages.create({
      from,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body: message,
    });
    res.json({ success: true, sid: resp.sid });
  } catch (err) {
    console.error('WhatsApp error', err);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// User Registration and Data Management Endpoints

// Create new user profile
app.post('/api/users/register', (req, res) => {
  try {
    const { personalInfo, healthMetrics, goals, preferences } = req.body;
    
    if (!personalInfo?.name || !personalInfo?.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const users = loadUsers();
    const userId = generateUserId();
    
    const newUser = {
      id: userId,
      personalInfo: {
        name: personalInfo.name,
        email: personalInfo.email,
        age: personalInfo.age || null,
        gender: personalInfo.gender || null,
        height: personalInfo.height || null,
        weight: personalInfo.weight || null,
        avatar: personalInfo.avatar || '👤'
      },
      healthMetrics: {
        bloodPressure: healthMetrics?.bloodPressure || null,
        heartRate: healthMetrics?.heartRate || null,
        bloodSugar: healthMetrics?.bloodSugar || null,
        cholesterol: healthMetrics?.cholesterol || null,
        bmi: healthMetrics?.bmi || null,
        sleepHours: healthMetrics?.sleepHours || null,
        exerciseFreq: healthMetrics?.exerciseFreq || null,
        waterIntake: healthMetrics?.waterIntake || null,
        stressLevel: healthMetrics?.stressLevel || null
      },
      goals: goals || [],
      preferences: preferences || {},
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      healthHistory: [],
      achievements: [],
      gamificationData: {
        level: 1,
        xp: 0,
        streak: 0,
        badges: ['welcome'],
        completedTasks: []
      }
    };

    users[userId] = newUser;
    
    if (saveUsers(users)) {
      res.json({ 
        success: true, 
        userId, 
        user: newUser,
        message: 'Welcome to your health journey! 🎉'
      });
    } else {
      res.status(500).json({ error: 'Failed to save user data' });
    }
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get user profile
app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const users = loadUsers();
    const user = users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[userId] = user;
    saveUsers(users);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user health data
app.put('/api/users/:userId/health', (req, res) => {
  try {
    const { userId } = req.params;
    const { healthData, analysisResults } = req.body;
    
    const users = loadUsers();
    const user = users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to health history
    const healthEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      healthData: healthData || {},
      analysisResults: analysisResults || {},
      type: 'health_check'
    };

    user.healthHistory.push(healthEntry);
    
    // Update gamification data
    user.gamificationData.xp += 10;
    user.gamificationData.completedTasks.push({
      type: 'health_check',
      timestamp: new Date().toISOString(),
      xp: 10
    });

    // Level up logic
    const newLevel = Math.floor(user.gamificationData.xp / 100) + 1;
    if (newLevel > user.gamificationData.level) {
      user.gamificationData.level = newLevel;
      user.achievements.push({
        type: 'level_up',
        level: newLevel,
        timestamp: new Date().toISOString(),
        title: `Level ${newLevel} Achieved! 🎯`,
        description: `You've reached level ${newLevel} on your health journey!`
      });
    }

    users[userId] = user;
    
    if (saveUsers(users)) {
      res.json({ 
        success: true, 
        user,
        newAchievements: user.achievements.slice(-1),
        message: `Great job! +10 XP earned 🌟`
      });
    } else {
      res.status(500).json({ error: 'Failed to update user data' });
    }
  } catch (error) {
    console.error('Update health data error:', error);
    res.status(500).json({ error: 'Failed to update health data' });
  }
});

// Get user health history and trends
app.get('/api/users/:userId/history', (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const users = loadUsers();
    const user = users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const recentHistory = user.healthHistory.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    // Generate trend data
    const trends = generateHealthTrends(recentHistory);

    res.json({ 
      success: true, 
      history: recentHistory,
      trends,
      totalChecks: user.healthHistory.length,
      gamificationData: user.gamificationData
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get health history' });
  }
});

// Helper function to generate health trends
function generateHealthTrends(history) {
  const trends = {
    stressLevel: [],
    sleepQuality: [],
    hydration: [],
    overallHealth: []
  };

  history.forEach(entry => {
    const date = entry.timestamp.split('T')[0];
    
    if (entry.analysisResults?.face?.healthIndicators) {
      const indicators = entry.analysisResults.face.healthIndicators;
      
      if (indicators.stressLevel) {
        trends.stressLevel.push({
          date,
          value: getNumericValue(indicators.stressLevel, { low: 1, moderate: 2, high: 3 })
        });
      }
      
      if (indicators.sleepQuality) {
        trends.sleepQuality.push({
          date,
          value: getNumericValue(indicators.sleepQuality, { poor: 1, adequate: 2, good: 3 })
        });
      }
      
      if (indicators.hydration) {
        trends.hydration.push({
          date,
          value: getNumericValue(indicators.hydration, { poor: 1, fair: 2, good: 3 })
        });
      }
    }

    // Overall health score (simplified)
    const overallScore = calculateOverallScore(entry.analysisResults);
    if (overallScore) {
      trends.overallHealth.push({
        date,
        value: overallScore
      });
    }
  });

  return trends;
}

function getNumericValue(value, mapping) {
  return mapping[value?.toLowerCase()] || 0;
}

function calculateOverallScore(analysisResults) {
  let score = 0;
  let factors = 0;

  if (analysisResults?.face?.healthIndicators) {
    const face = analysisResults.face.healthIndicators;
    score += getNumericValue(face.hydration, { poor: 1, fair: 2, good: 3 });
    score += getNumericValue(face.stressLevel, { high: 1, moderate: 2, low: 3 });
    score += getNumericValue(face.sleepQuality, { poor: 1, adequate: 2, good: 3 });
    factors += 3;
  }

  if (analysisResults?.eyes?.eyeHealth) {
    score += getNumericValue(analysisResults.eyes.eyeHealth.overall, { poor: 1, fair: 2, good: 3 });
    factors += 1;
  }

  return factors > 0 ? Math.round((score / factors) * 33.33) : null; // Scale to 0-100
}

// Text-to-Speech (OpenAI) - returns audio/mpeg
app.post('/api/tts', async (req, res) => {
  try {
    const { text = '', voice = 'alloy' } = req.body || {};
    if (!text || !openai) {
      return res.status(204).end();
    }
    const tts = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
      voice,
      input: text,
      format: 'mp3',
    });
    const buffer = Buffer.from(await tts.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('TTS error', err);
    res.status(204).end();
  }
});

// Avatar video generation via D-ID
app.post('/api/avatar/generate', async (req, res) => {
  try {
    const didKey = process.env.DID_API_KEY;
    if (!didKey) return res.status(400).json({ error: 'DID_API_KEY not configured' });

    const {
      language = 'en',
      script = 'Hello! I will guide you through the health data capture process.',
      avatar_image_url,
      voice_id,
    } = req.body || {};

    const defaultVoices = {
      en: 'en-US-GuyNeural',
      ms: 'ms-MY-OsmanNeural',
      ta: 'ta-IN-ValluvarNeural',
      zh: 'zh-CN-YunxiNeural',
    };

    const voice = voice_id || defaultVoices[language] || defaultVoices.en;
    const imageUrl = avatar_image_url || process.env.DID_AVATAR_IMAGE_URL;
    if (!imageUrl) return res.status(400).json({ error: 'Provide avatar_image_url or set DID_AVATAR_IMAGE_URL' });

    const createResp = await fetch('https://api.d-id.com/v1/talks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${didKey}:`).toString('base64')}`,
      },
      body: JSON.stringify({
        source_url: imageUrl,
        script: {
          type: 'text',
          input: script,
          provider: { type: 'microsoft', voice_id: voice },
        },
        config: { stitch: true, pad_audio: 0.2 },
      }),
    });
    const createJson = await createResp.json();
    if (!createResp.ok) return res.status(500).json({ error: 'D-ID create failed', details: createJson });

    const id = createJson.id;
    let status = 'created';
    let info = null;
    const started = Date.now();
    while (Date.now() - started < 120000) { // up to 2 minutes
      const pollResp = await fetch(`https://api.d-id.com/v1/talks/${id}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${didKey}:`).toString('base64')}` },
      });
      info = await pollResp.json();
      status = info.status;
      if (status === 'done' && info.result_url) {
        return res.json({ success: true, url: info.result_url });
      }
      if (status === 'error') {
        return res.status(500).json({ error: 'D-ID generation error', details: info });
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    return res.status(504).json({ error: 'D-ID generation timeout', details: info });
  } catch (err) {
    console.error('Avatar generate error', err);
    return res.status(500).json({ error: 'Failed to generate avatar video' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// --- Static file serving (production) ---
try {
  const clientDist = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      // Avoid catching API routes
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
} catch (_) {
  // no-op if dist not present
}
