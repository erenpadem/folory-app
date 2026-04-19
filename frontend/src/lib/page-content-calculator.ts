/**
 * Calculate page content capacity and usage
 * Estimates how much content fits on a typical book page
 */

interface ContentMetrics {
  textLength: number;
  imageCount: number;
  headingCount: { h1: number; h2: number; h3: number };
  blockquoteCount: number;
  estimatedPages: number;
  isOverLimit: boolean;
}

/**
 * Typical book page capacity:
 * - A4 size with margins: ~160mm x 240mm effective area
 * - Font: 12pt (16px), Line height: 1.5
 * - Average characters per line: ~70-80
 * - Lines per page: ~40-45
 * - Base capacity: ~2800-3600 characters
 * 
 * We use 3000 characters as base, with adjustments for:
 * - Images: ~800 characters equivalent each
 * - H1: ~150 characters equivalent
 * - H2: ~100 characters equivalent
 * - H3: ~80 characters equivalent
 * - Blockquotes: ~200 characters equivalent
 */
export const BASE_PAGE_CAPACITY = 3000;
const IMAGE_EQUIVALENT = 800;
const H1_EQUIVALENT = 150;
const H2_EQUIVALENT = 100;
const H3_EQUIVALENT = 80;
const BLOCKQUOTE_EQUIVALENT = 200;

/**
 * Parse HTML content and calculate metrics
 */
export function calculateContentMetrics(html: string): ContentMetrics {
  if (!html || typeof document === 'undefined') {
    return {
      textLength: 0,
      imageCount: 0,
      headingCount: { h1: 0, h2: 0, h3: 0 },
      blockquoteCount: 0,
      estimatedPages: 0,
      isOverLimit: false,
    };
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Extract text content (without HTML tags)
  const textContent = tempDiv.textContent || '';
  const textLength = textContent.trim().length;

  // Count images
  const images = tempDiv.querySelectorAll('img');
  const imageCount = images.length;
  
  // Calculate image space (considering size)
  let imageSpace = 0;
  images.forEach((img) => {
    // Estimate based on image dimensions if available
    const width = img.getAttribute('width') ? parseInt(img.getAttribute('width') || '0') : 0;
    const height = img.getAttribute('height') ? parseInt(img.getAttribute('height') || '0') : 0;
    
    if (width && height) {
      // Estimate: larger images take more space
      const area = width * height;
      const baseArea = 400 * 300; // Base image size (400x300)
      imageSpace += Math.ceil((area / baseArea) * IMAGE_EQUIVALENT);
    } else {
      // Default estimate
      imageSpace += IMAGE_EQUIVALENT;
    }
  });

  // Count headings
  const h1Count = tempDiv.querySelectorAll('h1').length;
  const h2Count = tempDiv.querySelectorAll('h2').length;
  const h3Count = tempDiv.querySelectorAll('h3').length;

  // Count blockquotes
  const blockquoteCount = tempDiv.querySelectorAll('blockquote').length;

  // Calculate total equivalent characters
  const headingSpace = (h1Count * H1_EQUIVALENT) + (h2Count * H2_EQUIVALENT) + (h3Count * H3_EQUIVALENT);
  const blockquoteSpace = blockquoteCount * BLOCKQUOTE_EQUIVALENT;
  
  const totalEquivalent = textLength + imageSpace + headingSpace + blockquoteSpace;

  // Calculate estimated pages
  const estimatedPages = Math.ceil(totalEquivalent / BASE_PAGE_CAPACITY);
  const isOverLimit = totalEquivalent > BASE_PAGE_CAPACITY;

  return {
    textLength,
    imageCount,
    headingCount: { h1: h1Count, h2: h2Count, h3: h3Count },
    blockquoteCount,
    estimatedPages,
    isOverLimit,
  };
}

/**
 * Get remaining capacity for current page
 */
export function getRemainingCapacity(html: string): number {
  const metrics = calculateContentMetrics(html);
  const totalEquivalent = 
    metrics.textLength +
    (metrics.imageCount * IMAGE_EQUIVALENT) +
    (metrics.headingCount.h1 * H1_EQUIVALENT) +
    (metrics.headingCount.h2 * H2_EQUIVALENT) +
    (metrics.headingCount.h3 * H3_EQUIVALENT) +
    (metrics.blockquoteCount * BLOCKQUOTE_EQUIVALENT);
  
  return Math.max(0, BASE_PAGE_CAPACITY - totalEquivalent);
}

/**
 * Check if content exceeds page limit
 */
export function isContentOverLimit(html: string): boolean {
  return calculateContentMetrics(html).isOverLimit;
}

/**
 * Split content at limit, returning current page content and overflow
 */
export function splitContentAtLimit(html: string): { currentPage: string; overflow: string } {
  if (!isContentOverLimit(html)) {
    return { currentPage: html, overflow: '' };
  }

  // For now, we'll keep it simple and let the user manually manage overflow
  // In a more advanced implementation, we could parse and split HTML intelligently
  return { currentPage: html, overflow: '' };
}

