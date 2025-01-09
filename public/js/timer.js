const debug = true; // Debug mode

// ** Timer logic** 
// DOM Elements for Settings
const focusLengthInput = document.getElementById("focus-length");
const shortBreakLengthInput = document.getElementById("short-break-length");
const longBreakLengthInput = document.getElementById("long-break-length");
const focusSpreeInput = document.getElementById("focus-spree");
const saveSettingsButton = document.getElementById("save-settings");

// DOM Elements for Timer States
const focusState = document.getElementById("focus-state");
const shortBreakState = document.getElementById("short-break-state");
const longBreakState = document.getElementById("long-break-state");
function updateStateIndicators() {
    requestAnimationFrame(() => {
        focusState.classList.add("state-indicator-off");
        focusState.classList.remove("state-indicator-on");
        shortBreakState.classList.add("state-indicator-off");
        shortBreakState.classList.remove("state-indicator-on");
        longBreakState.classList.add("state-indicator-off");
        longBreakState.classList.remove("state-indicator-on");

        if (timerState === "focus") {
            focusState.classList.remove("state-indicator-off");
            focusState.classList.add("state-indicator-on");
        } else if (timerState === "shortBreak") {
            shortBreakState.classList.remove("state-indicator-off");
            shortBreakState.classList.add("state-indicator-on");
        } else if (timerState === "longBreak") {
            longBreakState.classList.remove("state-indicator-off");
            longBreakState.classList.add("state-indicator-on");
        }

        console.log("State Indicators Updated:", timerState); // Debugging
    });
}

function switchToNextStateAsync() {
    return new Promise((resolve) => {
        switchToNextState();
        resolve();
    });
}

async function handleTimerCompletion() {
    clearInterval(timerInterval);
    await switchToNextStateAsync();
    startTimer(); // Restart the timer in the new state
}

// Timer States and Durations
let timerState = "focus"; // "focus", "shortBreak", "longBreak"
let focusDuration = parseInt(focusLengthInput.value, 10) * 60; // Default Focus duration in seconds
let shortBreakDuration = parseInt(shortBreakLengthInput.value, 10) * 60; // Default Short Break duration in seconds
let longBreakDuration = parseInt(longBreakLengthInput.value, 10) * 60; // Default Long Break duration in seconds
let focusSpree = parseInt(focusSpreeInput.value, 10); // Default focus spree count
let completedFocusSessions = 0;
let timeRemaining = focusDuration; // Current remaining time in seconds
let timerInterval = null;
let playState = "pause"; // "play" or "pause"


// Save the current timer state
async function saveState() {
    const state = {
        timerState,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        focusSpree,
        completedFocusSessions,
        timeRemaining,
        playState,
    };

    try {
        const response = await fetch('/api/timer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        });
        if (!response.ok) {
            throw new Error('Failed to save timer state');
        }
        console.log('Timer state saved successfully');
    } catch (error) {
        console.error('Error saving timer state:', error);
    }
}


// Load the saved timer state
async function loadState() {
    try {
        const response = await fetch('/api/timer');
        if (!response.ok) {
            throw new Error('Failed to load timer state');
        }
        const savedState = await response.json();

        const {
            timerState: savedTimerState,
            focusDuration: savedFocusDuration,
            shortBreakDuration: savedShortBreakDuration,
            longBreakDuration: savedLongBreakDuration,
            focusSpree: savedFocusSpree,
            completedFocusSessions: savedCompletedFocusSessions,
            timeRemaining: savedTimeRemaining,
            playState: savedPlayState,
        } = savedState;

        timerState = savedTimerState;
        focusDuration = savedFocusDuration;
        shortBreakDuration = savedShortBreakDuration;
        longBreakDuration = savedLongBreakDuration;
        focusSpree = savedFocusSpree;
        completedFocusSessions = savedCompletedFocusSessions;
        timeRemaining = savedTimeRemaining;
        playState = savedPlayState;

        // Update indicators
        updateStateIndicators();

        // Update UI
        focusLengthInput.value = focusDuration / 60;
        shortBreakLengthInput.value = shortBreakDuration / 60;
        longBreakLengthInput.value = longBreakDuration / 60;
        focusSpreeInput.value = focusSpree;
        updateTimeDisplay();
        updateProgressRing();
    } catch (error) {
        console.error('Error loading timer state:', error);
    }
}


saveSettingsButton.addEventListener("click", () => {
    focusDuration = parseInt(focusLengthInput.value, 10) * 60;
    shortBreakDuration = parseInt(shortBreakLengthInput.value, 10) * 60;
    longBreakDuration = parseInt(longBreakLengthInput.value, 10) * 60;
    focusSpree = parseInt(focusSpreeInput.value, 10);

    timerState = "focus";
    completedFocusSessions = 0;
    updateSpreeLengthIndicator(); // Reset spree length
    timeRemaining = focusDuration;
    initializeTimer();
    saveState();
});

// DOM Elements
const pausePlayButton = document.getElementById("state-toggle");
const stateIcon = document.getElementById("state-icon");
const timerDisplay = document.getElementById("time-display");
const minuteElement = document.getElementById("minute");
const secondElement = document.getElementById("second");
const progressRing = document.getElementById("progress-ring");

// SVG Progress Ring
const radius = progressRing.r.baseVal.value; // Radius of the circle
const FULL_DASH_ARRAY = 2 * Math.PI * radius; // Circumference of the circle

// Initialize stroke-dasharray and stroke-dashoffset
progressRing.style.strokeDasharray = FULL_DASH_ARRAY;
progressRing.style.strokeDashoffset = 0; // Start at 0 for clockwise behavior

// Utility Functions
function updateTimeDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    minuteElement.textContent = String(minutes).padStart(2, "0");
    secondElement.textContent = String(seconds).padStart(2, "0");
}

