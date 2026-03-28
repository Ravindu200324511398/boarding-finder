require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const https = require('https');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boarding_finder';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boarding' }],
}, { timestamps: true });

const boardingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  lat: Number,
  lng: Number,
  image: String,
  roomType: { type: String, default: 'Single' },
  amenities: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contact: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Boarding = mongoose.model('Boarding', boardingSchema);

const sampleUsers = [
  { name: 'Kasun Perera', email: 'kasun@example.com', password: 'password123' },
  { name: 'Nimasha Silva', email: 'nimasha@example.com', password: 'password123' },
  { name: 'Ravindu Fernando', email: 'ravindu@example.com', password: 'password123' },
];

// Download image from URL and save to uploads folder
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const filepath = path.join(uploadsDir, filename);
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(filename); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(filename); });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');
    await User.deleteMany({});
    await Boarding.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Download sample house images from Unsplash (free, no auth needed)
    console.log('📸 Downloading sample images...');
    const imageMap = [
      { file: 'boarding_1.jpg', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' },
      { file: 'boarding_2.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
      { file: 'boarding_3.jpg', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
      { file: 'boarding_4.jpg', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { file: 'boarding_5.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
      { file: 'boarding_6.jpg', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80' },
      { file: 'boarding_7.jpg', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
      { file: 'boarding_8.jpg', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80' },
    ];

    for (const img of imageMap) {
      try {
        await downloadImage(img.url, img.file);
        console.log('   ✓ Downloaded ' + img.file);
      } catch (e) {
        console.log('   ✗ Failed ' + img.file + ' - will use placeholder');
      }
    }

    const hashedUsers = await Promise.all(
      sampleUsers.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('\n👤 Created ' + createdUsers.length + ' users');

    const ownerIds = createdUsers.map((u) => u._id);

    const boardings = [
      {
        title: 'Cozy Single Room near University of Peradeniya',
        description: 'A clean and quiet single room perfect for university students. Located just 5 minutes walk from the University of Peradeniya main gate. Fully furnished with study table, wardrobe, and bed. The landlady is very friendly.',
        price: 8000, location: 'Asgiriya, Kandy', lat: 7.2546, lng: 80.5940,
        roomType: 'Single', amenities: ['WiFi', 'Water', 'Electricity', 'Study Table'],
        contact: '077-1234567', owner: ownerIds[0], image: 'boarding_1.jpg',
      },
      {
        title: 'Spacious Double Room - Katugastota',
        description: 'Well-maintained double room for two students. Two separate beds, shared study area, large windows. Near Katugastota bus stop with easy access to Kandy town and university.',
        price: 6500, location: 'Katugastota, Kandy', lat: 7.3167, lng: 80.6253,
        roomType: 'Double', amenities: ['WiFi', 'Water', 'Kitchen', 'Parking'],
        contact: '071-9876543', owner: ownerIds[1], image: 'boarding_2.jpg',
      },
      {
        title: 'Modern Annex near SLIIT Malabe',
        description: 'Fully independent annex unit with private bathroom and kitchenette. Ideal for a student who values privacy. 10 minutes from SLIIT Malabe. Newly constructed with modern fittings and 24/7 security.',
        price: 18000, location: 'Malabe, Colombo', lat: 6.9147, lng: 79.9726,
        roomType: 'Annex', amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Kitchen', 'Security', 'Parking'],
        contact: '076-5555123', owner: ownerIds[0], image: 'boarding_3.jpg',
      },
      {
        title: 'Budget Friendly Room near University of Kelaniya',
        description: 'Affordable and comfortable room near the University of Kelaniya. Meals arranged on request. Common TV lounge and laundry facilities. Female students only. Bus stop 2 minutes away.',
        price: 5500, location: 'Kelaniya, Gampaha', lat: 7.0000, lng: 79.9197,
        roomType: 'Single', amenities: ['Meals Available', 'Laundry', 'Water', 'WiFi'],
        contact: '078-4441122', owner: ownerIds[2], image: 'boarding_4.jpg',
      },
      {
        title: 'Triple Room for Engineering Students - Moratuwa',
        description: 'Large triple room near University of Moratuwa. Perfect for three students splitting costs. Three beds, large study table, good ventilation. 7 minutes walk to university.',
        price: 4500, location: 'Moratuwa, Colombo', lat: 6.7957, lng: 79.8812,
        roomType: 'Triple', amenities: ['WiFi', 'Water', 'Electricity', 'Study Table', 'Fan'],
        contact: '070-3332211', owner: ownerIds[1], image: 'boarding_5.jpg',
      },
      {
        title: 'Girls Boarding House - Nugegoda',
        description: 'Safe boarding exclusively for female students. CCTV installed, gate closes at 10 PM. Meals provided twice daily. Many students from NIBM and other Nugegoda institutes stay here.',
        price: 12000, location: 'Nugegoda, Colombo', lat: 6.8731, lng: 79.8878,
        roomType: 'Single', amenities: ['Meals Included', 'CCTV', 'WiFi', 'Laundry', 'Security Gate'],
        contact: '011-2223344', owner: ownerIds[2], image: 'boarding_6.jpg',
      },
      {
        title: 'Student Annex near Sabaragamuwa University',
        description: 'Independent annex unit near Sabaragamuwa University. Peaceful environment surrounded by nature. Includes bedroom, sitting area, and attached bathroom. Meals on request.',
        price: 9000, location: 'Belihuloya, Ratnapura', lat: 6.7453, lng: 80.7430,
        roomType: 'Annex', amenities: ['Water', 'Electricity', 'Peaceful Environment', 'Meals on Request'],
        contact: '045-2254321', owner: ownerIds[0], image: 'boarding_7.jpg',
      },
      {
        title: 'Furnished Room with AC - Colombo 07',
        description: 'Premium furnished room with air conditioning in prime Colombo 07 location. Ideal for University of Colombo students. High-speed fiber internet, modern bathroom, rooftop access.',
        price: 25000, location: 'Cinnamon Gardens, Colombo 07', lat: 6.9060, lng: 79.8636,
        roomType: 'Single', amenities: ['Air Conditioning', 'WiFi 100Mbps', 'Hot Water', 'Rooftop', 'Security'],
        contact: '077-8889900', owner: ownerIds[1], image: 'boarding_8.jpg',
      },
    ];

    const createdBoardings = await Boarding.insertMany(boardings);
    console.log('🏠 Created ' + createdBoardings.length + ' boarding listings');
    createdBoardings.forEach((b) => console.log('   - ' + b.title + ' | LKR ' + b.price));

    console.log('\n✅ Seed completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login credentials:');
    console.log('   kasun@example.com / password123');
    console.log('   nimasha@example.com / password123');
    console.log('   ravindu@example.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
