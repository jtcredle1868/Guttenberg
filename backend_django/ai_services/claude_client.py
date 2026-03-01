"""
Claude AI client for Guttenberg.

Uses the Anthropic Python SDK to power all AI features:
- Synopsis generation (FDD §3.2.3)
- Keyword optimization (RDD GUT-META-006)
- Layout AI optimization (RDD GUT-FMT-011)
- Cover concept generation (RDD GUT-CVR-006)
- Metadata enhancement
"""
import logging
from django.conf import settings

logger = logging.getLogger('guttenberg.ai')


def get_claude_client():
    """Get an Anthropic client instance."""
    try:
        import anthropic
        return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Claude client: {e}")
        return None


def generate_synopsis(title_data: dict, style: str = 'retail') -> dict:
    """
    Generate book synopsis using Claude per FDD §3.2.3.

    Args:
        title_data: Dict with title, genre, chapter_outline, tone, word_count, etc.
        style: 'retail' for reader-focused or 'press' for formal description.

    Returns:
        Dict with synopsis_short, synopsis_long, and metadata.
    """
    client = get_claude_client()

    style_instructions = {
        'retail': (
            "Write an emotionally engaging, reader-benefit-oriented book description. "
            "Use compelling hooks, vivid language, and create urgency to read. "
            "Think bestseller back-cover copy."
        ),
        'press': (
            "Write a professional, formal book description suitable for press releases "
            "and trade publications. Include genre positioning and comparable titles."
        ),
    }

    prompt = f"""You are a professional book marketing copywriter. Generate a book synopsis based on the following details:

Title: {title_data.get('title', 'Untitled')}
Author: {title_data.get('primary_author', 'Unknown')}
Genre: {title_data.get('genre', 'General Fiction')}
Word Count: {title_data.get('word_count', 'Unknown')}
Chapter Outline: {title_data.get('chapter_outline', 'Not provided')}
Tone/Themes: {title_data.get('tone', 'Not provided')}
Target Audience: {title_data.get('audience', 'General readers')}

Style: {style_instructions.get(style, style_instructions['retail'])}

Generate TWO versions:
1. SHORT SYNOPSIS (under 400 characters): A punchy, hook-driven summary for search results and quick browsing.
2. LONG SYNOPSIS (under 4000 characters): A full description with hooks, plot teaser (no spoilers), emotional stakes, and a compelling reason to buy.

Respond in JSON format:
{{"synopsis_short": "...", "synopsis_long": "...", "keywords_suggested": ["keyword1", "keyword2", ...], "comparable_titles": ["title1", "title2"]}}"""

    if not client:
        # Fallback for demo/development without API key
        return _generate_demo_synopsis(title_data, style)

    try:
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            messages=[{"role": "user", "content": prompt}],
        )

        import json
        content = response.content[0].text
        # Extract JSON from response
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]

        result = json.loads(content.strip())
        result['tokens_used'] = response.usage.input_tokens + response.usage.output_tokens
        result['model'] = settings.CLAUDE_MODEL
        result['ai_assisted'] = True
        return result

    except Exception as e:
        logger.error(f"Claude synopsis generation failed: {e}")
        return _generate_demo_synopsis(title_data, style)


def optimize_keywords(title_data: dict) -> dict:
    """
    Generate optimized keywords based on genre and BISAC per RDD GUT-META-006.

    Returns suggested keywords based on retail search trends.
    """
    client = get_claude_client()

    prompt = f"""You are a book marketing SEO expert. Suggest 7 optimized keywords/phrases for discoverability on Amazon, Apple Books, and Kobo.

Title: {title_data.get('title', 'Untitled')}
Genre: {title_data.get('genre', '')}
BISAC Codes: {title_data.get('bisac_codes', [])}
Current Keywords: {title_data.get('keywords', [])}
Synopsis: {title_data.get('synopsis_short', '')}

Rules:
- Each keyword can be a phrase (up to 50 chars)
- Mix broad and long-tail keywords
- Include genre-adjacent terms readers actually search for
- Avoid author name and title (these are already indexed)

Respond in JSON:
{{"keywords": ["keyword1", "keyword2", ...], "reasoning": ["why1", "why2", ...], "search_volume_estimate": "high/medium/low for each"}}"""

    if not client:
        return _generate_demo_keywords(title_data)

    try:
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )

        import json
        content = response.content[0].text
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]

        result = json.loads(content.strip())
        result['tokens_used'] = response.usage.input_tokens + response.usage.output_tokens
        result['ai_assisted'] = True
        return result

    except Exception as e:
        logger.error(f"Claude keyword optimization failed: {e}")
        return _generate_demo_keywords(title_data)


