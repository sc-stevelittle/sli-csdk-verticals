'use client';

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryListingFields {
  Eyebrow?: TextField;
  Title?: TextField;
  Intro?: TextField;
  SearchPlaceholder?: TextField;
  FilterOptions?: TextField;
  SortOptions?: TextField;
  ResultCount?: TextField;
  ViewMode?: TextField;
  Pagination?: TextField;
}

type Props = ComponentProps & { fields?: CustomerStoryListingFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-listing';
  const [query, setQuery] = useState('');
  const placeholderName = `customer-story-cards-${props.params.DynamicPlaceholderId ?? ''}`;

  useEffect(() => {
    const root = document.getElementById(componentKey);
    root?.querySelectorAll<HTMLElement>('[data-customer-story-card]').forEach((card) => {
      card.hidden = !card.textContent?.toLowerCase().includes(query.toLowerCase());
    });
  }, [componentKey, query]);

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-customer-story-listing ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h1" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Intro && <Text tag="p" field={fields.Intro} className="scx-field scx-field--intro" />}
        {fields.SearchPlaceholder && <Text tag="p" field={fields.SearchPlaceholder} className="scx-field scx-field--search-placeholder" />}
        {fields.FilterOptions && <Text tag="p" field={fields.FilterOptions} className="scx-field scx-field--filter-options" />}
        {fields.SortOptions && <Text tag="p" field={fields.SortOptions} className="scx-field scx-field--sort-options" />}
        {fields.ResultCount && <Text tag="p" field={fields.ResultCount} className="scx-field scx-field--result-count" />}
        {fields.ViewMode && <Text tag="p" field={fields.ViewMode} className="scx-field scx-field--view-mode" />}
        {fields.Pagination && <Text tag="p" field={fields.Pagination} className="scx-field scx-field--pagination" />}
<input className="scx-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search customer stories" placeholder={String(fields.SearchPlaceholder?.value ?? 'Search stories')} />
        <div className="scx-items ">
          <Placeholder name={placeholderName} rendering={props.rendering} />
        </div>

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
