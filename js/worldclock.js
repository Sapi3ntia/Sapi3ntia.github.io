/**
 * World Clock and Antarctica Weather Station
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize world clock
    initWorldClock();
    
    // Initialize Antarctica weather
    initAntarcticaWeather();
});

/**
 * World Clock Implementation
 */
function initWorldClock() {
    const clockItems = document.querySelectorAll('.clock-item');
    
    // Update all clocks immediately
    updateAllClocks();
    
    // Then update every second
    setInterval(updateAllClocks, 1000);
    
    function updateAllClocks() {
        const now = new Date();
        
        clockItems.forEach(clockItem => {
            const timezone = clockItem.getAttribute('data-timezone');
            const timeDisplay = clockItem.querySelector('.digital-time');
            
            let formattedTime;
            try {
                // Format the time based on the timezone
                formattedTime = formatTimeForTimezone(now, timezone);
            } catch (e) {
                console.error(`Error formatting time for ${timezone}:`, e);
                formattedTime = "ERROR";
            }
            
            // Update the displayed time
            timeDisplay.textContent = formattedTime;
            
            // Add neon flicker effect occasionally
            if (Math.random() < 0.01) { // 1% chance per update
                timeDisplay.classList.add('flicker');
                setTimeout(() => {
                    timeDisplay.classList.remove('flicker');
                }, 200);
            }
        });
    }
    
    function formatTimeForTimezone(date, timezone) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone
        };
        
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
}

/**
 * Antarctica Weather Implementation
 */
