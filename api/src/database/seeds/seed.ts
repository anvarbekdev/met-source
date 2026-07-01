import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'mederp',
  password: process.env.DB_PASSWORD || 'mederp_secret',
  database: process.env.DB_NAME || 'mederp_db',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true,
});

// ─── Fixed UUIDs ────────────────────────────────────────────────────────────
const C1 = '11111111-1111-1111-1111-111111111111';
const C2 = '22222222-2222-2222-2222-222222222222';
const C3 = '33333333-3333-3333-3333-333333333333';

const U_SUPER  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const U_ADM1   = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const U_ADM2   = 'bb000000-0000-0000-0000-000000000002';
const U_DOC1   = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const U_DOC2   = 'cc000000-0000-0000-0000-000000000002';
const U_DOC3   = 'cc000000-0000-0000-0000-000000000003';
const U_DOC4   = 'cc000000-0000-0000-0000-000000000004';
const U_DOC5   = 'cc000000-0000-0000-0000-000000000005';
const U_DOC6   = 'cc000000-0000-0000-0000-000000000006';
const U_REC1   = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const U_REC2   = 'dd000000-0000-0000-0000-000000000002';
const U_PAT1   = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const U_PAT2   = 'ee000000-0000-0000-0000-000000000002';

const D_ONCO1  = 'de000001-0000-0000-0000-000000000001';
const D_CARD1  = 'de000001-0000-0000-0000-000000000002';
const D_NEUR1  = 'de000001-0000-0000-0000-000000000003';
const D_PED1   = 'de000001-0000-0000-0000-000000000004';
const D_ONCO2  = 'de000002-0000-0000-0000-000000000001';
const D_GEN2   = 'de000002-0000-0000-0000-000000000002';

const DR1 = 'dc000001-0000-0000-0000-000000000001';
const DR2 = 'dc000001-0000-0000-0000-000000000002';
const DR3 = 'dc000001-0000-0000-0000-000000000003';
const DR4 = 'dc000001-0000-0000-0000-000000000004';
const DR5 = 'dc000002-0000-0000-0000-000000000001';
const DR6 = 'dc000002-0000-0000-0000-000000000002';

const P1 = 'ba000001-0000-0000-0000-000000000001';
const P2 = 'ba000001-0000-0000-0000-000000000002';
const P3 = 'ba000001-0000-0000-0000-000000000003';
const P4 = 'ba000001-0000-0000-0000-000000000004';
const P5 = 'ba000001-0000-0000-0000-000000000005';
const P6 = 'ba000001-0000-0000-0000-000000000006';
const P7 = 'ba000001-0000-0000-0000-000000000007';
const P8 = 'ba000001-0000-0000-0000-000000000008';

// Medical file IDs for Onko-AI
const MF1 = 'f0000001-0000-0000-0000-000000000001';
const MF2 = 'f0000001-0000-0000-0000-000000000002';
const MF3 = 'f0000001-0000-0000-0000-000000000003';
const MF4 = 'f0000001-0000-0000-0000-000000000004';
const MF5 = 'f0000001-0000-0000-0000-000000000005';

