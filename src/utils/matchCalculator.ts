
export const getZodiacSign = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  // Convert string date to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const month = dateObj.getMonth() + 1; // Month is 0-indexed
  const day = dateObj.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'Aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'Taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'Gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'Cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'Leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'Virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'Libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'Scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'Sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'Capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'Aquarius';
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return 'Pisces';
  } else {
    return '';
  }
};

export const calculateLifePathNumber = (date: string | Date | undefined): number => {
  if (!date) return 0;
  
  // Convert string date to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // Month is 0-indexed
  const year = dateObj.getFullYear();

  let sum = 0;
  let daySum = String(day).split('').reduce((acc, curr) => acc + Number(curr), 0);
  let monthSum = String(month).split('').reduce((acc, curr) => acc + Number(curr), 0);
  let yearSum = String(year).split('').reduce((acc, curr) => acc + Number(curr), 0);

  sum = daySum + monthSum + yearSum;

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((acc, curr) => acc + Number(curr), 0);
  }

  return sum;
};

// Function for compatibility color classes
export const getCompatibilityColorClass = (score: number | undefined): string => {
  if (score === undefined || score === null) return 'text-gray-500';
  
  if (score >= 80) {
    return 'text-green-500';
  } else if (score >= 60) {
    return 'text-blue-500';
  } else if (score >= 40) {
    return 'text-amber-500';
  } else if (score >= 20) {
    return 'text-orange-500';
  } else {
    return 'text-red-500';
  }
};
