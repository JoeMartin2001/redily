export interface IRideRule {
  id: string;
  description: string;
  type: RuleType;
}

enum RuleType {
  SMOKING = 'smoking',
  PETS = 'pets',
  MUSIC = 'music',
  LUGGAGE = 'luggage',
  OTHER = 'other',
}
