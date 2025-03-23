document.addEventListener("DOMContentLoaded", function() {
    // Fetch the JSON data from the data.json file
    fetch('data.json')
        .then(response => response.json())
        .then(itemsData => {
            const categoriesContainer = document.getElementById("item-categories");

            // Organize items by category
            const categories = {};

            itemsData.forEach(item => {
                if (!categories[item["Item Category"]]) {
                    categories[item["Item Category"]] = [];
                }
                categories[item["Item Category"]].push(item);
            });

            // Create category elements
            for (const category in categories) {
                const categoryElement = document.createElement("div");
                categoryElement.classList.add("category");
                categoryElement.innerHTML = `<h2>${category}</h2>`;
                
                categories[category].forEach(item => {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("item");
                    itemElement.innerHTML = `
                        <h3>${item["Item Name"]}</h3>
                        <p><strong>Drop Chance:</strong> ${item["Drop Chance"]}</p>
                        <p><strong>Locations:</strong> ${item["Locations"].join(", ")}</p>
                        ${item["Image"] ? `<img src="${item["Image"]}" alt="${item["Item Name"]}" />` : ''}
                    `;
                    categoryElement.appendChild(itemElement);
                });

                categoriesContainer.appendChild(categoryElement);
            }
        })
        .catch(error => {
            console.error("Error loading the JSON data: ", error);
        });
});
