# AI Weekly Sync

A local markdown-based webapp for managing weekly AI news syncs with your dev team.

![Dark themed UI](https://img.shields.io/badge/theme-dark-1a1a2e) ![Local first](https://img.shields.io/badge/storage-local%20files-green) ![Git friendly](https://img.shields.io/badge/persistence-git-orange)

## Features

- 🌙 **Clean dark theme** - GitHub-inspired design that's easy on the eyes
- 📝 **Markdown editor** - Split-pane with live preview
- 🗂️ **Card-based home** - Browse all syncs at a glance
- 📁 **Local file storage** - Syncs saved as markdown files in `syncs/`
- 🔄 **Git-friendly** - No database, just files you can version control
- 📋 **Template system** - Consistent structure for every weekly sync

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

This runs both:
- **Frontend**: http://localhost:5173 (Vite)
- **API Server**: http://localhost:3001 (Express)

## Usage

1. **Create a sync** - Click "Create New Sync" to start a new weekly entry
2. **Edit content** - Use the split-pane editor with live markdown preview
3. **Save** - Files are saved to `syncs/sync-XXX.md`
4. **View** - Click any card to view the full rendered sync
5. **Edit existing** - Use the Edit button to modify past syncs

## File Structure

```
syncs/
├── TEMPLATE.md      # Template for new syncs (customize this!)
├── sync-001.md      # Week 1
├── sync-002.md      # Week 2
└── ...
```

## Customizing the Template

Edit `syncs/TEMPLATE.md` to customize the structure for new syncs. Available placeholders:

- `{NUMBER}` - Auto-incremented sync number
- `{DATE}` - Today's date

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (dark theme)
- **Markdown**: react-markdown + remark-gfm
- **Backend**: Express.js
- **Storage**: Local filesystem

## Development

```bash
# Run frontend only
npm run client

# Run API only  
npm run server

# Run both (default)
npm run dev

# Build for production
npm run build
```

## License

MIT
