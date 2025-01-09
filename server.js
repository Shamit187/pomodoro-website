const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Get the port from command-line arguments or default to 3000
const PORT = process.argv[2] || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the tasks JSON file
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Endpoint to fetch tasks
app.get('/api/tasks', (req, res) => {
    console.log('Fetching tasks...');
    fs.readFile(tasksFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading tasks file:', err);
            return res.status(500).json({ error: 'Failed to load tasks' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update tasks
app.post('/api/tasks', (req, res) => {
    const updatedTasks = req.body;
    console.log('Updating tasks...', updatedTasks);
    fs.writeFile(tasksFilePath, JSON.stringify(updatedTasks, null, 2), (err) => {
        if (err) {
            console.error('Error writing to tasks file:', err);
            return res.status(500).json({ error: 'Failed to save tasks' });
        }
        res.json({ message: 'Tasks saved successfully' });
    });
});

// Path to the timer JSON file
const timerFilePath = path.join(__dirname, 'timer.json');

// Endpoint to fetch timer state
app.get('/api/timer', (req, res) => {
    console.log('Fetching timer state...');
    fs.readFile(timerFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading timer file:', err);
            return res.status(500).json({ error: 'Failed to load timer state' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update timer state
app.post('/api/timer', (req, res) => {
    const updatedTimerState = req.body;
    console.log('Updating timer state...', updatedTimerState);
    fs.writeFile(timerFilePath, JSON.stringify(updatedTimerState, null, 2), (err) => {
        if (err) {
            console.error('Error writing to timer file:', err);
            return res.status(500).json({ error: 'Failed to save timer state' });
        }
        res.json({ message: 'Timer state saved successfully' });
    });
});

const archivedTasksFilePath = path.join(__dirname, 'archived-tasks.json');

// Fetch Archived Tasks
app.get('/api/archived-tasks', (req, res) => {
    console.log('Fetching archived tasks...');
    fs.readFile(archivedTasksFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading archived tasks file:', err.message);
            return res.status(500).json({ error: 'Failed to load archived tasks' });
        }
        try {
            const parsedData = JSON.parse(data);
            res.json(parsedData);
        } catch (parseError) {
            console.error('Error parsing archived tasks file:', parseError.message);
            return res.status(500).json({ error: 'Failed to parse archived tasks' });
        }
    });
});

// Update Archived Tasks
app.post('/api/archived-tasks', (req, res) => {
    const updatedArchivedTasks = req.body;
    console.log('Updating archived tasks...', updatedArchivedTasks);
    fs.writeFile(archivedTasksFilePath, JSON.stringify(updatedArchivedTasks, null, 2), (err) => {
        if (err) {
            console.error('Error writing to archived tasks file:', err.message);
            return res.status(500).json({ error: 'Failed to save archived tasks' });
        }
        res.json({ message: 'Archived tasks saved successfully' });
    });
});

// music player
const musicDirectory = path.join(__dirname, 'public', 'music');

app.get('/api/playlists', (req, res) => {
    console.log('Fetching playlists...');
    fs.readdir(musicDirectory, (err, folders) => {
        if (err) {
            console.error('Error reading music directory:', err);
            return res.status(500).json({ error: 'Failed to load playlists' });
        }

        // Filter only directories and fetch tracks in each directory
        const playlists = folders
            .filter(folder => fs.statSync(path.join(musicDirectory, folder)).isDirectory())
            .map(folder => {
                const folderPath = path.join(musicDirectory, folder);
                const tracks = fs.readdirSync(folderPath).filter(file => file.endsWith('.mp3')); // Only .mp3 files
                return {
                    name: folder,
                    tracks: tracks
                };
            });

        res.json({ playlists });
    });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
