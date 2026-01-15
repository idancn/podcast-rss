const { Podcast } = require('podcast');
const fs = require('fs-extra');
const path = require('path');

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES FOR YOUR GITHUB ACCOUNT
// ============================================================================
const CONFIG = {
  // Replace with your GitHub username
  githubUsername: 'idancn',
  
  // Replace with your repository name
  repoName: 'podcast-rss',
  
  // Podcast metadata - customize these for your podcast
  podcast: {
    title: 'My Podcast',
    description: 'A podcast hosted on GitHub Pages',
    author: 'Your Name',
    email: 'your-email@example.com',
    language: 'en',
    categories: ['Technology'], // iTunes categories
    explicit: false,
  }
};

// Computed base URL for GitHub Pages
const BASE_URL = `https://${CONFIG.githubUsername}.github.io/${CONFIG.repoName}`;

// Directory paths
const EPISODES_DIR = path.join(__dirname, '..', 'episodes');
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'rss.xml');

/**
 * Convert filename to a readable episode title
 * @param {string} filename - The MP3 filename
 * @returns {string} - Human-readable title
 */
function filenameToTitle(filename) {
  return filename
    .replace(/\.(mp3|m4a|mp4|aac)$/i, '')  // Remove audio extension
    .replace(/[-_]/g, ' ')                  // Replace dashes/underscores with spaces
    .replace(/\s+/g, ' ')                   // Normalize multiple spaces
    .trim();
}

/**
 * Get file statistics including size and modified date
 * @param {string} filepath - Full path to the file
 * @returns {Promise<{size: number, mtime: Date}>}
 */
async function getFileStats(filepath) {
  const stats = await fs.stat(filepath);
  return {
    size: stats.size,
    mtime: stats.mtime,
  };
}

/**
 * Scan episodes directory and return episode metadata
 * @returns {Promise<Array>} - Array of episode objects
 */
async function scanEpisodes() {
  // Ensure episodes directory exists
  await fs.ensureDir(EPISODES_DIR);
  
  const files = await fs.readdir(EPISODES_DIR);
  const audioExtensions = ['.mp3', '.m4a', '.mp4', '.aac'];
  const audioFiles = files.filter(file => 
    audioExtensions.some(ext => file.toLowerCase().endsWith(ext))
  );
  
  const episodes = await Promise.all(
    audioFiles.map(async (filename) => {
      const filepath = path.join(EPISODES_DIR, filename);
      const stats = await getFileStats(filepath);
      const ext = path.extname(filename).toLowerCase();
      
      // Determine MIME type based on extension
      const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.m4a': 'audio/x-m4a',
        '.mp4': 'audio/mp4',
        '.aac': 'audio/aac',
      };
      
      return {
        filename,
        title: filenameToTitle(filename),
        url: `${BASE_URL}/episodes/${encodeURIComponent(filename)}`,
        size: stats.size,
        pubDate: stats.mtime,
        mimeType: mimeTypes[ext] || 'audio/mpeg',
      };
    })
  );
  
  // Sort episodes by publication date (newest first)
  return episodes.sort((a, b) => b.pubDate - a.pubDate);
}

/**
 * Generate the podcast RSS feed
 */
async function generateRSS() {
  console.log('🎙️  Podcast RSS Feed Generator');
  console.log('================================\n');
  
  // Scan for episodes
  console.log(`📂 Scanning episodes directory: ${EPISODES_DIR}`);
  const episodes = await scanEpisodes();
  
  if (episodes.length === 0) {
    console.log('⚠️  No audio files found in /episodes folder.');
    console.log('   Add some .mp3/.m4a files and run this script again.\n');
  } else {
    console.log(`✅ Found ${episodes.length} episode(s)\n`);
  }
  
  // Create podcast feed
  const feed = new Podcast({
    title: CONFIG.podcast.title,
    description: CONFIG.podcast.description,
    feedUrl: `${BASE_URL}/rss.xml`,
    siteUrl: BASE_URL,
    imageUrl: `${BASE_URL}/artwork.jpg`, // Optional: add artwork.jpg to public/
    author: CONFIG.podcast.author,
    managingEditor: CONFIG.podcast.email,
    webMaster: CONFIG.podcast.email,
    copyright: `${new Date().getFullYear()} ${CONFIG.podcast.author}`,
    language: CONFIG.podcast.language,
    pubDate: episodes.length > 0 ? episodes[0].pubDate : new Date(),
    ttl: 60, // Time to live in minutes
    itunesAuthor: CONFIG.podcast.author,
    itunesSubtitle: CONFIG.podcast.description.substring(0, 255),
    itunesSummary: CONFIG.podcast.description,
    itunesOwner: {
      name: CONFIG.podcast.author,
      email: CONFIG.podcast.email,
    },
    itunesExplicit: CONFIG.podcast.explicit,
    itunesCategory: CONFIG.podcast.categories.map(cat => ({ text: cat })),
    itunesImage: `${BASE_URL}/artwork.jpg`,
  });
  
  // Add episodes to feed
  episodes.forEach((episode, index) => {
    console.log(`   ${index + 1}. ${episode.title}`);
    console.log(`      📅 Date: ${episode.pubDate.toISOString()}`);
    console.log(`      📦 Size: ${(episode.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`      🔗 URL: ${episode.url}\n`);
    
    feed.addItem({
      title: episode.title,
      description: `Episode: ${episode.title}`,
      url: episode.url,
      guid: episode.url,
      date: episode.pubDate,
      enclosure: {
        url: episode.url,
        size: episode.size,
        type: episode.mimeType,
      },
      itunesAuthor: CONFIG.podcast.author,
      itunesExplicit: CONFIG.podcast.explicit,
      itunesSubtitle: episode.title,
      itunesSummary: `Episode: ${episode.title}`,
      itunesDuration: 0, // You can add duration detection if needed
    });
  });
  
  // Ensure root directory exists (should always exist)
  await fs.ensureDir(ROOT_DIR);
  
  // Generate and write RSS XML
  const xml = feed.buildXml('  ');
  await fs.writeFile(OUTPUT_FILE, xml, 'utf8');
  
  console.log('================================');
  console.log(`✅ RSS feed generated: ${OUTPUT_FILE}`);
  console.log(`🌐 Feed URL: ${BASE_URL}/rss.xml\n`);
  
  // Reminder about configuration
  if (CONFIG.githubUsername === 'YOUR_GITHUB_USERNAME') {
    console.log('⚠️  IMPORTANT: Update the CONFIG section in this script!');
    console.log('   - Set your GitHub username');
    console.log('   - Set your repository name');
    console.log('   - Customize your podcast metadata\n');
  }
}

// Run the generator
generateRSS().catch((error) => {
  console.error('❌ Error generating RSS feed:', error);
  process.exit(1);
});

