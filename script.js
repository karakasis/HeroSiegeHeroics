let itemsData = []; // This will hold the items from the JSON
let activeFilters = {
  acts: new Set(),
  locations: new Set(),
  zones: new Set()
};

// Function to fetch and load the JSON data from the file
function loadItemsData() {
  fetch('data.json', {
    cache: 'no-store' // Prevent caching
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      itemsData = data;
      initializePage();
    })
    .catch(error => {
      console.error('Error loading data:', error);
      // Don't show alert, just log the error
      initializePage(); // Still initialize the page even if data loading fails
    });
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
function createActButtons() {
  const actButtonsContainer = document.querySelector('#act-buttons .button-group');
  actButtonsContainer.innerHTML = ''; // Clear existing buttons
  acts.forEach((act) => {
    const button = document.createElement('button');
    button.textContent = act;
    button.dataset.filter = act;
    button.addEventListener('click', () => toggleActFilter(act, button));
    actButtonsContainer.appendChild(button);
  });
}

// Function to create and display the Boss buttons
function createLocationButtons() {
  const locationButtonsContainer = document.querySelector('#location-buttons .button-group');
  locationButtonsContainer.innerHTML = ''; // Clear existing buttons
  bosses.forEach((boss) => {
    const button = document.createElement('button');
    button.textContent = boss;
    button.dataset.filter = boss;
    button.addEventListener('click', () => toggleLocationFilter(boss, button));
    locationButtonsContainer.appendChild(button);
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
  const specialZones = ['Boss Dungeon', 'Dungeon'];
  
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
  
  // Add the new location filter and button state
  activeFilters.locations.add(location);
  button.classList.add('active');
  
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
  let filteredItems = [...itemsData];

  // Apply Act filters
  if (activeFilters.acts.size > 0) {
    filteredItems = filteredItems.filter(item =>
      item.Locations.some(location => 
        Array.from(activeFilters.acts).some(act => location.includes(act))
      )
    );
  }

  // Apply Location filters
  if (activeFilters.locations.size > 0) {
    filteredItems = filteredItems.filter(item =>
      item.Locations.some(location => activeFilters.locations.has(location))
    );
  }

  // Apply Zone filters (only if an Act is selected)
  if (activeFilters.zones.size > 0 && activeFilters.acts.size > 0) {
    filteredItems = filteredItems.filter(item =>
      item.Locations.some(location => 
        Array.from(activeFilters.zones).some(zone => location.includes(zone))
      )
    );
  }

  // If only Act is selected without Zone, show no items
  if (activeFilters.acts.size > 0 && activeFilters.zones.size === 0) {
    filteredItems = [];
  }
  // If no filters are active, show no items
  else if (activeFilters.acts.size === 0 && activeFilters.locations.size === 0) {
    filteredItems = [];
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
  
  displayItems([]); // Show no items when filters are cleared
}

// Function to parse drop chance and return a numeric value for sorting
function parseDropChance(dropChance) {
  if (!dropChance || dropChance === 'N/A') {
    return Infinity; // Put N/A items at the end
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
function displayItems(filteredItems) {
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  
  // Sort items by drop chance (highest to lowest)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const chanceA = parseDropChance(a['Drop Chance']);
    const chanceB = parseDropChance(b['Drop Chance']);
    return chanceB - chanceA; // Sort from highest to lowest (most common to rarest)
  });

  // If no items match the filters, show a message
  if (sortedItems.length === 0) {
    const noItemsMessage = document.createElement('div');
    noItemsMessage.className = 'no-items-message';
    noItemsMessage.textContent = 'No items match the selected filters.';
    itemsContainer.appendChild(noItemsMessage);
    return;
  }

  // Display matching items
  sortedItems.forEach(item => {
    const itemCard = createItemCard(item);
    itemsContainer.appendChild(itemCard);
  });
}

// Function to create item card with drop chance color
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const dropChance = item['Drop Chance'];
  const dropChanceColor = getDropChanceColor(dropChance);
  
  card.innerHTML = `
    <h3>${item['Item Name']}</h3>
    <div class="category">${item['Item Category']}</div>
    <div class="drop-chance" style="background-color: ${dropChanceColor}">${dropChance}</div>
  `;
  
  return card;
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
function initializePage() {
  createActButtons();
  createLocationButtons();
  createZoneButtons();
  
  // Add Clear Filters button event listener
  const clearButton = document.getElementById('clear-filters');
  if (clearButton) {
    clearButton.addEventListener('click', clearFilters);
  }
  
  displayItems([]); // Initially show no items
}

// Call the loadItemsData function when the page loads
window.onload = loadItemsData;

// Add event listener for clear filters button
document.getElementById('clear-filters').addEventListener('click', () => {
  // Clear all active states
  document.querySelectorAll('button.active').forEach(button => {
    button.classList.remove('active');
  });
  
  // Reset all filters
  activeFilters.acts.clear();
  activeFilters.locations.clear();
  activeFilters.zones.clear();
  
  // Reset zone buttons state
  document.querySelectorAll('#zone-buttons button').forEach(button => {
    button.disabled = true;
  });
  
  // Update display
  displayItems([]);
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

  // Display matching items
  filteredItems.forEach(item => {
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
document.head.appendChild(style);
