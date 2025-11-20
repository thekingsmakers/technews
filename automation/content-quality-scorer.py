#!/usr/bin/env python3
"""
Content Quality Scorer using Machine Learning
Analyzes article completeness, relevance, and quality metrics
"""

import json
import re
import statistics
from collections import Counter
import math
from datetime import datetime, timedelta


class ContentQualityScorer:
    def __init__(self):
        # Quality scoring weights
        self.weights = {
            'content_length': 0.25,
            'readability': 0.20,
            'completeness': 0.20,
            'relevance': 0.15,
            'freshness': 0.10,
            'uniqueness': 0.10
        }

        # Minimum thresholds
        self.min_content_length = 300  # characters
        self.min_paragraphs = 3
        self.max_word_length = 50  # flag very long words
        self.freshness_days = 30  # consider content fresh within 30 days

    def score_article(self, article):
        """Score article quality on multiple dimensions"""
        scores = {}

        # Content length score
        scores['content_length'] = self.score_content_length(article.get('content', ''))

        # Readability score
        scores['readability'] = self.score_readability(article.get('content', ''))

        # Completeness score
        scores['completeness'] = self.score_completeness(article)

        # Relevance score
        scores['relevance'] = self.score_relevance(article)

        # Freshness score
        scores['freshness'] = self.score_freshness(article.get('publishedAt', ''))

        # Uniqueness score
        scores['uniqueness'] = self.score_uniqueness(article)

        # Overall quality score
        overall_score = sum(scores[metric] * self.weights[metric] for metric in scores)

        return {
            'overall_score': round(overall_score, 3),
            'dimension_scores': scores,
            'quality_rating': self.get_quality_rating(overall_score),
            'recommendations': self.get_recommendations(scores)
        }

    def score_content_length(self, content):
        """Score based on content length and structure"""
        if not content:
            return 0.0

        length = len(content)

        # Length scoring
        if length < 100:
            length_score = 0.1
        elif length < 300:
            length_score = 0.3
        elif length < 1000:
            length_score = 0.7
        elif length < 3000:
            length_score = 0.9
        else:
            length_score = 1.0

        # Paragraph structure bonus
        paragraphs = content.split('\n\n')
        paragraph_score = min(len(paragraphs) / 5, 1.0)  # Max bonus at 5 paragraphs

        # Word count bonus
        words = content.split()
        word_score = min(len(words) / 200, 1.0)  # Max bonus at 200 words

        return min(length_score + (paragraph_score + word_score) * 0.1, 1.0)

    def score_readability(self, content):
        """Score content readability using various metrics"""
        if not content:
            return 0.0

        words = content.split()
        sentences = re.split(r'[.!?]+', content)

        # Average sentence length
        avg_sentence_length = len(words) / len(sentences) if sentences else 0

        # Average word length
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0

        # Complex word ratio (words > 6 characters)
        complex_words = sum(1 for word in words if len(word) > 6)
        complex_ratio = complex_words / len(words) if words else 0

        # Readability score (inverse of complexity)
        readability_score = 1.0 - (
            (avg_sentence_length - 15) / 25 +  # Optimal ~15 words per sentence
            (avg_word_length - 4.5) / 3 +     # Optimal ~4.5 characters per word
            complex_ratio                      # Lower complex ratio is better
        ) / 3

        return max(0.0, min(1.0, readability_score))

    def score_completeness(self, article):
        """Score article completeness based on available fields"""
        fields = ['title', 'content', 'summary', 'category', 'tags', 'publishedAt', 'imageUrl']
        completed_fields = sum(1 for field in fields if article.get(field))

        completeness_score = completed_fields / len(fields)

        # Bonus for high-quality content
        content = article.get('content', '')
        if len(content) > 500:
            completeness_score += 0.1
        if len(content) > 1000:
            completeness_score += 0.1
        if article.get('imageUrl'):
            completeness_score += 0.05
        if len(article.get('tags', [])) > 2:
            completeness_score += 0.05

        return min(1.0, completeness_score)

    def score_relevance(self, article):
        """Score content relevance based on keywords and structure"""
        content = (article.get('content', '') + ' ' + article.get('summary', '')).lower()
        title = article.get('title', '').lower()

        # Technology relevance keywords
        tech_keywords = [
            'technology', 'tech', 'software', 'hardware', 'ai', 'artificial intelligence',
            'machine learning', 'cloud', 'mobile', 'app', 'web', 'programming', 'code',
            'data', 'analytics', 'cybersecurity', 'blockchain', 'crypto', 'iot',
            'robotics', 'automation', 'digital', 'innovation', 'startup'
        ]

        # Count keyword matches
        keyword_matches = sum(1 for keyword in tech_keywords
                            if keyword in content or keyword in title)

        relevance_score = min(keyword_matches / 5, 1.0)  # Max at 5 keyword matches

        # Title quality bonus
        if len(title) > 20 and len(title) < 80:
            relevance_score += 0.1

        # Content structure bonus
        if 'introduction' in content.lower() or 'conclusion' in content.lower():
            relevance_score += 0.1

        return min(1.0, relevance_score)

    def score_freshness(self, published_at):
        """Score content freshness"""
        if not published_at:
            return 0.5  # Neutral score for undated content

        try:
            published_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            now = datetime.now()

            days_old = (now - published_date).days

            if days_old < 1:
                return 1.0  # Very fresh
            elif days_old < 7:
                return 0.9  # Fresh
            elif days_old < 30:
                return 0.7  # Recent
            elif days_old < 90:
                return 0.5  # Somewhat old
            elif days_old < 365:
                return 0.3  # Old
            else:
                return 0.1  # Very old

        except:
            return 0.4  # Parse error, slightly penalize

    def score_uniqueness(self, article):
        """Score content uniqueness (placeholder - would need database comparison)"""
        # This would typically compare against existing articles in database
        # For now, return neutral score
        return 0.8

    def get_quality_rating(self, score):
        """Convert numerical score to quality rating"""
        if score >= 0.9:
            return 'Excellent'
        elif score >= 0.8:
            return 'Very Good'
        elif score >= 0.7:
            return 'Good'
        elif score >= 0.6:
            return 'Fair'
        elif score >= 0.5:
            return 'Poor'
        else:
            return 'Very Poor'

    def get_recommendations(self, scores):
        """Generate improvement recommendations based on scores"""
        recommendations = []

        if scores['content_length'] < 0.7:
            recommendations.append("Add more detailed content (aim for 500+ characters)")

        if scores['readability'] < 0.6:
            recommendations.append("Improve readability with shorter sentences and simpler language")

        if scores['completeness'] < 0.8:
            recommendations.append("Add missing fields like category, tags, or image")

        if scores['relevance'] < 0.6:
            recommendations.append("Focus on technology-related topics for better relevance")

        if scores['freshness'] < 0.7:
            recommendations.append("Prioritize more recent content")

        if len(recommendations) == 0:
            recommendations.append("Content quality is excellent!")

        return recommendations


