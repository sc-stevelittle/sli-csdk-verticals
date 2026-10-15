import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductHeroFields {
  ProductLabel?: TextField;
  Title?: TextField;
  Body?: TextField;
  Media?: ImageField;
  PrimaryLink?: LinkField;
  SecondaryLink?: LinkField;
}

type Props = ComponentProps & { fields?: ProductHeroFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-hero';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-product-hero ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.ProductLabel && <Text tag="p" field={fields.ProductLabel} className="scx-field scx-field--product-label" />}
        {fields.Title && <Text tag="h1" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.Media && <SitecoreImage field={fields.Media} className="scx-media scx-media--media" />}
        {fields.PrimaryLink?.value?.href && <SitecoreLink field={fields.PrimaryLink} className="scx-link scx-link--primary-link" />}
        {fields.SecondaryLink?.value?.href && <SitecoreLink field={fields.SecondaryLink} className="scx-link scx-link--secondary-link" />}

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
