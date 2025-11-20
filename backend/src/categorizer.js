/**
 * Keyword-based categorizer for tech news
 */

const CATEGORIES = {
    'AI': {
        keywords: [
            'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'gpt', 'chatgpt',
            'generative ai', 'neural network', 'deep learning', 'openai', 'anthropic', 'bard',
            'gemini', 'copilot', 'transformer', 'inference', 'model', 'algorithm', 'robot',
            'robotics', 'autonomous', 'computer vision', 'nlp'
        ],
        weight: 1.2
    },
    'Cloud': {
        keywords: [
            'cloud', 'aws', 'azure', 'google cloud', 'gcp', 'serverless', 'kubernetes', 'k8s',
            'docker', 'container', 'microservices', 'devops', 'infrastructure', 'terraform',
            'ansible', 'ci/cd', 'pipeline', 'saas', 'paas', 'iaas', 'data center', 'edge computing'
        ],
        weight: 1.0
    },
    'Security': {
        keywords: [
            'security', 'cybersecurity', 'hack', 'hacker', 'malware', 'ransomware', 'phishing',
            'vulnerability', 'exploit', 'patch', 'firewall', 'encryption', 'breach', 'attack',
            'threat', 'zero day', 'cve', 'infosec', 'privacy', 'gdpr', 'compliance', 'auth',
            'authentication', 'password'
        ],
        weight: 1.1
    },
    'Mobile': {
        keywords: [
            'mobile', 'phone', 'smartphone', 'android', 'ios', 'iphone', 'ipad', 'apple',
            'samsung', 'pixel', 'app store', 'play store', 'tablet', 'wearable', 'watch',
            '5g', 'qualcomm', 'snapdragon', 'mediatek', 'arm'
        ],
        weight: 1.0
    },
    'Development': {
        keywords: [
            'development', 'programming', 'coding', 'software', 'developer', 'javascript',
            'python', 'java', 'rust', 'go', 'golang', 'react', 'vue', 'angular', 'node',
            'nodejs', 'typescript', 'api', 'graphql', 'rest', 'database', 'sql', 'nosql',
            'git', 'github', 'gitlab', 'ide', 'vscode', 'framework', 'library'
        ],
        weight: 0.9
    },
    'Enterprise': {
        keywords: [
            'enterprise', 'business', 'startup', 'acquisition', 'merger', 'stock', 'market',
            'ipo', 'revenue', 'quarterly', 'earnings', 'ceo', 'cto', 'cfo', 'management',
            'strategy', 'digital transformation', 'fintech'
        ],
        weight: 0.8
    }
};

/**
 * Categorizes an article based on its title and summary
 * @param {string} title 
 * @param {string} summary 
 * @param {string} content 
 * @returns {string} The determined category
 */
export function categorizeArticle(title = '', summary = '', content = '') {
    const text = `${title} ${summary} ${content}`.toLowerCase();
    const scores = {};

    // Calculate score for each category
    for (const [category, config] of Object.entries(CATEGORIES)) {
        let score = 0;
        for (const keyword of config.keywords) {
            // Simple frequency count
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = (text.match(regex) || []).length;
            score += matches;
        }
        scores[category] = score * config.weight;
    }

    // Find category with highest score
    let bestCategory = 'General';
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    // Threshold to avoid weak matches defaulting to a random category
    // If maxScore is too low, stick with 'General'
    if (maxScore < 1.5) {
        return 'General';
    }

    return bestCategory;
}

export function getAvailableCategories() {
    return Object.keys(CATEGORIES);
}
