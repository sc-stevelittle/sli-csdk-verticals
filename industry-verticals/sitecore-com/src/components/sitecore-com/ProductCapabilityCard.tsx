import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductCapabilityCardFields {
  Icon?: ImageField;
  Eyebrow?: TextField;
  Title?: TextField;
  Description?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: ProductCapabilityCardFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-capability-card';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-product-capability-card ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Description && <Text tag="p" field={fields.Description} className="scx-field scx-field--description" />}
        {fields.Icon && <SitecoreImage field={fields.Icon} className="scx-media scx-media--icon" />}
        {fields.Link?.value?.href && <SitecoreLink field={fields.Link} className="scx-link scx-link--link" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
