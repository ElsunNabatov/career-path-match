
import { supabase } from "@/lib/supabase";

export const generateSampleData = async (userId: string) => {
  try {
    // Check if we already have sample data for this user
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('id')
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .limit(1);
      
    if (existingMatches && existingMatches.length > 0) {
      console.log("Sample data already exists for this user");
      return;
    }
    
    // Create sample profiles
    const sampleProfiles = [
      {
        full_name: "Emily Johnson",
        birthday: "1995-10-15",
        gender: "female",
        interested_in: ["male"],
        bio: "Product Manager passionate about user experiences. Love hiking on weekends and exploring new coffee shops.",
        job_title: "Product Manager",
        company: "Tech Innovations",
        education: "MBA, Stanford University",
        skills: ["Product Strategy", "User Research", "Agile", "Data Analysis"],
        location: "San Francisco, CA",
        photos: ["https://randomuser.me/api/portraits/women/44.jpg"],
      },
      {
        full_name: "Michael Chen",
        birthday: "1992-05-23",
        gender: "male",
        interested_in: ["female"],
        bio: "Software engineer with a passion for AI and machine learning. Enjoy rock climbing and playing guitar in my free time.",
        job_title: "Senior Software Engineer",
        company: "CloudTech Solutions",
        education: "MS Computer Science, MIT",
        skills: ["JavaScript", "React", "Node.js", "Cloud Architecture"],
        location: "Seattle, WA",
        photos: ["https://randomuser.me/api/portraits/men/32.jpg"],
      },
      {
        full_name: "Sophia Rodriguez",
        birthday: "1996-08-12",
        gender: "female",
        interested_in: ["male"],
        bio: "Marketing Director who loves creative campaigns. Foodie, travel enthusiast, and part-time yoga instructor.",
        job_title: "Marketing Director",
        company: "Creative Media Group",
        education: "BA Communications, Columbia University",
        skills: ["Brand Strategy", "Content Marketing", "Social Media", "Analytics"],
        location: "New York, NY",
        photos: ["https://randomuser.me/api/portraits/women/68.jpg"],
      },
      {
        full_name: "David Kim",
        birthday: "1991-03-27",
        gender: "male",
        interested_in: ["female"],
        bio: "Financial analyst by day, amateur chef by night. Always looking for new restaurants to try and recipes to master.",
        job_title: "Financial Analyst",
        company: "Global Investments",
        education: "BBA Finance, University of Chicago",
        skills: ["Financial Modeling", "Data Analysis", "Risk Assessment", "Excel"],
        location: "Chicago, IL",
        photos: ["https://randomuser.me/api/portraits/men/75.jpg"],
      },
      {
        full_name: "Olivia Martinez",
        birthday: "1994-12-03",
        gender: "female",
        interested_in: ["male"],
        bio: "UX Designer who believes in creating intuitive digital experiences. Art lover, podcast host, and proud dog mom.",
        job_title: "UX Designer",
        company: "Design Studios Inc.",
        education: "BFA Graphic Design, RISD",
        skills: ["User Research", "Wireframing", "Prototyping", "Figma", "Adobe XD"],
        location: "Austin, TX",
        photos: ["https://randomuser.me/api/portraits/women/90.jpg"],
      }
    ];
    
    // Insert the profiles
    const { data: createdProfiles, error: profileError } = await supabase
      .from('profiles')
      .insert(sampleProfiles)
      .select();
      
    if (profileError) throw profileError;
    
    if (!createdProfiles || createdProfiles.length === 0) {
      throw new Error("Failed to create sample profiles");
    }
    
    // Create matches between the user and sample profiles
    const matchPromises = createdProfiles.map(async (profile) => {
      const isAnonymous = Math.random() > 0.5;
      
      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1: userId,
          user2: profile.id,
          is_anonymous: isAnonymous,
          identity_revealed: !isAnonymous,
          status: 'accepted'
        })
        .select();
        
      if (matchError) throw matchError;
      
      if (!match || match.length === 0) {
        return;
      }
      
      // Create conversations for each match
      const matchId = match[0].id;
      
      // Create messages
      const messages = [
        {
          match_id: matchId,
          sender_id: userId,
          content: `Hi ${profile.full_name}, nice to connect with you!`,
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
        },
        {
          match_id: matchId,
          sender_id: profile.id,
          content: `Hello! Thanks for reaching out. I see we both like ${profile.skills?.[0] || 'professional development'}. What's your background in it?`,
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
        },
        {
          match_id: matchId,
          sender_id: userId,
          content: "I've been working in the field for a few years now. Would you be interested in grabbing coffee sometime to discuss more?",
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() // 1 day ago
        }
      ];
      
      // Only add response for some matches
      if (Math.random() > 0.3) {
        messages.push({
          match_id: matchId,
          sender_id: profile.id,
          content: "That sounds great! I'm free this weekend if that works for you.",
          read: Math.random() > 0.5, // some read, some unread
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
        });
      }
      
      await supabase.from('messages').insert(messages);
      
      // Create a date for some matches
      if (Math.random() > 0.6) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        const date = {
          match_id: matchId,
          date_time: futureDate.toISOString(),
          location_name: "Coastal Coffee",
          location_address: "123 Seaside Ave, San Francisco, CA",
          type: Math.random() > 0.5 ? "coffee" : "meal",
          status: "scheduled"
        };
        
        await supabase.from('dates').insert([date]);
      }
    });
    
    await Promise.all(matchPromises);
    
    return { success: true };
  } catch (error) {
    console.error("Error generating sample data:", error);
    return { success: false, error };
  }
};
