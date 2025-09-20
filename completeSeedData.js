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

    // All 39 Real Temple Poojas (existing data) - ALL WITH 120 PARTICIPANT LIMIT
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: true,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: true,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: true,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: true,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true,
         
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
        special: false,
        maxParticipants: 120,
        onlineBookingAvailable: true
      }
    ];

    // NEW ENHANCED POOJAS - NO PARTICIPANT LIMITS (NULL VALUES)

    // ID 40: Daily Worship Schedule (ALREADY has NO LIMIT)
    const dailyWorshipPooja = {
      id: 40,
      poojaEnglish: 'Daily Worship Schedule',
      pooja: 'ഒരു ദിവസത്തെ പൂജ',
      malayalamDate: 'എല്ലാ ദിവസവും',
      day: 'എല്ലാ ദിവസങ്ങളിലും',
      date: null, // Available all days
      amount: 2500,
      category: 'premium',
      special: true,
      maxParticipants: null, // ✅ ALREADY NO LIMIT
      description: `രാവിലെ (Morning):
* അദീക്ഷകം, മേലനിവേദ്യം, മൂലമന്ത്രാർച്ചന
* കടുപായസം, ഹവിസ്, നെയ്വിളക്ക്
* ഭാഗ്യസൂക്തം, ശ്രീസൂക്തം, വിദ്യാസൂക്തം, സംവിദാസൂക്തം
* ലക്ഷ്മിയഷ്ടകം, രുദ്രാഷ്ടകം
* സ്വയംവരപൂജാപാഠണലി, രക്തതന്ത്രപാഠണലി, ഗുരുതിപാഠണലി
* മൂലമന്ത്രാർച്ചന

ഉച്ചപൂജ (Afternoon):
* രിപൊറാധന, ത്രിവധൂരം
* മൂലമന്ത്രാർച്ചന, സഹസ്രനാമാർച്ചന

വൈകിട്ട് (Evening):
* വൈകിട്ട് പൂജകൾ`,
      descriptionEnglish: `ONE DAY'S WORSHIP (Daily Puja Schedule)

Morning Rituals:
* Preliminary rituals, upper offerings, root mantra worship
* Sweet rice preparation, sacred offerings, ghee lamps
* Various hymns for fortune, prosperity, knowledge, and wisdom
* Eight verses to Lakshmi and Rudra
* Special ritual recitations
* Root mantra worship

Afternoon Worship:
* Afternoon rituals, special ceremonies
* Root mantra worship, thousand names recitation

Evening:
* Evening worship rituals`,
      onlineBookingAvailable: true
    };

    // ID 41: Nakshatra Pooja (ALREADY has NO LIMIT)
    const nakshatraPooja = {
      id: 41,
      poojaEnglish: 'Nakshatra Pooja',
      pooja: 'നക്ഷത്രപൂജ',
      malayalamDate: 'ജന്മനക്ഷത്ര ദിനങ്ങളിൽ',
      day: 'നക്ഷത്ര ദിവസം',
      date: null, // Based on individual birth stars
      amount: 200,
      category: 'special',
      special: false,
      maxParticipants: null, // ✅ ALREADY NO LIMIT
      description: `വള്ളൂർ ആലുംതോഴാം ശ്രീ മഹാവിഷ്ണുവിനി ദേവി ക്ഷേത്രം
പി.ഒ പുത്തൻപിടിക, അനിക്കാട്

വാരാഹി ദേവിക്ക് വിശേഷാൽ വഴിപാട് ജന്മനക്ഷത്ര (പ്രകാരപിന്നാൾ) ദിനത്തിൽ

നക്ഷത്രപൂജ:
കാലത്തിനെ വിനാഴിക, നാഴിക, ദിനരാത്രം, കൃഷ്ണൻ, ശുക്രകല്പം തുടങ്ങിയ ദിനത്തിൽ പക്കാങ്ങളും വൈകല്യങ്ങളും വിളക്കെട്ടുവക്കുന്നു. ജാതക മദണ്ടെളൾ സംവര്‍ഥിച്ച നക്ഷത്രങ്ങളെ കണക്കാക്കി ആചരിക്കുന്നു.`,
      descriptionEnglish: `Special offerings to Varahi Devi on birth star (Janma Nakshatra) days

This specialized Vedic ritual is performed based on one's birth star, considering various astrological factors including time calculations, lunar phases, and planetary positions. The worship helps overcome difficulties indicated in one's horoscope and brings divine blessings through proper archana and homas performed according to each nakshatra's specific requirements.

The Nakshatra Parihara Puja performed in the presence of Varahi Devi helps devotees overcome poverty, obstacles, and negative karmic influences while blessing them with prosperity and divine grace.`,
      onlineBookingAvailable: true
    };

    // 3. Special Festival Offerings (Parent Category)
    const specialFestivalOfferings = {
      id: 42,
      poojaEnglish: 'Special Festival Offerings',
      pooja: 'വിശേഷാൽ വഴിപാടുകൾ',
      malayalamDate: 'വിവിധ അവസരങ്ങളിൽ',
      day: 'വിശേഷ ദിവസങ്ങളിൽ',
      date: null,
      amount: null, // Parent category - no direct amount
      category: 'parent',
      special: true,
      hasSubcategories: true,
      maxParticipants: null, // Parent category has limit
      description: 'വാരാഹി ദേവിക്കുള്ള വിശേഷ വഴിപാടുകളും ആരാധനകളും',
      descriptionEnglish: 'Special ritual offerings and worship ceremonies for Varahi Devi',
      onlineBookingAvailable: false
    };

    // ALL SUBCATEGORIES - NO PARTICIPANT LIMITS FOR SPECIFIED POOJAS
    const subcategoryPoojas = [
      {

        id: 43,
        poojaEnglish: 'Kalappa Samarpanam',
        pooja: 'കलപ്പ സമർപണം',
        malayalamDate: 'എല്ലാ ദിവസവും',
        day: 'എല്ലാ ദിവസങ്ങളിലും',
        date: null,
        amount: 100,
        category: 'subcategory',
        special: false,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // ✅ NO LIMIT
        description: 'വിവാഹം വ്യവസായക്കോ വിവാഹോത്സവക്കോ സന്തതിയോ എന്ന് വേണ്ടാ എല്ലാ തടസ്സങ്ങളും മാറി ആഗ്രഹം സാധിക്കുവാൻ വാരാഹിദേവിക്ക് കलപ്പ സമർപിച്ച് പ്രാർത്ഥിക്കുക.',
        descriptionEnglish: 'For marriage, business success, or progeny - to remove all obstacles and fulfill desires, offer Kalappa (ceremonial plough) to Varahi Devi and pray. Available for online booking.',
        onlineBookingAvailable: true,     // ✅ Keep this
        requiresDirectVisit: false        // 🔧 CHANGE: Set to false for online booking

      },
      {
        id: 44,
        poojaEnglish: 'Panchami Pooja (Special Festival)',
        pooja: 'പഞ്ചമി പൂജ',
        malayalamDate: 'പഞ്ചമി ദിവസങ്ങളിൽ',
        day: 'പഞ്ചമി',
        date: null,
        amount: 500,
        category: 'subcategory',
        special: true,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // NO LIMIT
        description: 'വാരാഹി പ്രതിഷ്ഠായിൽ കൃഷ്ണപക്ഷത്തിലേയും ശുക്ളപക്ഷത്തിലേയും പഞ്ചമികളിൽ വിശേഷാൽ പൂജകളും ഗുരുത്വവും എല്ലാ തരത്തിലുള്ള അപൂർവ്വവിവാഹത്തിനും സകലചാഷ്ടകേണിച്ചാക്കും മുൻകൂട്ടി ബുക്ക് ചെയ്യണം',
        descriptionEnglish: 'On Panchami days in both Krishna Paksha and Shukla Paksha, special pujas and worship are performed at Varahi shrine. For all types of marriages and removing all obstacles. Advance booking required.',
        requiresAdvanceBooking: true,
        onlineBookingAvailable: true
      },
      {
        id: 45,
        poojaEnglish: 'Soil Offering',
        pooja: 'മണ്ണ് സമർപണം',
        malayalamDate: 'എല്ലാ ദിവസവും',
        day: 'എല്ലാ ദിവസങ്ങളിലും',
        date: null,
        amount: 50,
        category: 'subcategory',
        special: false,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // NO LIMIT
        description: `വടക്കു കിഴക്കുമുല (ഈശാന കോൺ) യിൽ നിന്ന് ഒരു പിടി മണ്ണ് ഏറിച്ച് കഴുകി വൃത്തിയാക്കിയ ശേഷം അതിൽ നിന്നും ഒരു സ്പൂൺ മണ്ണ് ഉണക്കി കരടുകൾ മാറ്റി സമർപണം നടത്തുക. മണ്ണ് കൊണ്ടുവരുന്ന കവർ, ടിന്നുകൾ ക്ഷേത്ര ഭൂമിയിൽ ഉപേക്ഷിക്കാതെ തിരിച്ചു കൊണ്ടു പോകേണ്ടതാണ്. ക്ഷേത്രത്തിൽ മുൻകൂട്ടി അറിയിക്കുക.`,
        descriptionEnglish: `Take a handful of soil from the northeast corner (Ishana corner) of the temple premises, wash and clean it properly. After that, take one spoon of dried soil from it, remove impurities, and make the offering. The bags and containers used to collect the soil should not be left on temple premises and must be taken back. Prior notification to temple required - call +91 8304091400.`,
        requiresNotification: true,
        requiresDirectVisit: true, // This requires physical presence
        onlineBookingAvailable: false
      },
      {
        id: 46,
        poojaEnglish: 'Vidya Varahi Pooja',
        pooja: 'വിദ്യാ വാരാഹി പൂജ',
        malayalamDate: 'എല്ലാ ദിവസവും',
        day: 'എല്ലാ ദിവസങ്ങളിലും',
        date: null,
        amount: 200,
        category: 'subcategory',
        special: false,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // NO LIMIT
        description: 'വളന്നുസ് സുബ്റാണമായ എല്ലാ ദേവക്ഷങ്ങളും പരിഹാരിക്കുവാനും വിർഗ്ആ്രുവിക്ക് എറങ്ങമാഥിലേയും തടസ്സം ഉണ്ടാക്കിൽ അത് തിരുവാണന്ന വാസരാവിലെ ഒറ്റ് വാരാഹിദേവിക്ക് സമർപിക്കാം',
        descriptionEnglish: 'Educational/wisdom worship - To overcome all types of obstacles and difficulties, and to remove impediments in life\'s progress through Vidya Varahi worship. Special offerings can be made to Varahi Devi.',
        onlineBookingAvailable: true
      },
      {
        id: 47,
        poojaEnglish: 'Chayarpanam',
        pooja: 'ചയാർപണം',
        malayalamDate: 'എല്ലാ ദിവസവും',
        day: 'എല്ലാ ദിവസങ്ങളിലും',
        date: null,
        amount: 800,
        category: 'subcategory',
        special: false,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // NO LIMIT
        description: 'കുട്ടികളുടെ വിദ്യാരംഭത്തെ ഉന്നതി ബുദ്ധിവിദും ഓർമശക്തിയും വർദ്ധിക്കാനും ബുക്ക് ചെയ്യാവുന്നതാണ്',
        descriptionEnglish: 'Special ritual offering - For children\'s educational commencement and progress, to enhance intelligence and memory power. Can be booked for the ritual.',
        requiresBooking: true,
        onlineBookingAvailable: true
      },
      {
        id: 48,
        poojaEnglish: 'Varahi Devikkum Nagangalkkum Kalamezhuthum Pattum',
        pooja: 'വാരാഹി ദേവിക്കും നാഗങ്ങൾക്കും കളമെഴുത്തും പാട്ടും',
        malayalamDate: 'വിശേഷ ദിവസങ്ങളിൽ',
        day: 'വിശേഷ ദിവസങ്ങളിൽ',
        date: null,
        amount: 5000,
        category: 'subcategory',
        special: true,
        parentCategory: 'വിശേഷാൽ വഴിപാടുകൾ',
        maxParticipants: null, // NO LIMIT
        description: `കർമദുഷിതുള്ള ദോഷങ്ങളായ പങ്ങളാൽ കളങ്കം, സാമ്പത്തിക ദോഷങ്ങളെയും അനിഷ്ട കാരണങ്ങൾ കർമ ദുരിത പാപങ്ങളെയും ടര്യാരള്ളാതിൽ എന്തിൽ ആവാഹനച്ച് വിളക്കിൽ സമർപിക്കാന്നു

ദേവാശീർവാദണം, കാര്യവിജയം, ഐശ്വര്യപ്രാപ്തി എന്നിവക്കുത്തമായ വിശേഷാൽ വഴിപാടാണ് കളമെഴുത്ത് അവധാന കളങ്ങളുന്തും പാട്ട്`,
        descriptionEnglish: `Combined worship for Varahi Devi and Serpent deities with Kalamezhuthu (ritual floor art) and devotional songs. This comprehensive ritual removes karmic defects, financial problems, and inauspicious influences through lamp offerings and divine invocation. 

It brings divine blessings, success in endeavors, and prosperity through the sacred art of ritual floor painting (Kalamezhuthu) and traditional devotional singing with special attention to ceremonial performances.`,
        isComprehensiveRitual: true,
        requiresAdvanceBooking: true,
        onlineBookingAvailable: true
      }
    ];

    // Combine all poojas
    const allPoojas = [
      ...allTemplePoojas,
      dailyWorshipPooja,
      nakshatraPooja,
      specialFestivalOfferings,
      ...subcategoryPoojas
    ];

    await Pooja.insertMany(allPoojas);
    console.log('Added all temple poojas with descriptions');

    // FIXED: Update this console log section at the end of your seed file:

    console.log('✅ Enhanced temple data added successfully!');
    console.log('Database now has:');
    console.log('- 27 Malayalam Stars (Nakshatras)');
    console.log('- 39 Original Temple Poojas for 2025 [120 participant limit each]');
    console.log('- 9 Enhanced Poojas with NO PARTICIPANT LIMITS:'); // FIXED: Changed from 8 to 9
    console.log('  • Daily Worship Schedule (ID: 40) - ₹2500 [NO LIMIT] [Online Booking]');
    console.log('  • Nakshatra Pooja (ID: 41) - ₹200 [NO LIMIT] [Online Booking]');
    console.log('  • Special Festival Offerings (ID: 42) - Parent [NO LIMIT] ✅'); // FIXED: Added this line
    console.log('  • Kalappa Samarpanam (ID: 43) - ₹100 [NO LIMIT] [Online Booking] ✅');
    console.log('  • Panchami Pooja Special Festival (ID: 44) - ₹500 [NO LIMIT] [Online Booking]');
    console.log('  • Soil Offering (ID: 45) - ₹50 [NO LIMIT] [Direct Visit Required]');
    console.log('  • Vidya Varahi Pooja (ID: 46) - ₹200 [NO LIMIT] [Online Booking]');
    console.log('  • Chayarpanam (ID: 47) - ₹800 [NO LIMIT] [Online Booking]');
    console.log('  • Kalamezhuthu & Songs (ID: 48) - ₹5000 [NO LIMIT] [Online Booking]');
    console.log('- 1 Parent Category with NO LIMIT ✅'); // FIXED: Changed from "120 limit" to "NO LIMIT"
    console.log('- Total Poojas: 48 (39 original + 9 enhanced)'); // FIXED: Changed from 8 to 9
    console.log('- Categories: regular, special, festival, premium, parent, subcategory');
    console.log('- Participant Limits: 120 for original poojas, NULL (unlimited) for 9 enhanced poojas'); // FIXED: Changed from 8 to 9
    console.log('- All enhanced poojas have descriptions in both Malayalam and English ✅');
    console.log('- Kalappa Samarpanam supports online booking as requested ✅');

    process.exit(0);

  } catch (error) {
    console.error('Error adding enhanced temple data:', error);
    process.exit(1);
  }
};