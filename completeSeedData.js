const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Pooja = require('./models/Pooja');
const Star = require('./models/Star');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  seedCompleteData();
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

const seedCompleteData = async () => {
  try {
    // Clear existing data
    await Pooja.deleteMany({});
    await Star.deleteMany({});
    
    console.log('Cleared existing data');

    // Add 27 Stars (Malayalam Names)
    const stars = [
      'Ashwathi', 'Bharani', 'Karthika', 'Rohini', 'Makayiram', 'Thiruvathira', 'Punartham',
      'Pooyyam', 'Aayilyam', 'Makam', 'Pooram', 'Uthram', 'Atham',
      'Chithira', 'Chothi', 'Vishakham', 'Anizham', 'Thrikketta', 'Moolam', 'Pooradam',
      'Uthradam', 'Thiruvonam', 'Avittam', 'Chathayam', 'Pooruruttathi', 'Uthrattathi', 'Revathi'
    ];

    const starDocuments = stars.map(star => ({ name: star }));
    await Star.insertMany(starDocuments);
    console.log('Added 27 Malayalam stars');

    // All 39 Real Temple Poojas
    const allTemplePoojas = [
      // January 2025
      {
        id: 1,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജനുവരി 4',
        day: 'ശനി',
        date: '2025-01-04',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 2,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജനുവരി 18',
        day: 'ശനി',
        date: '2025-01-18',
        amount: 500,
        category: 'regular',
        special: false
      },

      // February 2025
      {
        id: 3,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഫെബ്രുവരി 2',
        day: 'ഞായര്‍',
        date: '2025-02-02',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 4,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഫെബ്രുവരി 17',
        day: 'തിങ്കള്‍',
        date: '2025-02-17',
        amount: 500,
        category: 'regular',
        special: false
      },

      // March 2025
      {
        id: 5,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'മാര്‍ച്ച് 3',
        day: 'തിങ്കള്‍',
        date: '2025-03-03',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 6,
        poojaEnglish: 'Prathishta Dhinom (Foundation Day)',
        pooja: 'പ്രതിഷ്ഠാദിനോത്സവം',
        malayalamDate: 'മാര്‍ച്ച് 7',
        day: 'വെള്ളി',
        date: '2025-03-07',
        amount: 1500,
        category: 'festival',
        special: true
      },
      {
        id: 7,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'മാര്‍ച്ച് 19',
        day: 'ബുധന്‍',
        date: '2025-03-19',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 8,
        poojaEnglish: 'Naga Kalam',
        pooja: 'നാഗകലം',
        malayalamDate: 'മാര്‍ച്ച് 23',
        day: 'ഞായര്‍',
        date: '2025-03-23',
        amount: 750,
        category: 'special',
        special: false
      },
      {
        id: 9,
        poojaEnglish: 'Devi Phalam',
        pooja: 'ദേവിഫലം',
        malayalamDate: 'മാര്‍ച്ച് 24',
        day: 'തിങ്കള്‍',
        date: '2025-03-24',
        amount: 600,
        category: 'special',
        special: false
      },
      {
        id: 10,
        poojaEnglish: 'Anduvizha Mahotsavam',
        pooja: 'ആണ്ടുവിഴ മഹോത്സവം',
        malayalamDate: 'മാര്‍ച്ച് 25',
        day: 'ചൊവ്വ',
        date: '2025-03-25',
        amount: 2000,
        category: 'festival',
        special: true
      },
      {
        id: 11,
        poojaEnglish: 'Nada Thurakkal Mahotsavam',
        pooja: 'നടതുറക്കല്‍ മഹോത്സവം',
        malayalamDate: 'മാര്‍ച്ച് 31',
        day: 'തിങ്കള്‍',
        date: '2025-03-31',
        amount: 1200,
        category: 'festival',
        special: false
      },

      // April 2025
      {
        id: 12,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഏപ്രില്‍ 2',
        day: 'ബുധന്‍',
        date: '2025-04-02',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 13,
        poojaEnglish: 'Vaishu Masacharanam',
        pooja: 'വൈശാഖ മാസാചരണം',
        malayalamDate: 'ഏപ്രില്‍ 14',
        day: 'തിങ്കള്‍',
        date: '2025-04-14',
        amount: 800,
        category: 'special',
        special: false
      },
      {
        id: 14,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഏപ്രില്‍ 17',
        day: 'വ്യാഴം',
        date: '2025-04-17',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 15,
        poojaEnglish: 'Naga Kalam',
        pooja: 'നാഗകലം',
        malayalamDate: 'ഏപ്രില്‍ 20',
        day: 'ഞായര്‍',
        date: '2025-04-20',
        amount: 750,
        category: 'special',
        special: false
      },

      // May 2025
      {
        id: 16,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'മെയ് 1',
        day: 'വ്യാഴം',
        date: '2025-05-01',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 17,
        poojaEnglish: 'Devi Phalam',
        pooja: 'ദേവിഫലം',
        malayalamDate: 'മെയ് 10',
        day: 'ശനി',
        date: '2025-05-10',
        amount: 600,
        category: 'special',
        special: false
      },
      {
        id: 18,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'മെയ് 17',
        day: 'ശനി',
        date: '2025-05-17',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 19,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'മെയ് 31',
        day: 'ശനി',
        date: '2025-05-31',
        amount: 500,
        category: 'regular',
        special: false
      },

      // June 2025
      {
        id: 20,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജൂണ്‍ 15',
        day: 'ഞായര്‍',
        date: '2025-06-15',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 21,
        poojaEnglish: 'Anduvizha',
        pooja: 'ആണ്ടുവിഴ',
        malayalamDate: 'ജൂണ്‍ 25',
        day: 'ബുധന്‍',
        date: '2025-06-25',
        amount: 1500,
        category: 'festival',
        special: true
      },
      {
        id: 22,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജൂണ്‍ 29',
        day: 'ഞായര്‍',
        date: '2025-06-29',
        amount: 500,
        category: 'regular',
        special: false
      },

      // July 2025
      {
        id: 23,
        poojaEnglish: 'Nada Thurakkal',
        pooja: 'നടതുറക്കല്‍',
        malayalamDate: 'ജൂലൈ 15',
        day: 'ചൊവ്വ',
        date: '2025-07-15',
        amount: 1000,
        category: 'festival',
        special: false
      },
      {
        id: 24,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജൂലൈ 18',
        day: 'ബുധന്‍',
        date: '2025-07-18',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 25,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ജൂലൈ 27',
        day: 'ബുധന്‍',
        date: '2025-07-27',
        amount: 500,
        category: 'regular',
        special: false
      },

      // August 2025
      {
        id: 26,
        poojaEnglish: 'Karkidaka Masacharanam',
        pooja: 'കര്‍ക്കിടക മാസാചരണം',
        malayalamDate: 'ഓഗസ്റ്റ് 5',
        day: 'ചൊവ്വ',
        date: '2025-08-05',
        amount: 600,
        category: 'special',
        special: false
      },
      {
        id: 27,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഓഗസ്റ്റ് 11',
        day: 'വ്യാഴം',
        date: '2025-08-11',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 28,
        poojaEnglish: 'Karkidaka Aram',
        pooja: 'കര്‍ക്കിടക ആറാം',
        malayalamDate: 'ഓഗസ്റ്റ് 22',
        day: 'തിങ്കള്‍',
        date: '2025-08-22',
        amount: 400,
        category: 'special',
        special: false
      },
      {
        id: 29,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഓഗസ്റ്റ് 26',
        day: 'വെള്ളി',
        date: '2025-08-26',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 30,
        poojaEnglish: 'Pushpanjali',
        pooja: 'പുഷ്പാഞ്ജലി',
        malayalamDate: 'ഓഗസ്റ്റ് 29',
        day: 'തിങ്കള്‍',
        date: '2025-08-29',
        amount: 300,
        category: 'regular',
        special: false
      },
      {
        id: 31,
        poojaEnglish: 'Durgashtami',
        pooja: 'ദുര്‍ഗാഷ്ടമി',
        malayalamDate: 'ഓഗസ്റ്റ് 30',
        day: 'ചൊവ്വ',
        date: '2025-08-30',
        amount: 800,
        category: 'special',
        special: false
      },

      // September 2025
      {
        id: 32,
        poojaEnglish: 'Mahanavami',
        pooja: 'മഹാനവമി',
        malayalamDate: 'സെപ്റ്റംബര്‍ 1',
        day: 'ബുധന്‍',
        date: '2025-09-01',
        amount: 900,
        category: 'festival',
        special: false
      },
      {
        id: 33,
        poojaEnglish: 'Vijayadashami',
        pooja: 'വിജയദശമി',
        malayalamDate: 'സെപ്റ്റംബര്‍ 2',
        day: 'വ്യാഴം',
        date: '2025-09-02',
        amount: 1000,
        category: 'festival',
        special: false
      },
      {
        id: 34,
        poojaEnglish: 'Varahi Navarathri',
        pooja: 'വാരാഹി നവരാത്രി',
        malayalamDate: 'സെപ്റ്റംബര്‍ 10',
        day: 'വെള്ളി',
        date: '2025-09-10',
        amount: 1200,
        category: 'festival',
        special: true
      },
      {
        id: 35,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'സെപ്റ്റംബര്‍ 26',
        day: 'ഞായര്‍',
        date: '2025-09-26',
        amount: 500,
        category: 'regular',
        special: false
      },

      // October 2025
      {
        id: 36,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഒക്ടോബര്‍ 9',
        day: 'ഞായര്‍',
        date: '2025-10-09',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 37,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'ഒക്ടോബര്‍ 25',
        day: 'ചൊവ്വ',
        date: '2025-10-25',
        amount: 500,
        category: 'regular',
        special: false
      },

      // November 2025
      {
        id: 38,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'നവംബര്‍ 8',
        day: 'തിങ്കള്‍',
        date: '2025-11-08',
        amount: 500,
        category: 'regular',
        special: false
      },
      {
        id: 39,
        poojaEnglish: 'Panchami Pooja',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'നവംബര്‍ 24',
        day: 'ബുധന്‍',
        date: '2025-11-24',
        amount: 500,
        category: 'regular',
        special: false
      }
    ];

    await Pooja.insertMany(allTemplePoojas);
    console.log('Added all 39 temple poojas');

    console.log('✅ Complete temple data added successfully!');
    console.log('Database now has:');
    console.log('- 27 Malayalam Stars (Nakshatras)');
    console.log('- 39 Complete Temple Poojas for 2025');
    console.log('- Regular Poojas: 22');
    console.log('- Special Poojas: 8'); 
    console.log('- Festival Poojas: 9');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error adding complete temple data:', error);
    process.exit(1);
  }
};