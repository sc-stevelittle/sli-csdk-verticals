'use client';

import type { JSX } from 'react';
import { useRef } from 'react';
import { Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductCapabilityCarouselFields {
  Title?: TextField;
}

type Props = ComponentProps & { fields?: ProductCapabilityCarouselFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-capability-carousel';
  const itemsRef = useRef<HTMLDivElement>(null);
  const placeholderName = `capability-cards-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-product-capability-carousel ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
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
