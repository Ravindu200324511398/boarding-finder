// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const https = require('https');
// const fs = require('fs');
// const path = require('path');

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boarding_finder';

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   isAdmin: { type: Boolean, default: false },
//   favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boarding' }],
// }, { timestamps: true });

// const boardingSchema = new mongoose.Schema({
//   title: String, description: String, price: Number,
//   location: String, lat: Number, lng: Number, image: String,
//   roomType: { type: String, default: 'Single' },
//   amenities: [String],
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   contact: String,
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);
// const Boarding = mongoose.model('Boarding', boardingSchema);

// function downloadImage(url, filename) {
//   return new Promise((resolve, reject) => {
//     const uploadsDir = path.join(__dirname, 'uploads');
//     if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
//     const filepath = path.join(uploadsDir, filename);
//     const file = fs.createWriteStream(filepath);
//     https.get(url, (response) => {
//       if (response.statusCode === 302 || response.statusCode === 301) {
//         https.get(response.headers.location, (res) => {
//           res.pipe(file);
//           file.on('finish', () => { file.close(); resolve(filename); });
//         }).on('error', reject);
//       } else {
//         response.pipe(file);
//         file.on('finish', () => { file.close(); resolve(filename); });
//       }
//     }).on('error', (err) => { fs.unlink(filepath, () => {}); reject(err); });
//   });
// }

// async function seed() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('✅ MongoDB Connected');
//     await User.deleteMany({});
//     await Boarding.deleteMany({});
//     console.log('🗑️  Cleared existing data');

//     console.log('📸 Downloading images...');
//     const images = [
//       { file: 'boarding_1.jpg', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' },
//       { file: 'boarding_2.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
//       { file: 'boarding_3.jpg', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
//       { file: 'boarding_4.jpg', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
//       { file: 'boarding_5.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
//       { file: 'boarding_6.jpg', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80' },
//       { file: 'boarding_7.jpg', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
//       { file: 'boarding_8.jpg', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80' },
//     ];
//     for (const img of images) {
//       try { await downloadImage(img.url, img.file); console.log('   ✓ ' + img.file); }
//       catch (e) { console.log('   ✗ Failed: ' + img.file); }
//     }

//     const users = [
//       { name: 'Admin User', email: 'admin@boardingfinder.com', password: await bcrypt.hash('admin123', 10), isAdmin: true },
//       { name: 'Kasun Perera', email: 'kasun@example.com', password: await bcrypt.hash('password123', 10), isAdmin: false },
//       { name: 'Nimasha Silva', email: 'nimasha@example.com', password: await bcrypt.hash('password123', 10), isAdmin: false },
//       { name: 'Ravindu Fernando', email: 'ravindu@example.com', password: await bcrypt.hash('password123', 10), isAdmin: false },
//     ];
//     const createdUsers = await User.insertMany(users);
//     console.log('\n👤 Created ' + createdUsers.length + ' users (including 1 admin)');

//     const [admin, kasun, nimasha, ravindu] = createdUsers;

