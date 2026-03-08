/**
 * Simple Profanity Filter
 * A custom implementation to replace the abandoned 'bad-words' package.
 */

const BANNED_WORDS = [
  "abuse",
  "asshole",
  "bastard",
  "bitch",
  "cock",
  "cunt",
  "dick",
  "faggot",
  "fuck",
  "motherfucker",
  "nigger",
  "pussy",
  "shit",
  "slut",
  "whore",
  // Add more as needed
];

/**
 * Checks if a string contains any banned words.
 * Handles simple character substitutions and common variations.
 */
export const isProfane = (text: string): boolean => {
  if (!text) return false;

  const normalized = text
    .toLowerCase()
    .replace(/[0-9]/g, (digit) => {
      const map: Record<string, string> = {
        "0": "o",
        "1": "i",
        "3": "e",
        "4": "a",
        "5": "s",
        "7": "t",
        "8": "b",
      };
      return map[digit] || digit;
    })
    .replace(/[^a-zA-Z\s]/g, ""); // Remove special chars for checking

  return BANNED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, "i");
    return regex.test(normalized) || normalized.includes(word);
  });
};

export const filterText = (text: string, placeholder: string = "***"): string => {
  if (!text) return "";
  
  let filtered = text;
  BANNED_WORDS.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, placeholder);
  });
  
  return filtered;
};
