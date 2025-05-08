import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper to generate a random date in the past
const getRandomPastDate = (yearsBack: number = 1): string => {
  const today = new Date();
  const pastDate = new Date(today.getFullYear() - yearsBack, 
                           Math.floor(Math.random() * 12), 
                           Math.floor(Math.random() * 28) + 1);
  return pastDate.toISOString();
};

// Generate a random birthday for someone between 25-45 years old
const getRandomBirthday = (): string => {
  const today = new Date();
  const year = today.getFullYear() - Math.floor(Math.random() * 20) - 25; // 25-45 years old
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day).toISOString().split('T')[0]; // Just the date part
};

// Location coordinates around major cities
const locationAreas = [
  { city: "New York", lat: 40.7128, lng: -74.0060 },
  { city: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { city: "Chicago", lat: 41.8781, lng: -87.6298 },
  { city: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { city: "Miami", lat: 25.7617, lng: -80.1918 },
];

// Generate a random nearby location (within 20 miles)
const getNearbyLocation = (area: typeof locationAreas[0]): { lat: number, lng: number } => {
  // 0.14 degrees is roughly 10 miles
  const latOffset = (Math.random() - 0.5) * 0.28; // +/- 10 miles
  const lngOffset = (Math.random() - 0.5) * 0.28;
  
  return {
    lat: area.lat + latOffset,
    lng: area.lng + lngOffset
  };
};

// Sample profile photos (placeholders)
const samplePhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=500",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500",
  "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?q=80&w=500",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=500",
];

export const generateSampleData = async (userId: string) => {
  try {
    // Create 10 sample profiles with IDs
    const sampleProfiles = Array.from({ length: 10 }, (_, i) => {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const interestedIn = Math.random() > 0.8 ? ['male', 'female'] : [gender === 'male' ? 'female' : 'male'];
      const randomLocation = getRandomItem(locationAreas);
      const coords = getNearbyLocation(randomLocation);
      
      return {
        id: uuidv4(), // Generate UUID for each profile
        full_name: `Sample Person ${i + 1}`,
        birthday: getRandomBirthday(),
        gender,
        interested_in: interestedIn,
        bio: `I'm a sample profile ${i + 1}. I enjoy hiking, reading, and trying new restaurants.`,
        job_title: getRandomItem([
          'Software Engineer',
          'Product Manager', 
          'Marketing Specialist', 
          'UX Designer', 
          'Data Scientist'
        ]),
        company: getRandomItem([
          'Tech Innovations', 
          'Global Solutions', 
          'Creative Labs', 
          'Data Insights', 
          'Future Corp'
        ]),
        education: getRandomItem([
          'Stanford University',
          'MIT',
          'UC Berkeley',
          'Harvard University',
          'New York University'
        ]),
        skills: ['Communication', 'Leadership', 'Teamwork'],
        location: `${randomLocation.city} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        photos: [getRandomItem(samplePhotos)]
      };
    });
    
    // Insert profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(sampleProfiles);
    
    if (profilesError) {
      console.error('Error inserting sample profiles:', profilesError);
      throw profilesError;
    }
    
    // Create sample matches between user and sample profiles
    const sampleMatches = sampleProfiles.slice(0, 5).map(profile => ({
      id: uuidv4(),
      user1: userId,
      user2: profile.id,
      status: getRandomItem(['pending', 'accepted', 'rejected']),
      is_anonymous: Math.random() > 0.7
    }));
    
    const { error: matchesError } = await supabase
      .from('matches')
      .upsert(sampleMatches);
    
    if (matchesError) {
      console.error('Error inserting sample matches:', matchesError);
      throw matchesError;
    }
    
    // Create sample messages for the first 3 matches
    const messagesData = [];
    
    for (let i = 0; i < 3; i++) {
      const match = sampleMatches[i];
      const messageCount = Math.floor(Math.random() * 5) + 3; // 3-7 messages
      
      for (let j = 0; j < messageCount; j++) {
        // Alternate sender between user and match
        const senderId = j % 2 === 0 ? userId : match.user2;
        
        messagesData.push({
          id: uuidv4(),
          match_id: match.id,
          sender_id: senderId,
          content: `This is sample message ${j + 1} in conversation ${i + 1}.`,
          read: senderId === userId,
          created_at: getRandomPastDate(0.1) // Within last month
        });
      }
    }
    
    if (messagesData.length > 0) {
      const { error: messagesError } = await supabase
        .from('messages')
        .upsert(messagesData);
      
      if (messagesError) {
        console.error('Error inserting sample messages:', messagesError);
        throw messagesError;
      }
    }
    
    // Create sample date for the first match
    const { error: dateError } = await supabase
      .from('dates')
      .upsert([{
        id: uuidv4(),
        match_id: sampleMatches[0].id,
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
        location_name: 'Coffee House Deluxe',
        location_address: '123 Main St, Anytown, USA',
        type: 'coffee',
        status: 'scheduled'
      }]);
    
    if (dateError) {
      console.error('Error inserting sample date:', dateError);
      throw dateError;
    }
    
    // Create sample loyalty venues
    const sampleVenues = [
      {
        id: uuidv4(),
        name: 'Coffee Haven',
        address: '456 Oak St, Anytown, USA',
        type: 'coffee',
        discount_free: 5,
        discount_premium: 10,
        discount_premium_plus: 15,
        logo_url: 'https://via.placeholder.com/150?text=Coffee+Haven'
      },
      {
        id: uuidv4(),
        name: 'Bistro Palace',
        address: '789 Maple Ave, Anytown, USA',
        type: 'meal',
        discount_free: 0,
        discount_premium: 15,
        discount_premium_plus: 20,
        logo_url: 'https://via.placeholder.com/150?text=Bistro+Palace'
      },
      {
        id: uuidv4(),
        name: 'The Cozy Corner',
        address: '101 Pine St, Anytown, USA',
        type: 'coffee',
        discount_free: 5,
        discount_premium: 10,
        discount_premium_plus: 15,
        logo_url: 'https://via.placeholder.com/150?text=Cozy+Corner'
      },
      {
        id: uuidv4(),
        name: 'Sunset Bar & Grill',
        address: '202 Beach Rd, Anytown, USA',
        type: 'drink',
        discount_free: 0,
        discount_premium: 10,
        discount_premium_plus: 25,
        logo_url: 'https://via.placeholder.com/150?text=Sunset+Bar'
      }
    ];
    
    const { error: venuesError } = await supabase
      .from('loyalty_venues')
      .upsert(sampleVenues);
    
    if (venuesError) {
      console.error('Error inserting sample venues:', venuesError);
      throw venuesError;
    }
    
    return {
      profiles: sampleProfiles,
      matches: sampleMatches,
      messages: messagesData,
      venues: sampleVenues
    };
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
};
