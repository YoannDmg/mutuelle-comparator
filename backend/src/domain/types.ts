// === CATEGORIES ===

export const CATEGORIES = [
  'hospitalization',
  'general_care',
  'optical',
  'dental',
  'hearing_aids',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  hospitalization: 'Hospitalisation',
  general_care: 'Soins courants',
  optical: 'Optique',
  dental: 'Dentaire',
  hearing_aids: 'Audiologie',
};

// === NORMALIZED KEYS ===

export const NORMALIZED_KEYS = {
  // Hospitalization
  hospital_stay: 'Frais de séjour',
  daily_hospital_fee: 'Forfait journalier',
  private_room: 'Chambre particulière',
  surgical_fees: 'Honoraires chirurgicaux',
  // General care
  general_practitioner: 'Médecin généraliste',
  specialist: 'Spécialiste',
  lab_tests: 'Analyses',
  medication: 'Médicaments',
  // Optical
  simple_lenses: 'Verres simples + monture',
  complex_lenses: 'Verres complexes + monture',
  contact_lenses: 'Lentilles',
  // Dental
  dental_care: 'Soins dentaires',
  dental_prosthetics: 'Prothèses dentaires',
  orthodontics: 'Orthodontie',
  implants: 'Implants dentaires',
  // Hearing
  hearing_aids: 'Appareils auditifs',
} as const;

export type NormalizedKey = keyof typeof NORMALIZED_KEYS;

// === REIMBURSEMENT ===

export type PercentageReimbursement = {
  type: 'percentage';
  value: number;
};

export type FixedReimbursement = {
  type: 'fixed';
  value: number;
  unit: 'EUR' | 'EUR/day' | 'EUR/year';
};

export type RealCostsReimbursement = {
  type: 'real_costs';
};

export type Reimbursement =
  | PercentageReimbursement
  | FixedReimbursement
  | RealCostsReimbursement;

// === GUARANTEE ===

export interface Guarantee {
  category: Category;
  key: NormalizedKey;
  label: string;
  reimbursement: Reimbursement;
  limit?: string;
  details?: string;
}

// === PLAN ===

export interface Plan {
  level: number;
  name: string;
  guarantees: Guarantee[];
}

// === INSURER ===

export interface Insurer {
  name: string;
  brand: string;
  plans: Plan[];
}