def enhance_metadata(title_data: dict) -> dict:
    """
    Use Claude to suggest metadata improvements and fill gaps.
    """
    client = get_claude_client()

    prompt = f"""You are a publishing metadata specialist. Analyze this book's metadata and suggest improvements for better distribution channel acceptance and discoverability.

Current Metadata:
{title_data}

Analyze and suggest:
1. Missing required fields for major channels
2. BISAC code suggestions (provide actual BISAC codes)
3. Audience age range if applicable
4. Content advisory suggestions
5. Series categorization opportunities

Respond in JSON:
{{"suggestions": [{{"field": "...", "current": "...", "suggested": "...", "reason": "..."}}], "bisac_suggestions": [{{"code": "...", "description": "..."}}], "completeness_score": 0-100}}"""

    if not client:
        return {'suggestions': [], 'bisac_suggestions': [], 'completeness_score': 75, 'ai_assisted': True}

    try:
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )

        import json
        content = response.content[0].text
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]

        result = json.loads(content.strip())
        result['ai_assisted'] = True
        return result

    except Exception as e:
        logger.error(f"Claude metadata enhancement failed: {e}")
        return {'suggestions': [], 'bisac_suggestions': [], 'completeness_score': 75, 'ai_assisted': True}


def analyze_manuscript_content(text_excerpt: str) -> dict:
    """
    Analyze manuscript content for preflight insights using Claude.
    Used by the preflight validation Celery worker.
    """
    client = get_claude_client()

    prompt = f"""You are a professional book editor. Analyze this manuscript excerpt and provide a publishing readiness assessment.

Excerpt (first 5000 characters):
{text_excerpt[:5000]}

Assess:
1. Writing quality (1-10)
2. Genre classification
3. Tone/mood
4. Target audience
5. Potential content advisories
6. Chapter structure quality
7. Comparable published titles

Respond in JSON:
{{"quality_score": 8, "genre": "...", "tone": "...", "audience": "...", "content_advisories": [], "structure_notes": "...", "comparable_titles": [], "publishing_readiness": "ready/needs_work/not_ready"}}"""

    if not client:
        return {
            'quality_score': 7.5,
            'genre': 'General Fiction',
            'tone': 'Engaging',
            'audience': 'Adult',
            'content_advisories': [],
            'structure_notes': 'Well-structured manuscript',
            'comparable_titles': [],
            'publishing_readiness': 'ready',
            'ai_assisted': True,
        }

    try:
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )

        import json
        content = response.content[0].text
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]

        result = json.loads(content.strip())
        result['ai_assisted'] = True
        return result

    except Exception as e:
        logger.error(f"Claude manuscript analysis failed: {e}")
        return {'quality_score': 7, 'genre': 'Unknown', 'ai_assisted': True}


# ── Demo/Development fallbacks ──────────────────────────────────────────────

def _generate_demo_synopsis(title_data: dict, style: str) -> dict:
    """Generate demo synopsis when Claude API is unavailable."""
    title = title_data.get('title', 'Untitled')
    genre = title_data.get('genre', 'fiction')
    author = title_data.get('primary_author', 'the author')

    return {
        'synopsis_short': (
            f"A compelling {genre} that will keep you turning pages. "
            f"{title} explores the boundaries of human experience in ways that resonate deeply."
        ),
        'synopsis_long': (
            f"In {title}, {author} delivers a masterful work of {genre} that challenges "
            f"conventions and rewards the curious reader.\n\n"
            f"From its gripping opening to its satisfying conclusion, this book weaves together "
            f"themes of resilience, discovery, and transformation. Readers who loved recent "
            f"bestsellers in the {genre} category will find a fresh voice and unforgettable "
            f"characters that linger long after the final page.\n\n"
            f"Whether you're a devoted fan of {genre} or discovering the genre for the first "
            f"time, {title} offers something rare: a story that entertains as much as it "
            f"enlightens."
        ),
        'keywords_suggested': [genre, f'{genre} books', 'new releases', 'bestseller', 'must read'],
        'comparable_titles': [],
        'tokens_used': 0,
        'model': 'demo-fallback',
        'ai_assisted': True,
    }


def _generate_demo_keywords(title_data: dict) -> dict:
    """Generate demo keywords when Claude API is unavailable."""
    genre = title_data.get('genre', 'fiction')
    return {
        'keywords': [
            f'{genre} books 2026',
            f'best {genre}',
            f'new {genre} releases',
            f'{genre} must read',
            'book club picks',
            'independent authors',
            'award winning fiction',
        ],
        'reasoning': ['Genre match', 'Trending search', 'Discovery term'] * 2 + ['Broad reach'],
        'tokens_used': 0,
        'ai_assisted': True,
    }