function initAntarcticaWeather() {
    // API URL for Princess Elizabeth Station in Antarctica
    const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-71.9499&longitude=23.3478&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_speed_80m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_180m,vapour_pressure_deficit';
    
    // Fetch weather data
    fetchWeatherData();
    
    // Then update every 30 minutes (1,800,000 ms)
    setInterval(fetchWeatherData, 1800000);
    
    function fetchWeatherData() {
        // Show loading state
        document.getElementById('update-time').textContent = 'Loading...';
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                updateWeatherDisplay(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                document.getElementById('update-time').textContent = 'Using offline data';
                // Use sample data if API fails
                useSampleData();
            });
    }
    
    // Fallback to sample data if API fails
    function useSampleData() {
        const sampleData = {
            hourly: {
                time: generateTimeArray(),
                temperature_2m: generateTemperatureArray(-15, -20, 24),
                apparent_temperature: generateTemperatureArray(-22, -28, 24),
                relative_humidity_2m: generateRandomArray(60, 80, 24),
                wind_speed_10m: generateRandomArray(15, 30, 24),
                wind_direction_10m: generateRandomArray(0, 359, 24),
                cloud_cover: generateRandomArray(20, 90, 24),
                pressure_msl: generateRandomArray(980, 1020, 24)
            }
        };
        
        updateWeatherDisplay(sampleData);
    }
    
    // Helper functions to generate sample data
    function generateTimeArray() {
        const times = [];
        const now = new Date();
        
        for (let i = -12; i <= 12; i++) {
            const time = new Date(now);
            time.setHours(time.getHours() + i);
            times.push(time.toISOString());
        }
        
        return times;
    }
    
    function generateTemperatureArray(min, max, count) {
        const temps = [];
        
        for (let i = 0; i < count; i++) {
            // Create a slightly wavy pattern
            const wave = Math.sin(i / 4) * 2;
            temps.push(min + wave + Math.random() * (max - min) / 4);
        }
        
        return temps;
    }
    
    function generateRandomArray(min, max, count) {
        return Array.from({ length: count }, () => min + Math.random() * (max - min));
    }
    
    function updateWeatherDisplay(data) {
        // Get current time
        const now = new Date();
        
        // Find the index of the nearest hour in the forecast data
        const currentHourUTC = now.getUTCHours();
        const timeArray = data.hourly.time;
        let currentIndex = 0;
        
        // Find the right time index
        for (let i = 0; i < timeArray.length; i++) {
            const forecastTime = new Date(timeArray[i]);
            if (forecastTime > now) {
                currentIndex = Math.max(0, i - 1);
                break;
            }
        }
        
        // Get current weather values
        const currentTemp = data.hourly.temperature_2m[currentIndex];
        const feelsLike = data.hourly.apparent_temperature[currentIndex];
        const humidity = data.hourly.relative_humidity_2m[currentIndex];
        const windSpeed = data.hourly.wind_speed_10m[currentIndex];
        const windDirection = data.hourly.wind_direction_10m[currentIndex];
        const cloudCover = data.hourly.cloud_cover[currentIndex];
        const pressure = data.hourly.pressure_msl[currentIndex];
        
        // Update DOM elements with current values
        document.getElementById('current-temp').textContent = currentTemp.toFixed(1);
        document.getElementById('feels-like').textContent = feelsLike.toFixed(1);
        document.getElementById('humidity').textContent = humidity;
        document.getElementById('current-wind').textContent = windSpeed;
        document.getElementById('current-wind-dir').textContent = windDirection;
        document.getElementById('cloud-cover').textContent = cloudCover;
        document.getElementById('pressure').textContent = pressure;
        
        // Update last refreshed time
        document.getElementById('update-time').textContent = now.toLocaleTimeString();
        
        // Create temperature chart
        createTemperatureChart(data, currentIndex);
    }
    
    function createTemperatureChart(data, currentIndex) {
        const ctx = document.getElementById('temp-chart').getContext('2d');
        
        // Get 24-hour forecast data (12 hours before and 12 hours after current time)
        const startIndex = Math.max(0, currentIndex - 12);
        const endIndex = Math.min(data.hourly.time.length - 1, currentIndex + 12);
        
        const times = data.hourly.time.slice(startIndex, endIndex + 1).map(time => {
            const date = new Date(time);
            return `${date.getUTCHours()}:00`;
        });
        
        const temperatures = data.hourly.temperature_2m.slice(startIndex, endIndex + 1);
        
        // Destroy existing chart if it exists
        if (window.temperatureChart) {
            window.temperatureChart.destroy();
        }
        
        // Create new chart
        window.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#00ffff',
                    pointBorderColor: '#00ffff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 30, 0.8)',
                        borderColor: '#00ffff',
                        borderWidth: 1,
                        titleFont: {
                            family: "'Press Start 2P', cursive",
                            size: 10
                        },
                        bodyFont: {
                            family: "'Press Start 2P', cursive",
                            size: 10
                        },
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                family: "'Press Start 2P', cursive",
                                size: 8
                            },
                            maxRotation: 0,
                            callback: function(value, index, values) {
                                // Only show every 4th hour to avoid overcrowding
                                return index % 4 === 0 ? this.getLabelForValue(value) : '';
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                family: "'Press Start 2P', cursive",
                                size: 8
                            }
                        }
                    }
                }
            }
        });
    }
}

// Add additional code at the end of the file to handle weather data with UV index

// Sample UV data for when API fails
const sampleUvData = {
    current: 3.2,
    forecast: [
        { time: '00:00', value: 0 },
        { time: '03:00', value: 0 },
        { time: '06:00', value: 1.2 },
        { time: '09:00', value: 4.5 },
        { time: '12:00', value: 6.8 },
        { time: '15:00', value: 5.3 },
        { time: '18:00', value: 2.1 },
        { time: '21:00', value: 0 }
    ]
};

// Sample wind data for when API fails
const sampleWindData = {
    forecast: [
        { time: '00:00', speed: 15, direction: 180 },
        { time: '03:00', speed: 18, direction: 190 },
        { time: '06:00', speed: 22, direction: 200 },
        { time: '09:00', speed: 25, direction: 210 },
        { time: '12:00', speed: 20, direction: 200 },
        { time: '15:00', speed: 18, direction: 190 },
        { time: '18:00', speed: 15, direction: 180 },
        { time: '21:00', speed: 12, direction: 170 }
    ]
};

