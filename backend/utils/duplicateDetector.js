function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

async function findPotentialDuplicate(FeedbackModel, title, description) {
  const wordsA = normalizeText(`${title} ${description}`);

  const candidates = await FeedbackModel.find().select('title description');

  let bestMatch = null;
  let bestScore = 0;

  candidates.forEach(doc => {
    const wordsB = normalizeText(`${doc.title} ${doc.description}`);
    const score = jaccardSimilarity(wordsA, wordsB);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = doc;
    }
  });

  // Threshold tuned for "similar but not identical"
  if (bestScore >= 0.5) {
    return { duplicate: bestMatch, score: bestScore };
  }

  return { duplicate: null, score: bestScore };
}

module.exports = { findPotentialDuplicate };

