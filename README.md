# Hero Siege Heroics

Live version: https://karakasis.github.io/HeroSiegeHeroics/

A web application for tracking and filtering items in Hero Siege.

## Features

- Filter items by Act, Zone, and Boss
- Color-coded drop chances
- Dark mode interface
- Responsive design

## Running Locally

1. Clone the repository:
```bash
git clone https://github.com/karakasis/HeroSiegeHeroics.git
cd HeroSiegeHeroics
```

2. Start the local server:
```bash
python server.py
```

3. Open your web browser and navigate to:
```
http://localhost:8000
```

## Data Structure

The application uses a JSON file (`data.json`) to store item information. Each item entry contains:
- Item Name
- Item Category
- Drop Chance
- Locations (Act, Zone, Boss)

## Contributing

Feel free to submit issues and enhancement requests! 