import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

export interface DiagnosisAnalysis {
  diseaseDetected: string | null;
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  recommendations: string;
  findings: string[];
}

export interface StructuredDocData {
  patientName?: string;
  date?: string;
  diagnosis?: string;
  medications?: string[];
  doctorName?: string;
  clinicName?: string;
  additionalFields?: Record<string, any>;
  rawText: string;
}

export interface SymptomAssessment {
  possibleConditions: Array<{ name: string; probability: string }>;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  recommendation: string;
  disclaimer: string;
  suggestedSpecialists: string[];
}

@Injectable()
export class AiCoreService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AiCoreService.name);
  private readonly model = 'claude-sonnet-4-6';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async analyzeMedicalImage(fileUrl: string, context: string = ''): Promise<DiagnosisAnalysis> {
    try {
      const imageData = await this.fileToBase64(fileUrl);
      const mimeType = this.getMimeType(fileUrl);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType as any,
                  data: imageData,
                },
              },
              {
                type: 'text',
                text: `Siz professional tibbiy tasvir tahlilchisisiz. Quyidagi tibbiy tasvirni tahlil qilib, faqat JSON formatida javob bering.
${context ? `Qo'shimcha kontekst: ${context}` : ''}

Javob formati (faqat JSON, boshqa hech narsa yozma):
{
  "diseaseDetected": "aniqlangan kasallik yoki patologiya nomi (topilmasa null)",
  "confidenceScore": 75.5,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "tasvir tahlilining qisqacha xulosasi",
  "recommendations": "tavsiya etilgan keyingi qadamlar",
  "findings": ["topilma 1", "topilma 2"]
}

MUHIM: Bu tizim yakuniy tibbiy tashxis qo'ymaydi. Natijalar shifokor ko'rib chiqishi uchun mo'ljallangan.`,
              },
            ],
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return JSON.parse(this.extractJson(text));
      // return {
      //   diseaseDetected: "Og'ir tibbiy tashxis",
      //   confidenceScore: 100,
      //   riskLevel: 'HIGH',
      //   summary: 'Tahlil paytida ushbu chuqur tibbiy tashxisni qo\'ydik',
      //   recommendations: 'Tezkor shifokorga murojaat qiling',
      //   findings: [
      //     'Og\'ir tibbiy tashxis',
      //     'Og\'ir tibbiy tashxis',
      //   ],
      // }
    } catch (error) {
      this.logger.error('Medical image analysis failed', error);
      return {
        diseaseDetected: null,
        confidenceScore: 0,
        riskLevel: 'LOW',
        summary: 'Tahlil paytida xatolik yuz berdi',
        recommendations: 'Iltimos, faylni qayta yuklab ko\'ring yoki shifokorga murojaat qiling',
        findings: [],
      };
    }
  }

  async extractDocumentData(fileUrl: string): Promise<StructuredDocData> {
    try {
      const imageData = await this.fileToBase64(fileUrl);
      const mimeType = this.getMimeType(fileUrl);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mimeType as any, data: imageData },
              },
              {
                type: 'text',
                text: `Bu tibbiy hujjatdan ma'lumotlarni ajratib oling va JSON formatida qaytaring:
{
  "patientName": "bemor ismi",
  "date": "sana (ISO format)",
  "diagnosis": "tashxis",
  "medications": ["dori 1", "dori 2"],
  "doctorName": "shifokor ismi",
  "clinicName": "klinika nomi",
  "additionalFields": {"boshqa": "ma'lumotlar"},
  "rawText": "hujjatdagi barcha matn"
}
Faqat JSON qaytaring, boshqa hech narsa yozma.`,
              },
            ],
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      return JSON.parse(this.extractJson(text));
    } catch (error) {
      this.logger.error('Document extraction failed', error);
      return { rawText: 'Matn ajratib olishda xatolik yuz berdi' };
    }
  }

  async generateAssistantResponse(
    query: string,
    context: Record<string, any>,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ): Promise<string> {
    const systemPrompt = `Siz MedCore tibbiy boshqaruv tizimining mutaxassis AI yordamchisisiz (Dimed-AI).

═══ QATTIQ CHEGARALAR (buzilmaydi) ═══
Siz FAQAT quyidagi mavzularda javob berasiz:
  • Klinika statistikasi: bemorlar, navbatlar, tashxislar, shifokorlar
  • Tibbiy terminologiya, kasallik va sindromlar haqida ma'lumot
  • Onko-AI tashxis natijalarini tushuntirish
  • Klinika boshqaruvi va ish jarayonlari
  • Tibbiy protokollar va standart ko'rsatmalar

Quyidagi mavzularda javob BERMAYSIZ — hech qanday istisnosiz:
  • Siyosat, din, mafkura
  • Ko'ngilochar, sport, san'at, musiqa
  • Shaxsiy munosabatlar, psixologik maslahat (tibbiydan tashqari)
  • Dasturlash, matematika, fizika va boshqa fanlar
  • Oziq-ovqat retsepti, sayohat, moliya va boshqa sohallar
  • Klinika tizimiga aloqasiz har qanday mavzu

Tibbiyotga oid bo'lmagan savol kelganda MAJBURIY javob:
"⚕️ Men faqat MedCore tibbiy tizimi doirasidagi savollarga javob bera olaman. Klinika statistikasi, bemorlar holati, tashxislar yoki tibbiy mavzularda savol bering."

═══ USLUB ═══
• O'zbek tilida, professional va aniq
• Qisqa va konkret (keraksiz so'z ishlatma)
• Raqamli ma'lumotlarni jadval yoki ro'yxat ko'rinishida ber

═══ MAVJUD MA'LUMOTLAR ═══
${JSON.stringify(context, null, 2)}`;

    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: query },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async streamSymptomText(symptomText: string, onChunk: (text: string) => void): Promise<void> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 500,
      system: `Siz MedCore platformasining bemor yordamchi AI siz.

═══ QATTIQ CHEGARALAR (buzilmaydi) ═══
Siz FAQAT sog'liq va tibbiyotga oid savollarga javob berasiz:
  • Simptomlar, kasallik belgilari, o'zini his etish
  • Qaysi mutaxassisga murojaat qilish kerakligi
  • Umumiy sog'liqni saqlash maslahatlari
  • Dori-darmon haqida umumiy ma'lumot (doza belgilash emas)

Tibbiyotga aloqasiz har qanday savolda MAJBURIY javob:
"Kechirasiz, men faqat sog'liq va tibbiy maslahat bo'yicha yordam bera olaman. Simptomlaringiz yoki sog'liq holatingiz haqida yozing."

═══ USLUB ═══
• Hech qachon qo'rqitmang — "xavfli", "og'ir", "jiddiy" so'zlarini ishlatmang
• Xotirjam, iliq, dalda beruvchi, onalik mehri bilan
• O'zbek tilida, sodda va tushunarli
• 3-4 jumla, lo'nda`,
      messages: [{
        role: 'user',
        content: `Bemor yozgani: "${symptomText}"

Agar bu sog'liq/tibbiyotga oid bo'lsa — xotirjam va mehribon 3-4 jumlada tushuntir.
Agar tibbiyotga oid bo'lmasa — faqat cheklov xabarini yoz.`,
      }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        (event.delta as any).type === 'text_delta'
      ) {
        onChunk((event.delta as any).text || '');
      }
    }
  }

  async evaluateSymptoms(symptomText: string): Promise<SymptomAssessment> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        system: `Siz MedCore platformasining tibbiy baholash AI siz.

QATTIQ QOIDALAR:
1. Faqat tibbiy simptomlar, kasallik belgilari va sog'liq holatlarini baholaysiz
2. Tibbiyotga oid bo'lmagan matn kelsa — "NOT_MEDICAL" flagini qo'y
3. Yakuniy tashxis qo'yma — faqat yo'naltiruvchi baholash
4. Urgency darajasini ehtiyotkorlik bilan belgila (ishonchsiz bo'lsa MEDIUM)
5. suggestedSpecialists — faqat O'zbek tilidagi mutaxassislik nomlari`,
        messages: [
          {
            role: 'user',
            content: `Quyidagi matnni baholang. Agar tibbiy simptom/sog'liq mavzusi bo'lmasa — "NOT_MEDICAL" deb belgilab, bo'sh massivlar qaytaring.

Matn: "${symptomText}"

Faqat JSON qaytaring:
{
  "isMedical": true,
  "possibleConditions": [{"name": "holat nomi o'zbek tilida", "probability": "30-40%"}],
  "urgencyLevel": "LOW|MEDIUM|HIGH|EMERGENCY",
  "recommendation": "xotirjam, dalda beruvchi tavsiya",
  "disclaimer": "Bu tibbiy tashxis emas, shifokorga murojaat qiling",
  "suggestedSpecialists": ["Mutaxassislik1", "Mutaxassislik2"]
}`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      const parsed = JSON.parse(this.extractJson(text));

      if (parsed.isMedical === false) {
        return {
          possibleConditions: [],
          urgencyLevel: 'LOW',
          recommendation: 'Kechirasiz, bu tizim faqat tibbiy simptomlar va sog\'liq holatlari bo\'yicha baholash qiladi. Iltimos, sog\'liq muammoingizni tasvirlang.',
          disclaimer: 'Faqat tibbiy mavzularda yordam bera olaman',
          suggestedSpecialists: [],
        };
      }

      return parsed;
    } catch (error) {
      this.logger.error('Symptom evaluation failed', error);
      return {
        possibleConditions: [],
        urgencyLevel: 'MEDIUM',
        recommendation: 'Tashvishlanmang, shifokorga murojaat qilishni tavsiya etamiz.',
        disclaimer: 'Bu tibbiy tashxis emas',
        suggestedSpecialists: ['Terapevt'],
      };
    }
  }

  private async fileToBase64(fileUrl: string): Promise<string> {
    const fullPath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
    const data = fs.readFileSync(fullPath);
    return data.toString('base64');
  }

  private getMimeType(fileUrl: string): string {
    const ext = path.extname(fileUrl).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
    };
    return mimeMap[ext] || 'image/jpeg';
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : '{}';
  }
}
