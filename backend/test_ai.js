const { analyzeFeedback } = require('./utils/aiAnalyzer');

const testCases = [
    {
        title: 'App crashes on login',
        desc: 'Every time I try to login it gives an error and breaks.',
        rating: 1,
        expectedCategory: 'Bug',
        expectedPriority: 'High',
    },
    {
        title: 'Please add a dark mode',
        desc: 'I want a dark mode feature, it would be awesome!',
        rating: 5,
        expectedCategory: 'Feature Request',
        expectedPriority: 'Low', // Feature (0) + Positive (0) + Rating 5 (0) = 0 -> Low
    },
    {
        title: 'The UI is confusing',
        desc: 'I think the buttons should be bigger to improve usability.',
        rating: 3,
        expectedCategory: 'Improvement',
        expectedPriority: 'Medium', // Improvement (1) + Neutral (1) + Rating 3 (1) = 3 -> Medium
    }
];

let allPassed = true;
testCases.forEach((tc, i) => {
    const result = analyzeFeedback(tc.title, tc.desc, tc.rating);
    console.log(`Test ${i + 1}: ${tc.title}`);
    console.log(`  Expected: [${tc.expectedCategory}, ${tc.expectedPriority}]`);
    console.log(`  Actual:   [${result.category}, ${result.priority}] (Sentiment: ${result.sentiment}, Score: ${result.priorityScore})`);

    if (result.category !== tc.expectedCategory || result.priority !== tc.expectedPriority) {
        allPassed = false;
        console.error('  --> FAILED');
    } else {
        console.log('  --> PASSED');
    }
    console.log('---');
});

if (allPassed) {
    console.log('All AI Analyzer tests passed successfully!');
} else {
    console.error('Some tests failed.');
}
