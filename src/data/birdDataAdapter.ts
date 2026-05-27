import type { BirdData } from '@/models/BirdData';
import type { SimpleBirdData } from './simpleBirds';
import type { BirdType, Rarity } from '@/types';

function mapRarity(rarity: SimpleBirdData['rarity']): Rarity {
  return rarity;
}

function mapBirdType(bird: SimpleBirdData): BirdType {
  const endemicIds = new Set([
    'mullers-barbet',
    'taiwan-blue-magpie',
    'taiwan-scimitar-babbler',
    'black-necklaced-scimitar-babbler',
    'taiwan-yuhina',
    'white-eared-sibia',
    'yellow-tit',
    'flamecrest',
    'taiwan-hwamei',
    'collared-bush-robin',
  ]);
  if (endemicIds.has(bird.id)) {
    return 'endemic';
  }
  return 'resident';
}

/**
 * Convert lightweight roster entries into Pokedex BirdData records.
 */
export function simpleBirdToBirdData(bird: SimpleBirdData): BirdData {
  const lengthCm = bird.size;
  return {
    id: bird.id,
    species: {
      commonName: bird.name,
      scientificName: bird.scientificName,
      family: '',
      order: '',
    },
    classification: {
      type: mapBirdType(bird),
      rarity: mapRarity(bird.rarity),
      conservationStatus: 'LC',
    },
    physical: {
      size: {
        length: { min: lengthCm, max: lengthCm, unit: 'cm' },
        wingspan: { min: lengthCm * 1.4, max: lengthCm * 1.6, unit: 'cm' },
        weight: { min: bird.weight, max: bird.weight, unit: 'g' },
      },
      plumage: {
        male: bird.description,
        female: bird.description,
      },
      distinctiveFeatures: bird.characteristics,
    },
    identification: {
      difficulty: bird.rarity === 'legendary' ? 8 : bird.rarity === 'rare' ? 6 : 4,
      keyFeatures: bird.characteristics,
      similarSpecies: [],
      fieldMarks: {
        head: bird.characteristics[0] ?? '',
        body: bird.description,
        wings: '',
        tail: '',
        legs: '',
        beak: '',
      },
    },
    behavior: {
      habitat: bird.habitats,
      diet: [],
      feeding: bird.behaviors[0] ?? '',
      flightPattern: '',
      vocalization: {
        call: bird.callDescription,
        song: bird.callDescription,
      },
      breeding: {
        season: '',
        nest: '',
        eggs: 0,
      },
    },
    distribution: {
      range: 'Taiwan',
      altitude: { min: 0, max: 3500, unit: 'm' },
      seasonality: {
        spring: true,
        summer: true,
        autumn: true,
        winter: true,
      },
    },
    media: {
      images: [
        {
          url: bird.imageUrl,
          source: 'Wikimedia Commons',
          license: 'CC BY / CC BY-SA',
          author: 'See birdImageCredits.ts',
        },
      ],
      sounds: [],
    },
    gameData: {
      points: bird.discoveryPoints,
      experienceReward: bird.discoveryPoints,
      spawnWeight: bird.rarity === 'common' ? 10 : bird.rarity === 'uncommon' ? 6 : 3,
      spawnConditions: {
        habitats: bird.habitats,
        timeOfDay: ['morning', 'afternoon', 'dusk'],
        weather: ['sunny', 'cloudy'],
        season: ['spring', 'summer', 'autumn', 'winter'],
      },
    },
  };
}

export function catalogToBirdData(catalog: SimpleBirdData[]): BirdData[] {
  return catalog.map(simpleBirdToBirdData);
}
