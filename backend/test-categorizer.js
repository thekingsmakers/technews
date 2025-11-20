import { categorizeArticle } from './src/categorizer.js';

const testCases = [
    {
        title: "OpenAI releases GPT-5 with advanced reasoning",
        summary: "The new AI model demonstrates human-level performance on benchmarks.",
        expected: "AI"
    },
    {
        title: "AWS launches new serverless database features",
        summary: "Amazon Web Services expands its cloud infrastructure offerings.",
        expected: "Cloud"
    },
    {
        title: "Critical vulnerability found in Linux kernel",
        summary: "Hackers could exploit this zero-day to gain root access.",
        expected: "Security"
    },
    {
        title: "Apple announces iPhone 16 with new chip",
        summary: "The latest smartphone features a faster processor and better camera.",
        expected: "Mobile"
    },
    {
        title: "React 19 introduces new compiler",
        summary: "JavaScript developers can now enjoy automatic memoization.",
        expected: "Development"
    },
    {
        title: "Microsoft acquires gaming giant for $69B",
        summary: "The enterprise deal shakes up the stock market.",
        expected: "Enterprise"
    }
];

console.log("Running Categorizer Tests...\n");

testCases.forEach(test => {
    const result = categorizeArticle(test.title, test.summary);
    const pass = result === test.expected;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] "${test.title}" -> ${result} (Expected: ${test.expected})`);
});
