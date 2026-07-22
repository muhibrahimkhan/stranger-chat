const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
  'i', 'like', 'love', 'im', "i'm", 'is', 'are', 'am'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOPWORDS.has(word));
}


function buildVectors(pool) {
  const docs = pool.map((entry) => tokenize(entry.interests));
  const vocabulary = [...new Set(docs.flat())];

  const documentFrequency = {};
  for (const word of vocabulary) {
    documentFrequency[word] = docs.filter((doc) => doc.includes(word)).length;
  }

  const totalDocs = docs.length;

  return docs.map((doc) => {
    const termFrequency = {};
    for (const word of doc) {
      termFrequency[word] = (termFrequency[word] || 0) + 1;
    }

    const vector = {};
    for (const word of Object.keys(termFrequency)) {
      const idf = Math.log((totalDocs + 1) / (documentFrequency[word] + 1)) + 1;
      vector[word] = termFrequency[word] * idf;
    }
    return vector;
  });
}


function cosineSimilarity(vectorA, vectorB) {
  const words = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const word of words) {
    const a = vectorA[word] || 0;
    const b = vectorB[word] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

module.exports = { tokenize, buildVectors, cosineSimilarity };