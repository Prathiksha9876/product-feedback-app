const Sentiment = require('sentiment');

const sentimentAnalyzer = new Sentiment();

const analyzeFeedback = (title, description, rating) => {
    const text = `${title} ${description}`;

    // 1. Sentiment Analysis
    const result = sentimentAnalyzer.analyze(text);
    let sentiment = 'Neutral';
    if (result.score > 0) sentiment = 'Positive';
    else if (result.score < 0) sentiment = 'Negative';

    // 2. NLP Categorization via token matching
    const tokens = text.toLowerCase().match(/\w+/g) || [];

    const bugKeywords = ['bug', 'error', 'fail', 'broken', 'crash', 'issue', 'fix', 'wrong', 'stuck', 'doesn\'t'];
    const featureKeywords = ['add', 'feature', 'new', 'create', 'allow', 'want', 'wish', 'missing', 'need'];
    const improvementKeywords = ['improve', 'better', 'update', 'change', 'faster', 'redesign', 'confusing'];

    let bugScore = 0;
    let featureScore = 0;
    let improvementScore = 0;

    tokens.forEach(token => {
        if (bugKeywords.includes(token)) bugScore++;
        else if (featureKeywords.includes(token)) featureScore++;
        else if (improvementKeywords.includes(token)) improvementScore++;
    });

    let category = 'Improvement';
    if (bugScore > featureScore && bugScore >= improvementScore) category = 'Bug';
    else if (featureScore > bugScore && featureScore >= improvementScore) category = 'Feature Request';

    // 3. Priority Suggestion
    let priority = 'Medium';
    let priorityScore = 0;

    // Rating factor
    if (rating <= 2) priorityScore += 2;
    else if (rating === 3) priorityScore += 1;

    // Sentiment factor
    if (sentiment === 'Negative') priorityScore += 2;
    else if (sentiment === 'Neutral') priorityScore += 1;

    // Category factor
    if (category === 'Bug') priorityScore += 2;
    else if (category === 'Improvement') priorityScore += 1;

    if (priorityScore >= 4) priority = 'High';
    else if (priorityScore >= 2) priority = 'Medium';
    else priority = 'Low';

    return { category, sentiment, priority, priorityScore };
};

const generateSummary = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return "No feedback available to summarize.";

    let bugCount = 0;
    let featureCount = 0;
    let loginIssues = 0;
    let perfIssues = 0;
    let uiIssues = 0;

    feedbacks.forEach(f => {
        if (f.category === 'Bug') bugCount++;
        if (f.category === 'Feature Request') featureCount++;

        const text = `${f.title || ''} ${f.description || ''}`.toLowerCase();
        if (text.includes('login') || text.includes('sign in') || text.includes('auth')) loginIssues++;
        if (text.includes('slow') || text.includes('crash') || text.includes('performance') || text.includes('freeze')) perfIssues++;
        if (text.includes('ui') || text.includes('design') || text.includes('confusing') || text.includes('color')) uiIssues++;
    });

    let text = `Based on ${feedbacks.length} feedback items, `;
    if (bugCount >= featureCount && bugCount > 0) {
        text += `the primary focus is on resolving bugs. `;
    } else if (featureCount > bugCount) {
        text += `users are primarily requesting new features. `;
    } else {
        text += `feedback is evenly split. `;
    }

    if (loginIssues > 0 && perfIssues > 0) {
        text += `Many users are reporting login issues and performance problems.`;
    } else if (loginIssues > 0) {
        text += `Authentication and login issues are frequently mentioned.`;
    } else if (perfIssues > 0) {
        text += `Users are experiencing performance and stability problems.`;
    } else if (uiIssues > 0) {
        text += `Users are frequently discussing UI improvements and design changes.`;
    } else {
        text += `Overall sentiment and requests are varied across minor updates.`;
    }

    return text;
};

module.exports = { analyzeFeedback, generateSummary };
