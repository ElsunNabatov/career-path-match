import { Profile } from "@/types/supabase";

export interface CompatibilityResult {
  score: number; // 0-100
  insights: string[];
  pros: string[];
  cons: string[];
  zodiacMatch?: {
    score: number;
    description: string;
  };
  lifePathMatch?: {
    score: number;
    description: string;
  };
}

// Map zodiac signs to their dates
const zodiacSignDates = {
  'Aries': { start: '03-21', end: '04-19' },
  'Taurus': { start: '04-20', end: '05-20' },
  'Gemini': { start: '05-21', end: '06-20' },
  'Cancer': { start: '06-21', end: '07-22' },
  'Leo': { start: '07-23', end: '08-22' },
  'Virgo': { start: '08-23', end: '09-22' },
  'Libra': { start: '09-23', end: '10-22' },
  'Scorpio': { start: '10-23', end: '11-21' },
  'Sagittarius': { start: '11-22', end: '12-21' },
  'Capricorn': { start: '12-22', end: '01-19' },
  'Aquarius': { start: '01-20', end: '02-18' },
  'Pisces': { start: '02-19', end: '03-20' }
};

// Calculate zodiac sign from birthday
export const getZodiacSign = (birthday: string): string | null => {
  if (!birthday) return null;
  
  try {
    const date = new Date(birthday);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${month}-${day}`;
    
    for (const [sign, { start, end }] of Object.entries(zodiacSignDates)) {
      // Handle Capricorn (spans across years)
      if (sign === 'Capricorn') {
        if (formattedDate >= '12-22' || formattedDate <= '01-19') {
          return sign;
        }
      }
      // Handle other signs
      else if (formattedDate >= start && formattedDate <= end) {
        return sign;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating zodiac sign:', error);
    return null;
  }
};

// Calculate life path number from birthday
export const calculateLifePathNumber = (birthday: string): number | null => {
  if (!birthday) return null;
  
  try {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Sum all digits
    const sumDigits = (num: number): number => {
      let sum = 0;
      while (num > 0) {
        sum += num % 10;
        num = Math.floor(num / 10);
      }
      return sum;
    };
    
    // Calculate sum of each component
    let yearSum = sumDigits(year);
    let monthSum = sumDigits(month);
    let daySum = sumDigits(day);
    
    // Reduce to single digit
    const reduceToSingleDigit = (num: number): number => {
      while (num > 9) {
        num = sumDigits(num);
      }
      return num;
    };
    
    yearSum = reduceToSingleDigit(yearSum);
    monthSum = reduceToSingleDigit(monthSum);
    daySum = reduceToSingleDigit(daySum);
    
    // Calculate final sum
    let lifePathNumber = yearSum + monthSum + daySum;
    
    // Reduce to single digit if not a master number (11, 22, 33)
    if (lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
      lifePathNumber = reduceToSingleDigit(lifePathNumber);
    }
    
    return lifePathNumber;
  } catch (error) {
    console.error('Error calculating life path number:', error);
    return null;
  }
};

// Compatibility analysis
export const analyzeCompatibility = (userProfile: Profile | null, targetProfile: Profile | null): CompatibilityResult => {
  if (!userProfile || !targetProfile) {
    return {
      score: 0,
      insights: ['Profiles incomplete. Unable to determine compatibility.'],
      pros: [],
      cons: []
    };
  }
  
  // Calculate individual components
  const userZodiac = getZodiacSign(userProfile.birthday);
  const targetZodiac = getZodiacSign(targetProfile.birthday);
  
  const userLifePath = calculateLifePathNumber(userProfile.birthday);
  const targetLifePath = calculateLifePathNumber(targetProfile.birthday);
  
  // Random starting score between 65-85
  let compatibilityScore = 65 + Math.floor(Math.random() * 20);
  const insights: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Zodiac compatibility
  const zodiacMatch = calculateZodiacCompatibility(userZodiac, targetZodiac);
  if (zodiacMatch) {
    compatibilityScore = Math.round((compatibilityScore + zodiacMatch.score) / 2);
    insights.push(zodiacMatch.description);
    if (zodiacMatch.score >= 75) {
      pros.push('Astrologically well-matched');
    } else if (zodiacMatch.score <= 40) {
      cons.push('Astrological challenges may arise');
    }
  }
  
  // Life path compatibility
  const lifePathMatch = calculateLifePathCompatibility(userLifePath, targetLifePath);
  if (lifePathMatch) {
    compatibilityScore = Math.round((compatibilityScore + lifePathMatch.score) / 2);
    insights.push(lifePathMatch.description);
    if (lifePathMatch.score >= 75) {
      pros.push('Life paths complement each other well');
    } else if (lifePathMatch.score <= 40) {
      cons.push('May have differing life approaches');
    }
  }
  
  // Career/skills compatibility
  const careerMatch = analyzeCareerCompatibility(userProfile, targetProfile);
  compatibilityScore = Math.round((compatibilityScore + careerMatch.score) / 2);
  insights.push(careerMatch.insight);
  if (careerMatch.score >= 75) {
    pros.push('Strong career alignment');
    pros.push('Professional goals highly compatible');
  } else if (careerMatch.score >= 50) {
    pros.push('Can learn from each other\'s professional experiences');
  } else {
    cons.push('Career paths may create tension');
  }
  
  // Add some personality-based insights
  if (Math.random() > 0.5) {
    pros.push('Natural personality alignment');
    insights.push('Your communication styles appear to complement each other');
  } else {
    cons.push('May need to work on communication');
    insights.push('Different communication styles could be challenging but growth-oriented');
  }
  
  return {
    score: compatibilityScore,
    insights,
    pros,
    cons,
    zodiacMatch,
    lifePathMatch
  };
};

// Helper functions for compatibility calculations
const calculateZodiacCompatibility = (sign1: string | null, sign2: string | null): { score: number; description: string } | null => {
  if (!sign1 || !sign2) return null;
  
  // Sample compatibility logic (simplified)
  const compatiblePairs: Record<string, string[]> = {
    'Aries': ['Leo', 'Sagittarius', 'Gemini'],
    'Taurus': ['Virgo', 'Capricorn', 'Cancer'],
    'Gemini': ['Libra', 'Aquarius', 'Aries'],
    'Cancer': ['Scorpio', 'Pisces', 'Taurus'],
    'Leo': ['Aries', 'Sagittarius', 'Gemini'],
    'Virgo': ['Taurus', 'Capricorn', 'Cancer'],
    'Libra': ['Gemini', 'Aquarius', 'Leo'],
    'Scorpio': ['Cancer', 'Pisces', 'Virgo'],
    'Sagittarius': ['Aries', 'Leo', 'Libra'],
    'Capricorn': ['Taurus', 'Virgo', 'Scorpio'],
    'Aquarius': ['Gemini', 'Libra', 'Sagittarius'],
    'Pisces': ['Cancer', 'Scorpio', 'Capricorn']
  };
  
  // Opposite signs (can be challenging but powerful)
  const oppositePairs: Record<string, string> = {
    'Aries': 'Libra',
    'Taurus': 'Scorpio',
    'Gemini': 'Sagittarius',
    'Cancer': 'Capricorn',
    'Leo': 'Aquarius',
    'Virgo': 'Pisces',
    'Libra': 'Aries',
    'Scorpio': 'Taurus',
    'Sagittarius': 'Gemini',
    'Capricorn': 'Cancer',
    'Aquarius': 'Leo',
    'Pisces': 'Virgo'
  };
  
  let score: number;
  let description: string;
  
  if (sign1 === sign2) {
    // Same sign
    score = 70 + Math.floor(Math.random() * 15);
    description = `As two ${sign1}s, you understand each other deeply, though you may compete at times.`;
  } else if (compatiblePairs[sign1].includes(sign2)) {
    // Compatible signs
    score = 80 + Math.floor(Math.random() * 15);
    description = `${sign1} and ${sign2} have a natural harmony that creates a balanced connection.`;
  } else if (oppositePairs[sign1] === sign2) {
    // Opposite signs
    score = 60 + Math.floor(Math.random() * 25);
    description = `${sign1} and ${sign2} are astrological opposites, which can create both intense attraction and challenges.`;
  } else {
    // Other combinations
    score = 50 + Math.floor(Math.random() * 25);
    description = `${sign1} and ${sign2} have differences to navigate, but this can lead to growth for both of you.`;
  }
  
  return { score, description };
};

const calculateLifePathCompatibility = (path1: number | null, path2: number | null): { score: number; description: string } | null => {
  if (path1 === null || path2 === null) return null;
  
  const compatiblePaths: Record<number, number[]> = {
    1: [3, 5, 7],
    2: [4, 6, 8],
    3: [1, 5, 9],
    4: [2, 8, 22],
    5: [1, 3, 7],
    6: [2, 9],
    7: [1, 5],
    8: [2, 4],
    9: [3, 6],
    11: [11, 22, 33],
    22: [4, 11, 22, 33],
    33: [11, 22, 33]
  };
  
  let score: number;
  let description: string;
  
  if (path1 === path2) {
    // Same path
    score = 75 + Math.floor(Math.random() * 15);
    description = `You both share Life Path ${path1}, creating a strong understanding but potential for competition.`;
  } else if (compatiblePaths[path1]?.includes(path2)) {
    // Compatible paths
    score = 85 + Math.floor(Math.random() * 15);
    description = `Life Paths ${path1} and ${path2} complement each other beautifully.`;
  } else {
    // Less compatible paths
    score = 55 + Math.floor(Math.random() * 20);
    description = `Life Paths ${path1} and ${path2} bring different energies that can be balancing with effort.`;
  }
  
  return { score, description };
};

const analyzeCareerCompatibility = (profile1: Profile, profile2: Profile): { score: number; insight: string } => {
  const skills1 = profile1.skills || [];
  const skills2 = profile2.skills || [];
  
  // Find overlapping skills
  const commonSkills = skills1.filter(skill => skills2.includes(skill));
  const commonSkillRatio = commonSkills.length / Math.max(1, Math.min(skills1.length, skills2.length));
  
  // Career similarity
  const sameIndustry = profile1.job_title?.toLowerCase().includes(profile2.job_title?.toLowerCase() || '') ||
                      profile2.job_title?.toLowerCase().includes(profile1.job_title?.toLowerCase() || '');
  
  let score: number;
  let insight: string;
  
  if (commonSkillRatio > 0.5 || sameIndustry) {
    // High similarity
    score = 80 + Math.floor(Math.random() * 15);
    insight = "You share professional interests and experiences, creating a strong foundation.";
  } else if (commonSkillRatio > 0.2) {
    // Moderate similarity
    score = 65 + Math.floor(Math.random() * 15);
    insight = "Your professional backgrounds have enough in common to understand each other's worlds.";
  } else {
    // Low similarity
    score = 50 + Math.floor(Math.random() * 15);
    insight = "Your diverse professional backgrounds can bring fresh perspectives to each other.";
  }
  
  return { score, insight };
};

export default {
  analyzeCompatibility,
  getZodiacSign,
  calculateLifePathNumber
};
