# Deployment Guide

## Quick Start

This repository contains a complete, self-contained web game that can be deployed to any static hosting service.

## Deployment Options

### 1. GitHub Pages (Recommended)
1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your game will be available at `https://yourusername.github.io/snowball-frenzy-site`

### 2. Netlify
1. Connect your GitHub repository to Netlify
2. Deploy automatically on push
3. Get a custom URL and optional custom domain

### 3. Vercel
1. Import your GitHub repository to Vercel
2. Automatic deployments on push
3. Get a custom URL and optional custom domain

### 4. Any Static Hosting
- Upload all files to your web server
- Ensure `index.html` is in the root directory
- No server-side processing required

## File Structure

```
snowball-frenzy-site/
├── index.html          # Main entry point
├── main.js            # Game logic
├── style.css          # Styling
├── core/              # Core game systems
├── loops/             # Game loop systems
├── ui/                # User interface
├── global/            # Global game data
├── meta/              # Meta game systems
└── README.md          # This file
```

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No external dependencies
- No server-side processing
- Local storage enabled (for save games)

## Testing

1. Open `index.html` in a web browser
2. The game should load and be fully playable
3. Check browser console for any errors
4. Verify save/load functionality works

## Customization

- Modify `core/config.js` for game balance changes
- Update `global/data/` files for content changes
- Modify `style.css` for visual changes
- Edit `ui/` components for interface changes

## Support

For issues or questions:
- Check browser console for errors
- Verify all files are present
- Ensure proper file permissions
- Test in different browsers

---

*Happy deploying! 🚀*
