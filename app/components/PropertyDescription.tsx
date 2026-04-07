import {
  parsePropertyDescription,
  type DescriptionSection,
} from "@/lib/utils/parse-property-description";

type PropertyDescriptionProps = {
  description: string;
  /** Contexto opcional para microcopy acessível (não altera o texto guardado) */
  propertyTitle?: string;
};

const articleClass =
  "max-w-prose text-[15px] leading-[1.7] text-zinc-700 sm:text-base sm:leading-[1.75]";

const sectionTitleClass =
  "text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl";

const paragraphClass = "text-pretty text-zinc-700";

function renderSections(sections: DescriptionSection[]) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <section
          key={`${section.title}-${index}`}
          className="scroll-mt-24 border-b border-zinc-100 pb-10 last:border-b-0 last:pb-0"
          aria-labelledby={`property-desc-${index}`}
        >
          <h2
            id={`property-desc-${index}`}
            className={sectionTitleClass}
          >
            {section.title}
          </h2>
          <div className="mt-4 space-y-4">
            {section.paragraphs.map((p, i) => (
              <p key={i} className={paragraphClass}>
                {p}
              </p>
            ))}
            {section.listItems && section.listItems.length > 0 && (
              <ul className="list-disc space-y-2 pl-5 text-zinc-700 marker:text-green-700">
                {section.listItems.map((item, i) => (
                  <li key={i} className="text-pretty pl-0.5 leading-[1.65]">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function renderHtml(html: string) {
  return (
    <div
      className={`property-description-html ${articleClass} [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:first:mt-0 [&_h2]:sm:text-xl [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:mb-4 [&_p]:text-zinc-700 [&_p]:last:mb-0 [&_p]:text-pretty [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-zinc-700 [&_ul]:marker:text-green-700 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-zinc-700 [&_strong]:font-semibold [&_strong]:text-zinc-900`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Descrição do imóvel: estrutura escaneável, tipografia legível e HTML legado suportado.
 */
export function PropertyDescription({
  description,
  propertyTitle,
}: PropertyDescriptionProps) {
  const parsed = parsePropertyDescription(description);

  if (parsed.kind === "html") {
    return (
      <article
        className="mt-6"
        aria-label={propertyTitle ? `Descrição: ${propertyTitle}` : "Descrição do imóvel"}
      >
        {renderHtml(parsed.html)}
      </article>
    );
  }

  if (parsed.sections.length === 0) return null;

  return (
    <article
      className="mt-6"
      aria-label={propertyTitle ? `Descrição: ${propertyTitle}` : "Descrição do imóvel"}
    >
      {renderSections(parsed.sections)}
    </article>
  );
}
