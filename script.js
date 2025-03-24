let itemsData = []; // This will hold the items from the JSON
let activeFilters = {
  acts: new Set(),
  locations: new Set(),
  zones: new Set()
};

// Function to fetch and load the JSON data from the file
async function loadItemsData() {
  const response = await fetch('data.json', {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  itemsData = data; // Set the global variable
  await initializePage();
  return data; // Return the data
}

// Extracting the Acts, Locations, and Zones from the JSON data
const acts = ['Act I', 'Act II', 'Act III', 'Act IV', 'Act V', 'Act VI', 'Act VII', 'Act VIII'];
const bosses = ['Grimbone', 'Possessed Luna', 'Uber Reaper', 'King Rakhul', 'Sung Lee'];
const zones = [
  // Regular zones
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5',
  // Special zones
  'Boss Dungeon', 'Dungeon'
];

// Function to create and display the Act buttons
async function createActButtons() {
  const actButtonsContainer = document.querySelector('#act-buttons .button-group');
  actButtonsContainer.innerHTML = ''; // Clear existing buttons
  for (const act of acts) {
    const button = document.createElement('button');
    button.textContent = act;
    button.dataset.filter = act;
    button.addEventListener('click', () => toggleActFilter(act, button));
    actButtonsContainer.appendChild(button);
  }
}

// Function to create and display the Boss buttons
async function createBossButtons() {
  const bossContainer = document.querySelector('#location-buttons .button-group');
  const globalContainer = document.querySelector('#global-drops .button-group');
  const bossCategories = await loadBossCategories();
  
  bossContainer.innerHTML = ''; // Clear existing buttons
  globalContainer.innerHTML = ''; // Clear existing global drops buttons

  // Add act bosses
  bossCategories.act_bosses.forEach(boss => {
    const button = createFilterButton(boss, 'location');
    bossContainer.appendChild(button);
  });

  // Add spacing
  bossContainer.appendChild(document.createElement('br'));

  // Add uber bosses
  bossCategories.uber_bosses.forEach(boss => {
    const button = createFilterButton(boss, 'location');
    bossContainer.appendChild(button);
  });

  // Add spacing
  bossContainer.appendChild(document.createElement('br'));

  // Add endgame bosses
  bossCategories.endgame_bosses.forEach(boss => {
    const button = createFilterButton(boss, 'location');
    bossContainer.appendChild(button);
  });

  // Add spacing
  bossContainer.appendChild(document.createElement('br'));

  // Add pinnacle bosses
  bossCategories.pinnacle_bosses.forEach(boss => {
    const button = createFilterButton(boss, 'location');
    bossContainer.appendChild(button);
  });

  // Add global drops to their own container
  bossCategories.global_drops.forEach(location => {
    const button = createFilterButton(location, 'location');
    button.classList.add('global-drop');
    globalContainer.appendChild(button);
  });
}

// Function to create and display the Zone buttons
function createZoneButtons() {
  const zoneButtonsContainer = document.querySelector('#zone-buttons .regular-zones');
  const specialZoneButtonsContainer = document.querySelector('#zone-buttons .special-zones-group');
  
  // Clear existing buttons
  zoneButtonsContainer.innerHTML = '';
  specialZoneButtonsContainer.innerHTML = '';
  
  // Define the zones explicitly since we know them
  const regularZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
  const specialZones = ['Boss Dungeons', 'Dungeons'];
  
  // Create regular zone buttons
  regularZones.forEach(zone => {
    const button = document.createElement('button');
    button.textContent = zone;
    button.disabled = true; // Initially disabled
    button.addEventListener('click', () => toggleZoneFilter(zone, button));
    zoneButtonsContainer.appendChild(button);
  });
  
  // Create special zone buttons
  specialZones.forEach(zone => {
    const button = document.createElement('button');
    button.textContent = zone;
    button.disabled = true; // Initially disabled
    button.addEventListener('click', () => toggleZoneFilter(zone, button));
    specialZoneButtonsContainer.appendChild(button);
  });
}

// Function to update Zone buttons state
function updateZoneButtonsState() {
  const zoneButtons = document.querySelectorAll('#zone-buttons button');
  const hasActiveAct = activeFilters.acts.size > 0;
  
  zoneButtons.forEach(button => {
    button.disabled = !hasActiveAct;
    if (!hasActiveAct) {
      button.classList.remove('active');
    }
  });
}

// Function to toggle Act filter
function toggleActFilter(act, button) {
  // Clear all act buttons
  document.querySelectorAll('#act-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Clear all location buttons
  document.querySelectorAll('#location-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Clear all zone buttons
  document.querySelectorAll('#zone-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Clear all filters
  activeFilters.acts.clear();
  activeFilters.locations.clear();
  activeFilters.zones.clear();
  
  // Add the new act filter and button state
  activeFilters.acts.add(act);
  button.classList.add('active');
  
  // Update Zone buttons state
  updateZoneButtonsState();
  
  applyFilters();
}

// Function to toggle Location filter
function toggleLocationFilter(location, button) {
  const isActive = button.classList.toggle('active');
  
  // Clear all filters and button states when activating any location filter
  if (isActive) {
    // Clear all other filter buttons
    document.querySelectorAll('#act-buttons button, #zone-buttons button, #location-buttons button, #global-drops button').forEach(btn => {
      if (btn !== button) {
        btn.classList.remove('active');
      }
    });
    
    // Clear all filters
    activeFilters.acts.clear();
    activeFilters.locations.clear();
    activeFilters.zones.clear();

    // Add the new filter
    if (location === 'Anywhere') {
      activeFilters.locations.add('');
    } else if (location === 'Dungeons') {
      activeFilters.locations.add('dungeon_filter');
    } else if (location === 'Boss Dungeons') {
      activeFilters.locations.add('boss_dungeon_filter');
    } else {
      activeFilters.locations.add(location);
    }
  } else {
    // If deactivating, just remove the filter
    activeFilters.locations.delete(location);
    activeFilters.locations.delete('');
    activeFilters.locations.delete('dungeon_filter');
    activeFilters.locations.delete('boss_dungeon_filter');
  }
  
  // Update Zone buttons state
  updateZoneButtonsState();
  
  applyFilters();
}

// Function to toggle Zone filter
function toggleZoneFilter(zone, button) {
  // Only proceed if an Act is selected
  if (activeFilters.acts.size === 0) return;
  
  // Clear all zone buttons
  document.querySelectorAll('#zone-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Clear zone filters
  activeFilters.zones.clear();
  
  // Add the new zone filter and button state
  activeFilters.zones.add(zone);
  button.classList.add('active');
  
  applyFilters();
}

// Function to apply all active filters
function applyFilters() {
  // Check if itemsData is an array before trying to spread it
  let filteredItems = Array.isArray(itemsData) ? [...itemsData] : [];

  // Apply Act filters
  if (activeFilters.acts.size > 0) {
    filteredItems = filteredItems.filter(item =>
      item && item.Locations && Array.isArray(item.Locations) && 
      item.Locations.some(location => 
        Array.from(activeFilters.acts).some(act => {
          // Use regex to match exact Act (e.g., 'Act V' but not 'Act VI')
          const actRegex = new RegExp(`^${act}\\b|\\s${act}\\b`);
          return actRegex.test(location);
        })
      )
    );
  }

  // Apply Location filters
  if (activeFilters.locations.size > 0) {
    filteredItems = filteredItems.filter(item => {
      // Handle empty locations (Anywhere)
      if (activeFilters.locations.has('')) {
        return item.Locations.length === 0 || item.Locations.some(loc => loc === '');
      }
      
      // Handle global dungeon filter (exact match for "Dungeons")
      if (activeFilters.locations.has('dungeon_filter')) {
        return item.Locations.some(loc => loc === 'Dungeons');
      }
      
      // Handle global boss dungeon filter (exact match for "Boss Dungeons")
      if (activeFilters.locations.has('boss_dungeon_filter')) {
        return item.Locations.some(loc => loc === 'Boss Dungeons');
      }
      
      // Handle normal location filters with regex to match base location name
      return item.Locations.some(location => 
        Array.from(activeFilters.locations).some(filter => {
          const locationRegex = new RegExp(`^${filter}\\b`);
          return locationRegex.test(location) && filter !== '' && 
                 filter !== 'dungeon_filter' && filter !== 'boss_dungeon_filter';
        })
      );
    });
  }

  // Apply Zone filters (only if an Act is selected)
  if (activeFilters.zones.size > 0 && activeFilters.acts.size > 0) {
    filteredItems = filteredItems.filter(item =>
      item.Locations.some(location => {
        // Get the selected Act
        const selectedAct = Array.from(activeFilters.acts)[0];
        // Use regex to match exact Act (e.g., 'Act V' but not 'Act VI')
        const actRegex = new RegExp(`^${selectedAct}\\b|\\s${selectedAct}\\b`);
        // Check if location contains the exact Act and the exact Zone
        return actRegex.test(location) && 
               Array.from(activeFilters.zones).some(zone => {
                 // Use regex to match exact Zone (e.g., 'Zone 5' but not 'Zone 51')
                 const zoneRegex = new RegExp(`^${zone}\\b|\\s${zone}\\b`);
                 return zoneRegex.test(location);
               });
      })
    );
  }

  // If only Act is selected without Zone, show no items
  if (activeFilters.acts.size > 0 && activeFilters.zones.size === 0) {
    filteredItems = [];
  }
  // If no filters are active, show all items
  else if (activeFilters.acts.size === 0 && activeFilters.locations.size === 0) {
    filteredItems = itemsData;
  }

  displayItems(filteredItems);
}

// Function to clear all filters
function clearFilters() {
  activeFilters.acts.clear();
  activeFilters.locations.clear();
  activeFilters.zones.clear();
  
  // Remove active class from all buttons
  document.querySelectorAll('button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Update Zone buttons state
  updateZoneButtonsState();
  
  displayItems(itemsData); // Show all items when filters are cleared
}

// Function to parse drop chance and return a numeric value for sorting
function parseDropChance(dropChance) {
  if (!dropChance || dropChance === 'N/A') {
    return -Infinity; // Put N/A items at the end
  }
  
  // Parse the format "X:Y" or "X%" or "X"
  const parts = dropChance.split(':');
  if (parts.length === 2) {
    // Format: "X:Y" - calculate percentage
    const numerator = parseFloat(parts[0].replace(/,/g, ''));
    const denominator = parseFloat(parts[1].replace(/,/g, ''));
    return (numerator / denominator) * 100;
  } else {
    // Format: "X%" or "X"
    return parseFloat(dropChance.replace('%', '').replace(/,/g, ''));
  }
}

// Function to display items with sorting
function displayItems(filteredItems = []) {
  const itemsContainer = document.getElementById('items-container');
  const items = Array.isArray(filteredItems) ? filteredItems : [];

  // Clear the items container
  itemsContainer.innerHTML = '';

  // If no items match the filters, show a message
  if (items.length === 0) {
    const noItemsMessage = document.createElement('div');
    noItemsMessage.className = 'no-items-message';
    noItemsMessage.textContent = 'No items match the selected filters.';
    itemsContainer.appendChild(noItemsMessage);
    return;
  }

  // Sort items by drop chance (from rarest to most common)
  const sortedItems = [...items].sort((a, b) => {
    const chanceA = parseDropChance(a['Drop Chance']);
    const chanceB = parseDropChance(b['Drop Chance']);
    return chanceB - chanceA; // Descending order (rarest to most common)
  });

  // Display matching items
  sortedItems.forEach(item => {
    const itemCard = createItemCard(item);
    itemsContainer.appendChild(itemCard);
  });}


// Add console logging to loadItemsData function
async function loadItemsData() {
  try {
    const response = await fetch('data.json', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data loaded:', data.length, 'items'); // Debug log
    itemsData = data;
    await initializePage();
    displayItems(itemsData); // Show all items initially
  } catch (error) {
    console.error('Failed to load data:', error);
    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = `<div style="color: red; padding: 20px;">Error loading data: ${error.message}</div>`;
  }
}

// Function to create item card with drop chance color and dynamic border color
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const dropChance = item['Drop Chance'];
  const dropChanceColor = getDropChanceColor(dropChance);
  const borderColor = getBorderColor(item['Item Rarity']);
  const itemTier = item['Item Tier'] || 'Unknown'; // Default to 'Unknown' if not specified
  
  card.style.borderColor = borderColor; // Set dynamic border color
  
  card.innerHTML = `
    <h3>${item['Item Name']}</h3>
    <div class="category">${item['Item Category']}</div>
    <div class="item-tier">Tier: <span style="color: goldenrod;">${itemTier}</span></div> <!-- Apply color only to the value -->
    <div class="drop-chance" style="background-color: ${dropChanceColor}">${dropChance}</div>
  `;
  
  return card;
}

// Function to get border color based on item rarity
function getBorderColor(rarity) {
  switch (rarity) {
    case 'Satanic':
      return 'red';
    case 'Heroic':
      return 'teal';
    case 'Unholy':
      return 'pink';
    case 'Angelic':
      return 'yellow';
    default:
      return 'gray'; // Default color if rarity is not recognized
  }
}

// Function to display searched item with dynamic border color
function displaySearchedItem(item) {
  clearFilters();
  
  const itemCard = document.createElement('div');
  itemCard.className = 'item-card-searched';
  
  const dropChanceColor = getDropChanceColor(item['Drop Chance']);
  const borderColor = getBorderColor(item['Item Rarity']);
  const itemTier = item['Item Tier'] || 'Unknown'; // Default to 'Unknown' if not specified
  
  itemCard.style.borderColor = borderColor; // Set dynamic border color
  
  // Format locations list with better error handling
  let locationsList = '';
  if (item.Locations && Array.isArray(item.Locations) && item.Locations.length > 0) {
    locationsList = item.Locations.map(loc => `<li>${loc}</li>`).join('');
  } else {
    locationsList = '<li>No location data available</li>';
  }
  
  itemCard.innerHTML = `
    <h3>${item['Item Name']}</h3>
    <div class="category">${item['Item Category']}</div>
    <div class="item-tier">Tier: <span style="color: goldenrod;">${itemTier}</span></div> <!-- Apply color only to the value -->
    <div class="searched-locations">
      <strong>Drops At:</strong>
      <ul class="locations-list">
        ${locationsList}
      </ul>
    </div>
    <div class="drop-chance" style="background-color: ${dropChanceColor}">${item['Drop Chance']}</div>
  `;
  
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  itemsContainer.appendChild(itemCard);
}

// Function to get color based on drop chance
function getDropChanceColor(dropChance) {
  if (!dropChance || dropChance === 'N/A') {
    return '#666666'; // Gray for N/A
  }
  
  const chance = parseDropChance(dropChance);
  
  // Revert to original thresholds
  if (chance >= 0.01) { // 0.01% or higher
    return '#4CAF50'; // Green for very common drops
  } else if (chance >= 0.005) { // 0.005% or higher
    return '#2196F3'; // Blue for common drops
  } else if (chance >= 0.001) { // 0.001% or higher
    return '#FF9800'; // Orange for uncommon drops
  } else {
    return '#F44336'; // Red for rare drops
  }
}

// Function to initialize the page
async function initializePage() {
  await createActButtons();
  await createZoneButtons();
  await createBossButtons();
  
  // Add Clear Filters button event listener
  const clearButton = document.getElementById('clear-filters');
  if (clearButton) {
    clearButton.addEventListener('click', clearFilters);
  }
  
  displayItems(itemsData); // Initially show items
}

// Call the loadItemsData function when the page loads
// Remove the window.onload handler
// window.onload = loadItemsData;

// Update the initialization code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Disable all filter buttons until data is loaded
    document.querySelectorAll('button[data-filter]').forEach(btn => {
      btn.disabled = true;
    });
    
    // Load data first
    const response = await fetch('data.json', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data loaded successfully:', data.length, 'items');
    itemsData = data;
    
    // Then create UI elements
    await createActButtons();
    await createZoneButtons();
    await createBossButtons();
    
    // Enable buttons after data is loaded
    document.querySelectorAll('button[data-filter]').forEach(btn => {
      btn.disabled = false;
    });
    
    // Display items
    displayItems(itemsData);
  } catch (error) {
    console.error('Failed to initialize the page:', error);
    // Add error message to the UI
    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = '<div class="error-message">Failed to load item data. Please refresh the page.</div>';
  }
});

// Update the updateDisplay function to handle z-index
function updateDisplay() {
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  
  // Get all items that match the current filters
  const filteredItems = itemsData.filter(item => {
    const actMatch = activeFilters.acts.size === 0 || activeFilters.acts.has(item.act);
    const locationMatch = activeFilters.locations.size === 0 || activeFilters.locations.has(item.location);
    const zoneMatch = activeFilters.zones.size === 0 || activeFilters.zones.has(item.zone);
    return actMatch && locationMatch && zoneMatch;
  });

  // If no items match the filters, show a message
  if (filteredItems.length === 0) {
    const noItemsMessage = document.createElement('div');
    noItemsMessage.className = 'no-items-message';
    noItemsMessage.textContent = 'No items match the selected filters.';
    noItemsMessage.style.textAlign = 'center';
    noItemsMessage.style.padding = '20px';
    noItemsMessage.style.color = '#e0e0e0';
    itemsContainer.appendChild(noItemsMessage);
    return;
  }

  // Sort items by drop chance (from rarest to most common)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const chanceA = parseDropChance(a['Drop Chance']);
    const chanceB = parseDropChance(b['Drop Chance']);
    return chanceB - chanceA; // Descending order (rarest to most common)
  });

  // Display matching items
  sortedItems.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    const dropChanceColor = getDropChanceColor(item['Drop Chance']);
    itemCard.innerHTML = `
      <h3>${item['Item Name']}</h3>
      <div class="category">${item['Item Category']}</div>
      <div class="drop-chance" style="background-color: ${dropChanceColor}">${item['Drop Chance']}</div>
    `;
    itemsContainer.appendChild(itemCard);
  });
}

// Add styles for the no-items message
const style = document.createElement('style');
style.textContent = `
  .no-items-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    color: #e0e0e0;
    font-size: 1.2em;
  }
`;

// Search functionality
let searchTimeout;
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const searchTerm = this.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        const matchingItems = itemsData.filter(item => 
            item['Item Name'].toLowerCase().includes(searchTerm) ||
            item['Item Category'].toLowerCase().includes(searchTerm)
        ).slice(0, 10); // Limit to 10 results

        if (matchingItems.length > 0) {
            searchResults.innerHTML = matchingItems.map(item => `
                <div class="search-result-item" data-item-name="${item['Item Name']}">
                    <div>${item['Item Name']}</div>
                    <small>${item['Item Category']}</small>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }, 300); // Debounce search for 300ms
});

// Handle search result selection
// Add this near the top of your file to test console logging
console.log('Script loaded and running');

// Modify the search results event listener to use a more direct approach
// Handle search result selection
searchResults.addEventListener('click', function(e) {
    console.log('Search result clicked');
    // Remove the alert popup
    // alert('Search result clicked'); // This will show a popup to confirm the event is firing
    
    const resultItem = e.target.closest('.search-result-item');
    if (resultItem) {
        console.log('Found result item:', resultItem);
        const itemName = resultItem.dataset.itemName;
        console.log('Item name:', itemName);
        searchInput.value = itemName;
        searchResults.style.display = 'none';
        
        // Find and display the selected item
        const selectedItem = itemsData.find(item => item['Item Name'] === itemName);
        console.log('Selected item from data:', selectedItem);
        if (selectedItem) {
            console.log('Calling displaySearchedItem');
            displaySearchedItem(selectedItem);
        } else {
            console.error('Item not found in itemsData');
            // Remove this alert as well
            // alert('Item not found in data'); // Show an alert for debugging
        }
    } else {
        console.log('No result item found');
    }
});

function displaySearchedItem(item) {
  clearFilters();
  
  const itemCard = document.createElement('div');
  itemCard.className = 'item-card-searched';
  
  const dropChanceColor = getDropChanceColor(item['Drop Chance']);
  const borderColor = getBorderColor(item['Item Rarity']);
  const itemTier = item['Item Tier'] || 'Unknown'; // Default to 'Unknown' if not specified
  
  itemCard.style.borderColor = borderColor; // Set dynamic border color
  
  // Format locations list with better error handling
  let locationsList = '';
  if (item.Locations && Array.isArray(item.Locations) && item.Locations.length > 0) {
    locationsList = item.Locations.map(loc => `<li>${loc}</li>`).join('');
  } else {
    locationsList = '<li>No location data available</li>';
  }
  
  itemCard.innerHTML = `
    <h3>${item['Item Name']}</h3>
    <div class="category">${item['Item Category']}</div>
    <div class="searched-locations">
      <strong>Drops At:</strong>
      <ul class="locations-list">
        ${locationsList}
      </ul>
    </div>
    <div class="drop-chance" style="background-color: ${dropChanceColor}">${item['Drop Chance']}</div>
  `;
  
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  itemsContainer.appendChild(itemCard);
}

// Add these styles to the existing searchStyles
// Check if searchStyles exists, if not create it
const searchStyles = document.getElementById('search-styles') || document.createElement('style');
searchStyles.id = 'search-styles';
searchStyles.textContent += `
  .locations-list {
    list-style-type: none;
    padding-left: 0;
    margin-top: 8px;
  }
  
  .locations-list li {
    padding: 4px 0;
    color: #e0e0e0;
  }
  
  .searched-item-content {
    gap: 15px;
  }
`;

// Make sure the style element is in the document
if (!document.getElementById('search-styles')) {
  document.head.appendChild(searchStyles);
}

async function loadBossCategories() {
  const response = await fetch('boss_categories.json');
  return await response.json();
}

function createFilterButton(boss, type) {
  const button = document.createElement('button');
  button.textContent = boss;
  button.dataset.filter = boss;
  button.addEventListener('click', () => toggleLocationFilter(boss, button));
  return button;
}

// Update the initialization code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadItemsData();
    await createActButtons();
    await createZoneButtons();
    await createBossButtons(); // Changed to async
    displayItems(itemsData);
  } catch (error) {
    console.error('Failed to initialize the page:', error);
    // Add error message to the UI
    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = '<div class="error-message">Failed to load item data. Please refresh the page.</div>';
  }
});
