const BLOCKLIST = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'whore', 'slut'
];

const pattern = new RegExp(`\\b(${BLOCKLIST.join('|')})\\b`, 'gi');

function containsProfanity(text) {
  return pattern.test(text);
}

function censor(text) {
  return text.replace(pattern, (match) => match[0] + '*'.repeat(match.length - 1));
}

module.exports = { containsProfanity, censor };