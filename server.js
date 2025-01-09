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
    //make sure every task is not active before saving
    updatedArchivedTasks.forEach(task => task.active = false);
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

const historyFilePath = path.join(__dirname, 'history.json');

// Helper function to read and write JSON data
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API to save Pomodoro session data
app.post('/api/saveActivity', (req, res) => {
    const { tag, topic, timeSpent } = req.body;
    console.log('Saving activity:', tag, topic, timeSpent);

    if (!tag || !topic || !timeSpent) {
        return res.status(400).send({ error: 'Missing required fields: tag, topic, or timeSpent' });
    }

    const history = readJSON(historyFilePath);
    history.push({ tag, topic, timeSpent, date: new Date().toISOString() });

    writeJSON(historyFilePath, history);

    res.status(200).send({ message: 'Activity saved successfully' });
});

// API to fetch progress data
app.get('/api/progress', (req, res) => {
    if (!fs.existsSync(historyFilePath)) {
        return res.status(404).send({ error: "History file not found" });
    }

    const historyData = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));

    // Aggregate data by date
    const progressData = historyData.reduce((acc, entry) => {
        const date = entry.date.split('T')[0]; // Extract date part
        acc[date] = (acc[date] || 0) + entry.timeSpent; // Sum minutes for each date
        return acc;
    }, {});

    // Get today's date and the date 10 days ago, normalize to YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    // Filter the progress data for the last 10 days
    const filteredProgressData = Object.keys(progressData)
        .filter(date => {
            const currentDate = new Date(date);
            currentDate.setHours(0, 0, 0, 0); // Strip time
            return currentDate >= tenDaysAgo && currentDate <= today;
        })
        .reduce((acc, date) => {
            acc[date] = progressData[date];
            return acc;
        }, {});

    // Prepare the response
    const labels = Object.keys(filteredProgressData).sort(); // Sorted dates
    const dailyHours = labels.map((date) => (filteredProgressData[date] / 60).toFixed(2)); // Convert minutes to hours and round to 2 decimals

    console.log('Fetching progress data for the last 10 days:', labels, dailyHours);

    res.status(200).json({ labels, dailyHours });
});


// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