//     const boardings = [
//       { title: 'Cozy Single Room near University of Peradeniya', description: 'A clean and quiet single room perfect for university students. Located just 5 minutes walk from the University of Peradeniya main gate. Fully furnished with study table, wardrobe, and bed.', price: 8000, location: 'Asgiriya, Kandy', lat: 7.2546, lng: 80.5940, roomType: 'Single', amenities: ['WiFi', 'Water', 'Electricity', 'Study Table'], contact: '077-1234567', owner: kasun._id, image: 'boarding_1.jpg' },
//       { title: 'Spacious Double Room - Katugastota', description: 'Well-maintained double room for two students. Two separate beds, shared study area, large windows. Near Katugastota bus stop.', price: 6500, location: 'Katugastota, Kandy', lat: 7.3167, lng: 80.6253, roomType: 'Double', amenities: ['WiFi', 'Water', 'Kitchen', 'Parking'], contact: '071-9876543', owner: nimasha._id, image: 'boarding_2.jpg' },
//       { title: 'Modern Annex near SLIIT Malabe', description: 'Fully independent annex unit with private bathroom and kitchenette. Ideal for a student who values privacy. 10 minutes from SLIIT.', price: 18000, location: 'Malabe, Colombo', lat: 6.9147, lng: 79.9726, roomType: 'Annex', amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Kitchen', 'Security'], contact: '076-5555123', owner: kasun._id, image: 'boarding_3.jpg' },
//       { title: 'Budget Friendly Room near University of Kelaniya', description: 'Affordable and comfortable room near the University of Kelaniya. Meals arranged on request. Female students only.', price: 5500, location: 'Kelaniya, Gampaha', lat: 7.0000, lng: 79.9197, roomType: 'Single', amenities: ['Meals Available', 'Laundry', 'Water', 'WiFi'], contact: '078-4441122', owner: ravindu._id, image: 'boarding_4.jpg' },
//       { title: 'Triple Room for Engineering Students - Moratuwa', description: 'Large triple room near University of Moratuwa. Perfect for three students splitting costs. 7 minutes walk to university.', price: 4500, location: 'Moratuwa, Colombo', lat: 6.7957, lng: 79.8812, roomType: 'Triple', amenities: ['WiFi', 'Water', 'Electricity', 'Study Table', 'Fan'], contact: '070-3332211', owner: nimasha._id, image: 'boarding_5.jpg' },
//       { title: 'Girls Boarding House - Nugegoda', description: 'Safe boarding exclusively for female students. CCTV installed, gate closes at 10 PM. Meals provided twice daily.', price: 12000, location: 'Nugegoda, Colombo', lat: 6.8731, lng: 79.8878, roomType: 'Single', amenities: ['Meals Included', 'CCTV', 'WiFi', 'Laundry', 'Security Gate'], contact: '011-2223344', owner: ravindu._id, image: 'boarding_6.jpg' },
//       { title: 'Student Annex near Sabaragamuwa University', description: 'Independent annex near Sabaragamuwa University. Peaceful environment. Bedroom, sitting area, and attached bathroom.', price: 9000, location: 'Belihuloya, Ratnapura', lat: 6.7453, lng: 80.7430, roomType: 'Annex', amenities: ['Water', 'Electricity', 'Peaceful Environment', 'Meals on Request'], contact: '045-2254321', owner: kasun._id, image: 'boarding_7.jpg' },
//       { title: 'Furnished Room with AC - Colombo 07', description: 'Premium furnished room with AC in Colombo 07. High-speed fiber internet, modern bathroom, rooftop access.', price: 25000, location: 'Cinnamon Gardens, Colombo 07', lat: 6.9060, lng: 79.8636, roomType: 'Single', amenities: ['Air Conditioning', 'WiFi 100Mbps', 'Hot Water', 'Rooftop', 'Security'], contact: '077-8889900', owner: nimasha._id, image: 'boarding_8.jpg' },
//     ];
//     const created = await Boarding.insertMany(boardings);
//     console.log('🏠 Created ' + created.length + ' boardings');

//     console.log('\n✅ Seed complete!');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('🔑 ADMIN LOGIN:');
//     console.log('   Email:    admin@boardingfinder.com');
//     console.log('   Password: admin123');
//     console.log('');
//     console.log('🔑 USER LOGINS:');
//     console.log('   kasun@example.com / password123');
//     console.log('   nimasha@example.com / password123');
//     console.log('   ravindu@example.com / password123');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Seed failed:', err.message);
//     process.exit(1);
//   }
// }
// seed();


require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boarding_finder';

// ── Inline schemas (avoids model overwrite issues in seed) ──
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  avatar: { type: String, default: null },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boarding' }],
}, { timestamps: true });

const boardingSchema = new mongoose.Schema({
  title: String, description: String, price: Number,
  location: String, lat: Number, lng: Number,
  image: String,
  images: [String],
  roomType: { type: String, default: 'Single' },
  amenities: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contact: String,
  isAvailable: { type: Boolean, default: true },
  isPromoted: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Boarding = mongoose.model('Boarding', boardingSchema);

// ── Image downloader with redirect support ──
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filepath = path.join(uploadsDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(filepath)) { resolve(filename); return; }

    const protocol = url.startsWith('https') ? https : http;

    const request = (u) => {
      protocol.get(u, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          request(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(filename); });
        file.on('error', (err) => { fs.unlink(filepath, () => {}); reject(err); });
      }).on('error', reject);
    };
    request(url);
  });
}

