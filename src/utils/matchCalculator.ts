
// Match calculation algorithm

// Calculate Life Path Number
export const calculateLifePathNumber = (birthdate: Date): number => {
  // Get date components
  const day = birthdate.getDate();
  const month = birthdate.getMonth() + 1;
  const year = birthdate.getFullYear();
  
  // Sum all digits
  const sumDigits = (num: number): number => {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum > 9 ? sumDigits(sum) : sum;
  };
  
  // Calculate life path number
  const daySum = sumDigits(day);
  const monthSum = sumDigits(month);
  const yearSum = sumDigits(year);
  
  const totalSum = daySum + monthSum + yearSum;
  return sumDigits(totalSum);
};

// Get zodiac sign
export const getZodiacSign = (birthdate: Date): string => {
  const month = birthdate.getMonth() + 1;
  const day = birthdate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
};

// Calculate compatibility between zodiac signs (simplified)
export const getZodiacCompatibility = (sign1: string, sign2: string): number => {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    "Aries": { "Aries": 70, "Taurus": 60, "Gemini": 85, "Cancer": 65, "Leo": 90, "Virgo": 45, "Libra": 75, "Scorpio": 50, "Sagittarius": 95, "Capricorn": 40, "Aquarius": 80, "Pisces": 55 },
    "Taurus": { "Aries": 60, "Taurus": 85, "Gemini": 50, "Cancer": 90, "Leo": 70, "Virgo": 95, "Libra": 80, "Scorpio": 90, "Sagittarius": 40, "Capricorn": 95, "Aquarius": 50, "Pisces": 85 },
    "Gemini": { "Aries": 85, "Taurus": 50, "Gemini": 80, "Cancer": 60, "Leo": 85, "Virgo": 75, "Libra": 95, "Scorpio": 55, "Sagittarius": 90, "Capricorn": 45, "Aquarius": 95, "Pisces": 50 },
    "Cancer": { "Aries": 65, "Taurus": 90, "Gemini": 60, "Cancer": 85, "Leo": 65, "Virgo": 80, "Libra": 60, "Scorpio": 90, "Sagittarius": 45, "Capricorn": 85, "Aquarius": 40, "Pisces": 95 },
    "Leo": { "Aries": 90, "Taurus": 70, "Gemini": 85, "Cancer": 65, "Leo": 85, "Virgo": 55, "Libra": 90, "Scorpio": 65, "Sagittarius": 95, "Capricorn": 50, "Aquarius": 70, "Pisces": 60 },
    "Virgo": { "Aries": 45, "Taurus": 95, "Gemini": 75, "Cancer": 80, "Leo": 55, "Virgo": 85, "Libra": 70, "Scorpio": 85, "Sagittarius": 50, "Capricorn": 90, "Aquarius": 60, "Pisces": 75 },
    "Libra": { "Aries": 75, "Taurus": 80, "Gemini": 95, "Cancer": 60, "Leo": 90, "Virgo": 70, "Libra": 80, "Scorpio": 65, "Sagittarius": 85, "Capricorn": 55, "Aquarius": 90, "Pisces": 65 },
    "Scorpio": { "Aries": 50, "Taurus": 90, "Gemini": 55, "Cancer": 90, "Leo": 65, "Virgo": 85, "Libra": 65, "Scorpio": 90, "Sagittarius": 45, "Capricorn": 80, "Aquarius": 50, "Pisces": 95 },
    "Sagittarius": { "Aries": 95, "Taurus": 40, "Gemini": 90, "Cancer": 45, "Leo": 95, "Virgo": 50, "Libra": 85, "Scorpio": 45, "Sagittarius": 90, "Capricorn": 55, "Aquarius": 90, "Pisces": 50 },
    "Capricorn": { "Aries": 40, "Taurus": 95, "Gemini": 45, "Cancer": 85, "Leo": 50, "Virgo": 90, "Libra": 55, "Scorpio": 80, "Sagittarius": 55, "Capricorn": 85, "Aquarius": 65, "Pisces": 75 },
    "Aquarius": { "Aries": 80, "Taurus": 50, "Gemini": 95, "Cancer": 40, "Leo": 70, "Virgo": 60, "Libra": 90, "Scorpio": 50, "Sagittarius": 90, "Capricorn": 65, "Aquarius": 80, "Pisces": 60 },
    "Pisces": { "Aries": 55, "Taurus": 85, "Gemini": 50, "Cancer": 95, "Leo": 60, "Virgo": 75, "Libra": 65, "Scorpio": 95, "Sagittarius": 50, "Capricorn": 75, "Aquarius": 60, "Pisces": 85 }
  };
  
  return compatibilityMatrix[sign1]?.[sign2] || 50;
};

