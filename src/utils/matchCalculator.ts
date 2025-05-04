
export function getZodiacSign(birthdate: Date | string): string {
  // Convert to Date object if string is passed
  const date = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  
  // Get month and day
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Determine zodiac sign based on month and day
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export function calculateLifePathNumber(birthdate: Date | string): number {
  // Convert to Date object if string is passed
  const date = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  
  // Extract year, month, and day
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Calculate life path number
  let sum = 0;
  
  // Add the digits of the year
  sum += year % 10;
  sum += Math.floor((year / 10) % 10);
  sum += Math.floor((year / 100) % 10);
  sum += Math.floor((year / 1000) % 10);
  
  // Add the digits of the month
  sum += month % 10;
  sum += Math.floor(month / 10);
  
  // Add the digits of the day
  sum += day % 10;
  sum += Math.floor(day / 10);
  
  // Reduce to a single digit
  while (sum > 9) {
    let tempSum = 0;
    while (sum > 0) {
      tempSum += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = tempSum;
  }
  
  return sum;
}

/**
 * Returns the appropriate Tailwind CSS color class based on compatibility score
 * @param score - A compatibility score between 0-100
 * @returns Tailwind CSS color class for text
 */
export function getCompatibilityColorClass(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-emerald-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 45) return 'text-amber-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}
