"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiCoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoreService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
let AiCoreService = AiCoreService_1 = class AiCoreService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiCoreService_1.name);
        this.model = 'claude-sonnet-4-6';
        this.client = new sdk_1.default({
            apiKey: configService.get('ANTHROPIC_API_KEY'),
        });
    }
    async analyzeMedicalImage(fileUrl, context = '') {
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
                                    media_type: mimeType,
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
        }
        catch (error) {
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
    async extractDocumentData(fileUrl) {
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
                                source: { type: 'base64', media_type: mimeType, data: imageData },
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
        }
        catch (error) {
            this.logger.error('Document extraction failed', error);
            return { rawText: 'Matn ajratib olishda xatolik yuz berdi' };
        }
    }
    async generateAssistantResponse(query, context, conversationHistory = []) {
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
            { role: 'user', content: query },
        ];
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            system: systemPrompt,
            messages,
        });
        return response.content[0].type === 'text' ? response.content[0].text : '';
    }
    async streamSymptomText(symptomText, onChunk) {
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
            if (event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta') {
                onChunk(event.delta.text || '');
            }
        }
    }
    async evaluateSymptoms(symptomText) {
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
        }
        catch (error) {
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
    async fileToBase64(fileUrl) {
        const fullPath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
        const data = fs.readFileSync(fullPath);
        return data.toString('base64');
    }
    getMimeType(fileUrl) {
        const ext = path.extname(fileUrl).toLowerCase();
        const mimeMap = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
            '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
        };
        return mimeMap[ext] || 'image/jpeg';
    }
    extractJson(text) {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : '{}';
    }
};
exports.AiCoreService = AiCoreService;
exports.AiCoreService = AiCoreService = AiCoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiCoreService);
//# sourceMappingURL=ai-core.service.js.map