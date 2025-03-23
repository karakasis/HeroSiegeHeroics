// We will load the items data from the data.json file
let itemsData = [];

// Function to fetch and load the JSON data from the file
function loadItemsData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      itemsData = data; // Store the fetched data
      initializePage();  // Initialize the page once the data is loaded
    })
    .catch(error => {
      console.error('Error loading data:', error);
      alert('Failed to load item data.');
    });
}

// Extracting the Acts and Locations from the JSON data
const acts = ['Act I', 'Act II', 'Act III', 'Act IV', 'Act V', 'Act VI', 'Act VII', 'Act VIII'];
const locations = ['Grimbone', 'Possessed Luna', 'Uber Reaper', 'King Rakhul', 'Sung Lee'];

// Function to create and display the Act buttons
function createActButtons() {
  const actButtonsContainer = document.getElementById('act-buttons');
  acts.forEach((act) => {
    const button = document.createElement('button');
    button.textContent = act;
    button.addEventListener('click', () => filterItemsByAct(act));
    actButtonsContainer.appendChild(button);
  });
}

// Function to create and display the Location buttons
function createLocationButtons() {
  const locationButtonsContainer = document.getElementById('location-buttons');
  locations.forEach((location) => {
    const button = document.createElement('button');
    button.textContent = location;
    button.addEventListener('click', () => filterItemsByLocation(location));
    locationButtonsContainer.appendChild(button);
  });
}

// Function to filter items based on the selected Act
function filterItemsByAct(act) {
  const filteredItems = itemsData.filter(item =>
    item.Locations.some(location => location.includes(act))
  );
  displayItems(filteredItems);
}

// Function to filter items based on the selected Location
function filterItemsByLocation(location) {
  const filteredItems = itemsData.filter(item =>
    item.Locations.includes(location)
  );
  displayItems(filteredItems);
}

// Function to display the filtered items in the items container
function displayItems(items) {
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = ''; // Clear previous items

  if (items.length === 0) {
    itemsContainer.innerHTML = '<p>No items found for this filter.</p>';
    return;
  }

  items.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.innerHTML = `
      <h3>${item['Item Name']}</h3>
      <p><strong>Category:</strong> ${item['Item Category']}</p>
      <p><strong>Drop Chance:</strong> ${item['Drop Chance']}</p>
      <p><strong>Locations:</strong> ${item['Locations'].join(', ')}</p>
    `;
    itemsContainer.appendChild(itemCard);
  });
}

// Function to initialize the page
function initializePage() {
  createActButtons();
  createLocationButtons();
  displayItems(itemsData); // Initially show all items
}

// Call the loadItemsData function when the page loads
window.onload = loadItemsData;
