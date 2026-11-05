import { SearchResultItem } from '../types';

export class SearchService {
  private historyKey = 'jarvis_search_history';

  public getHistory(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.historyKey);
      return data ? JSON.parse(data) : ['Quantum Computing', 'James Webb Space Telescope', 'Android Jetpack Compose', 'Iron Man Mark 85'];
    } catch {
      return [];
    }
  }

  public saveToHistory(query: string) {
    if (!query || typeof window === 'undefined') return;
    try {
      const current = this.getHistory().filter((item) => item.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...current].slice(0, 15);
      localStorage.setItem(this.historyKey, JSON.stringify(updated));
    } catch {
      // storage failed
    }
  }

  public clearHistory() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.historyKey);
    } catch {
      // ignore
    }
  }

  /**
   * Performs real multi-source web search using DuckDuckGo Instant & Wikipedia APIs
   */
  public async search(query: string, category: string = 'all'): Promise<SearchResultItem[]> {
    const cleaned = query.trim();
    if (!cleaned) return [];

    this.saveToHistory(cleaned);
    const results: SearchResultItem[] = [];

    // 1. Query DuckDuckGo Instant Answer API (JSONP/CORS friendly)
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleaned)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(ddgUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.AbstractText) {
          results.push({
            id: 'ddg-abstract',
            title: data.Heading || cleaned,
            url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(cleaned)}`,
            snippet: data.AbstractText,
            source: data.AbstractSource || 'DuckDuckGo Knowledge',
            category: 'Knowledge',
          });
        }

        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 4)) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                id: `ddg-topic-${topic.FirstURL}`,
                title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 40),
                url: topic.FirstURL,
                snippet: topic.Text,
                source: 'DuckDuckGo Web',
                category: 'All',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('DDG search request failed, falling back to Wikipedia/Direct web:', err);
    }

    // 2. Query Wikipedia API for deep knowledge cards
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}&format=json&origin=*`;
      const response = await fetch(wikiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.query?.search && Array.isArray(data.query.search)) {
          for (const item of data.query.search.slice(0, 4)) {
            const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '');
            // Only add if not already in results
            if (!results.some((r) => r.title.toLowerCase() === item.title.toLowerCase())) {
              results.push({
                id: `wiki-${item.pageid}`,
                title: item.title,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
                snippet: cleanSnippet,
                source: 'Wikipedia Encyclopedia',
                category: 'Knowledge',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Wikipedia query fallback failed:', err);
    }

    // 3. Always include direct deep links to Google, Bing, and DuckDuckGo full results
    results.push({
      id: 'direct-google',
      title: `Google Search: "${cleaned}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(cleaned)}`,
      snippet: `Explore live real-time web results, images, articles, and news regarding "${cleaned}" on Google.`,
      source: 'Google Search Index',
      category: 'Web',
    });

    results.push({
      id: 'direct-youtube',
      title: `YouTube Video Results: "${cleaned}"`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleaned)}`,
      snippet: `Watch verified high-definition videos, tutorials, streams, and podcasts for "${cleaned}".`,
      source: 'YouTube Media',
      category: 'Media',
    });

    // Filter by category if requested
    if (category !== 'all') {
      const filtered = results.filter((r) => r.category?.toLowerCase() === category.toLowerCase());
      return filtered.length > 0 ? filtered : results;
    }

    return results;
  }
}

export const searchService = new SearchService();
