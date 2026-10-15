'use client';

import type { JSX } from 'react';
import { useRef } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface AwardsLogoRailFields {}

type Props = ComponentProps & { fields?: AwardsLogoRailFields };

export const Default = (props: Props): JSX.Element => {
  const { params, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'awards-logo-rail';
  const itemsRef = useRef<HTMLDivElement>(null);
  const placeholderName = `award-items-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-awards-logo-rail ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
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
