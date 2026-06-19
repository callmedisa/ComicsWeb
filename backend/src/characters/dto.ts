import { CharacterType } from "@prisma/client";

export interface CharacterPreviewDto {
  type: CharacterType;
  name: string;
  traits: string[];
  color: string;
}

export interface CreateCharacterDto extends CharacterPreviewDto {
  imageUrl?: string | null;
}