class ContentDeduper:
    def __init__(self):
        self.fingerprints = set()

    def generate_fingerprint(self, article):
        """Generate content fingerprint for deduplication"""
        content = article.get('content', '') + article.get('summary', '')
        content = re.sub(r'\s+', ' ', content.lower())

        # Create shingles (word sequences)
        words = content.split()
        shingles = []
        for i in range(len(words) - 2):
            shingle = ' '.join(words[i:i+3])
            shingles.append(shingle)

        # Hash shingles
        hashes = [hash(shingle) for shingle in shingles[:20]]  # Use first 20 shingles

        # MinHash for similarity comparison
        fingerprint = min(hashes) if hashes else hash(content)

        return fingerprint

    def is_duplicate(self, article, threshold=0.8):
        """Check if article is duplicate of existing content"""
        fingerprint = self.generate_fingerprint(article)

        # Check fingerprint similarity (simplified)
        if fingerprint in self.fingerprints:
            return True

        # Add to known fingerprints
        self.fingerprints.add(fingerprint)
        return False


def main():
    scorer = ContentQualityScorer()
    deduper = ContentDeduper()

    # Example usage
    sample_articles = [
        {
            'title': 'AI Revolution in Software Development',
            'content': 'Artificial Intelligence is transforming how we build software. Machine learning algorithms can now write code, debug applications, and even design user interfaces. This revolutionary technology is making developers more productive and creating new possibilities for innovation. The future of coding looks bright with AI assistance becoming mainstream.',
            'summary': 'AI is changing software development forever',
            'category': 'Technology',
            'tags': ['AI', 'programming', 'development'],
            'publishedAt': '2024-01-15T10:00:00Z',
            'source': 'techcrunch.com'
        }
    ]

    for article in sample_articles:
        # Score quality
        quality_score = scorer.score_article(article)
        print(f"Article: {article['title']}")
        print(f"Quality Score: {quality_score['overall_score']} ({quality_score['quality_rating']})")
        print("Dimension Scores:", json.dumps(quality_score['dimension_scores'], indent=2))
        print("Recommendations:", quality_score['recommendations'])

        # Check for duplicates
        is_duplicate = deduper.is_duplicate(article)
        print(f"Is Duplicate: {is_duplicate}")

        print("-" * 50)


if __name__ == '__main__':
    main()