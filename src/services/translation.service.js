const { translate } = require('@vitalets/google-translate-api');

async function translateText(text, targetLanguage) {
  try {
    const result = await translate(text, { to: targetLanguage });
    return { text: result.text, ok: true };
  } catch (error) {
    console.warn('Translation failed, falling back to original text:', error.message);
    return { text, ok: false };
  }
}

module.exports = { translateText };