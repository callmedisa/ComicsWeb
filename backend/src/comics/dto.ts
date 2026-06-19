import { ArtStyle, ComicLength } from "@prisma/client";

export interface CreateComicDto {
  topic: string;
  style: ArtStyle;
  length: ComicLength;
  characterIds?: string[];
}

export const PANELS_BY_LENGTH: Record<ComicLength, number> = {
  Short: 4,
  Medium: 6,
  Long: 8,
};
