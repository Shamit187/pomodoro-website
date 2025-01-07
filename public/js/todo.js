// // Task List
// let tasks = [
//     { tag: "Software Engineering", topic: "Write Introduction Section", minute: 70, active: true },
//     { tag: "Research", topic: "Review Literature", minute: 50, active: false },
//     { tag: "Software Engineering", topic: "Write Abstract", minute: 30, active: false },
//     { tag: "Data Analysis", topic: "Clean Dataset", minute: 40, active: false },
//     { tag: "System Design", topic: "Draft Architecture Diagram", minute: 90, active: false },
//     { tag: "Research", topic: "Analyze Survey Results", minute: 45, active: false },
//     { tag: "Software Engineering", topic: "Debug API Integration", minute: 60, active: false },
//     { tag: "Research", topic: "Write Methodology Section", minute: 80, active: false },
//     { tag: "Data Analysis", topic: "Generate Visualizations", minute: 35, active: false },
//     { tag: "System Design", topic: "Evaluate Load Balancer Options", minute: 55, active: false }
// ];

// // DOM Elements
// const activeTaskContainer = document.getElementById("active-task");
// const taskListContainer = document.getElementById("task-list");

// // Render Tasks
// function renderTasks() {
//     // Clear existing tasks
//     activeTaskContainer.innerHTML = "";
//     taskListContainer.innerHTML = "";

//     // Render Active Task
//     const activeTask = tasks.find((task) => task.active);
//     if (activeTask) {
//         activeTaskContainer.innerHTML = `
//             <div class="flex justify-between items-center w-full">
//                 <div>
//                     <p class="text-sm">${activeTask.tag}</p>
//                     <p class="text-xl font-bold">${activeTask.topic}</p>
//                     <p class="text-sm">${activeTask.minute} minutes</p>
//                 </div>
//                 <div class="task-buttons">
//                     <button class="neumorphic-button edit-button">✏️</button>
//                     <button class="neumorphic-button delete-button">❌</button>
//                 </div>
//             </div>
//         `;
//     }

//     // Render Inactive Tasks
//     tasks.forEach((task, index) => {
//         if (!task.active) {
//             const taskElement = document.createElement("div");
//             taskElement.className = "task-item";
//             taskElement.innerHTML = `
//                 <div class="flex justify-between items-center w-full">
//                     <div>
//                         <p class="text-sm">${task.tag}</p>
//                         <p class="text-lg font-semibold">${task.topic}</p>
//                         <p class="text-sm">${task.minute} minutes</p>
//                     </div>
//                     <div class="task-buttons">
//                         <button class="neumorphic-button up-button">🔼</button>
//                         <button class="neumorphic-button down-button">🔽</button>
//                         <button class="neumorphic-button edit-button">✏️</button>
//                         <button class="neumorphic-button delete-button">❌</button>
//                     </div>
//                 </div>
//             `;

//             // Add event listeners for up and down buttons
//             const upButton = taskElement.querySelector(".up-button");
//             const downButton = taskElement.querySelector(".down-button");

//             upButton.addEventListener("click", (e) => {
//                 e.stopPropagation(); // Prevent triggering task click
//                 moveTaskUp(index);
//             });

//             downButton.addEventListener("click", (e) => {
//                 e.stopPropagation(); // Prevent triggering task click
//                 moveTaskDown(index);
//             });

//             // Add event listener for task click to make it active
//             taskElement.addEventListener("click", () => handleTaskClick(index));

//             taskListContainer.appendChild(taskElement);
//         }
//     }); 
// }


// // Move Task Up
// function moveTaskUp(index) {
//     if (index > 0 && !tasks[index].active) {
//         // Swap current task with the one above
//         const temp = tasks[index];
//         tasks[index] = tasks[index - 1];
//         tasks[index - 1] = temp;
//         renderTasks(); // Re-render tasks
//     }
// }

// // Move Task Down
// function moveTaskDown(index) {
//     if (index < tasks.length - 1 && !tasks[index].active) {
//         // Swap current task with the one below
//         const temp = tasks[index];
//         tasks[index] = tasks[index + 1];
//         tasks[index + 1] = temp;
//         renderTasks(); // Re-render tasks
//     }
// }


// // Handle Task Click
// function handleTaskClick(index) {
//     const currentActiveIndex = tasks.findIndex((task) => task.active);

//     if (currentActiveIndex !== -1) {
//         // Set the current active task to inactive
//         const [recentlyInactivatedTask] = tasks.splice(currentActiveIndex, 1); // Remove current active task
//         recentlyInactivatedTask.active = false; // Mark it as inactive

//         // Add it to the top of the tasks array
//         tasks.unshift(recentlyInactivatedTask);
//     }

//     // Mark the clicked task as active
//     const [newActiveTask] = tasks.splice(index, 1); // Remove clicked task
//     newActiveTask.active = true; // Mark it as active

//     // Add it to the beginning of the array
//     tasks.unshift(newActiveTask);

//     // Re-render the tasks
//     renderTasks();
// }

// // Initial Render on Page Load
// document.addEventListener("DOMContentLoaded", () => {
//     renderTasks();
// });