// Sample visibility data
const sampleVisibility = 8.5; // km

// Function to update UV index display
function updateUvIndex(uvIndex) {
    const uvElement = document.getElementById('uv-index');
    if (!uvElement) return;
    
    // Update text value
    uvElement.textContent = uvIndex.toFixed(1);
    
    // Update position of the indicator bar
    const uvBar = document.querySelector('.uv-bar');
    if (uvBar) {
        // Calculate position (0-11 scale)
        const position = Math.min(uvIndex / 11 * 100, 100);
        uvBar.style.left = `${position}%`;
        
        // Set color based on UV index
        let color;
        if (uvIndex < 3) {
            color = '#00ff00'; // Low
        } else if (uvIndex < 6) {
            color = '#ffff00'; // Moderate
        } else if (uvIndex < 8) {
            color = '#ffaa00'; // High
        } else if (uvIndex < 11) {
            color = '#ff5500'; // Very High
        } else {
            color = '#ff0000'; // Extreme
        }
        
        uvBar.style.backgroundColor = color;
        uvBar.style.boxShadow = `0 0 5px ${color}`;
    }
}

// Function to update visibility
function updateVisibility(visibility) {
    const visibilityElement = document.getElementById('visibility');
    if (visibilityElement) {
        visibilityElement.textContent = visibility.toFixed(1);
    }
}

// Create the UV chart
function createUvChart(data) {
    const ctx = document.getElementById('uv-chart');
    if (!ctx) return;
    
    // Extract data for chart
    const times = data.forecast.map(item => item.time);
    const values = data.forecast.map(item => item.value);
    
    // Create gradient
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0.8)');
    
    // Destroy existing chart if it exists
    if (window.uvChart) {
        window.uvChart.destroy();
    }
    
    // Create new chart
    window.uvChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'UV Index',
                data: values,
                borderColor: '#ff00ff',
                backgroundColor: 'rgba(255, 0, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#ff00ff',
                pointBorderColor: '#ffffff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 12,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(0, 255, 0, 0.7)',
                        font: {
                            family: '"Press Start 2P", cursive',
                            size: 8
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(0, 255, 0, 0.7)',
                        font: {
                            family: '"Press Start 2P", cursive',
                            size: 8
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Create the wind chart
function createWindChart(data) {
    const ctx = document.getElementById('wind-chart');
    if (!ctx) return;
    
    // Extract data for chart
    const times = data.forecast.map(item => item.time);
    const speeds = data.forecast.map(item => item.speed);
    
    // Destroy existing chart if it exists
    if (window.windChart) {
        window.windChart.destroy();
    }
    
    // Create new chart
    window.windChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Wind Speed (km/h)',
                data: speeds,
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#00ffff',
                pointBorderColor: '#ffffff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(0, 255, 255, 0.7)',
                        font: {
                            family: '"Press Start 2P", cursive',
                            size: 8
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(0, 255, 255, 0.7)',
                        font: {
                            family: '"Press Start 2P", cursive',
                            size: 8
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Setup chart tab switching
function setupChartTabs() {
    const chartTabs = document.querySelectorAll('.chart-tab');
    if (!chartTabs.length) return;
    
    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and containers
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.chart-container').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show selected chart
            const chartType = tab.getAttribute('data-chart');
            document.getElementById(`${chartType}-chart`).classList.add('active');
        });
    });
}

// Update weather with UV index
document.addEventListener('DOMContentLoaded', function() {
    // Existing clock initialization code will run first
    
    // Then setup the UV index and additional charts
    setTimeout(() => {
        // Update UV index display
        updateUvIndex(sampleUvData.current);
        
        // Update visibility
        updateVisibility(sampleVisibility);
        
        // Create UV chart
        createUvChart(sampleUvData);
        
        // Create wind chart
        createWindChart(sampleWindData);
        
        // Setup chart tabs
        setupChartTabs();
    }, 1000); // Small delay to ensure other elements are initialized
}); 