import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InspirationGrid } from "@/components/homepage/inspiration-grid";
import { getInspirationImages } from "@/lib/homepage";

export default async function InspirationPage() {
  const images = await getInspirationImages();

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Inspiration" }]} />
        <section className="rounded-md bg-saltwater-50 p-8">
          <p className="brand-eyebrow-dark">
            Gallery
          </p>
          <h1 className="mt-3 font-heading text-4xl text-tangaroa md:text-5xl">
            Inspiration
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-grey">
            Styled bathrooms, doors, kitchens and laundries to inspire your next renovation project.
          </p>
        </section>
      </div>
      <InspirationGrid images={images} title="Styled spaces" />
    </div>
  );
}
