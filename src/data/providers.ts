import type { ProviderId } from "@/tokens";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  short: string;
  tagline: string;
  /** Position on the 1000x1000 stage, angle in degrees from top */
  angle: number;
  colorVar: string;
}

export const PROVIDERS: ProviderMeta[] = [
  { id: "aws", name: "Amazon Web Services", short: "AWS", tagline: "Elastic compute fabric", angle: -60, colorVar: "var(--mem-aws)" },
  { id: "azure", name: "Microsoft Azure", short: "Azure", tagline: "Hybrid enterprise cloud", angle: 60, colorVar: "var(--mem-azure)" },
  { id: "gcp", name: "Google Cloud", short: "GCP", tagline: "AI-native infrastructure", angle: 120, colorVar: "var(--mem-gcp)" },
  { id: "onprem", name: "On-Premise", short: "On-Premise", tagline: "Private bare-metal", angle: -120, colorVar: "var(--mem-onprem)" },
];