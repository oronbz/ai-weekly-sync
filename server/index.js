import express from 'express';
import { readdir, readFile, writeFile, mkdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYNCS_DIR = join(__dirname, '..', 'syncs');
const TEMPLATE_PATH = join(SYNCS_DIR, 'TEMPLATE.md');

const app = express();
app.use(express.json());

// Ensure syncs directory exists
async function ensureSyncsDir() {
    if (!existsSync(SYNCS_DIR)) {
        await mkdir(SYNCS_DIR, { recursive: true });
    }
}

// Get sync number from filename (e.g., "sync-001.md" -> 1)
function getSyncNumber(filename) {
    const match = filename.match(/^sync-(\d+)\.md$/);
    return match ? parseInt(match[1], 10) : null;
}

// Extract title from markdown content
function extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled';
}

// Extract date from markdown content
function extractDate(content) {
    const match = content.match(/\*\*Date\*\*:\s*(.+)/);
    return match ? match[1].trim() : null;
}

// Get preview snippet (first non-empty line after frontmatter)
function extractPreview(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('---')) {
            return line.substring(0, 150) + (line.length > 150 ? '...' : '');
        }
    }
    return '';
}

// GET /api/syncs - List all syncs
app.get('/api/syncs', async (req, res) => {
    try {
        await ensureSyncsDir();
        const files = await readdir(SYNCS_DIR);
        const syncs = [];

        for (const file of files) {
            if (file === 'TEMPLATE.md') continue;
            const num = getSyncNumber(file);
            if (num === null) continue;

            const content = await readFile(join(SYNCS_DIR, file), 'utf-8');
            syncs.push({
                id: num,
                filename: file,
                title: extractTitle(content),
                date: extractDate(content),
                preview: extractPreview(content)
            });
        }

        // Sort by number descending (newest first)
        syncs.sort((a, b) => b.id - a.id);
        res.json(syncs);
    } catch (error) {
        console.error('Error listing syncs:', error);
        res.status(500).json({ error: 'Failed to list syncs' });
    }
});

// GET /api/syncs/:id - Get single sync
app.get('/api/syncs/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const filename = `sync-${String(id).padStart(3, '0')}.md`;
        const filepath = join(SYNCS_DIR, filename);

        if (!existsSync(filepath)) {
            return res.status(404).json({ error: 'Sync not found' });
        }

        const content = await readFile(filepath, 'utf-8');
        res.json({
            id,
            filename,
            content,
            title: extractTitle(content),
            date: extractDate(content)
        });
    } catch (error) {
        console.error('Error reading sync:', error);
        res.status(500).json({ error: 'Failed to read sync' });
    }
});

// GET /api/template - Get template content
app.get('/api/template', async (req, res) => {
    try {
        await ensureSyncsDir();

        if (!existsSync(TEMPLATE_PATH)) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const content = await readFile(TEMPLATE_PATH, 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error('Error reading template:', error);
        res.status(500).json({ error: 'Failed to read template' });
    }
});

// POST /api/syncs - Create new sync
app.post('/api/syncs', async (req, res) => {
    try {
        await ensureSyncsDir();

        // Find next sync number
        const files = await readdir(SYNCS_DIR);
        let maxNum = 0;
        for (const file of files) {
            const num = getSyncNumber(file);
            if (num !== null && num > maxNum) {
                maxNum = num;
            }
        }
        const newNum = maxNum + 1;
        const filename = `sync-${String(newNum).padStart(3, '0')}.md`;

        // Get template and populate
        let content = req.body.content;
        if (!content) {
            if (existsSync(TEMPLATE_PATH)) {
                content = await readFile(TEMPLATE_PATH, 'utf-8');
            } else {
                content = '# Week {NUMBER} - AI News Sync\n**Date**: {DATE}\n';
            }
        }

        // Replace placeholders
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        content = content.replace(/{NUMBER}/g, String(newNum));
        content = content.replace(/{DATE}/g, today);

        await writeFile(join(SYNCS_DIR, filename), content, 'utf-8');

        res.json({
            id: newNum,
            filename,
            content,
            title: extractTitle(content),
            date: extractDate(content)
        });
    } catch (error) {
        console.error('Error creating sync:', error);
        res.status(500).json({ error: 'Failed to create sync' });
    }
});

// PUT /api/syncs/:id - Update sync
app.put('/api/syncs/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const filename = `sync-${String(id).padStart(3, '0')}.md`;
        const filepath = join(SYNCS_DIR, filename);

        if (!existsSync(filepath)) {
            return res.status(404).json({ error: 'Sync not found' });
        }

        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        await writeFile(filepath, content, 'utf-8');

        res.json({
            id,
            filename,
            content,
            title: extractTitle(content),
            date: extractDate(content)
        });
    } catch (error) {
        console.error('Error updating sync:', error);
        res.status(500).json({ error: 'Failed to update sync' });
    }
});

// DELETE /api/syncs/:id - Delete sync
app.delete('/api/syncs/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const filename = `sync-${String(id).padStart(3, '0')}.md`;
        const filepath = join(SYNCS_DIR, filename);

        if (!existsSync(filepath)) {
            return res.status(404).json({ error: 'Sync not found' });
        }

        await unlink(filepath);

        res.json({ success: true, id, message: `Sync #${id} deleted` });
    } catch (error) {
        console.error('Error deleting sync:', error);
        res.status(500).json({ error: 'Failed to delete sync' });
    }
});

const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});

// Keep the server running
server.on('error', (err) => {
    console.error('Server error:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        process.exit(0);
    });
});