function updateTitle() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Determine the state text for the title
    const stateText = timerState === "focus" ? "Focus" : "Break";

    // Determine the play/pause icon
    const playIcon = playState === "play" ? "▶️" : "⏸️";

    // Update the website tab title
    document.title = `${playIcon} ${stateText} ${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Periodically update the title
setInterval(() => {
    updateTitle();
}, 1000);

function updateSpreeLengthIndicator() {
    const spreeIndicator = document.getElementById("spree");

    // Calculate progress within the current spree cycle
    const currentCycleProgress = completedFocusSessions % focusSpree;
    const spreeWidth = (currentCycleProgress / focusSpree) * 100;

    spreeIndicator.style.width = `${spreeWidth}%`; // Update the width based on cycle progress
    console.log(`Spree Indicator Updated: ${spreeWidth}% (Cycle Progress: ${currentCycleProgress}/${focusSpree})`);
}

// Update Progress Ring for Clockwise Movement
function updateProgressRing() {
    const offset = FULL_DASH_ARRAY * (timeRemaining / getCurrentDuration());
    progressRing.style.strokeDashoffset = offset; // Move clockwise
}

function getCurrentDuration() {
    if (timerState === "focus") return focusDuration;
    if (timerState === "shortBreak") return shortBreakDuration;
    return longBreakDuration;
}


let isSwitchingState = false;

function switchToNextState() {
    if (isSwitchingState) return; // Prevent concurrent state switches
    isSwitchingState = true;

    if (timerState === "focus") {
        completedFocusSessions++;
        updateSpreeLengthIndicator();

        const activeTask = tasks.find((task) => task.active);
        if (activeTask) {
            activeTask.minute += focusDuration / 60;
            if (activeTask.minute <= 0) {
                activeTask.active = false;
            }
            renderTasks();
            saveTasks(); 
        }

        timerState =
            completedFocusSessions % focusSpree === 0 ? "longBreak" : "shortBreak";
        timeRemaining =
            timerState === "shortBreak" ? shortBreakDuration : longBreakDuration;

        sendNotification(`Time for a ${timerState === "shortBreak" ? "short break" : "long break"}!`);
    } else {
        timerState = "focus";
        timeRemaining = focusDuration;
        sendNotification("Time to focus!");
    }

    updateStateIndicators();
    initializeTimer();
    isSwitchingState = false;
}

// Helper function to send notifications
function sendNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
            body: message,
            icon: "resource/alert.png", // Optional: Add an icon path here
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("Pomodoro Timer", {
                    body: message,
                    icon: "resource/rest.png", // Optional: Add an icon path here
                });
            }
        });
    }
}

function startTimer() {
    if (playState === "play") return;

    playState = "play";
    stateIcon.textContent = "||";

    const startTime = Date.now(); // Get the current timestamp
    const targetEndTime = startTime + timeRemaining * 1000; // Calculate the exact end time

    function tick() {
        if (playState !== "play") return; // Stop if paused or stopped

        const now = Date.now(); // Get the current timestamp
        timeRemaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000)); // Calculate remaining time

        if (timeRemaining > 0) {
            updateTimeDisplay();
            updateProgressRing();
            saveState();
            requestAnimationFrame(tick); // Schedule the next tick
        } else {
            handleTimerCompletion();
        }
    }

    requestAnimationFrame(tick); // Start the timer loop
}

function pauseTimer() {
    if (playState === "pause") return;
    playState = "pause";
    clearInterval(timerInterval);
    stateIcon.textContent = "▶";
    saveState();
}

function initializeTimer() {
    clearInterval(timerInterval);
    playState = "pause";
    stateIcon.textContent = "▶";
    updateTimeDisplay();
    updateProgressRing();
}

pausePlayButton.addEventListener("click", () => {
    if (playState === "pause") {
        startTimer();
    } else {
        pauseTimer();
    }
});

// Initialize Timer on Page Load
loadState();
updateStateIndicators();
updateSpreeLengthIndicator();
if (playState === "play") {
    startTimer();
} else {
    initializeTimer();
}

// ** Task logic **
// DOM Elements
const activeTaskContainer = document.getElementById("active-task");
const taskListContainer = document.getElementById("task-list");


async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function saveTasks() {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tasks),
        });
        if (!response.ok) {
            throw new Error('Failed to save tasks');
        }
        console.log('Tasks saved successfully');
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}


// Render Tasks
function renderTasks() {
    // If no active task exists, promote the first inactive task
    if (!tasks.some((task) => task.active) && tasks.length > 0) {
        tasks[0].active = true;
        saveTasks(); // Save the updated task state
    }

    // Clear existing tasks
    activeTaskContainer.innerHTML = "";
    taskListContainer.innerHTML = "";

    // Render Active Task
    const activeTask = tasks.find((task) => task.active);
    if (activeTask) {
        activeTaskContainer.innerHTML = `
            <div class="flex justify-between items-center w-full">
                <div>
                    <p class="text-sm">${activeTask.tag}</p>
                    <p class="text-xl font-bold">${activeTask.topic}</p>
                    <p class="text-sm">${activeTask.minute} minutes</p>
                </div>
                <div class="task-buttons">
                    <button class="neumorphic-button edit-button"><span class="material-symbols-outlined">edit</span></button>
                    <button class="neumorphic-button delete-button"><span class="material-symbols-outlined">delete</span></button>
                </div>
            </div>
        `;

        // Add delete button logic for the active task
        const deleteButton = activeTaskContainer.querySelector(".delete-button");
        deleteButton.addEventListener("click", () => {
            handleTaskDeletion(tasks.findIndex((task) => task.active)); // Pass index of active task
        });
    }

    // Render Inactive Tasks
    tasks.forEach((task, index) => {
        if (!task.active) {
            const taskElement = document.createElement("div");
            taskElement.className = "task-item";
            taskElement.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <div>
                        <p class="text-sm">${task.tag}</p>
                        <p class="text-lg font-semibold">${task.topic}</p>
                        <p class="text-sm">${task.minute} minutes</p>
                    </div>
                    <div class="task-buttons">
                        <button class="neumorphic-button up-button"><span class="material-symbols-outlined">arrow_circle_up</span></button>
                        <button class="neumorphic-button down-button"><span class="material-symbols-outlined">arrow_circle_down</span></button>
                        <button class="neumorphic-button edit-button"><span class="material-symbols-outlined">edit</span></button>
                        <button class="neumorphic-button delete-button"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                </div>
            `;

            // Add event listeners for up and down buttons
            const upButton = taskElement.querySelector(".up-button");
            const downButton = taskElement.querySelector(".down-button");

            upButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent triggering task click
                moveTaskUp(index);
            });

            downButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent triggering task click
                moveTaskDown(index);
            });

            // Add delete button logic
            const deleteButton = taskElement.querySelector(".delete-button");
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent task click propagation
                handleTaskDeletion(index);
            });

            // Add event listener for task click to make it active
            taskElement.addEventListener("click", () => handleTaskClick(index));

            taskListContainer.appendChild(taskElement);
        }
    });
}


