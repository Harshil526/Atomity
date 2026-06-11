import { createFileRoute } from "@tanstack/react-router";
import { IntelligenceMembraneSection } from "@/components/intelligence/IntelligenceMembraneSection";
import { ThemeToggle } from "@/components/intelligence/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: " The Intelligence Membrane" },
      { name: "description", content: "A unified optimization layer that watches workloads across AWS, Azure, GCP, and on-prem and reallocates compute in real time." },
      { property: "og:title", content: " The Intelligence Membrane" },
      { property: "og:description", content: "A unified cloud optimization layer that watches workloads in real time." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <ThemeToggle />
      <IntelligenceMembraneSection />
    </main>
  );
}