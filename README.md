# Podcast RSS Feed Generator for GitHub Pages

A simple Node.js tool that generates an iTunes/Spotify compatible RSS 2.0 podcast feed from MP3 files, designed for hosting on GitHub Pages.

## Quick Start

### 1. Configure Your Settings

Edit `scripts/generate-rss.js` and update the `CONFIG` section:

```javascript
const CONFIG = {
  // Replace with your GitHub username
  githubUsername: 'your-actual-username',
  
  // Replace with your repository name
  repoName: 'podcasts-rss',
  
  // Customize your podcast metadata
  podcast: {
    title: 'My Awesome Podcast',
    description: 'A podcast about amazing things',
    author: 'Your Name',
    email: 'your-email@example.com',
    language: 'en',
    categories: ['Technology'],
    explicit: false,
  }
};
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Your Episodes

Drop your `.mp3` files into the `/episodes` folder. The script will:
- Use the filename as the episode title (converting dashes/underscores to spaces)
- Use the file's last modified date as the publication date

### 4. Generate the RSS Feed

```bash
npm run build-rss
```

This creates `public/rss.xml` with your podcast feed.

### 5. Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select the `main` branch and `/ (root)` folder
4. Click **Save**

Your podcast will be available at:
- **RSS Feed:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/rss.xml`
- **Episodes:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/episodes/your-episode.mp3`

## Project Structure

```
├── episodes/           # Drop your MP3 files here
├── public/
│   └── rss.xml        # Generated RSS feed
├── scripts/
│   └── generate-rss.js # RSS generation script
├── .github/
│   └── workflows/
│       └── update-rss.yml  # Auto-regenerate on new episodes
└── package.json
```

## Automation

The included GitHub Action automatically:
1. Detects when new files are added to `/episodes`
2. Regenerates the RSS feed
3. Commits and pushes the updated `rss.xml`

## Adding Podcast Artwork

Place an `artwork.jpg` file (1400x1400 to 3000x3000 pixels recommended) in the `/public` folder for podcast artwork.

## Submitting to Podcast Directories

Once your feed is live, submit your RSS URL to:

| Platform | Submission URL |
|----------|---------------|
| Apple Podcasts | https://podcastsconnect.apple.com |
| Spotify | https://podcasters.spotify.com |
| Google Podcasts | https://podcastsmanager.google.com |
| Amazon Music | https://podcasters.amazon.com |

## File Naming Tips

The filename becomes your episode title. For best results:

| Filename | Generated Title |
|----------|----------------|
| `my-first-episode.mp3` | My first episode |
| `001_welcome_to_the_show.mp3` | 001 welcome to the show |
| `Episode 5 - Great Topic.mp3` | Episode 5 - Great Topic |

## License

MIT

