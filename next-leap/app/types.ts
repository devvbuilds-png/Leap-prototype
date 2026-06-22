export type AppPhase = "landing" | "onboarding" | "paths" | "simulator" | "roles" | "nextsteps";

export interface ProfileData {
  role: string;
  experience: string;
  aspiration: string;
  aspirationDetail: string;
  salary: string;
  collegeTier: string;
  cgpa: string;
  budget: string;
  countries: string[];
  timeline: string;
}

export interface PathOption {
  course: string;
  country: string;
  collegeTier: string;
  exampleColleges: string[];
  fitReason: string;
  costRangeUSD: string;
  duration: string;
  fitLabel: "Strong Fit" | "Good Fit" | "Stretch";
  headlineSalaryLPA: string;
  breakevenYears: number;
  isCustom?: boolean;
}

export interface YearPoint {
  year: number;
  stay: number;
  abroad: number;
}

export interface RoleCard {
  title: string;
  salaryRangeLPA: string;
  note?: string;
  whyQualify?: string;
}

export interface RolesData {
  currentCeiling: RoleCard[];
  unlockedRoles: RoleCard[];
}

export interface SimulationData {
  chartData: YearPoint[];
  breakevenYear: number;
  totalInvestmentINR: string;
  salaryAtYear10Abroad: number;
  salaryAtYear10Stay: number;
  tenYearGainLPA: string;
  worthItScore: number;
  verdictHeadline: string;
  verdictDetail: string;
  calculationNotes: string[];
  keyRisk: string;
  keyOpportunity: string;
}
