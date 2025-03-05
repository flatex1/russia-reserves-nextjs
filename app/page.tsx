
import { Hero } from "./_components/hero";
import { SearchSection } from "./_components/search-section";

export default function Home() {

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <SearchSection />
      </div>
    </main>
  );
}
