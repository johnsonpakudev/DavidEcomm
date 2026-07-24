import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductSpecification } from "@/lib/supabase/types";

function groupSpecifications(specifications: ProductSpecification[]) {
  const groups = new Map<string, ProductSpecification[]>();

  for (const specification of specifications) {
    const groupName = specification.group_name ?? "Details";
    const existing = groups.get(groupName) ?? [];
    existing.push(specification);
    groups.set(groupName, existing);
  }

  return [...groups.entries()];
}

export function ProductSpecifications({
  specifications,
}: {
  specifications: ProductSpecification[];
}) {
  if (specifications.length === 0) {
    return null;
  }

  const groupedSpecifications = groupSpecifications(specifications);

  return (
    <Accordion type="single" collapsible className="rounded-md border border-saltwater">
      <AccordionItem value="specifications" className="px-5">
        <AccordionTrigger className="py-4 text-sm font-semibold uppercase tracking-[0.16em] text-tangaroa hover:no-underline">
          Specifications
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="space-y-6">
            {groupedSpecifications.map(([groupName, items]) => (
              <div key={groupName} className="space-y-3">
                {groupedSpecifications.length > 1 ? (
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-inkjet">
                    {groupName}
                  </h3>
                ) : null}
                <dl className="grid gap-3 sm:grid-cols-2">
                  {items.map((specification) => (
                    <div
                      key={specification.id}
                      className="border-b border-saltwater/70 pb-3"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-tangaroa">
                        {specification.label}
                      </dt>
                      <dd className="mt-1 text-sm text-slate-grey">
                        {specification.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
