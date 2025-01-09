let progressChart = null;

async function fetchProgressData() {
    try {
        console.log("Fetching progress data...");
        const response = await fetch('/api/progress');
        if (!response.ok) {
            throw new Error('Failed to fetch progress data');
        }

        const { labels, dailyHours } = await response.json();
        console.log("Fetched Labels:", labels);
        console.log("Fetched Daily Hours:", dailyHours);

        createProgressChart(labels, dailyHours);
    } catch (error) {
        console.error("Error fetching progress data:", error);
    }
}

function createProgressChart(labels, dailyHours) {
    const root = getComputedStyle(document.documentElement);
    const backgroundColor = root.getPropertyValue("--background-color").trim();
    const primaryColor = root.getPropertyValue("--primary-color").trim();
    const accentColor = root.getPropertyValue("--accent-color").trim();

    console.log("Theme colors:", { backgroundColor, primaryColor, accentColor });

    const ctx = document.getElementById("dailyProgressChart").getContext("2d");

    // Destroy the previous chart instance if it exists
    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Hours Worked",
                    data: dailyHours,
                    backgroundColor: accentColor, // Bar color
                    borderWidth: 0, // Remove borders
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: primaryColor, // Use primary color for legend text
                        font: {
                            family: "'Nunito Sans', sans-serif", // Use Nunito Sans
                            size: 14,
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        display: false, // Remove x-axis labels
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.2)", // Grid lines with 20% opacity
                    },
                },
                y: {
                    ticks: {
                        color: primaryColor, // Use primary color for y-axis labels
                        font: {
                            family: "'Nunito Sans', sans-serif", // Use Nunito Sans
                            size: 12,
                        },
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.2)", // Grid lines with 20% opacity
                    },
                },
            },
        },
    });
}


// Listen for the themeChange event
document.addEventListener("themeChange", () => {
    console.log("Theme changed, updating chart...");
    if (progressChart) {
        progressChart.destroy(); // Destroy the old chart
    }
    fetchProgressData(); // Recreate the chart with the new theme
});

// Fetch and render the chart on page load
document.addEventListener("DOMContentLoaded", fetchProgressData);
