/**
 * Modern Market Tracker - displays prices for Bitcoin, Gold and Silver
 */

document.addEventListener('DOMContentLoaded', () => {
    // API keys
    const FINNHUB_API_KEY = 'ctvukbpr01ql96gpfktgctvukbpr01ql96gpfku0';
    const GOLD_API_KEY = 'goldapi-vhj1419mad0eroz-io';
    
    // Define timeframes
    const timeframes = {
        realtime: { label: 'Live', interval: '1m', dataPoints: 20 },
        daily: { label: '1D', interval: '1d', dataPoints: 24 },
        weekly: { label: '1W', interval: '1w', dataPoints: 7 },
        monthly: { label: '1M', interval: '1m', dataPoints: 30 },
        yearly: { label: '1Y', interval: '1d', dataPoints: 365 },
        fiveYear: { label: '5Y', interval: '1w', dataPoints: 260 }
    };
    
    // Asset symbols and configurations
    const assets = {
        bitcoin: { 
            symbol: 'BINANCE:BTCUSDT', 
            type: 'crypto',
            refreshInterval: 120000, // 2 minutes
            lastUpdate: 0,
            historicalData: {},
            currentTimeframe: 'realtime'
        },
        gold: { 
            symbol: 'XAU', 
            type: 'metal',
            refreshInterval: 300000, // 5 minutes
            lastUpdate: 0,
            historicalData: {},
            currentTimeframe: 'realtime'
        },
        silver: { 
            symbol: 'XAG', 
            type: 'metal',
            refreshInterval: 300000, // 5 minutes
            lastUpdate: 0,
            historicalData: {},
            currentTimeframe: 'realtime'
        }
    };
    
    // Initialize charts data
    let miniCharts = {};
    
    // Set up interactive features
    setupInteractiveFeatures();
    
    // Update all assets initially
    updateAssetPrices();
    
    // Set up the main update loop
    setInterval(() => {
        const now = Date.now();
        
        // Check each asset to see if it needs updating
        Object.keys(assets).forEach(assetId => {
            const asset = assets[assetId];
            if (now - asset.lastUpdate >= asset.refreshInterval) {
                fetchAssetPrice(assetId, asset);
                asset.lastUpdate = now;
            }
        });
        
        // Update countdown timers
        updateRefreshCountdowns();
    }, 1000);
    
    // Setup interactive features for the market tracker
    function setupInteractiveFeatures() {
        const marketItems = document.querySelectorAll('.market-item');
        
        marketItems.forEach(item => {
            const assetId = item.id;
            
            // Add hover sound effect
            item.addEventListener('mouseenter', () => {
                playSound('hover');
            });
            
            // Add click to expand with details
            item.addEventListener('click', () => {
                playSound('select');
                toggleAssetDetails(assetId);
                
                // Fetch historical data when expanded if not already fetched
                if (item.classList.contains('expanded')) {
                    const asset = assets[assetId];
                    if (!asset.historicalData[asset.currentTimeframe] ||
                        asset.historicalData[asset.currentTimeframe].length === 0) {
                        fetchHistoricalData(assetId, asset.currentTimeframe);
                    }
                }
            });
            
            // Create a mini chart container for each asset with timeframe tabs
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'asset-expanded-details';
            
            // Create timeframe tabs
            let timeframeTabs = '<div class="timeframe-tabs">';
            Object.keys(timeframes).forEach(timeframeKey => {
                const isActive = timeframeKey === 'realtime' ? 'active' : '';
                timeframeTabs += `<div class="timeframe-tab ${isActive}" data-timeframe="${timeframeKey}">${timeframes[timeframeKey].label}</div>`;
            });
            timeframeTabs += '</div>';
            
            detailsContainer.innerHTML = `
                ${timeframeTabs}
                <div class="asset-chart-container">
                    <canvas id="${assetId}-chart" width="300" height="150"></canvas>
                </div>
                <div class="asset-meta">
                    <div class="asset-refresh-countdown">
                        <div class="countdown-label">Refreshing in</div>
                        <div class="countdown-timer" id="${assetId}-countdown">--</div>
                    </div>
                    <div class="asset-last-updated">
                        <div class="update-label">Last updated</div>
                        <div class="update-time" id="${assetId}-update-time">--</div>
                    </div>
                </div>
            `;
            
            item.appendChild(detailsContainer);
            
            // Initialize the mini chart
            initializeChart(assetId);
            
            // Add click event for timeframe tabs
            const tabs = detailsContainer.querySelectorAll('.timeframe-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent closing the expanded view
                    
                    // Update active tab
                    detailsContainer.querySelectorAll('.timeframe-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    tab.classList.add('active');
                    
                    // Get selected timeframe
                    const timeframe = tab.dataset.timeframe;
                    const asset = assets[assetId];
                    
                    // Update current timeframe
                    asset.currentTimeframe = timeframe;
                    
                    // Check if we need to fetch data for this timeframe
                    if (!asset.historicalData[timeframe] || asset.historicalData[timeframe].length === 0) {
                        fetchHistoricalData(assetId, timeframe);
                    } else {
                        // Update chart with existing data
                        updateChart(assetId, asset.historicalData[timeframe]);
                    }
                });
            });
        });
    }
    
    // Initialize chart
    function initializeChart(assetId) {
        const ctx = document.getElementById(`${assetId}-chart`).getContext('2d');
        miniCharts[assetId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: assetId.charAt(0).toUpperCase() + assetId.slice(1),
                    data: [],
                    borderColor: getAssetColor(assetId),
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    backgroundColor: createGradient(ctx, getAssetColor(assetId)),
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
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 10, 30, 0.8)',
                        borderColor: getAssetColor(assetId),
                        borderWidth: 1,
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false,
                        beginAtZero: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }
    
    // Create gradient for chart background
    function createGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        const rgbaColor = hexToRgba(color, 0.5);
        gradient.addColorStop(0, rgbaColor);
        gradient.addColorStop(1, 'rgba(0, 10, 30, 0)');
        return gradient;
    }
    
    // Convert hex color to rgba
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Get asset-specific color
    function getAssetColor(assetId) {
        const colors = {
            bitcoin: '#FF9900',
            gold: '#FFD700',
            silver: '#C0C0C0'
        };
        return colors[assetId] || '#3498db';
    }
    
    // Toggle expanded details view for an asset
    function toggleAssetDetails(assetId) {
        const item = document.getElementById(assetId);
        const allItems = document.querySelectorAll('.market-item');
        
        // Close other expanded items
        allItems.forEach(otherItem => {
            if (otherItem.id !== assetId && otherItem.classList.contains('expanded')) {
                otherItem.classList.remove('expanded');
            }
        });
        
        // Toggle current item
        item.classList.toggle('expanded');
        
        // Resize chart if expanded
        if (item.classList.contains('expanded')) {
            setTimeout(() => {
                if (miniCharts[assetId]) {
                    miniCharts[assetId].resize();
                }
            }, 300);
        }
    }
    
    // Update all assets
    function updateAssetPrices() {
        Object.keys(assets).forEach(assetId => {
            fetchAssetPrice(assetId, assets[assetId]);
            assets[assetId].lastUpdate = Date.now();
        });
    }
    
    // Update countdown timers
    function updateRefreshCountdowns() {
        Object.keys(assets).forEach(assetId => {
            const asset = assets[assetId];
            const now = Date.now();
            const timeLeft = Math.max(0, asset.refreshInterval - (now - asset.lastUpdate));
            const seconds = Math.ceil(timeLeft / 1000);
            
            const countdownElement = document.getElementById(`${assetId}-countdown`);
            if (countdownElement) {
                countdownElement.textContent = `${seconds}s`;
                
                // Add pulsing effect when close to refresh
                if (seconds <= 5) {
                    countdownElement.classList.add('pulse');
                } else {
                    countdownElement.classList.remove('pulse');
                }
            }
            
            const updateTimeElement = document.getElementById(`${assetId}-update-time`);
            if (updateTimeElement) {
                const date = new Date(asset.lastUpdate);
                updateTimeElement.textContent = date.toLocaleTimeString();
            }
        });
    }
    
    // Fetch price for a specific asset
    function fetchAssetPrice(assetId, asset) {
        const assetElement = document.getElementById(assetId);
        if (!assetElement) return;
        
        const priceElement = assetElement.querySelector('.asset-price');
        const changeElement = assetElement.querySelector('.asset-change');
        
        // Add loading indicator
        assetElement.classList.add('loading');
        
        // Different API endpoints based on asset type
        let fetchPromise;
        
        if (asset.type === 'crypto') {
            const url = `https://finnhub.io/api/v1/quote?symbol=${asset.symbol}&token=${FINNHUB_API_KEY}`;
            fetchPromise = fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => updateCryptoUI(assetId, priceElement, changeElement, data));
        } 
        else if (asset.type === 'metal') {
            const url = `https://www.goldapi.io/api/${asset.symbol}/USD`;
            fetchPromise = fetch(url, {
                headers: {
                    'x-access-token': GOLD_API_KEY,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => updateMetalUI(assetId, priceElement, changeElement, data));
        }
        
        // Handle the fetch promise
        fetchPromise
            .catch(error => {
                console.error(`Error fetching ${assetId} data:`, error);
                priceElement.textContent = 'Data Unavailable';
                priceElement.classList.add('error');
                changeElement.textContent = '--';
                changeElement.classList.remove('positive', 'negative');
            })
            .finally(() => {
                // Remove loading indicator
                assetElement.classList.remove('loading');
                assetElement.classList.add('updated');
                setTimeout(() => {
                    assetElement.classList.remove('updated');
                }, 1000);
            });
    }
    
    // Fetch historical data for a specific timeframe
    function fetchHistoricalData(assetId, timeframeKey) {
        const asset = assets[assetId];
        const assetElement = document.getElementById(assetId);
        
        if (!assetElement) return;
        
        // Add loading indicator to chart
        assetElement.querySelector('.asset-chart-container').classList.add('loading');
        
        // If this is the realtime timeframe, we handle it differently
        if (timeframeKey === 'realtime') {
            if (!asset.historicalData.realtime) {
                asset.historicalData.realtime = [];
            }
            assetElement.querySelector('.asset-chart-container').classList.remove('loading');
            return;
        }
        
        // Different API endpoints and handling based on asset type and timeframe
        let fetchPromise;
        
        if (asset.type === 'crypto') {
            // Calculate time parameters based on timeframe
            const to = Math.floor(Date.now() / 1000);
            let from;
            let resolution;
            
            switch (timeframeKey) {
                case 'daily':
                    from = to - (24 * 60 * 60); // Last 24 hours
                    resolution = '15'; // 15 minute candles
                    break;
                case 'weekly':
                    from = to - (7 * 24 * 60 * 60); // Last 7 days
                    resolution = '60'; // 1 hour candles
                    break;
                case 'monthly':
                    from = to - (30 * 24 * 60 * 60); // Last 30 days
                    resolution = 'D'; // Daily candles
                    break;
                case 'yearly':
                    from = to - (365 * 24 * 60 * 60); // Last year
                    resolution = 'W'; // Weekly candles
                    break;
                case 'fiveYear':
                    from = to - (5 * 365 * 24 * 60 * 60); // Last 5 years
                    resolution = 'M'; // Monthly candles
                    break;
                default:
                    from = to - (24 * 60 * 60);
                    resolution = '15';
            }
            
            // Format symbol properly for Finnhub candles API
            const formattedSymbol = asset.symbol.replace('BINANCE:', '');
            
            const url = `https://finnhub.io/api/v1/crypto/candle?symbol=${formattedSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
            
            fetchPromise = fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.s === 'ok' && data.c && data.t) {
                        // Process candle data
                        const historicalData = [];
                        for (let i = 0; i < data.t.length; i++) {
                            const timestamp = new Date(data.t[i] * 1000);
                            // Format the time label based on timeframe
                            let timeLabel;
                            switch (timeframeKey) {
                                case 'daily':
                                    timeLabel = timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                                    break;
                                case 'weekly':
                                case 'monthly':
                                    timeLabel = timestamp.toLocaleDateString([], {month: 'short', day: 'numeric'});
                                    break;
                                case 'yearly':
                                case 'fiveYear':
                                    timeLabel = timestamp.toLocaleDateString([], {month: 'short', year: '2-digit'});
                                    break;
                                default:
                                    timeLabel = timestamp.toLocaleDateString();
                            }
                            
                            historicalData.push({
                                time: timeLabel,
                                price: data.c[i]
                            });
                        }
                        
                        // Store and display the data
                        asset.historicalData[timeframeKey] = historicalData;
                        updateChart(assetId, historicalData);
                    } else {
                        throw new Error('Invalid data format');
                    }
                });
        } else if (asset.type === 'metal') {
            // For precious metals, we'll simulate historical data since many APIs require premium subscriptions
            // In a production environment, you would subscribe to a proper financial API service
            const simulatedData = simulateHistoricalData(assetId, timeframeKey);
            asset.historicalData[timeframeKey] = simulatedData;
            updateChart(assetId, simulatedData);
            fetchPromise = Promise.resolve();
        }
        
        fetchPromise
            .catch(error => {
                console.error(`Error fetching historical data for ${assetId}:`, error);
                // Create empty dataset to avoid repeated failed requests
                asset.historicalData[timeframeKey] = [];
            })
            .finally(() => {
                // Remove loading indicator
                assetElement.querySelector('.asset-chart-container').classList.remove('loading');
            });
    }
    
    // Simulate historical data for metals (when real API isn't available)
    function simulateHistoricalData(assetId, timeframeKey) {
        // Get current price as base
        const assetElement = document.getElementById(assetId);
        let basePrice = 0;
        if (assetElement) {
            const priceText = assetElement.querySelector('.asset-price').textContent;
            basePrice = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;
        }
        
        if (basePrice === 0) {
            // Fallback values if current price is not available
            if (assetId === 'gold') basePrice = 2000;
            else if (assetId === 'silver') basePrice = 25;
            else basePrice = 100;
        }
        
        // Determine number of data points and volatility based on timeframe
        let dataPoints;
        let volatility;
        let dateFormat;
        
        switch (timeframeKey) {
            case 'daily':
                dataPoints = 24;
                volatility = 0.005;
                dateFormat = 'time';
                break;
            case 'weekly':
                dataPoints = 7;
                volatility = 0.01;
                dateFormat = 'day';
                break;
            case 'monthly':
                dataPoints = 30;
                volatility = 0.03;
                dateFormat = 'day';
                break;
            case 'yearly':
                dataPoints = 12;
                volatility = 0.05;
                dateFormat = 'month';
                break;
            case 'fiveYear':
                dataPoints = 5 * 12;
                volatility = 0.1;
                dateFormat = 'month-year';
                break;
            default:
                dataPoints = 24;
                volatility = 0.005;
                dateFormat = 'time';
        }
        
        // Generate simulated data
        const now = new Date();
        const historicalData = [];
        
        // Use a sine wave with random noise for more realistic looking data
        for (let i = dataPoints - 1; i >= 0; i--) {
            const date = new Date();
            let timeLabel;
            
            // Set appropriate date/time for data point
            switch (timeframeKey) {
                case 'daily':
                    date.setHours(now.getHours() - i);
                    timeLabel = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                    break;
                case 'weekly':
                    date.setDate(now.getDate() - i);
                    timeLabel = date.toLocaleDateString([], {weekday: 'short'});
                    break;
                case 'monthly':
                    date.setDate(now.getDate() - i);
                    timeLabel = date.toLocaleDateString([], {month: 'short', day: 'numeric'});
                    break;
                case 'yearly':
                    date.setMonth(now.getMonth() - i);
                    timeLabel = date.toLocaleDateString([], {month: 'short'});
                    break;
                case 'fiveYear':
                    date.setMonth(now.getMonth() - i);
                    timeLabel = date.toLocaleDateString([], {month: 'short', year: '2-digit'});
                    break;
            }
            
            // Generate a price with some randomness and trend
            const trend = Math.sin(i / dataPoints * Math.PI * 2) * volatility * basePrice;
            const noise = (Math.random() - 0.5) * volatility * basePrice;
            let price = basePrice + trend + noise;
            
            // Ensure price is always positive
            price = Math.max(price, basePrice * 0.5);
            
            historicalData.push({
                time: timeLabel,
                price: price
            });
        }
        
        return historicalData;
    }
    
    // Update UI for crypto assets
    function updateCryptoUI(assetId, priceElement, changeElement, data) {
        if (!data || typeof data.c === 'undefined') return;
        
        const currentPrice = data.c;
        const previousClose = data.pc;
        const priceChange = currentPrice - previousClose;
        const percentChange = (priceChange / previousClose) * 100;
        
        // Format the price with appropriate commas and decimals
        priceElement.textContent = `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Update change information and add appropriate class
        updateChangeElement(changeElement, priceChange, percentChange);
        
        // Add the new data point to historical data
        updateRealtimeData(assetId, currentPrice);
    }
    
    // Update UI for metal assets (gold, silver)
    function updateMetalUI(assetId, priceElement, changeElement, data) {
        if (!data || typeof data.price === 'undefined') return;
        
        const currentPrice = data.price;
        const priceChange = data.ch || 0;
        const percentChange = data.chp || 0;
        
        // Format the price
        priceElement.textContent = `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Update change information
        updateChangeElement(changeElement, priceChange, percentChange);
        
        // Add the new data point to historical data
        updateRealtimeData(assetId, currentPrice);
    }
    
    // Update the change element with appropriate styling
    function updateChangeElement(element, change, percentChange) {
        if (!change || change === 0) {
            element.textContent = 'No Change';
            element.classList.remove('positive', 'negative');
        } else {
            const sign = change > 0 ? '+' : '';
            element.textContent = `${sign}${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${percentChange.toFixed(2)}%)`;
            
            if (change > 0) {
                element.classList.add('positive');
                element.classList.remove('negative');
            } else {
                element.classList.add('negative');
                element.classList.remove('positive');
            }
        }
    }
    
    // Update realtime historical data
    function updateRealtimeData(assetId, price) {
        const asset = assets[assetId];
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Initialize realtime data array if needed
        if (!asset.historicalData.realtime) {
            asset.historicalData.realtime = [];
        }
        
        // Add new data point
        asset.historicalData.realtime.push({
            time: timeString,
            price: price
        });
        
        // Keep only last 20 data points for realtime
        if (asset.historicalData.realtime.length > 20) {
            asset.historicalData.realtime.shift();
        }
        
        // Update the chart if this is the active timeframe
        if (asset.currentTimeframe === 'realtime') {
            updateChart(assetId, asset.historicalData.realtime);
        }
    }
    
    // Update chart for an asset
    function updateChart(assetId, historicalData) {
        const chart = miniCharts[assetId];
        
        if (!chart || !historicalData || historicalData.length === 0) return;
        
        // Update chart data
        chart.data.labels = historicalData.map(d => d.time);
        chart.data.datasets[0].data = historicalData.map(d => d.price);
        
        // Update chart
        chart.update();
    }
    
    // Play sound effects
    function playSound(type) {
        // Create an AudioContext (this must be done in response to user interaction)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set sound properties based on type
        if (type === 'hover') {
            oscillator.type = 'sine';
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.05;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'select') {
            oscillator.type = 'sine';
            oscillator.frequency.value = 660;
            gainNode.gain.value = 0.1;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }
}); 