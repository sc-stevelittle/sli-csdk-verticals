'use client';

import type { JSX } from 'react';
import { useRef } from 'react';
import { Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryCarouselFields {
  Title?: TextField;
  Intro?: TextField;
  ViewAllLink?: LinkField;
}

type Props = ComponentProps & { fields?: CustomerStoryCarouselFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-carousel';
  const itemsRef = useRef<HTMLDivElement>(null);
  const placeholderName = `story-cards-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-customer-story-carousel ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Intro && <Text tag="p" field={fields.Intro} className="scx-field scx-field--intro" />}
        {fields.ViewAllLink?.value?.href && <SitecoreLink field={fields.ViewAllLink} className="scx-link scx-link--view-all-link" />}
        <div className="scx-items scx-items--carousel" ref={itemsRef}>
          <Placeholder name={placeholderName} rendering={props.rendering} />
        </div>

      <div className="scx-controls" aria-label="Carousel controls">
        <button type="button" onClick={() => itemsRef.current?.scrollBy({ left: -360, behavior: 'smooth' })}>Previous</button>
        <button type="button" onClick={() => itemsRef.current?.scrollBy({ left: 360, behavior: 'smooth' })}>Next</button>
      </div>
      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
