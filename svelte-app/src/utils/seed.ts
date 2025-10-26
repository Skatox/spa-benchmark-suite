import type { Item } from '../api/items';

const categories = [
  'Electronics',
  'Home',
  'Outdoors',
  'Fitness',
  'Books',
  'Clothing',
  'Toys',
  'Grocery',
  'Beauty',
  'Automotive',
];

const adjectives = [
  'Advanced',
  'Portable',
  'Eco',
  'Premium',
  'Compact',
  'Wireless',
  'Smart',
  'Durable',
  'Elegant',
  'Versatile',
];

const nouns = [
  'Speaker',
  'Blender',
  'Tent',
  'Treadmill',
  'Notebook',
  'Jacket',
  'Drone',
  'Camera',
  'Backpack',
  'Headset',
  'Lamp',
  'Vacuum',
  'Monitor',
  'Grill',
  'Mixer',
];

function pseudoRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function seedLargeDataset(count: number, startId: number): Item[] {
  const random = pseudoRandom(count * 7919 + startId * 1543);
  const seeded: Item[] = [];

  for (let index = 0; index < count; index += 1) {
    const id = startId + index + 1;
    const category = categories[Math.floor(random() * categories.length)];
    const name = `${adjectives[Math.floor(random() * adjectives.length)]} ${
      nouns[Math.floor(random() * nouns.length)]
    }`;
    const price = Number((random() * 590 + 10).toFixed(2));
    const rating = Number((random() * 2.5 + 2.5).toFixed(1));
    const stock = Math.floor(random() * 500);
    const timestamp = new Date(Date.now() - Math.floor(random() * 1000 * 60 * 60 * 24 * 180)).toISOString();

    seeded.push({
      id,
      sku: `SEED${id.toString().padStart(5, '0')}`,
      name,
      category,
      price,
      rating,
      stock,
      status: stock > 0 ? 'active' : 'out_of_stock',
      description: `Generated item ${id} for stress testing scenarios.`,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return seeded;
}
