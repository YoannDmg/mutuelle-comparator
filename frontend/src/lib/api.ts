// API client for insurance comparator

const API_BASE = '/api';

// Types matching backend domain
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

export interface Guarantee {
  category: Category;
  key: string;
  label: string;
  reimbursement: Reimbursement;
  limit?: string;
  details?: string;
}

export interface Plan {
  level: number;
  name: string;
  guarantees: Guarantee[];
}

export interface Insurer {
  name: string;
  brand: string;
  plans: Plan[];
}

// API response types (list endpoints return partial data)
export interface InsurerListItem {
  name: string;
  brand: string;
  planCount: number;
}

export interface PlanListItem {
  level: number;
  name: string;
}

// API client functions
export async function getInsurers(): Promise<InsurerListItem[]> {
  const response = await fetch(`${API_BASE}/insurers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch insurers: ${response.statusText}`);
  }
  return response.json();
}

export async function getInsurer(name: string): Promise<Insurer> {
  const response = await fetch(`${API_BASE}/insurers/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch insurer: ${response.statusText}`);
  }
  return response.json();
}

export async function getInsurerPlans(name: string): Promise<PlanListItem[]> {
  const response = await fetch(`${API_BASE}/insurers/${encodeURIComponent(name)}/plans`);
  if (!response.ok) {
    throw new Error(`Failed to fetch plans: ${response.statusText}`);
  }
  return response.json();
}

export async function getPlan(insurerName: string, level: number): Promise<Plan> {
  const response = await fetch(
    `${API_BASE}/insurers/${encodeURIComponent(insurerName)}/plans/${level}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch plan: ${response.statusText}`);
  }
  return response.json();
}

// Utility to format reimbursement for display
export function formatReimbursement(reimbursement: Reimbursement): string {
  switch (reimbursement.type) {
    case 'percentage':
      return `${reimbursement.value}%`;
    case 'fixed':
      return `${reimbursement.value} ${reimbursement.unit.replace('EUR', '€')}`;
    case 'real_costs':
      return 'Frais réels';
  }
}