// Move Task Up
function moveTaskUp(index) {
    if (index > 0 && !tasks[index].active) {
        // Swap current task with the one above
        const temp = tasks[index];
        tasks[index] = tasks[index - 1];
        tasks[index - 1] = temp;
        renderTasks(); // Re-render tasks
    }
}

// Move Task Down
function moveTaskDown(index) {
    if (index < tasks.length - 1 && !tasks[index].active) {
        // Swap current task with the one below
        const temp = tasks[index];
        tasks[index] = tasks[index + 1];
        tasks[index + 1] = temp;
        renderTasks(); // Re-render tasks
    }
}


// Handle Task Click
function handleTaskClick(index) {
    const currentActiveIndex = tasks.findIndex((task) => task.active);

    if (currentActiveIndex !== -1) {
        // Set the current active task to inactive
        const [recentlyInactivatedTask] = tasks.splice(currentActiveIndex, 1); // Remove current active task
        recentlyInactivatedTask.active = false; // Mark it as inactive

        // Add it to the top of the tasks array
        tasks.unshift(recentlyInactivatedTask);
    }

    // Mark the clicked task as active
    const [newActiveTask] = tasks.splice(index, 1); // Remove clicked task
    newActiveTask.active = true; // Mark it as active

    // Add it to the beginning of the array
    tasks.unshift(newActiveTask);

    // Re-render the tasks
    renderTasks();
}

