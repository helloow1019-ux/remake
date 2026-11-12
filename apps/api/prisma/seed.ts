import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/env.js';

const prisma = new PrismaClient();

const FACTOR_SOURCE =
  'Illustrative default — replace with cited value (e.g., EPA WARM / DEFRA / ecoinvent) before presenting';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Settings
  const settings = [
    { key: 'whatsapp_number', value: '923000000000' },
    { key: 'instagram_url', value: 'https://instagram.com/remake_pk' },
    { key: 'site_name', value: 'ReMake' },
    { key: 'scan_daily_quota', value: '30' },
    { key: 'scan_hourly_quota', value: '10' },
    { key: 'kiosk_lock', value: 'false' },
    { key: 'reuse_displacement', value: '0.5' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }
  console.log('✅ Settings seeded');

  // 2. Seed Admin User
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    create: {
      email: env.ADMIN_EMAIL,
      name: 'ReMake Admin',
      passwordHash,
      role: 'ADMIN',
      isGuest: false,
      locale: 'en',
    },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user seeded (${env.ADMIN_EMAIL})`);

  // 3. Seed Waste Types
  const wasteTypesData = [
    { slug: 'plastic-bottle', nameEn: 'Plastic bottle', nameUr: 'پلاسٹک کی بوتل', icon: 'bottle', gramsPerPiece: 20, co2PerKg: 2.3, sortOrder: 1 },
    { slug: 'bottle-cap', nameEn: 'Bottle cap', nameUr: 'بوتل کا ڈھکن', icon: 'cap', gramsPerPiece: 2, co2PerKg: 2.0, sortOrder: 2 },
    { slug: 'food-scraps', nameEn: 'Food scraps', nameUr: 'کھانے کا بچا ہوا', icon: 'apple', gramsPerPiece: 100, co2PerKg: 0.6, sortOrder: 3 },
    { slug: 'old-cloth', nameEn: 'Old cloth', nameUr: 'پرانا کپڑا', icon: 'shirt', gramsPerPiece: 150, co2PerKg: 5.0, sortOrder: 4 },
    { slug: 'cardboard', nameEn: 'Cardboard', nameUr: 'گتہ', icon: 'box', gramsPerPiece: 80, co2PerKg: 1.0, sortOrder: 5 },
    { slug: 'glass-jar', nameEn: 'Glass jar', nameUr: 'شیشے کا جار', icon: 'jar', gramsPerPiece: 250, co2PerKg: 0.9, sortOrder: 6 },
    { slug: 'tin-can', nameEn: 'Tin can', nameUr: 'ٹین کا ڈبہ', icon: 'can', gramsPerPiece: 60, co2PerKg: 2.0, sortOrder: 7 },
    { slug: 'paper-newspaper', nameEn: 'Paper & newspaper', nameUr: 'کاغذ اور اخبار', icon: 'newspaper', gramsPerPiece: 50, co2PerKg: 1.1, sortOrder: 8 },
    { slug: 'plastic-bag', nameEn: 'Plastic bag (shopper)', nameUr: 'شاپر', icon: 'bag', gramsPerPiece: 8, co2PerKg: 2.0, sortOrder: 9 },
    { slug: 'tetra-pack', nameEn: 'Tetra pack', nameUr: 'ٹیٹرا پیک', icon: 'tetra', gramsPerPiece: 25, co2PerKg: 1.1, sortOrder: 10 },
    { slug: 'other', nameEn: 'Other waste', nameUr: 'متفرق کچرا', icon: 'sparkles', gramsPerPiece: 50, co2PerKg: 1.0, sortOrder: 99 },
  ];

  const wasteTypeMap = new Map<string, string>();
  for (const wt of wasteTypesData) {
    const record = await prisma.wasteType.upsert({
      where: { slug: wt.slug },
      create: {
        slug: wt.slug,
        nameEn: wt.nameEn,
        nameUr: wt.nameUr,
        icon: wt.icon,
        gramsPerPiece: wt.gramsPerPiece,
        co2PerKg: wt.co2PerKg,
        factorSource: FACTOR_SOURCE,
        sortOrder: wt.sortOrder,
        active: true,
      },
      update: {
        nameEn: wt.nameEn,
        nameUr: wt.nameUr,
        gramsPerPiece: wt.gramsPerPiece,
        co2PerKg: wt.co2PerKg,
      },
    });
    wasteTypeMap.set(wt.slug, record.id);
  }
  console.log('✅ 11 Waste types seeded');

  // 4. Seed Badges
  const badgesData = [
    {
      key: 'first-make',
      nameEn: 'First Make',
      nameUr: 'پہلا تجربہ',
      descriptionEn: 'Completed your first reuse project',
      descriptionUr: 'آپ نے اپنا پہلا ری سائیکل پروجیکٹ مکمل کیا',
      icon: 'sparkles',
    },
    {
      key: 'five-makes',
      nameEn: 'Master Maker',
      nameUr: 'ماہر کاریگر',
      descriptionEn: 'Completed 5 reuse projects',
      descriptionUr: 'آپ نے 5 ری سائیکل پروجیکٹس مکمل کیے',
      icon: 'trophy',
    },
    {
      key: 'streak-3',
      nameEn: 'Green Streak',
      nameUr: 'مسلسل تخلیق',
      descriptionEn: 'Logged activity 3 days in a row',
      descriptionUr: 'مسلسل 3 دن گرین ایکشن ریکارڈ کیا',
      icon: 'flame',
    },
    {
      key: 'one-kg-club',
      nameEn: '1 kg Club',
      nameUr: 'ایک کلو کلب',
      descriptionEn: 'Kept 1 kg of waste out of landfills',
      descriptionUr: 'کچرے کے ڈھیر سے 1 کلو کچرا بچایا',
      icon: 'scale',
    },
    {
      key: 'bottle-hero',
      nameEn: 'Bottle Hero',
      nameUr: 'بوتل ہیرو',
      descriptionEn: 'Repurposed equivalent of 10 plastic bottles',
      descriptionUr: '10 پلاسٹک کی بوتلوں کے برابر کچرا روکا',
      icon: 'award',
    },
    {
      key: 'cloth-saver',
      nameEn: 'Cloth Saver',
      nameUr: 'کپڑا بچاؤ',
      descriptionEn: 'Saved at least 500g of textile waste',
      descriptionUr: '500 گرام کپڑے کا فضلہ بچایا',
      icon: 'shirt',
    },
    {
      key: 'sharing-is-caring',
      nameEn: 'Sharing is Caring',
      nameUr: 'شراکت داری',
      descriptionEn: 'Had a make photo approved for the community wall',
      descriptionUr: 'آپ کی تصویر کمیونٹی وال کے لیے منظور ہوئی',
      icon: 'camera',
    },
    {
      key: 'scanner',
      nameEn: 'Visionary',
      nameUr: 'نگہبان',
      descriptionEn: 'Scanned your first waste item with ReMake Vision',
      descriptionUr: 'پہلی بار ReMake کے ذریعے کچرے کو اسکین کیا',
      icon: 'scan',
    },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { key: b.key },
      create: b,
      update: b,
    });
  }
  console.log('✅ 8 Badges seeded');

  // 5. Seed Products (4)
  const productsData = [
    {
      slug: 'bottle-cap-keychain',
      nameEn: 'Bottle Cap Keychain',
      nameUr: 'بوتل کے ڈھکن کا کی چین',
      descriptionEn: 'Upcycled durable keychain made from melted and stamped bottle caps with brass ring.',
      pricePkr: 250,
      image: '/seed/product-cap-keychain.jpg',
      wasteTypeSlugs: 'bottle-cap',
      wasteGrams: 18,
      co2SavedG: 18,
      sortOrder: 1,
    },
    {
      slug: 'letter-keychain',
      nameEn: 'Letter Keychain from Caps',
      nameUr: 'حروف والا کی چین',
      descriptionEn: 'Personalised alphabet initial keychain pressed from colourful sorted plastic bottle caps.',
      pricePkr: 300,
      image: '/seed/product-letter-keychain.jpg',
      wasteTypeSlugs: 'bottle-cap',
      wasteGrams: 24,
      co2SavedG: 24,
      sortOrder: 2,
    },
    {
      slug: 'bottle-bottom-coaster-set',
      nameEn: 'Bottle-Bottom Coaster Set (4-pack)',
      nameUr: 'پلاسٹک کوسٹر سیٹ',
      descriptionEn: 'Set of 4 interlocking coasters pressed from heat-formed bottle caps and recycled plastic.',
      pricePkr: 400,
      image: '/seed/product-coasters.jpg',
      wasteTypeSlugs: 'bottle-cap',
      wasteGrams: 80,
      co2SavedG: 92,
      sortOrder: 3,
    },
    {
      slug: 'mini-planter',
      nameEn: 'Self-Watering Mini Planter',
      nameUr: 'سیلف واٹرنگ پلانٹر',
      descriptionEn: 'Clever two-piece indoor herb planter crafted from inverted half-liter drink bottles.',
      pricePkr: 350,
      image: '/seed/product-planter.jpg',
      wasteTypeSlugs: 'plastic-bottle',
      wasteGrams: 40,
      co2SavedG: 46,
      sortOrder: 4,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }
  console.log('✅ 4 Products seeded');

  // 6. Seed 12 Ideas
  const ideasData = [
    // Tested 1: Bottle Cap Keychain
    {
      slug: 'bottle-cap-keychain',
      status: 'TESTED',
      published: true,
      titleEn: 'Bottle Cap Keychain',
      titleUr: 'بوتل کے ڈھکن کا کی چین',
      summaryEn: 'Melt, press and bind discarded plastic bottle caps into stylish, colourful geometric keychains.',
      summaryUr: 'پلاسٹک کے ڈھکنوں کو گرم کر کے خوبصورت اور پائیدار کی چین بنائیں۔',
      difficulty: 1,
      timeMinutes: 25,
      costPkr: 40,
      sellPricePkr: 250,
      safetyNoteEn: 'Wear gloves and use parchment paper when heating plastic. Work in a well-ventilated room.',
      safetyNoteUr: 'پلاسٹک گرم کرتے وقت دستانے پہنیں اور کھلی ہوا میں کام کریں۔',
      coverImage: '/seed/idea-bottle-cap-keychain.jpg',
      isSampleData: true,
      waste: [{ slug: 'bottle-cap', pieces: 9, grams: 18 }],
      materials: [
        { nameEn: 'Clean plastic bottle caps', nameUr: 'صاف بوتل کے ڈھکن', quantity: '9 caps', isWaste: true },
        { nameEn: 'Parchment paper', nameUr: 'بیکنگ پیپر', quantity: '2 sheets', isWaste: false },
        { nameEn: 'Metal split ring with chain', nameUr: 'کی چین کا رنگ', quantity: '1 piece', isWaste: false },
      ],
      tools: [
        { nameEn: 'Household iron or heat press', nameUr: 'استری' },
        { nameEn: 'Hand drill or heated nail (adult supervision)', nameUr: 'سوراخ کرنے کا اوزار' },
        { nameEn: 'Heat-resistant work mat', nameUr: 'حفاظتی پیڈ' },
      ],
      steps: [
        {
          position: 1,
          textEn: 'Sort 9 bottle caps by matching or contrasting colours, then rinse and dry thoroughly.',
          textUr: '9 ڈھکنوں کو دھو کر اچھی طرح خشک کر لیں اور رنگوں کی ترتیب دیں۔',
          tipEn: 'HDPE caps with recycle symbol 2 melt cleanly.',
          imageUrl: '/seed/step-caps-sort.jpg',
        },
        {
          position: 2,
          textEn: 'Sandwich the arranged caps between two sheets of baking parchment on a flat, heat-safe surface.',
          textUr: 'ڈھکنوں کو بیکنگ پیپر کے درمیان رکھیں تاکہ استری چپکے نہیں۔',
          timerSeconds: 120,
          imageUrl: '/seed/step-iron.jpg',
        },
        {
          position: 3,
          textEn: 'Apply medium heat with an iron for 2 minutes in circular motions until caps fuse into a solid puck.',
          textUr: 'استری کو درمیانی آنچ پر 2 منٹ تک آہستہ آہستہ گھمائیں جب تک وہ آپس میں جڑ نہ جائیں۔',
          timerSeconds: 120,
        },
        {
          position: 4,
          textEn: 'Let cool under a flat heavy book for 5 minutes, then puncture a hole 5mm from the edge.',
          textUr: 'کسی وزنی کتاب کے نیچے 5 منٹ ٹھنڈا ہونے دیں، پھر اوپر ایک چھوٹا سوراخ کریں۔',
          timerSeconds: 300,
        },
        {
          position: 5,
          textEn: 'Attach the metal split ring through the hole and test ring tension.',
          textUr: 'سوراخ میں کی رنگ پرو دیں، آپ کا خوبصورت کی چین تیار ہے!',
        },
      ],
    },

    // Tested 2: Letter Keychain from Caps
    {
      slug: 'letter-keychain',
      status: 'TESTED',
      published: true,
      titleEn: 'Letter Keychain from Caps',
      titleUr: 'حروف والا کی چین',
      summaryEn: 'Custom initial keychain molded from molten sorted bottle caps. Great gift or campus stall seller.',
      summaryUr: 'رنگ برنگے ڈھکنوں سے اپنے نام کے پہلے حرف کا ذاتی کی چین بنائیں۔',
      difficulty: 1,
      timeMinutes: 30,
      costPkr: 50,
      sellPricePkr: 300,
      safetyNoteEn: 'Careful with cookie cutters and hot plastic. Use tweezers to handle hot molds.',
      safetyNoteUr: 'گرم پلاسٹک اور کٹر استعمال کرتے وقت احتیاط برتیں۔',
      coverImage: '/seed/idea-letter-keychain.jpg',
      isSampleData: true,
      waste: [{ slug: 'bottle-cap', pieces: 12, grams: 24 }],
      materials: [
        { nameEn: 'Plastic bottle caps', nameUr: 'پلاسٹک کے ڈھکن', quantity: '12 caps', isWaste: true },
        { nameEn: 'Metal alphabet cookie cutter', nameUr: 'دھاتی حرفی سانچہ', quantity: '1 letter', isWaste: false },
        { nameEn: 'Keychain jump ring', nameUr: 'کی چین کی زنجیر', quantity: '1', isWaste: false },
      ],
      tools: [
        { nameEn: 'Iron or toaster oven (dedicated craft)', nameUr: 'استری' },
        { nameEn: 'Pliers and heat gloves', nameUr: 'چمٹا اور دستانے' },
      ],
      steps: [
        { position: 1, textEn: 'Chop bottle caps into small 5mm flakes using heavy kitchen shears.', textUr: 'ڈھکنوں کو قینچی سے چھوٹے چھوٹے ٹکڑوں میں کاٹ لیں۔' },
        { position: 2, textEn: 'Fill the metal letter mold evenly with colourful plastic flakes over parchment paper.', textUr: 'حرفی سانچے کو پلاسٹک کے ٹکڑوں سے بھر دیں۔' },
        { position: 3, textEn: 'Heat from above through parchment paper until the plastic softens and fills the mold corners.', textUr: 'سانچے پر بیکنگ پیپر رکھ کر استری سے نرم کریں۔', timerSeconds: 180 },
        { position: 4, textEn: 'Press firmly with a wood block, allow to cool completely, and gently pop the letter out.', textUr: 'لکڑی کے ٹکڑے سے دبا کر مکمل ٹھنڈا ہونے دیں پھر باہر نکالیں۔' },
      ],
    },

    // Tested 3: Bottle-Bottom Flower Coaster
    {
      slug: 'bottle-bottom-coaster',
      status: 'TESTED',
      published: true,
      titleEn: 'Bottle-Bottom Flower Coaster',
      titleUr: 'پلاسٹک کے پھول والے کوسٹرز',
      summaryEn: 'Cut the 5-petal fluted bottom of clean soda bottles and heat-seal the edges for waterproof table coasters.',
      summaryUr: 'سافٹ ڈرنک کی بوتلوں کے نچلے حصے سے واٹر پروف اور دیدہ زیب کوسٹرز بنائیں۔',
      difficulty: 1,
      timeMinutes: 15,
      costPkr: 20,
      sellPricePkr: 150,
      safetyNoteEn: 'Careful with cut plastic edges until smoothed on an iron soleplate. Keep fingers away from heat.',
      safetyNoteUr: 'بوتل کاٹتے وقت تیز کناروں سے ہوشیار رہیں۔ استری پر ہلکا سا گھما کر کنارے ہموار کریں۔',
      coverImage: '/seed/idea-coaster.jpg',
      isSampleData: true,
      waste: [{ slug: 'plastic-bottle', pieces: 1, grams: 20 }],
      materials: [
        { nameEn: 'PET soda bottle (1.5L or 500ml)', nameUr: 'پلاسٹک کی بڑی یا چھوٹی بوتل', quantity: '1 bottle', isWaste: true },
        { nameEn: 'Acrylic paint or Posca marker', nameUr: 'رنگ یا مارکر', quantity: 'optional', isWaste: false },
        { nameEn: 'Self-adhesive felt dots', nameUr: 'فیلٹ پیڈز', quantity: '4 dots', isWaste: false },
      ],
      tools: [
        { nameEn: 'Utility craft knife', nameUr: 'کٹر' },
        { nameEn: 'Sharp kitchen scissors', nameUr: 'قینچی' },
        { nameEn: 'Household iron on medium heat', nameUr: 'استری' },
      ],
      steps: [
        { position: 1, textEn: 'Mark 2.5 cm from the base of the bottle with a dry-erase marker.', textUr: 'بوتل کے پیندے سے ڈھائی سینٹی میٹر اوپر گول لکیر لگائیں۔' },
        { position: 2, textEn: 'Carefully puncture and cut away the base with craft scissors along the line.', textUr: 'قینچی سے نشان کے مطابق پیندہ کاٹ کر الگ کر لیں۔' },
        { position: 3, textEn: 'Press the cut rim flat against a warm iron (wool setting) for 3 seconds to curl the edge smooth.', textUr: 'کنارے کو گرم استری پر 3 سیکنڈ تک گھمائیں تاکہ کنارے نرم اور گول ہو جائیں۔', timerSeconds: 10 },
        { position: 4, textEn: 'Paint the underside inside the grooves with colourful floral patterns, and add felt feet.', textUr: 'اندر کی طرف اپنی پسند کا ڈیزائن بنائیں اور نیچے ربڑ کے پیڈ لگا لیں۔' },
      ],
    },

    // Tested 4: Bottle Planter
    {
      slug: 'bottle-planter',
      status: 'TESTED',
      published: true,
      titleEn: 'Self-Watering Bottle Planter',
      titleUr: 'سیلف واٹرنگ بوتل پلانٹر',
      summaryEn: 'Two-tier hydroponic/soil planter that draws water via cotton wick. Perfect for kitchen herbs like mint and coriander.',
      summaryUr: 'پلاسٹک بوتل سے خود بخود پانی کھینچنے والا خوبصورت پودوں کا گملہ۔',
      difficulty: 1,
      timeMinutes: 20,
      costPkr: 30,
      sellPricePkr: 200,
      safetyNoteEn: 'Adult supervision when piercing the bottle cap. Smooth sharp cut edges with sandpaper.',
      safetyNoteUr: 'ڈھکن میں سوراخ کرتے وقت احتیاط کریں تاکہ ہاتھ پر چوٹ نہ لگے۔',
      coverImage: '/seed/idea-planter.jpg',
      isSampleData: true,
      waste: [
        { slug: 'plastic-bottle', pieces: 1, grams: 20 },
        { slug: 'bottle-cap', pieces: 1, grams: 2 },
      ],
      materials: [
        { nameEn: 'Empty 1.5L plastic drink bottle with cap', nameUr: 'پلاسٹک بوتل مع ڈھکن', quantity: '1', isWaste: true },
        { nameEn: 'Cotton string or fabric strip', nameUr: 'سوتی دھاگہ یا پٹی', quantity: '20 cm', isWaste: true },
        { nameEn: 'Potting soil and seeds (mint / chilli)', nameUr: 'مٹی اور بیج', quantity: '1 cup', isWaste: false },
      ],
      tools: [
        { nameEn: 'Scissors or craft knife', nameUr: 'قینچی' },
        { nameEn: 'Awl, nail or drill bit for cap hole', nameUr: 'سوراخ کرنے والا کیل' },
      ],
      steps: [
        { position: 1, textEn: 'Cut the plastic bottle into two halves roughly 12 cm from the neck.', textUr: 'بوتل کو اوپر سے ایک تہائی حصے پر کاٹ کر دو حصوں میں تقسیم کریں۔' },
        { position: 2, textEn: 'Drill or pierce a 5mm hole through the center of the bottle cap.', textUr: 'بوتل کے ڈھکن کے بیچ میں ایک سوراخ بنائیں۔' },
        { position: 3, textEn: 'Thread the cotton strip halfway through the cap and screw the cap back on the neck.', textUr: 'سوتی پٹی کو سوراخ میں پروئیں اور ڈھکن بوتل پر کس دیں۔' },
        { position: 4, textEn: 'Invert the top half into the bottom base, fill base with water and top with moist soil.', textUr: 'اوپری حصے کو الٹا کر کے نچلے حصے میں رکھیں، نیچے پانی اور اوپر مٹی بھر کر پودا لگائیں۔' },
      ],
    },

    // Untested 5: Cloth Scrap Pouch
    {
      slug: 'cloth-scrap-pouch',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Cloth Scrap Zipper Pouch',
      titleUr: 'پرانے کپڑے کا زپ پاؤچ',
      summaryEn: 'Stitch remnants of denim or worn cotton shirts into a durable pencil case or makeup pouch.',
      summaryUr: 'پرانی جینز یا قمیض کے ٹکڑوں سے پنسل اور سامان رکھنے کا پاؤچ بنائیں۔',
      difficulty: 2,
      timeMinutes: 45,
      costPkr: 60,
      sellPricePkr: 250,
      safetyNoteEn: 'Careful with sewing needles and fabric scissors.',
      safetyNoteUr: 'سوئی اور قینچی احتیاط سے استعمال کریں۔',
      coverImage: '/seed/idea-pouch.jpg',
      waste: [{ slug: 'old-cloth', pieces: 1, grams: 150 }],
      materials: [
        { nameEn: 'Scrap cotton or denim fabric', nameUr: 'پرانے کپڑے کے ٹکڑے', quantity: '2 pieces 22x15cm', isWaste: true },
        { nameEn: 'Nylon zipper', nameUr: 'زپ', quantity: '20 cm', isWaste: false },
        { nameEn: 'Sewing thread', nameUr: 'دھاگہ', quantity: '1 spool', isWaste: false },
      ],
      tools: [{ nameEn: 'Sewing needle or machine', nameUr: 'سوئی یا مشین' }, { nameEn: 'Fabric scissors', nameUr: 'قینچی' }],
      steps: [
        { position: 1, textEn: 'Cut two matching rectangular fabric pieces from clean old trousers or shirts.', textUr: 'کپڑے سے دو برابر مستطیل ٹکڑے کاٹیں۔' },
        { position: 2, textEn: 'Pin the zipper face-down to the top edge of the first fabric rectangle and stitch.', textUr: 'زپ کو کپڑے کے کنارے پر رکھ کر سلائی کریں۔' },
        { position: 3, textEn: 'Attach the second fabric piece to the opposite side of the zipper.', textUr: 'دوسرے ٹکڑے کو زپ کی دوسری طرف سلائی کریں۔' },
        { position: 4, textEn: 'Open zipper halfway, fold right sides together, and stitch the remaining three outer edges.', textUr: 'زپ آدھی کھول کر باقی تینوں طرف سلائی کریں اور سیدھا کر لیں۔' },
      ],
    },

    // Untested 6: Cardboard Desk Organizer
    {
      slug: 'cardboard-desk-organizer',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Modular Cardboard Desk Caddy',
      titleUr: 'کارڈ بورڈ ڈیسک آرگنائزر',
      summaryEn: 'Slot together corrugated delivery boxes into tidy tiered compartments for pens, notes, and cables.',
      summaryUr: 'ڈلیوری والے گتے کے ڈبوں سے میز پر سامان رکھنے کا خوبصورت شیلف بنائیں۔',
      difficulty: 1,
      timeMinutes: 40,
      costPkr: 30,
      sellPricePkr: 200,
      safetyNoteEn: 'Always cut away from yourself when scoring cardboard with a craft knife.',
      safetyNoteUr: 'گتے کو کٹر سے کاٹتے وقت انگلیوں کا خاص خیال رکھیں۔',
      coverImage: '/seed/idea-organizer.jpg',
      waste: [{ slug: 'cardboard', pieces: 2, grams: 160 }],
      materials: [
        { nameEn: 'Corrugated delivery box cardboard', nameUr: 'گتے کے ڈبے', quantity: '2 medium boxes', isWaste: true },
        { nameEn: 'PVA craft glue or glue stick', nameUr: 'گلو', quantity: '50 ml', isWaste: false },
        { nameEn: 'Patterned scrap paper or paint', nameUr: 'رنگین کاغذ', quantity: 'optional', isWaste: true },
      ],
      tools: [{ nameEn: 'Steel ruler', nameUr: 'فٹہ' }, { nameEn: 'Craft knife', nameUr: 'کٹر' }, { nameEn: 'Pencil', nameUr: 'پنسل' }],
      steps: [
        { position: 1, textEn: 'Measure and cut a base tray (20x15cm) and three back walls of descending heights.', textUr: 'گتے پر بنیادی بیس اور مختلف اونچائی کی دیواروں کے نشان لگا کر کاٹیں۔' },
        { position: 2, textEn: 'Score shallow fold lines for the dividers to create tiered stairs.', textUr: 'درمیانی خانوں کے لیے ہلکی کریز ڈالیں۔' },
        { position: 3, textEn: 'Apply PVA glue along bottom edges and firmly secure partitions to the base.', textUr: 'گلو لگا کر خانوں کو مضبوطی سے بیس کے ساتھ چپکا دیں۔' },
        { position: 4, textEn: 'Wrap exposed edges in brown kraft paper or paint in earthy tones.', textUr: 'کناروں پر خوبصورت کاغذ لگا کر فنشنگ دیں۔' },
      ],
    },

    // Untested 7: Kitchen Compost Starter
    {
      slug: 'kitchen-compost-starter',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Odorless Kitchen Compost Bin',
      titleUr: 'کچن کمپوسٹ بن',
      summaryEn: 'Turn vegetable peelings and coffee grounds into rich organic compost using a layered bucket system.',
      summaryUr: 'سبزیوں کے چھلکوں اور کھانے کے فضلے سے کھاد بنانے کا آسان گھریلو طریقہ۔',
      difficulty: 1,
      timeMinutes: 20,
      costPkr: 20,
      sellPricePkr: null,
      safetyNoteEn: 'Do not add meat, dairy, or oily cooked food to prevent odors and pests.',
      safetyNoteUr: 'گوشت، تیل اور دودھ والی اشیاء شامل نہ کریں تاکہ بدبو نہ آئے۔',
      coverImage: '/seed/idea-compost.jpg',
      waste: [
        { slug: 'food-scraps', pieces: 5, grams: 500 },
        { slug: 'cardboard', pieces: 1, grams: 80 },
      ],
      materials: [
        { nameEn: 'Raw fruit/veg scraps, tea leaves, eggshells', nameUr: 'سبزی و پھل کے چھلکے اور چائے کی پتی', quantity: '500g', isWaste: true },
        { nameEn: 'Shredded brown cardboard / egg cartons', nameUr: 'باریک کٹا ہوا گتہ', quantity: '80g', isWaste: true },
        { nameEn: 'Large plastic container or paint bucket', nameUr: 'پلاسٹک کی بالٹی', quantity: '1', isWaste: true },
      ],
      tools: [{ nameEn: 'Drill or heated skewer for aeration holes', nameUr: 'سوراخ کرنے والا اوزار' }],
      steps: [
        { position: 1, textEn: 'Drill small 3mm aeration holes around the upper rim and lid of the bucket.', textUr: 'بالٹی کے اوپری کنارے اور ڈھکن پر ہوا کی آمدورفت کے لیے چھوٹے سوراخ کریں۔' },
        { position: 2, textEn: 'Lay a 5cm dry base of shredded cardboard and dry leaves to absorb excess moisture.', textUr: 'نیچے 5 سینٹی میٹر سوکھے گتے اور کاغذ کی تہہ بچھائیں۔' },
        { position: 3, textEn: 'Add kitchen vegetable peels chopped into small 2cm chunks for fast breakdown.', textUr: 'سبزی کے چھلکوں کے چھوٹے ٹکڑے کر کے شامل کریں۔' },
        { position: 4, textEn: 'Top every food layer with double volume of shredded brown cardboard. Turn once a week.', textUr: 'ہر بار کھانے کے بعد اوپر سوکھے گتے کی تہہ لگائیں اور ہفتے میں ایک بار ہلائیں۔' },
      ],
    },

    // Untested 8: Glass Jar Lantern
    {
      slug: 'glass-jar-lantern',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Twine & Glass Jar Lantern',
      titleUr: 'شیشے کے جار کی خوبصورت لالٹین',
      summaryEn: 'Wrap clean condiment jars in rustic jute twine and insert a tea-light or fairy lights for ambient lighting.',
      summaryUr: 'شیشے کے پرانے جار کو رسی اور رنگ سے سجا کر خوبصورت لالٹین میں بدلیں۔',
      difficulty: 1,
      timeMinutes: 20,
      costPkr: 50,
      sellPricePkr: 250,
      safetyNoteEn: 'Inspect glass for chips or cracks before starting. Use LED candles for child safety.',
      safetyNoteUr: 'شیشے کے ٹوٹے کناروں سے بچیں اور بچوں کی حفاظت کے لیے LED موم بتی استعمال کریں۔',
      coverImage: '/seed/idea-lantern.jpg',
      waste: [{ slug: 'glass-jar', pieces: 1, grams: 250 }],
      materials: [
        { nameEn: 'Empty glass jam or pickle jar', nameUr: 'شیشے کا خالی جار', quantity: '1 jar', isWaste: true },
        { nameEn: 'Jute twine or craft string', nameUr: 'رسی یا دھاگہ', quantity: '3 meters', isWaste: false },
        { nameEn: 'LED tea-light candle', nameUr: 'چھوٹی لائٹ', quantity: '1', isWaste: false },
      ],
      tools: [{ nameEn: 'Glue gun or transparent craft adhesive', nameUr: 'گلو گن' }, { nameEn: 'Scissors', nameUr: 'قینچی' }],
      steps: [
        { position: 1, textEn: 'Soak jar in warm soapy water to remove label and adhesive residues completely.', textUr: 'جار کو گرم پانی میں بھگو کر لیبل اور گوند صاف کریں۔' },
        { position: 2, textEn: 'Wrap twine tightly around the jar rim 5 times and knot to form a secure collar.', textUr: 'جار کے منہ پر رسی کو 5 بار لپیٹ کر مضبوط گرہ لگائیں۔' },
        { position: 3, textEn: 'Loop an additional 30cm length across the top as a hanging lantern handle.', textUr: 'لٹکانے کے لیے اوپر رسی کا ہینڈل بنائیں۔' },
        { position: 4, textEn: 'Place an LED tea-light inside on a layer of dry sand or pebbles.', textUr: 'اندر ریت یا کنکر بچھا کر موم بتی رکھیں، آپ کی لالٹین تیار ہے۔' },
      ],
    },

    // Untested 9: Tin Can Pen Holder
    {
      slug: 'tin-can-pen-holder',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Decoupage Tin Can Desk Cup',
      titleUr: 'ٹین کا پین ہولڈر',
      summaryEn: 'Crimp sharp rims of tomato or bean cans, then wrap in leftover wrapping paper or jute for desktop stationery.',
      summaryUr: 'ٹین کے ڈبے کو خوبصورت رنگوں اور کپڑے سے سجا کر قلم دان بنائیں۔',
      difficulty: 1,
      timeMinutes: 20,
      costPkr: 30,
      sellPricePkr: 180,
      safetyNoteEn: 'Press inner rim flat with pliers to remove any jagged sharp metal burrs before decorating.',
      safetyNoteUr: 'پین ہولڈر بنانے سے پہلے پلاس کی مدد سے ٹین کے تیز کنارے بالکل ہموار کریں۔',
      coverImage: '/seed/idea-tin-holder.jpg',
      waste: [{ slug: 'tin-can', pieces: 1, grams: 60 }],
      materials: [
        { nameEn: 'Empty washed food tin can', nameUr: 'دھاتی ڈبہ', quantity: '1', isWaste: true },
        { nameEn: 'Decorative paper, fabric strip or rope', nameUr: 'کاغذ یا کپڑا', quantity: '1 strip', isWaste: true },
        { nameEn: 'Craft glue', nameUr: 'گلو', quantity: '20 ml', isWaste: false },
      ],
      tools: [{ nameEn: 'Pliers (for rim crimping)', nameUr: 'پلاس' }, { nameEn: 'Scissors', nameUr: 'قینچی' }],
      steps: [
        { position: 1, textEn: 'Use flat-nose pliers to press all jagged metal edge pieces down around the rim.', textUr: 'پلاس سے تیز دھار کناروں کو اندر کی طرف دبا کر محفوظ کریں۔' },
        { position: 2, textEn: 'Cut scrap fabric or decorative paper to match the exact height and circumference of the can.', textUr: 'ڈبے کے ناپ کا کاغذ یا کپڑا کاٹیں۔' },
        { position: 3, textEn: 'Coat the outer surface with craft glue and smoothly roll the wrapping into place.', textUr: 'ڈبے پر گلو لگا کر کاغذ کو صفائی سے چپکائیں۔' },
        { position: 4, textEn: 'Tuck 1cm of excess paper into the interior lip to seal the metal rim permanently.', textUr: 'اضافی کنارے اندر موڑ دیں اور قلم رکھ کر استعمال کریں۔' },
      ],
    },

    // Untested 10: Newspaper Storage Basket
    {
      slug: 'newspaper-storage-basket',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Woven Newspaper Reed Basket',
      titleUr: 'اخبار کی ٹوکری',
      summaryEn: 'Roll discarded newspaper sheets into slender paper reeds, then weave them into a sturdy, lightweight catch-all basket.',
      summaryUr: 'پرانے اخبار کی تلیاں بنا کر خوبصورت اور مضبوط ٹوکری بُنیں۔',
      difficulty: 2,
      timeMinutes: 60,
      costPkr: 30,
      sellPricePkr: 350,
      safetyNoteEn: 'Safe for all ages. Wash hands after handling newsprint to remove ink smudges.',
      safetyNoteUr: 'ہر عمر کے لیے محفوظ ہے۔ کام کے بعد ہاتھ صابن سے دھو لیں۔',
      coverImage: '/seed/idea-basket.jpg',
      waste: [{ slug: 'paper-newspaper', pieces: 6, grams: 300 }],
      materials: [
        { nameEn: 'Old newspapers or flyers', nameUr: 'پرانے اخبارات', quantity: '6 sheets', isWaste: true },
        { nameEn: 'PVA glue or flour paste', nameUr: 'گلو', quantity: '30 ml', isWaste: false },
        { nameEn: 'Cardboard base circle', nameUr: 'گتے کا گول ٹکڑا', quantity: '2 circles', isWaste: true },
      ],
      tools: [{ nameEn: 'Thin wooden skewer or knitting needle (for rolling tubes)', nameUr: 'پتلی تیلی' }, { nameEn: 'Clothespins', nameUr: 'چمٹیاں' }],
      steps: [
        { position: 1, textEn: 'Cut newspaper sheets into 10cm strips and roll tightly around a skewer at a 45° angle.', textUr: 'اخبار کی پٹیوں کو تیلی پر ترچھا لپیٹ کر پتلی نالیاں بنائیں۔' },
        { position: 2, textEn: 'Glue 12 spoke reeds radially between two cardboard circular disks to form the base.', textUr: 'گتے کے دو گول ٹکڑوں کے درمیان نالیوں کو پنکھے کی طرح چپکائیں۔' },
        { position: 3, textEn: 'Fold spokes upward and weave horizontal weaver reeds in an alternating over-under pattern.', textUr: 'تیلیوں کو اوپر اٹھا کر گولائی میں بُنائی شروع کریں۔' },
        { position: 4, textEn: 'Tuck remaining tips into the weave, secure with glue, and brush with diluted PVA for rigidity.', textUr: 'کنارے اندر موڑ کر گلو لگائیں اور سوکھنے دیں۔' },
      ],
    },

    // Untested 11: Braided Shopper-Bag Mat
    {
      slug: 'braided-shopper-mat',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Braided "Plarn" Door Mat',
      titleUr: 'شاپر کی چٹائی',
      summaryEn: 'Cut polythene shopper bags into continuous plastic yarn (plarn), braid 3 strands together and coil into a waterproof mat.',
      summaryUr: 'پلاسٹک کے شاپرز سے دھاگہ بنا کر واٹر پروف چٹائی تیار کریں۔',
      difficulty: 2,
      timeMinutes: 75,
      costPkr: 20,
      sellPricePkr: 300,
      safetyNoteEn: 'Do not heat thin plastic bags directly — braid and stitch mechanically.',
      safetyNoteUr: 'پلاسٹک شاپرز کو جلانے یا گرم کرنے سے گریز کریں۔ سوئی دھاگے سے سلائی کریں۔',
      coverImage: '/seed/idea-mat.jpg',
      waste: [{ slug: 'plastic-bag', pieces: 15, grams: 120 }],
      materials: [
        { nameEn: 'Plastic grocery shopper bags', nameUr: 'پلاسٹک کے شاپرز', quantity: '15 bags', isWaste: true },
        { nameEn: 'Strong thread or thin wire', nameUr: 'مضبوط دھاگہ', quantity: '1 spool', isWaste: false },
      ],
      tools: [{ nameEn: 'Scissors', nameUr: 'قینچی' }, { nameEn: 'Heavy upholstery needle', nameUr: 'بڑی سوئی' }],
      steps: [
        { position: 1, textEn: 'Flatten grocery bags, slice into 4cm horizontal loops, and interlock into continuous plarn strips.', textUr: 'شاپرز کو برابر پٹیوں میں کاٹ کر لمبی ڈوریاں بنائیں۔' },
        { position: 2, textEn: 'Tie 3 plarn strands together and braid a tight three-strand rope.', textUr: 'تین ڈوریوں کو ملا کر لمبی چوٹی بُن لیں۔' },
        { position: 3, textEn: 'Coil the braid flat in an expanding oval, stitching adjacent edges firmly with needle and thread.', textUr: 'چوٹی کو گولائی میں لپیٹتے جائیں اور ساتھ ساتھ سلائی کرتے جائیں۔' },
        { position: 4, textEn: 'Knot the final end underneath and press flat. Washable and waterproof.', textUr: 'آخری سرے کو نیچے پکا کر دیں۔ یہ چٹائی پانی سے خراب نہیں ہوتی۔' },
      ],
    },

    // Untested 12: Tetra Pack Wallet
    {
      slug: 'tetra-pack-wallet',
      status: 'UNTESTED',
      published: true,
      titleEn: 'Origami Tetra Pack Card Wallet',
      titleUr: 'ٹیٹرا پیک کا بٹوہ',
      summaryEn: 'Fold and interlock a clean aluminum-lined juice carton into a water-resistant pocket wallet with card slots.',
      summaryUr: 'جوس یا دودھ کے خالی ڈبے سے پائیدار اور واٹر پروف بٹوہ بنائیں۔',
      difficulty: 1,
      timeMinutes: 25,
      costPkr: 20,
      sellPricePkr: 150,
      safetyNoteEn: 'Wash and thoroughly air-dry the carton interior to eliminate sour milk/juice residue.',
      safetyNoteUr: 'ڈبے کو اندر سے صابن سے اچھی طرح دھو کر خشک کر لیں۔',
      coverImage: '/seed/idea-wallet.jpg',
      waste: [{ slug: 'tetra-pack', pieces: 1, grams: 25 }],
      materials: [
        { nameEn: 'Clean 1-liter juice or milk carton with cap', nameUr: 'ایک لیٹر کا ٹیٹرا پیک ڈبہ مع ڈھکن', quantity: '1 carton', isWaste: true },
        { nameEn: 'Double-sided tape or velcro dot', nameUr: 'ویلکرو یا ٹیپ', quantity: 'optional', isWaste: false },
      ],
      tools: [{ nameEn: 'Scissors', nameUr: 'قینچی' }, { nameEn: 'Bone folder or ruler (for crisp folds)', nameUr: 'فٹہ' }],
      steps: [
        { position: 1, textEn: 'Cut off top spout and bottom folds, opening the carton into a flat metallic-lined rectangle.', textUr: 'ڈبے کے اوپری اور نچلے کنارے کاٹ کر سیدھا مستطیل بنا لیں۔' },
        { position: 2, textEn: 'Crease into three equal horizontal folds to create the wallet body and flap.', textUr: 'فٹے کی مدد سے تین برابر حصوں میں موڑ کر کریز ڈالیں۔' },
        { position: 3, textEn: 'Invert side accordions to form inner divider pockets for cash and CNIC cards.', textUr: 'سائیڈز کو اندر کی طرف موڑ کر کارڈ رکھنے کی جیبیں بنائیں۔' },
        { position: 4, textEn: 'Fold the top flap over the front and slot in the plastic screw cap or velcro clasp.', textUr: 'اوپری فلیپ کو بند کر کے ڈھکن یا ویل کرو لگا لیں۔' },
      ],
    },
  ];

  for (const idea of ideasData) {
    // 1. Calculate wasteGrams & co2SavedG
    let wasteGrams = 0;
    let co2Grams = 0;
    for (const w of idea.waste) {
      wasteGrams += w.grams;
      const wtRecord = wasteTypesData.find((t) => t.slug === w.slug);
      if (wtRecord) {
        // displacement factor 0.5
        co2Grams += Math.round((w.grams / 1000) * wtRecord.co2PerKg * 1000 * 0.5);
      }
    }

    const createdIdea = await prisma.idea.upsert({
      where: { slug: idea.slug },
      create: {
        slug: idea.slug,
        status: idea.status,
        published: idea.published,
        titleEn: idea.titleEn,
        titleUr: idea.titleUr,
        summaryEn: idea.summaryEn,
        summaryUr: idea.summaryUr,
        difficulty: idea.difficulty,
        timeMinutes: idea.timeMinutes,
        costPkr: idea.costPkr,
        sellPricePkr: idea.sellPricePkr,
        safetyNoteEn: idea.safetyNoteEn,
        safetyNoteUr: idea.safetyNoteUr,
        coverImage: idea.coverImage,
        wasteGrams,
        co2SavedG: co2Grams,
        isSampleData: idea.isSampleData ?? false,
        source: 'ADMIN',
      },
      update: {
        status: idea.status,
        titleEn: idea.titleEn,
        titleUr: idea.titleUr,
        summaryEn: idea.summaryEn,
        summaryUr: idea.summaryUr,
        difficulty: idea.difficulty,
        timeMinutes: idea.timeMinutes,
        costPkr: idea.costPkr,
        sellPricePkr: idea.sellPricePkr,
        safetyNoteEn: idea.safetyNoteEn,
        safetyNoteUr: idea.safetyNoteUr,
        coverImage: idea.coverImage,
        wasteGrams,
        co2SavedG: co2Grams,
      },
    });

    // Clean and recreate relations for clean upsert
    await prisma.ideaWaste.deleteMany({ where: { ideaId: createdIdea.id } });
    for (const w of idea.waste) {
      const wtId = wasteTypeMap.get(w.slug);
      if (wtId) {
        await prisma.ideaWaste.create({
          data: {
            ideaId: createdIdea.id,
            wasteTypeId: wtId,
            pieces: w.pieces,
            grams: w.grams,
          },
        });
      }
    }

    await prisma.ideaMaterial.deleteMany({ where: { ideaId: createdIdea.id } });
    for (let i = 0; i < idea.materials.length; i++) {
      const m = idea.materials[i]!;
      await prisma.ideaMaterial.create({
        data: {
          ideaId: createdIdea.id,
          nameEn: m.nameEn,
          nameUr: m.nameUr,
          quantity: m.quantity,
          isWaste: m.isWaste,
          sortOrder: i,
        },
      });
    }

    await prisma.ideaTool.deleteMany({ where: { ideaId: createdIdea.id } });
    for (let i = 0; i < idea.tools.length; i++) {
      const t = idea.tools[i]!;
      await prisma.ideaTool.create({
        data: {
          ideaId: createdIdea.id,
          nameEn: t.nameEn,
          nameUr: t.nameUr,
          sortOrder: i,
        },
      });
    }

    await prisma.ideaStep.deleteMany({ where: { ideaId: createdIdea.id } });
    for (const s of idea.steps as any[]) {
      await prisma.ideaStep.create({
        data: {
          ideaId: createdIdea.id,
          position: s.position,
          textEn: s.textEn,
          textUr: s.textUr,
          tipEn: s.tipEn,
          imageUrl: s.imageUrl,
          timerSeconds: s.timerSeconds,
        },
      });
    }
  }
  console.log('✅ 12 Ideas seeded with materials, tools, and steps');

  // Optional Demo Seed
  if (env.SEED_DEMO) {
    console.log('🌱 Seeding demo makes and reviews...');
    // Seed sample makes for community wall
    const demoUser = await prisma.user.upsert({
      where: { email: 'maker.ayesha@example.com' },
      create: {
        email: 'maker.ayesha@example.com',
        name: 'Ayesha (Maker)',
        role: 'USER',
        isGuest: false,
      },
      update: {},
    });

    const firstIdea = await prisma.idea.findFirst({ where: { slug: 'bottle-cap-keychain' } });
    if (firstIdea) {
      await prisma.make.create({
        data: {
          userId: demoUser.id,
          ideaId: firstIdea.id,
          outcome: 'WORKED',
          timeTakenMin: 22,
          difficultyFelt: 1,
          rating: 5,
          notes: 'Loved how the marigold and teal caps fused together! Great workshop craft.',
          photoUrl: '/seed/demo-make-1.jpg',
          status: 'APPROVED',
          wasteGramsSnapshot: 18,
          co2GramsSnapshot: 18,
          moneyPkrSnapshot: 210,
        },
      });
    }
    console.log('✅ Demo data seeded');
  }

  console.log('🎉 Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
