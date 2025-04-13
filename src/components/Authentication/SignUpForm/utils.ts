
export const calculateZodiacSign = (birthday: Date): string => {
  const month = birthday.getMonth() + 1;
  const day = birthday.getDate();
  
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

export const calculateLifePathNumber = (birthday: Date): number => {
  const month = birthday.getMonth() + 1;
  const day = birthday.getDate();
  const year = birthday.getFullYear();
  
  const sumDigits = (num: number): number => {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum;
  };
  
  let yearSum = sumDigits(year);
  let monthSum = sumDigits(month);
  let daySum = sumDigits(day);
  
  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22) {
      num = sumDigits(num);
    }
    return num;
  };
  
  yearSum = reduceToSingleDigit(yearSum);
  monthSum = reduceToSingleDigit(monthSum);
  daySum = reduceToSingleDigit(daySum);
  
  let lifePathNumber = yearSum + monthSum + daySum;
  return reduceToSingleDigit(lifePathNumber);
};