// Calculate numerology compatibility
export const getNumerologyCompatibility = (number1: number, number2: number): number => {
  const compatibilityMatrix: Record<number, Record<number, number>> = {
    1: { 1: 80, 2: 70, 3: 90, 4: 50, 5: 85, 6: 65, 7: 60, 8: 80, 9: 75 },
    2: { 1: 70, 2: 85, 3: 65, 4: 80, 5: 60, 6: 95, 7: 70, 8: 50, 9: 85 },
    3: { 1: 90, 2: 65, 3: 85, 4: 55, 5: 90, 6: 75, 7: 80, 8: 60, 9: 90 },
    4: { 1: 50, 2: 80, 3: 55, 4: 85, 5: 50, 6: 70, 7: 90, 8: 90, 9: 45 },
    5: { 1: 85, 2: 60, 3: 90, 4: 50, 5: 90, 6: 55, 7: 65, 8: 75, 9: 80 },
    6: { 1: 65, 2: 95, 3: 75, 4: 70, 5: 55, 6: 90, 7: 50, 8: 65, 9: 80 },
    7: { 1: 60, 2: 70, 3: 80, 4: 90, 5: 65, 6: 50, 7: 85, 8: 75, 9: 60 },
    8: { 1: 80, 2: 50, 3: 60, 4: 90, 5: 75, 6: 65, 7: 75, 8: 90, 9: 70 },
    9: { 1: 75, 2: 85, 3: 90, 4: 45, 5: 80, 6: 80, 7: 60, 8: 70, 9: 85 }
  };
  
  return compatibilityMatrix[number1]?.[number2] || 50;
};

// Calculate career compatibility based on industries and skills
export const getCareerCompatibility = (industry1: string, industry2: string, commonSkills: number): number => {
  // Same industry
  if (industry1 === industry2) {
    return 85 + Math.min(commonSkills * 3, 15);
  }
  
  // Related industries (this would be a more complex mapping in a real app)
  const relatedIndustries: Record<string, string[]> = {
    "Technology": ["Finance", "Education", "Healthcare"],
    "Finance": ["Technology", "Consulting", "Real Estate"],
    "Healthcare": ["Technology", "Education", "Non-profit"],
    "Education": ["Healthcare", "Non-profit", "Technology"],
    "Marketing": ["Media", "Design", "Retail"],
    // Add more industry relationships
  };
  
  if (relatedIndustries[industry1]?.includes(industry2)) {
    return 70 + Math.min(commonSkills * 2, 20);
  }
  
  // Unrelated industries
  return 50 + Math.min(commonSkills * 5, 30);
};

