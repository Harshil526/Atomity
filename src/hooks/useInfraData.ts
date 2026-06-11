import { useQuery } from "@tanstack/react-query";
import { PROVIDERS } from "@/data/providers";
import type { ProviderId } from "@/tokens";

/**
 * Public API: DummyJSON /users. We deterministically map fields per user
 * into believable infrastructure metrics — proves async/loading/error
 * handling without fake data hardcoded in components.
 */
export interface ProviderMetrics {
  id: ProviderId;
  cpu: number;
  memory: number;
  network: number;
  gpu: number;
  savings: number;
  efficiency: number;
  regions: number;
  workloads: number;
}

interface DummyUser {
  id: number;
  age: number;
  height: number;
  weight: number;
  eyeColor: string;
}
interface DummyResponse {
  users: DummyUser[];
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function mapUsersToMetrics(users: DummyUser[]): ProviderMetrics[] {
  return PROVIDERS.map((p, i) => {
    // Take 8 users per provider, deterministic slice.
    const slice = users.slice(i * 8, i * 8 + 8);
    const avg = (k: keyof DummyUser) =>
      slice.reduce((s, u) => s + Number(u[k] || 0), 0) / Math.max(slice.length, 1);
    const cpu = clamp(40 + (avg("age") - 30) * 1.6);
    const memory = clamp(45 + (avg("weight") - 70) * 0.5);
    const network = clamp(30 + (avg("height") - 165) * 0.6);
    const gpu = clamp(20 + ((slice[0]?.id ?? i) * 7) % 70);
    const efficiency = clamp(70 + (100 - (cpu + memory) / 2) * 0.25);
    const savings = Math.round(8000 + ((slice[0]?.id ?? 1) * 1234) % 42000);
    return {
      id: p.id,
      cpu: Math.round(cpu),
      memory: Math.round(memory),
      network: Math.round(network),
      gpu: Math.round(gpu),
      savings,
      efficiency: Math.round(efficiency),
      regions: 3 + (i * 2) % 6,
      workloads: 120 + ((slice[0]?.id ?? 1) * 37) % 480,
    };
  });
}

async function fetchInfra(): Promise<ProviderMetrics[]> {
  const res = await fetch("https://dummyjson.com/users?limit=40&select=age,height,weight,eyeColor");
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const data: DummyResponse = await res.json();
  return mapUsersToMetrics(data.users);
}

export function useInfraData() {
  return useQuery({
    queryKey: ["infra", "providers", "v1"],
    queryFn: fetchInfra,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}