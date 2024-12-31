import { ProjectsGrid } from "@/components/projects-grid";

export default function Home() {
  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to PoContainer
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Select a PoC from the navigation above to get started
        </p>
      </div>
      <ProjectsGrid />
    </div>
  );
}