// Add Event Listener to Task Form
document.getElementById('task-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form values
    const tagInput = document.getElementById('task-tag');
    const nameInput = document.getElementById('task-name');

    const newTask = {
        tag: tagInput.value,
        topic: nameInput.value,
        minute: 0, // Default value for minute, can be updated later
        active: false // Default state for a new task
    };

    // Add the new task to the tasks array
    tasks.push(newTask);

    // Save tasks to the server (if applicable) and re-render
    saveTasks();
    renderTasks();

    // Clear form inputs
    tagInput.value = '';
    nameInput.value = '';
});

// DOM Elements
const archiveTaskContainer = document.getElementById("archive-task");

// Archive Task List
let archivedTasks = [];

// Fetch Archived Tasks
async function loadArchivedTasks() {
    try {
        const response = await fetch('/api/archived-tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch archived tasks');
        }
        archivedTasks = await response.json();
        renderArchivedTasks();
    } catch (error) {
        console.error('Error loading archived tasks:', error);
    }
}

// Save Archived Tasks
async function saveArchivedTasks() {
    try {
        const response = await fetch('/api/archived-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(archivedTasks),
        });
        if (!response.ok) {
            throw new Error('Failed to save archived tasks');
        }
        console.log('Archived tasks saved successfully');
    } catch (error) {
        console.error('Error saving archived tasks:', error);
    }
}

// Render Archived Tasks
function renderArchivedTasks() {
    archiveTaskContainer.innerHTML = "";

    archivedTasks.forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.className = "archived";
        taskElement.innerHTML = `
            <div class="flex justify-start items-center w-full gap-4">
                <button class="neumorphic-button recycle-button"><span class="material-symbols-outlined">recycling</span></button>
                <button class="neumorphic-button recycle-button"><span class="material-symbols-outlined">delete_forever</span></button>
                <p class="text-base"> <span class="font-semibold">${task.topic}</span>, <span class="font-semibold" style="color:var(--accent-color)">${task.minute}</span> mins</p>
            </div>
        `;
        archiveTaskContainer.appendChild(taskElement);
    });
}

// Load Archived Tasks on Page Load
document.addEventListener("DOMContentLoaded", async () => {
    await loadArchivedTasks();
});

// Handle Task Deletion
function handleTaskDeletion(index) {
    // Check if the task to delete is active
    if (tasks[index].active) {
        // Promote the first inactive task (if available) to active
        const firstInactiveIndex = tasks.findIndex((task) => !task.active);
        if (firstInactiveIndex !== -1) {
            tasks[firstInactiveIndex].active = true;
        }
    }

    // Remove the task from the main list and add it to the archive
    const [deletedTask] = tasks.splice(index, 1);
    archivedTasks.push(deletedTask);

    // Save the updated lists
    saveArchivedTasks(); // Save archived tasks to the server
    saveTasks(); // Save active/inactive tasks to the server

    // Re-render the tasks
    renderTasks();
    renderArchivedTasks();
}

// Initial Render on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    await loadTasks();
    updateStateIndicators();
    updateSpreeLengthIndicator();
    if (playState === "play") {
        startTimer();
    } else {
        initializeTimer();
    }
});