import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/news';

const sampleNews = [
    {
        title: "The Future of AI in 2025",
        summary: "Artificial Intelligence is evolving rapidly. Here is what to expect in the coming year, from agents to AGI.",
        content: "Full content about AI...",
        source: "TechCrunch",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
        category: "AI"
    },
    {
        title: "New Quantum Chip Breaks Records",
        summary: "Scientists have developed a new quantum processor that surpasses all previous benchmarks.",
        content: "Full content about Quantum...",
        source: "Wired",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000",
        category: "Hardware"
    },
    {
        title: "Cybersecurity Trends for Enterprise",
        summary: "Protecting your infrastructure is more critical than ever. Learn about the latest threats and defenses.",
        content: "Full content about Security...",
        source: "The Verge",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
        category: "Security"
    },
    {
        title: "Cloud Computing: The Next Generation",
        summary: "Serverless and edge computing are redefining how we deploy applications.",
        content: "Full content about Cloud...",
        source: "Ars Technica",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
        category: "Cloud"
    }
];

async function populate() {
    for (const article of sampleNews) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(article)
            });
            const data = await response.json();
            console.log(`Added: ${article.title}`, data);
        } catch (error) {
            console.error(`Failed to add ${article.title}:`, error);
        }
    }
}

populate();
