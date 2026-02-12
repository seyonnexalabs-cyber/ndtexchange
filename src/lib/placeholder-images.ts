import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This is now the single source of truth for placeholder images.
// All other placeholder data has been migrated to seed-data.ts for database seeding.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
