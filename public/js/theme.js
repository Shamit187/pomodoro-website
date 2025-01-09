    // ** Theme logic **
    // Select the root element and button
    const root = document.documentElement;
    const themeToggleButton = document.getElementById("theme-toggle");

    // Functions to set themes
    function setLightMode() {
        root.style.setProperty("--background-color", "#ebeaea");
        root.style.setProperty("--primary-color", "#353535");
        root.style.setProperty("--accent-color", "#fe7325");
        root.style.setProperty("--shadow-light", "7px 7px 14px #bebebe");
        root.style.setProperty("--shadow-dark", "-7px -7px 14px #ffffff");
    }

    function setDarkMode() {
        root.style.setProperty("--background-color", "#353535");
        root.style.setProperty("--primary-color", "#ebeaea");
        root.style.setProperty("--accent-color", "#25b0fe");
        root.style.setProperty("--shadow-light", "7px 7px 14px #2c2c2c");
        root.style.setProperty("--shadow-dark", "-7px -7px 14px #424242");
    }

    // Toggle between themes
    function toggleTheme() {
        const currentBackground = getComputedStyle(root).getPropertyValue("--background-color").trim();
        if (currentBackground === "#ebeaea") {
            setDarkMode();
        } else {
            setLightMode();
        }
    
        // Dispatch a custom event to notify the chart logic
        const themeChangeEvent = new CustomEvent("themeChange");
        document.dispatchEvent(themeChangeEvent);
    }

    // Set default theme on page load
    setLightMode(); // Change to setDarkMode() if you prefer dark mode as the default

    // Attach the click event listener
    themeToggleButton.addEventListener("click", toggleTheme);