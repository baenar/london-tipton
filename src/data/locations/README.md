# Adding New Attractions

Adding a new attraction to London Walking Trip Planner is as simple as dropping a new `.json` file into this directory (`src/data/locations/`).

The application automatically imports every `.json` file in this directory using Vite's `import.meta.glob`. No need to update an index file or register anything!

## JSON Format Specification

Create a file named `<unique-slug>.json` (for example `natural-history-museum.json`):

```json
{
  "id": "natural-history-museum",
  "name": "Natural History Museum",
  "coordinates": [51.4967, -0.1764],
  "description": "World-class museum exhibiting a vast range of specimens from various segments of natural history, including dinosaur skeletons.",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Natural_History_Museum,_London",
  "imageUrl": "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=1000&q=80",
  "category": "Museum & Gallery",
  "suggestedDurationMinutes": 90,
  "highlight": "Hope the blue whale skeleton in Hintze Hall",
  "address": "Cromwell Rd, South Kensington, London SW7 5BD, UK"
}
```

### Allowed Categories:
- `Iconic Landmark`
- `Museum & Gallery`
- `Royal & Historic`
- `Market & Food`
- `Park & Nature`
- `Entertainment & View`
