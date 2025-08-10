import re

COMMON_ABBREVIATIONS = {
    'corporation': 'corp',
    'incorporated': 'inc',
    'company': 'co',
    'limited': 'ltd',
    'technologies': 'tech',
    'technology': 'tech',
    'solutions': 'sol',
    'international': 'intl',
    'development': 'dev',
    'organization': 'org',
    'workspace': 'ws',
    'project': 'proj',
    'management': 'mgmt',
    'department': 'dept',
    'system': 'sys',
}

def slugify(text: str) -> str:
    """
    Converts a string into a URL-safe, shortened slug.
    """
    text = text.lower()

    for word, replacement in COMMON_ABBREVIATIONS.items():
        text = re.sub(rf'\b{word}\b', replacement, text)

    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')
