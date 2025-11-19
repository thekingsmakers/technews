# Tech News API Documentation

This document provides instructions on how to add news articles to the Tech News site using the API.

## API Endpoint

The API endpoint for adding news articles is:

`POST /api/news`

## Authentication

The API uses Basic Authentication. You must provide a valid username and password in the `Authorization` header of your request.

**Username:** Newbythekingsmaker
**Password:** acf6b283-e353-4538-8a4f-fe7c67f338ad

## Request Body

The request body must be a JSON object with the following fields:

*   `title` (string, required): The title of the news article.
*   `summary` (string, required): A short summary of the article.
*   `body` (string, required): The full content of the article.
*   `url` (string, required): The URL of the original article.
*   `category` (string, optional): The category of the article (e.g., "AI", "Cloud", "Security").
*   `tags` (array of strings, optional): A list of tags associated with the article.

## Example Request

```bash
curl -X POST \
  http://localhost:5000/api/news \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Basic TmV3Ynl0aGVraW5nc21ha2VyOmFjZjZiMjgzLWUzNTMtNDUzOC04YTRmLWZlN2M2N2YzMzhhZA==' \
  -d '{
    "title": "New Breakthrough in AI",
    "summary": "Scientists have developed a new AI model that can learn from a single example.",
    "body": "<p>This is a major breakthrough in the field of artificial intelligence...</p>",
    "url": "http://example.com/ai-breakthrough",
    "category": "AI",
    "tags": ["AI", "Machine Learning"]
  }'
```