// Calculate overall compatibility
export const calculateCompatibility = (
  zodiacSign1: string,
  zodiacSign2: string,
  lifePathNumber1: number,
  lifePathNumber2: number,
  industry1: string,
  industry2: string,
  commonSkills: number
): { 
  score: number;
  insights: string[];
  pros: string[];
  cons: string[];
} => {
  const zodiacComp = getZodiacCompatibility(zodiacSign1, zodiacSign2);
  const numerologyComp = getNumerologyCompatibility(lifePathNumber1, lifePathNumber2);
  const careerComp = getCareerCompatibility(industry1, industry2, commonSkills);
  
  // Calculate weighted score
  const overallScore = Math.round((zodiacComp * 0.25) + (numerologyComp * 0.25) + (careerComp * 0.5));
  
  // Generate insights
  const insights: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Career insights
  if (careerComp > 80) {
    insights.push("Strong career alignment");
    pros.push("Professional goals and paths highly compatible");
  } else if (careerComp > 60) {
    insights.push("Complementary career paths");
    pros.push("Can learn from each other's professional experiences");
  } else {
    insights.push("Different professional worlds");
    cons.push("May have difficulty relating to work challenges");
  }
  
  // Zodiac insights
  if (zodiacComp > 80) {
    insights.push("Astrologically well-matched");
    pros.push("Natural personality alignment");
  } else if (zodiacComp < 60) {
    insights.push("Astrological challenges");
    cons.push("May need to work on understanding different perspectives");
  }
  
  // Numerology insights
  if (numerologyComp > 80) {
    insights.push("Life paths are aligned");
    pros.push("Similar life goals and values");
  } else if (numerologyComp < 60) {
    insights.push("Different life approaches");
    cons.push("May have differing views on personal growth");
  }
  
  // Additional insights based on specific combinations
  if (zodiacSign1 === "Aries" && zodiacSign2 === "Libra") {
    insights.push("Opposite signs with magnetic attraction");
    pros.push("Balance each other well");
  }
  
  if (lifePathNumber1 === 1 && lifePathNumber2 === 8) {
    insights.push("Leadership and ambition combination");
    pros.push("Can build impressive things together");
    cons.push("Potential power struggles");
  }
  
  // Return computed compatibility
  return {
    score: overallScore,
    insights,
    pros,
    cons
  };
};

// Get color class for compatibility score
export const getCompatibilityColorClass = (score: number): string => {
  if (score >= 80) return "compatibility-high";
  if (score >= 60) return "compatibility-medium";
  return "compatibility-low";
};

// Generate personality traits based on zodiac and life path number
export const getPersonalityTraits = (zodiacSign: string, lifePathNumber: number): string[] => {
  const traits: Record<string, string[]> = {
    "Aries": ["Bold", "Passionate", "Confident", "Impulsive"],
    "Taurus": ["Reliable", "Patient", "Practical", "Stubborn"],
    "Gemini": ["Versatile", "Curious", "Adaptable", "Inconsistent"],
    "Cancer": ["Nurturing", "Intuitive", "Emotional", "Protective"],
    "Leo": ["Charismatic", "Warm", "Dominant", "Theatrical"],
    "Virgo": ["Analytical", "Practical", "Diligent", "Perfectionist"],
    "Libra": ["Diplomatic", "Fair", "Social", "Indecisive"],
    "Scorpio": ["Intense", "Passionate", "Strategic", "Secretive"],
    "Sagittarius": ["Optimistic", "Adventurous", "Honest", "Restless"],
    "Capricorn": ["Ambitious", "Disciplined", "Practical", "Reserved"],
    "Aquarius": ["Progressive", "Original", "Independent", "Aloof"],
    "Pisces": ["Compassionate", "Artistic", "Intuitive", "Escapist"]
  };
  
  const numberTraits: Record<number, string[]> = {
    1: ["Leader", "Independent", "Innovative", "Ambitious"],
    2: ["Cooperative", "Diplomatic", "Sensitive", "Peacemaker"],
    3: ["Creative", "Optimistic", "Inspirational", "Expressive"],
    4: ["Practical", "Trustworthy", "Organized", "Detail-oriented"],
    5: ["Adventurous", "Versatile", "Freedom-loving", "Curious"],
    6: ["Responsible", "Nurturing", "Harmonious", "Compassionate"],
    7: ["Analytical", "Introspective", "Perfectionist", "Spiritual"],
    8: ["Ambitious", "Goal-oriented", "Status-conscious", "Resilient"],
    9: ["Humanitarian", "Compassionate", "Selfless", "Artistic"]
  };
  
  // Combine traits from both zodiac and life path number
  return [...traits[zodiacSign], ...numberTraits[lifePathNumber]];
};
