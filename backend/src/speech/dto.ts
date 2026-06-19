export interface CreateAttemptDto {
  lineId: string;
  transcript: string;
  score: number;
}

export const XP_PER_SUCCESS = 30;
export const GEMS_PER_SUCCESS = 1;
export const SUCCESS_SCORE_THRESHOLD = 70;
