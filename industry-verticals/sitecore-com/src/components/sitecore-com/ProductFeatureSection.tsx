import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductFeatureSectionFields {
  Eyebrow?: TextField;
  Title?: TextField;
  Body?: TextField;
  Image?: ImageField;
  Bullets?: TextField;
  Cta?: LinkField;
  LayoutVariant?: TextField;
}

type Props = ComponentProps & { fields?: ProductFeatureSectionFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-feature-section';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-product-feature-section ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.Bullets && <Text tag="p" field={fields.Bullets} className="scx-field scx-field--bullets" />}
        {fields.LayoutVariant && <Text tag="p" field={fields.LayoutVariant} className="scx-field scx-field--layout-variant" />}
        {fields.Image && <SitecoreImage field={fields.Image} className="scx-media scx-media--image" />}
        {fields.Cta?.value?.href && <SitecoreLink field={fields.Cta} className="scx-link scx-link--cta" />}

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
