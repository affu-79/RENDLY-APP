'use client';

import React from 'react';
import type { LegalSection } from '@/content/legalContent';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function linkify(text: string): React.ReactNode {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    part.match(URL_REGEX) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-space_indigo underline underline-offset-2 hover:text-glaucous hover:no-underline transition-colors duration-100"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

const headingClasses = {
  2: 'font-chillax font-bold text-ink_black text-lg sm:text-xl mt-6 mb-3 first:mt-0',
  3: 'font-chillax font-semibold text-ink_black text-base sm:text-lg mt-4 mb-2',
  4: 'font-chillax font-semibold text-ink_black text-sm sm:text-base mt-3 mb-1',
};

export function LegalContentRenderer({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="space-y-1 text-dusty_grape text-sm sm:text-base leading-relaxed">
      {sections.map((section, idx) => (
        <section key={`${section.title}-${idx}`}>
          {section.level === 2 && (
            <h2 className={headingClasses[2]} style={{ fontFamily: 'var(--font-chillax)' }}>
              {section.title}
            </h2>
          )}
          {section.level === 3 && (
            <h3 className={headingClasses[3]} style={{ fontFamily: 'var(--font-chillax)' }}>
              {section.title}
            </h3>
          )}
          {section.level === 4 && (
            <h4 className={headingClasses[4]} style={{ fontFamily: 'var(--font-chillax)' }}>
              {section.title}
            </h4>
          )}
          {section.paragraphs?.map((p, i) => (
            <p key={i} className="mb-3">
              {linkify(p)}
            </p>
          ))}
          {section.list && section.list.length > 0 && (
            <ul className="list-disc pl-6 mb-3 space-y-1">
              {section.list.map((item, i) => (
                <li key={i}>{linkify(item)}</li>
              ))}
            </ul>
          )}
          {section.numbered && section.numbered.length > 0 && (
            <ol className="list-decimal pl-6 mb-3 space-y-1">
              {section.numbered.map((item, i) => (
                <li key={i}>{linkify(item)}</li>
              ))}
            </ol>
          )}
          {section.paragraphsAfterList?.map((p, i) => (
            <p key={i} className="mb-3">
              {linkify(p)}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