// Medical file IDs for Doc-Digitizer
const MF_D1 = 'f0000002-0000-0000-0000-000000000001';
const MF_D2 = 'f0000002-0000-0000-0000-000000000002';
const MF_D3 = 'f0000002-0000-0000-0000-000000000003';
const MF_D4 = 'f0000002-0000-0000-0000-000000000004';

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding database...');
  const qr = AppDataSource.createQueryRunner();

  // ─── 0. CLEANUP (idempotent) ─────────────────────────────────────────────
  await qr.query(`DELETE FROM diagnosis_results`);
  await qr.query(`DELETE FROM digitized_documents`);
  await qr.query(`DELETE FROM appointments`);
  await qr.query(`DELETE FROM medical_files WHERE module_source IN ('ONKO_AI','DOC_DIGITIZER')`);
  await qr.query(`DELETE FROM doctors`);
  await qr.query(`DELETE FROM clinics`);
  // Delete old patients from previous seed (different IDs but same scope)
  await qr.query(`DELETE FROM patients WHERE id NOT IN (
    '${P1}','${P2}','${P3}','${P4}','${P5}','${P6}','${P7}','${P8}'
  ) AND phone NOT IN ('+998901000030','+998901000031','+998901100001','+998901100002','+998901100003','+998901100004','+998901100005','+998901100006')`);
  console.log('🧹 Eski ma\'lumotlar tozalandi');

  // ─── 1. CLINICS ──────────────────────────────────────────────────────────
  const clinics = [
    { id: C1, name: 'Jizzax Shahri Tibbiyot Markazi',      address: 'Jizzax, Markaziy ko\'cha, 1-uy',                     lat: 40.1344, lng: 67.8255, phone: '+998722345678', workingHours: '08:00-18:00' },
    { id: C2, name: 'Jizzax Viloyat Kasalxonasi',           address: 'Jizzax, Sharq ko\'chasi, 45-uy',                     lat: 40.1444, lng: 67.8255, phone: '+998723456789', workingHours: '08:00-20:00' },
    { id: C3, name: 'Ibn Sino Jizzax Klinikasi',            address: 'Jizzax, Navoiy ko\'chasi, 12-uy',                    lat: 40.1264, lng: 67.8175, phone: '+998724567890', workingHours: '09:00-17:00' },
    { id: 'c4000000-0000-0000-0000-000000000004', name: 'Jizzax Oilaviy Poliklinikasi',   address: 'Jizzax, Mustaqillik ko\'chasi, 7-uy',                lat: 40.1424, lng: 67.8335, phone: '+998722001100', workingHours: '08:00-22:00' },
    { id: 'c5000000-0000-0000-0000-000000000005', name: 'Gagarin Tibbiyot Markazi',       address: 'Jizzax, Gagarin ko\'chasi, 33-uy',                   lat: 40.1244, lng: 67.8255, phone: '+998722002200', workingHours: '09:00-18:00' },
    { id: 'c6000000-0000-0000-0000-000000000006', name: 'Jizzax Shifobaxsh Klinikasi',    address: 'Jizzax, Bog\'ishamol ko\'chasi, 19-uy',              lat: 40.1344, lng: 67.8155, phone: '+998722003300', workingHours: '08:00-20:00' },
    { id: 'c7000000-0000-0000-0000-000000000007', name: 'Jizzax Tez Yordam Klinikasi',    address: 'Jizzax, Amir Temur ko\'chasi, 5-uy',                 lat: 40.1464, lng: 67.8195, phone: '+998722004400', workingHours: '24/7' },
    { id: 'c8000000-0000-0000-0000-000000000008', name: 'Zafarobod Tibbiyot Filiali',     address: 'Jizzax, Zafarobod ko\'chasi, 22-uy',                 lat: 40.1344, lng: 67.8355, phone: '+998722005500', workingHours: '08:00-18:00' },
  ];
  for (const c of clinics) {
    await qr.query(
      `INSERT INTO clinics (id, name, address, lat, lng, phone, working_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.address, c.lat, c.lng, c.phone, c.workingHours],
    );
  }
  console.log(`✅ Clinics (${clinics.length})`);

  // ─── 2. USERS ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const docHash   = await bcrypt.hash('Doctor123!', 12);
  const users = [
    { id: U_SUPER, fullName: 'Super Admin',          phone: '+998901000001', email: 'admin@mederp.uz',      hash: adminHash, role: 'SUPER_ADMIN',  clinicId: null },
    { id: U_ADM1,  fullName: 'Alisher Karimov',       phone: '+998901000002', email: 'alisher@mederp.uz',   hash: adminHash, role: 'CLINIC_ADMIN', clinicId: C1 },
    { id: U_ADM2,  fullName: 'Dilnoza Mirzayeva',     phone: '+998901000040', email: 'dilnoza@mederp.uz',   hash: adminHash, role: 'CLINIC_ADMIN', clinicId: C2 },
    { id: U_DOC1,  fullName: 'Dr. Nodira Yusupova',   phone: '+998901000010', email: 'nodira@mederp.uz',    hash: docHash,   role: 'DOCTOR',       clinicId: C1 },
    { id: U_DOC2,  fullName: 'Dr. Sardor Tursunov',   phone: '+998901000011', email: 'sardor@mederp.uz',    hash: docHash,   role: 'DOCTOR',       clinicId: C1 },
    { id: U_DOC3,  fullName: 'Dr. Aziz Holmatov',     phone: '+998901000012', email: 'aziz@mederp.uz',      hash: docHash,   role: 'DOCTOR',       clinicId: C1 },
    { id: U_DOC4,  fullName: 'Dr. Zulfiya Nazarova',  phone: '+998901000013', email: 'zulfiya@mederp.uz',   hash: docHash,   role: 'DOCTOR',       clinicId: C1 },
    { id: U_DOC5,  fullName: 'Dr. Behruz Ergashev',   phone: '+998901000014', email: 'behruz@mederp.uz',    hash: docHash,   role: 'DOCTOR',       clinicId: C2 },
    { id: U_DOC6,  fullName: 'Dr. Feruza Rashidova',  phone: '+998901000015', email: 'feruza@mederp.uz',    hash: docHash,   role: 'DOCTOR',       clinicId: C2 },
    { id: U_REC1,  fullName: 'Jasur Rahimov',          phone: '+998901000020', email: 'jasur@mederp.uz',     hash: adminHash, role: 'RECEPTIONIST', clinicId: C1 },
    { id: U_REC2,  fullName: 'Maftuna Qosimova',       phone: '+998901000021', email: 'maftuna@mederp.uz',   hash: adminHash, role: 'RECEPTIONIST', clinicId: C2 },
    { id: U_PAT1,  fullName: 'Malika Toshmatova',      phone: '+998901000030', email: 'malika@mederp.uz',    hash: adminHash, role: 'PATIENT',      clinicId: null },
    { id: U_PAT2,  fullName: 'Bobur Xasanov',          phone: '+998901000031', email: 'bobur@mederp.uz',     hash: adminHash, role: 'PATIENT',      clinicId: null },
  ];
  for (const u of users) {
    await qr.query(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, clinic_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.fullName, u.phone, u.email, u.hash, u.role, u.clinicId],
    );
  }
  console.log('✅ Users (13)');

  // ─── 3. DEPARTMENTS ──────────────────────────────────────────────────────
  const departments = [
    { id: D_ONCO1, clinicId: C1, name: "Onkologiya Bo'limi",   type: 'ONCOLOGY' },
    { id: D_CARD1, clinicId: C1, name: "Kardiologiya Bo'limi", type: 'CARDIOLOGY' },
    { id: D_NEUR1, clinicId: C1, name: "Nevrologiya Bo'limi",  type: 'NEUROLOGY' },
    { id: D_PED1,  clinicId: C1, name: "Pediatriya Bo'limi",   type: 'PEDIATRICS' },
    { id: D_ONCO2, clinicId: C2, name: "Onkologiya Markazi",   type: 'ONCOLOGY' },
    { id: D_GEN2,  clinicId: C2, name: "Umumiy Terapiya",      type: 'GENERAL' },
  ];
  for (const d of departments) {
    await qr.query(
      `INSERT INTO departments (id, clinic_id, name, type)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [d.id, d.clinicId, d.name, d.type],
    );
  }
  console.log('✅ Departments (6)');

  // ─── 4. DOCTORS ──────────────────────────────────────────────────────────
  const doctors = [
    { id: DR1, userId: U_DOC1, deptId: D_ONCO1, spec: 'Onkolog',      exp: 12 },
    { id: DR2, userId: U_DOC2, deptId: D_CARD1, spec: 'Kardiolog',    exp: 8  },
    { id: DR3, userId: U_DOC3, deptId: D_NEUR1, spec: 'Nevrolog',     exp: 6  },
    { id: DR4, userId: U_DOC4, deptId: D_PED1,  spec: 'Pediatr',      exp: 10 },
    { id: DR5, userId: U_DOC5, deptId: D_ONCO2, spec: 'Onkolog-Xirurg', exp: 15 },
    { id: DR6, userId: U_DOC6, deptId: D_GEN2,  spec: 'Umumiy Shifokor', exp: 5 },
  ];
  for (const d of doctors) {
    await qr.query(
      `INSERT INTO doctors (id, user_id, department_id, specialization, experience_years)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [d.id, d.userId, d.deptId, d.spec, d.exp],
    );
  }
  console.log('✅ Doctors (6)');

  // ─── 5. PATIENTS ─────────────────────────────────────────────────────────
  const patients = [
    { id: P1, userId: U_PAT1, fullName: 'Malika Toshmatova',    phone: '+998901000030', gender: 'FEMALE', birth: '1990-05-15', blood: 'B+', address: 'Toshkent, Chilonzor' },
    { id: P2, userId: U_PAT2, fullName: 'Bobur Xasanov',         phone: '+998901000031', gender: 'MALE',   birth: '1985-03-22', blood: 'A+', address: 'Toshkent, Yunusobod' },
    { id: P3, userId: null,   fullName: 'Gulnora Abdullayeva',   phone: '+998901100001', gender: 'FEMALE', birth: '1972-09-10', blood: 'O-', address: 'Toshkent, Sergeli' },
    { id: P4, userId: null,   fullName: 'Sherzod Nazarov',       phone: '+998901100002', gender: 'MALE',   birth: '1968-11-30', blood: 'AB+', address: 'Samarqand shahri' },
    { id: P5, userId: null,   fullName: 'Dilorom Yusupova',      phone: '+998901100003', gender: 'FEMALE', birth: '1995-07-04', blood: 'A-', address: 'Toshkent, Mirzo Ulugbek' },
    { id: P6, userId: null,   fullName: 'Akbar Mirzayev',        phone: '+998901100004', gender: 'MALE',   birth: '1955-01-18', blood: 'B-', address: 'Toshkent, Shayxontohur' },
    { id: P7, userId: null,   fullName: 'Oydin Rahimova',        phone: '+998901100005', gender: 'FEMALE', birth: '2000-12-25', blood: 'O+', address: 'Toshkent, Olmazor' },
    { id: P8, userId: null,   fullName: "Umid Qo'ziyev",         phone: '+998901100006', gender: 'MALE',   birth: '1978-06-08', blood: 'A+', address: 'Namangan shahri' },
  ];
  for (const p of patients) {
    await qr.query(
      `INSERT INTO patients (id, user_id, full_name, phone, gender, birth_date, blood_type, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.userId, p.fullName, p.phone, p.gender, p.birth, p.blood, p.address],
    );
  }
  console.log('✅ Patients (8)');

  // ─── 6. APPOINTMENTS ─────────────────────────────────────────────────────
  const now = new Date();
  const ago = (days: number) => new Date(now.getTime() - days * 86_400_000);
  const fwd = (days: number) => new Date(now.getTime() + days * 86_400_000);

  const appointments = [
    // Completed (past)
    { p: P1, d: DR1, c: C1, status: 'COMPLETED',  at: ago(10), reason: 'Onkologik tekshiruv' },
    { p: P3, d: DR1, c: C1, status: 'COMPLETED',  at: ago(8),  reason: "Ko'krak bezi tekshiruvi" },
    { p: P6, d: DR1, c: C1, status: 'COMPLETED',  at: ago(6),  reason: 'MRT natijalarini ko\'rish' },
    { p: P4, d: DR2, c: C1, status: 'COMPLETED',  at: ago(7),  reason: 'Yurak elektrokardiogramm' },
    { p: P2, d: DR2, c: C1, status: 'COMPLETED',  at: ago(5),  reason: 'Qon bosimi nazorati' },
    { p: P5, d: DR3, c: C1, status: 'COMPLETED',  at: ago(4),  reason: 'Bosh og\'riq tekshiruvi' },
    { p: P7, d: DR4, c: C1, status: 'COMPLETED',  at: ago(3),  reason: 'Bolalar profilaktika' },
    // Confirmed (today/tomorrow)
    { p: P1, d: DR1, c: C1, status: 'CONFIRMED',  at: fwd(1),  reason: 'Kimyoterapiya nazorati' },
    { p: P8, d: DR2, c: C1, status: 'CONFIRMED',  at: fwd(1),  reason: 'EKG tekshiruv' },
    { p: P3, d: DR3, c: C1, status: 'CONFIRMED',  at: fwd(2),  reason: 'Nevrologiya konsultatsiya' },
    // Pending
    { p: P4, d: DR1, c: C1, status: 'PENDING',    at: fwd(3),  reason: 'Onkologik nazorat' },
    { p: P5, d: DR4, c: C1, status: 'PENDING',    at: fwd(3),  reason: 'Bolalar vaksinatsiya' },
    { p: P6, d: DR2, c: C1, status: 'PENDING',    at: fwd(4),  reason: 'Xolesterin tekshiruvi' },
    { p: P7, d: DR3, c: C1, status: 'PENDING',    at: fwd(5),  reason: 'MRT natijalari muhokama' },
    { p: P2, d: DR5, c: C2, status: 'PENDING',    at: fwd(4),  reason: 'Ikkinchi fikr - onkologiya' },
    // In progress (simulated — set scheduled to past)
    { p: P8, d: DR1, c: C1, status: 'IN_PROGRESS', at: ago(0), reason: 'Biopsiya natijasi' },
    // No show / Cancelled
    { p: P6, d: DR4, c: C1, status: 'CANCELLED',  at: ago(2),  reason: 'Tibbiy kartochka yangilash' },
    { p: P3, d: DR2, c: C1, status: 'NO_SHOW',    at: ago(1),  reason: 'Qon taxlili natijasi' },
  ];
  for (const a of appointments) {
    await qr.query(
      `INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, status, scheduled_at, reason)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
      [a.p, a.d, a.c, a.status, a.at, a.reason],
    );
  }
  console.log('✅ Appointments (18)');

  // ─── 7. MEDICAL FILES + ONKO-AI DIAGNOSIS RESULTS ───────────────────────
  const onkoFiles = [
    {
      mfId: MF1, patId: P1, upId: U_DOC1, moduleSource: 'ONKO_AI', fileType: 'IMAGE',
      url: 'https://placehold.co/800x600/png?text=MRT+Tasviri+1',
      name: 'mrt_tasvir_p1_2026.jpg', mime: 'image/jpeg', size: 2_450_000,
      diagnosis: {
        aiSummary: 'MRT tasvirida o\'ng o\'pkada 1.2sm diametrli shubhali o\'choq aniqlandi. Perifokal infiltratsiya kuzatilmoqda. Zudlik bilan onkolog nazorati tavsiya etiladi.',
        confidence: 87.4,
        disease: 'O\'pka adenokarsinomasi (shubha)',
        riskLevel: 'HIGH',
        status: 'REVIEWED',
        reviewedBy: U_DOC1,
        doctorNotes: 'Bemor bilan suhbat o\'tkazildi. PET-KT tekshiruvi buyurildi.',
        recommendations: 'PET-KT tekshiruvi, bronxoskopiya, torakik xirurg konsultatsiyasi.',
        aiJson: {
          regions: [{ x: 234, y: 156, w: 48, h: 52, label: 'Shubhali o\'choq', confidence: 0.874 }],
          classification: 'MALIGNANT_SUSPICIOUS',
          model_version: 'onko-cnn-v3.1',
        },
      },
    },
    {
      mfId: MF2, patId: P3, upId: U_DOC1, moduleSource: 'ONKO_AI', fileType: 'IMAGE',
      url: 'https://placehold.co/800x600/png?text=Mammografiya+P3',
      name: 'mammografiya_p3.jpg', mime: 'image/jpeg', size: 1_890_000,
      diagnosis: {
        aiSummary: 'Chap ko\'krak bezida BIRADS-4 toifasiga mos keladigan 0.8sm giperdens o\'choq. Magnit-rezonans tomografiya tavsiya etiladi.',
        confidence: 79.2,
        disease: 'Ko\'krak bezi neoplaziyasi (BIRADS-4)',
        riskLevel: 'HIGH',
        status: 'CONFIRMED',
        reviewedBy: U_DOC1,
        doctorNotes: 'Biopsia natijalari kutilmoqda. Bemor monitoring ostiga olindi.',
        recommendations: 'Core-biopsy, mammolog konsultatsiyasi, 3 oyda takroriy tekshiruv.',
        aiJson: {
          birads_score: 4,
          mass_size_mm: 8,
          margin: 'spiculated',
          model_version: 'onko-cnn-v3.1',
        },
      },
    },
    {
      mfId: MF3, patId: P6, upId: U_DOC5, moduleSource: 'ONKO_AI', fileType: 'IMAGE',
      url: 'https://placehold.co/800x600/png?text=CT+Abdomen+P6',
      name: 'ct_abdomen_p6.jpg', mime: 'image/jpeg', size: 3_120_000,
      diagnosis: {
        aiSummary: 'Jigar parchasi IV-da 2.1sm gipervakulyarizatsiyalangan o\'choq. Gepartosellyulyar karsinoma ehtimoli o\'rtacha. AFP taxlili tavsiya etiladi.',
        confidence: 71.8,
        disease: 'Jigar o\'choqli jarohat (HCC shubha)',
        riskLevel: 'MEDIUM',
        status: 'REVIEWED',
        reviewedBy: U_DOC5,
        doctorNotes: 'AFP: 412 ng/mL — yuqori. Jigar xirurgi bilan maslahatlashildi.',
        recommendations: 'AFP, CA19-9 taxlili, jigar xirurgi konsultatsiyasi, TACE baholash.',
        aiJson: {
          lesion_size_mm: 21,
          segment: 'IV',
          enhancement_pattern: 'arterial_washout',
          model_version: 'onko-cnn-v3.1',
        },
      },
    },
    {
      mfId: MF4, patId: P4, upId: U_DOC1, moduleSource: 'ONKO_AI', fileType: 'IMAGE',
      url: 'https://placehold.co/800x600/png?text=PET-KT+P4',
      name: 'pet_kt_p4.jpg', mime: 'image/jpeg', size: 4_200_000,
      diagnosis: {
        aiSummary: 'Ekzofitik o\'sish bilan birga FDG-PET da SUVmax=6.8 bo\'lgan mediastinal limfa tugunlari gipermetabolizmi. Limfoma ehtimoli baland.',
        confidence: 91.3,
        disease: 'Mediastinal limfoma (Xodgkin shubha)',
        riskLevel: 'CRITICAL',
        status: 'CONFIRMED',
        reviewedBy: U_DOC1,
        doctorNotes: 'ABVD protokoli boshlandi. Gematolог-onkolog jamoasi bilan muvofiqlashtirildi.',
        recommendations: 'Suyak iligi biopsiyasi, ABVD kimyoterapiyasi, radioterapiya baholash.',
        aiJson: {
          suv_max: 6.8,
          affected_nodes: ['paratraheal', 'subcarinal', 'hilar'],
          stage_suggestion: 'II-III',
          model_version: 'onko-cnn-v3.1',
        },
      },
    },
    {
      mfId: MF5, patId: P7, upId: U_DOC1, moduleSource: 'ONKO_AI', fileType: 'IMAGE',
      url: 'https://placehold.co/800x600/png?text=Teri+Dermoskopiya+P7',
      name: 'dermoskopiya_p7.jpg', mime: 'image/jpeg', size: 980_000,
      diagnosis: {
        aiSummary: 'Chap yelkada A-B-C-D qoidasiga ko\'ra yuqori xavfli pigment o\'chog\'i (ABCD score: 7.4). Melanoma shubhasi. Dermatolog zudlik bilan ko\'rsin.',
        confidence: 83.6,
        disease: 'Melanoma in situ (shubha)',
        riskLevel: 'HIGH',
        status: 'PENDING',
        reviewedBy: null,
        doctorNotes: null,
        recommendations: 'Dermatolog konsultatsiyasi, ekzision biopsy, Sentinel node biopsy.',
        aiJson: {
          abcd_score: 7.4,
          asymmetry: true,
          irregular_border: true,
          multicolor: true,
          diameter_mm: 7,
          model_version: 'onko-cnn-v3.1',
        },
      },
    },
  ];

  for (const f of onkoFiles) {
    await qr.query(
      `INSERT INTO medical_files (id, patient_id, uploaded_by_id, file_url, original_name, mime_type, file_size, "fileType", module_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [f.mfId, f.patId, f.upId, f.url, f.name, f.mime, f.size, f.fileType, f.moduleSource],
    );
    const d = f.diagnosis;
    await qr.query(
      `INSERT INTO diagnosis_results
         (id, medical_file_id, ai_summary, confidence_score, disease_detected, risk_level, ai_response_json,
          recommendations, status, reviewed_by_doctor_id, doctor_notes, reviewed_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        f.mfId, d.aiSummary, d.confidence, d.disease, d.riskLevel,
        JSON.stringify(d.aiJson), d.recommendations, d.status,
        d.reviewedBy, d.doctorNotes,
        d.reviewedBy ? new Date(Date.now() - Math.random() * 5 * 86_400_000) : null,
      ],
    );
  }
  console.log('✅ Onko-AI: medical_files (5) + diagnosis_results (5)');

  // ─── 8. MEDICAL FILES + DOC-DIGITIZER ───────────────────────────────────
  const digiFiles = [
    {
      mfId: MF_D1, patId: P1, upId: U_REC1,
      url: 'https://placehold.co/800x1100/png?text=Tibbiy+Yo\'llanma+P1',
      name: 'yollanma_p1.pdf', mime: 'application/pdf', size: 420_000,
      status: 'COMPLETED',
      rawText: `TIBBIY YO'LLANMA\nBemor: Malika Toshmatova\nTug'ilgan sana: 15.05.1990\nTashxis: J18.0 Pnevmoniya\nYo'naltirilgan muassasa: Toshkent Tibbiyot Instituti\nSana: 12.06.2026\nShifokor: Dr. N. Yusupova`,
      extractedData: {
        document_type: "Tibbiy yo'llanma",
        patient_name: 'Malika Toshmatova',
        birth_date: '15.05.1990',
        icd_code: 'J18.0',
        diagnosis: 'Pnevmoniya',
        referred_to: 'Toshkent Tibbiyot Instituti',
        date: '12.06.2026',
        doctor: 'Dr. N. Yusupova',
        confidence: 0.96,
      },
    },
    {
      mfId: MF_D2, patId: P4, upId: U_REC1,
      url: 'https://placehold.co/800x1100/png?text=Retsept+P4',
      name: 'retsept_p4.jpg', mime: 'image/jpeg', size: 310_000,
      status: 'COMPLETED',
      rawText: `RETSEPT №A-20248\nBemor: Sherzod Nazarov, 1968 y.t.\nPreparatlar:\n1. Metformin 500mg - kuniga 2 marta\n2. Atorvastatin 20mg - kechqurun 1 dona\n3. Aspirin 100mg - ertalab 1 dona\nMuddat: 30 kun\nSana: 08.06.2026`,
      extractedData: {
        document_type: 'Retsept',
        prescription_number: 'A-20248',
        patient_name: 'Sherzod Nazarov',
        birth_year: 1968,
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'kuniga 2 marta', duration: '30 kun' },
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'kechqurun 1 dona', duration: '30 kun' },
          { name: 'Aspirin', dosage: '100mg', frequency: 'ertalab 1 dona', duration: '30 kun' },
        ],
        date: '08.06.2026',
        confidence: 0.94,
      },
    },
    {
      mfId: MF_D3, patId: P3, upId: U_DOC1,
      url: 'https://placehold.co/800x1100/png?text=Lab+Taxlil+P3',
      name: 'lab_taxlil_p3.pdf', mime: 'application/pdf', size: 280_000,
      status: 'COMPLETED',
      rawText: `QON TAHLILI NATIJASI\nBemor: Gulnora Abdullayeva\nSana: 05.06.2026\nLaboratoriya: Toshkent Tibbiyot Markazi\n\nEritmalar: 3.9 x10^12/l (Nm: 3.8-5.1)\nHemoglobin: 102 g/l (Nm: 120-160) ↓ PAST\nLeykositlar: 11.2 x10^9/l (Nm: 4.0-9.0) ↑ YUQORI\nTrombositlar: 156 x10^9/l (Nm: 150-400)\nESR: 42 mm/soat (Nm: 2-15) ↑ YUQORI\nCRP: 28.4 mg/l (Nm: <5) ↑ YUQORI`,
      extractedData: {
        document_type: 'Qon tahlili',
        patient_name: 'Gulnora Abdullayeva',
        date: '05.06.2026',
        lab_name: 'Toshkent Tibbiyot Markazi',
        results: {
          erythrocytes: { value: 3.9, unit: 'x10^12/l', normal: '3.8-5.1', status: 'normal' },
          hemoglobin: { value: 102, unit: 'g/l', normal: '120-160', status: 'low' },
          leukocytes: { value: 11.2, unit: 'x10^9/l', normal: '4.0-9.0', status: 'high' },
          platelets: { value: 156, unit: 'x10^9/l', normal: '150-400', status: 'normal' },
          esr: { value: 42, unit: 'mm/soat', normal: '2-15', status: 'high' },
          crp: { value: 28.4, unit: 'mg/l', normal: '<5', status: 'high' },
        },
        anomalies: ['Anemiya', 'Leykositoz', 'Yallig\'lanish'],
        confidence: 0.97,
      },
    },
    {
      mfId: MF_D4, patId: P2, upId: U_REC2,
      url: 'https://placehold.co/800x1100/png?text=Kasallik+Tarixi+P2',
      name: 'kasallik_tarixi_p2.pdf', mime: 'application/pdf', size: 890_000,
      status: 'COMPLETED',
      rawText: `KASALLIK TARIXI\nBemor: Bobur Xasanov, 1985 y.t.\nQabul sanasi: 01.06.2026\nChiqish sanasi: 07.06.2026\nAsosiy tashxis: I25.1 Aterosklerotik yurak kasalligi\nQo'shimcha: E11.2 2-toifa cukurli diabet\nO'tkazilgan amaliyot: Koronar angiografiya\nMuolaja: Metoprolol, Clopidogrel, Atorvastatin\nHolati: Yaxshilangan, ambulatoriya kuzatuviga yo'naltirildi`,
      extractedData: {
        document_type: 'Kasallik tarixi',
        patient_name: 'Bobur Xasanov',
        birth_year: 1985,
        admission_date: '01.06.2026',
        discharge_date: '07.06.2026',
        diagnoses: [
          { icd: 'I25.1', description: 'Aterosklerotik yurak kasalligi', type: 'primary' },
          { icd: 'E11.2', description: '2-toifa cukurli diabet', type: 'secondary' },
        ],
        procedures: ['Koronar angiografiya'],
        medications: ['Metoprolol', 'Clopidogrel', 'Atorvastatin'],
        discharge_status: 'Yaxshilangan',
        confidence: 0.93,
      },
    },
  ];

  for (const f of digiFiles) {
    await qr.query(
      `INSERT INTO medical_files (id, patient_id, uploaded_by_id, file_url, original_name, mime_type, file_size, "fileType", module_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [f.mfId, f.patId, f.upId, f.url, f.name, f.mime, f.size, 'PDF', 'DOC_DIGITIZER'],
    );
    await qr.query(
      `INSERT INTO digitized_documents (id, original_file_id, extracted_data_json, raw_text, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
      [f.mfId, JSON.stringify(f.extractedData), f.rawText, f.status],
    );
  }
  console.log('✅ Doc-Digitizer: medical_files (4) + digitized_documents (4)');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('\n🔑 Login ma\'lumotlari:');
  console.log('   admin@mederp.uz   / Admin123!  — SUPER_ADMIN');
  console.log('   alisher@mederp.uz / Admin123!  — CLINIC_ADMIN (C1)');
  console.log('   dilnoza@mederp.uz / Admin123!  — CLINIC_ADMIN (C2)');
  console.log('   nodira@mederp.uz  / Doctor123! — DOCTOR (Onkolog)');
  console.log('   sardor@mederp.uz  / Doctor123! — DOCTOR (Kardiolog)');
  console.log('   jasur@mederp.uz   / Admin123!  — RECEPTIONIST');
  console.log('   malika@mederp.uz  / Admin123!  — PATIENT');
  console.log('   bobur@mederp.uz   / Admin123!  — PATIENT');

  await AppDataSource.destroy();
}

seed().catch((err) => { console.error('❌ Seed xatosi:', err); process.exit(1); });
