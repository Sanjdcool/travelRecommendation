// Load the appropriate navbar and content on page load
window.addEventListener('DOMContentLoaded', () => {
    let currentPage = window.location.pathname.split('/').pop();
    if (!['home.html', 'about.html', 'contact.html'].includes(currentPage)) {
        currentPage = 'home.html';
    }
    loadNavbar(currentPage);  // Dynamically load the navbar based on the page
    loadContent(currentPage); // Dynamically load the content based on the page
});

// Function to load content for each page
function loadContent(page, updateHistory = true) {
    fetch(page)
        .then(response => {
            if (!response.ok) throw new Error('Page not found');
            return response.text();
        })
        .then(html => {
            document.getElementById('content-container').innerHTML = html;
        
            loadNavbar(page);
        
            // Only call recommendations if container exists in the LOADED content
            const recommendationsEl = document.querySelector('#recommendations-container');
            if (recommendationsEl && page === 'home.html') {
                loadRecommendations();
            }
        
            if (updateHistory) {
                history.pushState({ page }, '', page);
            }
        })
        .catch(() => {
            document.getElementById('content-container').innerHTML = '<p>Page not found.</p>';
        });
}

// Function to dynamically load the appropriate navbar
function loadNavbar(page) {
    const navbarContainer = document.getElementById('navbar-container');
    
    if (page === 'about.html' || page === 'contact.html') {
        // Load the simplified navbar for the About Us & Contact Us pages
        fetch('navbar_simple.html')
            .then(response => response.text())
            .then(html => navbarContainer.innerHTML = html);
    } else {
        // Load the full navbar (for other pages)
        fetch('navbar.html')
            .then(response => response.text())
            .then(html => navbarContainer.innerHTML = html);
    }
}

// Handle search functionality (same as before)
function handleSearch(event) {
    event.preventDefault();
    const keyword = document.getElementById('searchInput').value;
    alert('Searching for: ' + keyword);
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('recommendations-container');

    // Clear input box
    if (input) input.value = '';

    // Clear displayed results
    if (container) container.innerHTML = '';
}

function loadRecommendations() {
  fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load data');
      return response.json();
    })
    .then(data => {
      console.log('Travel Data:', data);
      displayAllRecommendations(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function displayAllRecommendations(data) {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  container.innerHTML = ''; // Clear previous content

  // Display countries and their cities
  data.countries.forEach(country => {
    const countryTitle = document.createElement('h2');
    countryTitle.textContent = country.name;
    container.appendChild(countryTitle);

    country.cities.forEach(city => {
      const card = createCard(city.name, city.imageUrl, city.description);
      container.appendChild(card);
    });
  });

  // Display temples
  const templeTitle = document.createElement('h2');
  templeTitle.textContent = 'Famous Temples';
  container.appendChild(templeTitle);

  data.temples.forEach(temple => {
    const card = createCard(temple.name, temple.imageUrl, temple.description);
    container.appendChild(card);
  });

  // Display beaches
  const beachTitle = document.createElement('h2');
  beachTitle.textContent = 'Beautiful Beaches';
  container.appendChild(beachTitle);

  data.beaches.forEach(beach => {
    const card = createCard(beach.name, beach.imageUrl, beach.description);
    container.appendChild(card);
  });
}

function createCard(name, imageUrl, description) {
  const card = document.createElement('div');
  card.className = 'recommendation-card';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}">
    <h3>${name}</h3>
    <p>${description}</p>
  `;

  return card;
}

function handleSearch(event) {
    event.preventDefault();

    const input = document.getElementById('searchInput');
    const keyword = input.value.trim().toLowerCase();

    if (!keyword) return;

    fetch('travel_recommendation_api.json')
        .then(res => res.json())
        .then(data => {
            const results = [];

            // Match beaches
            if (keyword === 'beach' || keyword === 'beaches') {
                results.push(...data.beaches);
            }

            // Match temples
            else if (keyword === 'temple' || keyword === 'temples') {
                results.push(...data.temples);
            }

            // Match country names
            else {
                data.countries.forEach(country => {
                    if (country.name.toLowerCase() === keyword) {
                        results.push(...country.cities);
                    }
                });
            }

            // Display the results
            displaySearchResults(results, keyword);
        })
        .catch(error => {
            console.error('Error fetching search data:', error);
        });
}

function displaySearchResults(items, keyword) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    container.innerHTML = ''; // Clear old content

    if (items.length === 0) {
        container.innerHTML = `<p>No results found for "<strong>${keyword}</strong>".</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';

        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;

        container.appendChild(card);
    });
}