// ── All images to download ──
const IMAGE_LIST = [
  // Room interiors
  { file: 'b_room_01.jpg', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' },
  { file: 'b_room_02.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
  { file: 'b_room_03.jpg', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
  { file: 'b_room_04.jpg', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
  { file: 'b_room_05.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
  { file: 'b_room_06.jpg', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80' },
  { file: 'b_room_07.jpg', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
  { file: 'b_room_08.jpg', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80' },
  { file: 'b_room_09.jpg', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80' },
  { file: 'b_room_10.jpg', url: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80' },
  { file: 'b_room_11.jpg', url: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=800&q=80' },
  { file: 'b_room_12.jpg', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80' },
  { file: 'b_room_13.jpg', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
  { file: 'b_room_14.jpg', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80' },
  { file: 'b_room_15.jpg', url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80' },
  { file: 'b_room_16.jpg', url: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800&q=80' },
  { file: 'b_room_17.jpg', url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80' },
  { file: 'b_room_18.jpg', url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80' },
  { file: 'b_room_19.jpg', url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80' },
  { file: 'b_room_20.jpg', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80' },
  // Extra images for galleries
  { file: 'b_extra_01.jpg', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80' },
  { file: 'b_extra_02.jpg', url: 'https://images.unsplash.com/photo-1567225557594-88d73398014a?w=800&q=80' },
  { file: 'b_extra_03.jpg', url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80' },
  { file: 'b_extra_04.jpg', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80' },
  { file: 'b_extra_05.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' },
  { file: 'b_extra_06.jpg', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80' },
  { file: 'b_extra_07.jpg', url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80' },
  { file: 'b_extra_08.jpg', url: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Only clear boardings and non-admin users — preserve admin accounts
    await Boarding.deleteMany({});
    await User.deleteMany({ isAdmin: false });
    console.log('🗑️  Cleared existing boardings and regular users');

    // ── Download images ──
    console.log('\n📸 Downloading images...');
    let downloaded = 0, failed = 0;
    for (const img of IMAGE_LIST) {
      try {
        await downloadImage(img.url, img.file);
        process.stdout.write(`   ✓ ${img.file}\n`);
        downloaded++;
      } catch (e) {
        process.stdout.write(`   ✗ ${img.file} — ${e.message}\n`);
        failed++;
      }
    }
    console.log(`\n   Downloaded: ${downloaded} | Failed: ${failed}`);

    // ── Create users — upsert admin, insert regular users fresh ──
    // Upsert admin (won't duplicate if already exists)
    await User.findOneAndUpdate(
      { email: 'admin@boardingfinder.com' },
      { name: 'Admin User', email: 'admin@boardingfinder.com', password: await bcrypt.hash('admin123', 10), isAdmin: true },
      { upsert: true, new: true }
    );

    const regularUsers = [
      { name: 'Kasun Perera',         email: 'kasun@example.com',      password: await bcrypt.hash('password123', 10), isAdmin: false },
      { name: 'Nimasha Silva',        email: 'nimasha@example.com',     password: await bcrypt.hash('password123', 10), isAdmin: false },
      { name: 'Ravindu Fernando',     email: 'ravindu@example.com',     password: await bcrypt.hash('password123', 10), isAdmin: false },
      { name: 'Samanthi Jayawardena', email: 'samanthi@example.com',    password: await bcrypt.hash('password123', 10), isAdmin: false },
      { name: 'Nuwan Bandara',        email: 'nuwan@example.com',       password: await bcrypt.hash('password123', 10), isAdmin: false },
      { name: 'Dilini Madushani',     email: 'dilini@example.com',      password: await bcrypt.hash('password123', 10), isAdmin: false },
    ];

    const createdRegular = await User.insertMany(regularUsers);
    const adminUser = await User.findOne({ email: 'admin@boardingfinder.com' });
    const createdUsers = [adminUser, ...createdRegular];
    console.log(`\n👤 Created/updated ${createdUsers.length} users`);
    const [admin, kasun, nimasha, ravindu, samanthi, nuwan, dilini] = createdUsers;

    // ── Boarding data ──
    const boardings = [
      // ── COLOMBO ──
      {
        title: 'Premium Furnished Room with AC – Colombo 07',
        description: 'Luxury furnished single room in the heart of Cinnamon Gardens. Features high-speed 100Mbps fiber WiFi, split AC, hot water shower, rooftop terrace access, and 24/7 security. Walking distance to Viharamahadevi Park and major bus routes. Ideal for working professionals or postgraduate students.',
        price: 25000,
        location: 'Cinnamon Gardens, Colombo 07',
        lat: 6.9060, lng: 79.8636,
        roomType: 'Single',
        amenities: ['Air Conditioning', 'WiFi 100Mbps', 'Hot Water', 'Rooftop', 'Security', 'CCTV', 'Electricity'],
        contact: '077-8889900',
        owner: nimasha._id,
        image: 'b_room_08.jpg',
        images: ['b_room_08.jpg', 'b_extra_01.jpg', 'b_extra_04.jpg'],
        isAvailable: true,
        isPromoted: true,
      },
      {
        title: 'Girls Boarding House with Meals – Nugegoda',
        description: 'Safe and comfortable boarding house exclusively for female students and working women. Full meals provided twice daily (breakfast & dinner). CCTV throughout premises, security gate closes at 10 PM. Laundry service available. Close to Nugegoda junction and Maharagama road.',
        price: 12000,
        location: 'Nugegoda, Colombo',
        lat: 6.8731, lng: 79.8878,
        roomType: 'Single',
        amenities: ['Meals Included', 'CCTV', 'WiFi', 'Laundry', 'Security Gate', 'Water', 'Electricity'],
        contact: '011-2223344',
        owner: ravindu._id,
        image: 'b_room_06.jpg',
        images: ['b_room_06.jpg', 'b_extra_02.jpg', 'b_extra_06.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Modern Annex with Private Bathroom – Malabe',
        description: 'Fully independent annex unit near SLIIT Malabe campus. Private entrance, attached bathroom, kitchenette with fridge. 10 minutes from SLIIT main gate. Parking available. Quiet residential neighbourhood. Suitable for one or two students. Landlord lives on same property.',
        price: 18000,
        location: 'Malabe, Colombo',
        lat: 6.9147, lng: 79.9726,
        roomType: 'Annex',
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Kitchen', 'Security', 'Parking', 'Electricity'],
        contact: '076-5555123',
        owner: kasun._id,
        image: 'b_room_03.jpg',
        images: ['b_room_03.jpg', 'b_extra_03.jpg', 'b_extra_05.jpg'],
        isAvailable: true,
        isPromoted: true,
      },
      {
        title: 'Affordable Double Room – Dehiwala',
        description: 'Spacious double room ideal for two students sharing. Two single beds, shared study table, ceiling fan, large wardrobe. Shared kitchen and bathroom. Close to Dehiwala train station — easy commute to Colombo. Grocery stores and restaurants nearby.',
        price: 7500,
        location: 'Dehiwala, Colombo',
        lat: 6.8483, lng: 79.8659,
        roomType: 'Double',
        amenities: ['WiFi', 'Water', 'Electricity', 'Fan', 'Kitchen'],
        contact: '071-4445566',
        owner: samanthi._id,
        image: 'b_room_02.jpg',
        images: ['b_room_02.jpg', 'b_extra_07.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Budget Single Room – Kelaniya University Area',
        description: 'Affordable and clean single room near University of Kelaniya. Suitable for female students only. Meals arranged on request. Short walk to campus. Friendly neighbourhood environment with easy access to public transport.',
        price: 5500,
        location: 'Kelaniya, Gampaha',
        lat: 7.0000, lng: 79.9197,
        roomType: 'Single',
        amenities: ['Meals Available', 'Laundry', 'Water', 'WiFi', 'Electricity'],
        contact: '078-4441122',
        owner: ravindu._id,
        image: 'b_room_04.jpg',
        images: ['b_room_04.jpg', 'b_extra_08.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Triple Room for Engineering Students – Moratuwa',
        description: 'Large triple room near University of Moratuwa engineering faculty. Three single beds with personal study desks. Ceiling fans, shared bathroom, communal kitchen. 7 minutes walk to university main entrance. Ideal for three students splitting costs.',
        price: 4500,
        location: 'Moratuwa, Colombo',
        lat: 6.7957, lng: 79.8812,
        roomType: 'Triple',
        amenities: ['WiFi', 'Water', 'Electricity', 'Study Table', 'Fan', 'Kitchen'],
        contact: '070-3332211',
        owner: nimasha._id,
        image: 'b_room_05.jpg',
        images: ['b_room_05.jpg', 'b_extra_01.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── KANDY ──
      {
        title: 'Cozy Single Room near University of Peradeniya',
        description: 'Clean and quiet single room perfect for University of Peradeniya students. Located just 5 minutes walk from the main gate. Fully furnished with study table, wardrobe, and comfortable bed. Reliable WiFi and 24/7 electricity. Meals available on request from landlady.',
        price: 8000,
        location: 'Asgiriya, Kandy',
        lat: 7.2546, lng: 80.5940,
        roomType: 'Single',
        amenities: ['WiFi', 'Water', 'Electricity', 'Study Table', 'Meals on Request'],
        contact: '077-1234567',
        owner: kasun._id,
        image: 'b_room_01.jpg',
        images: ['b_room_01.jpg', 'b_extra_02.jpg', 'b_extra_06.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Spacious Double Room – Katugastota',
        description: 'Well-maintained double room for two students sharing. Two separate beds, shared study area, large windows with good natural light. Near Katugastota bus stop with direct routes to Kandy city centre and university areas.',
        price: 6500,
        location: 'Katugastota, Kandy',
        lat: 7.3167, lng: 80.6253,
        roomType: 'Double',
        amenities: ['WiFi', 'Water', 'Kitchen', 'Parking', 'Electricity', 'Fan'],
        contact: '071-9876543',
        owner: nimasha._id,
        image: 'b_room_09.jpg',
        images: ['b_room_09.jpg', 'b_extra_03.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Peaceful Annex near NIBM Kandy',
        description: 'Private annex unit in a quiet residential area near NIBM Kandy campus. Separate entrance, bedroom with wardrobe, small sitting area, attached bathroom. Landlord maintains the property well. Peaceful garden environment. Parking space available.',
        price: 14000,
        location: 'Peradeniya Road, Kandy',
        lat: 7.2650, lng: 80.6210,
        roomType: 'Annex',
        amenities: ['WiFi', 'Water', 'Electricity', 'Private Bathroom', 'Parking', 'Peaceful Environment'],
        contact: '081-2345678',
        owner: nuwan._id,
        image: 'b_room_10.jpg',
        images: ['b_room_10.jpg', 'b_extra_04.jpg', 'b_extra_07.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Student Room near Kandy Bus Stand',
        description: 'Convenient single room right in Kandy city — 3 minutes walk to the main bus stand. Perfect for students commuting to multiple institutes. Shared bathroom, WiFi, and electricity included in rent. Friendly co-tenants from various universities.',
        price: 7000,
        location: 'Kandy City Centre',
        lat: 7.2906, lng: 80.6337,
        roomType: 'Single',
        amenities: ['WiFi', 'Water', 'Electricity', 'Fan'],
        contact: '077-2233445',
        owner: samanthi._id,
        image: 'b_room_11.jpg',
        images: ['b_room_11.jpg', 'b_extra_05.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── GALLE / SOUTHERN ──
      {
        title: 'Beachside Room near Galle Face – Galle',
        description: 'Charming room near the historic Galle Fort area. Walking distance to beach. Great sea breeze keeps the room cool. Suitable for students attending South Eastern University or working professionals in Galle. Shared kitchen, common sitting area.',
        price: 9500,
        location: 'Galle Fort, Galle',
        lat: 6.0367, lng: 80.2170,
        roomType: 'Single',
        amenities: ['WiFi', 'Water', 'Electricity', 'Fan', 'Kitchen'],
        contact: '091-3344556',
        owner: dilini._id,
        image: 'b_room_12.jpg',
        images: ['b_room_12.jpg', 'b_extra_01.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
      {
        title: 'Large Annex for Couple or Family – Matara',
        description: 'Spacious annex unit near University of Ruhuna Matara campus. Bedroom, separate living area, fully equipped kitchen, hot water bathroom. Suitable for a couple or small family. Quiet residential neighbourhood 15 minutes from Matara town centre.',
        price: 16000,
        location: 'Welipitiya, Matara',
        lat: 5.9548, lng: 80.5550,
        roomType: 'Annex',
        amenities: ['Kitchen', 'Hot Water', 'WiFi', 'Parking', 'Water', 'Electricity', 'Peaceful Environment'],
        contact: '041-2233441',
        owner: nuwan._id,
        image: 'b_room_13.jpg',
        images: ['b_room_13.jpg', 'b_extra_06.jpg', 'b_extra_08.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── JAFFNA ──
      {
        title: 'Clean Single Room near University of Jaffna',
        description: 'Simple and clean single room suitable for University of Jaffna students. Shared bathroom and kitchen. Study table and fan provided. Very affordable for students on a tight budget. Bus routes to university from nearby stop.',
        price: 4000,
        location: 'Thirunelvely, Jaffna',
        lat: 9.6615, lng: 80.0255,
        roomType: 'Single',
        amenities: ['Water', 'Electricity', 'Study Table', 'Fan'],
        contact: '021-2233445',
        owner: kasun._id,
        image: 'b_room_14.jpg',
        images: ['b_room_14.jpg', 'b_extra_02.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── RATNAPURA / SABARAGAMUWA ──
      {
        title: 'Student Annex near Sabaragamuwa University',
        description: 'Independent annex near Sabaragamuwa University of Sri Lanka. Peaceful hillside environment with fresh air. Bedroom, sitting area, and attached bathroom. Meals arranged on request. Close to local shops and bus stop to Ratnapura.',
        price: 9000,
        location: 'Belihuloya, Ratnapura',
        lat: 6.7453, lng: 80.7430,
        roomType: 'Annex',
        amenities: ['Water', 'Electricity', 'Peaceful Environment', 'Meals on Request', 'Private Bathroom'],
        contact: '045-2254321',
        owner: kasun._id,
        image: 'b_room_07.jpg',
        images: ['b_room_07.jpg', 'b_extra_03.jpg', 'b_extra_07.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── KURUNEGALA ──
      {
        title: 'Comfortable Double Room – Kurunegala Town',
        description: 'Well-maintained double room for two students near Kurunegala town centre. Short distance from Wayamba University. Two beds, ceiling fan, wardrobe space for each person. Shared bathroom and kitchen. Bus stop 2 minutes walk.',
        price: 5800,
        location: 'Kurunegala Town',
        lat: 7.4833, lng: 80.3647,
        roomType: 'Double',
        amenities: ['Water', 'Electricity', 'Fan', 'Kitchen', 'WiFi'],
        contact: '037-2244556',
        owner: samanthi._id,
        image: 'b_room_15.jpg',
        images: ['b_room_15.jpg', 'b_extra_04.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── NEGOMBO ──
      {
        title: 'Modern Room near Airport – Negombo',
        description: 'Clean modern room in Negombo — convenient for staff at Bandaranaike International Airport or students at NSBM. Air conditioning, hot water, and high-speed WiFi. Easy access to Colombo by bus or train. Short-term and long-term stays welcome.',
        price: 15000,
        location: 'Negombo Town',
        lat: 7.2094, lng: 79.8358,
        roomType: 'Single',
        amenities: ['Air Conditioning', 'Hot Water', 'WiFi', 'Electricity', 'Security', 'Parking'],
        contact: '031-2233445',
        owner: dilini._id,
        image: 'b_room_16.jpg',
        images: ['b_room_16.jpg', 'b_extra_05.jpg', 'b_extra_01.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── ANURADHAPURA ──
      {
        title: 'Affordable Triple Room – Anuradhapura',
        description: 'Budget-friendly triple room near Rajarata University of Sri Lanka. Three study desks, fans, shared bathroom and kitchen. Ideal for three students from the same faculty. Quiet area with good bus connectivity to university campus.',
        price: 3500,
        location: 'Anuradhapura New Town',
        lat: 8.3114, lng: 80.4037,
        roomType: 'Triple',
        amenities: ['Water', 'Electricity', 'Fan', 'Study Table', 'Kitchen'],
        contact: '025-2244331',
        owner: nuwan._id,
        image: 'b_room_17.jpg',
        images: ['b_room_17.jpg', 'b_extra_06.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── NUWARA ELIYA ──
      {
        title: 'Cozy Room in Hill Country – Nuwara Eliya',
        description: 'Warm and cozy room in the cool hill country of Nuwara Eliya. Ideal for students at SLUHS or tea estate workers. Heater provided, blankets included. Shared bathroom with hot water. Meals available from the friendly landlady. Stunning mountain views.',
        price: 10000,
        location: 'Nuwara Eliya Town',
        lat: 6.9497, lng: 80.7891,
        roomType: 'Single',
        amenities: ['Hot Water', 'Water', 'Electricity', 'Meals Available', 'Peaceful Environment'],
        contact: '052-2223344',
        owner: dilini._id,
        image: 'b_room_18.jpg',
        images: ['b_room_18.jpg', 'b_extra_07.jpg', 'b_extra_08.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── TRINCOMALEE ──
      {
        title: 'Sea View Room – Trincomalee',
        description: 'Unique sea view room near Trincomalee harbour. Clean and well-ventilated. Shared bathroom, communal kitchen. Suitable for students at Eastern University or government employees posted in Trinco. Short walk to beach and harbour area.',
        price: 6000,
        location: 'Trincomalee Town',
        lat: 8.5874, lng: 81.2152,
        roomType: 'Single',
        amenities: ['Water', 'Electricity', 'Fan', 'Kitchen', 'Peaceful Environment'],
        contact: '026-2223344',
        owner: samanthi._id,
        image: 'b_room_19.jpg',
        images: ['b_room_19.jpg', 'b_extra_02.jpg'],
        isAvailable: true,
        isPromoted: false,
      },

      // ── BADULLA ──
      {
        title: 'Simple Room near Uva Wellassa University – Badulla',
        description: 'Simple and affordable room near Uva Wellassa University. Study table, fan, wardrobe. Shared bathroom and kitchen. Landlord is very supportive of students. Daily bus to university campus from 200m away. Meals available on request.',
        price: 4800,
        location: 'Badulla Town',
        lat: 6.9895, lng: 81.0557,
        roomType: 'Single',
        amenities: ['Water', 'Electricity', 'Study Table', 'Fan', 'Meals on Request'],
        contact: '055-2234455',
        owner: nuwan._id,
        image: 'b_room_20.jpg',
        images: ['b_room_20.jpg', 'b_extra_03.jpg'],
        isAvailable: true,
        isPromoted: false,
      },
    ];

    const created = await Boarding.insertMany(boardings);
    console.log(`\n🏠 Created ${created.length} boarding listings across Sri Lanka`);

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 ADMIN LOGIN:');
    console.log('   Email:    admin@boardingfinder.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔑 USER LOGINS (password: password123):');
    console.log('   kasun@example.com');
    console.log('   nimasha@example.com');
    console.log('   ravindu@example.com');
    console.log('   samanthi@example.com');
    console.log('   nuwan@example.com');
    console.log('   dilini@example.com');
    console.log('');
    console.log('📍 Locations covered:');
    console.log('   Colombo, Kandy, Galle, Matara, Jaffna,');
    console.log('   Ratnapura, Kurunegala, Negombo,');
    console.log('   Anuradhapura, Nuwara Eliya, Trincomalee, Badulla');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();