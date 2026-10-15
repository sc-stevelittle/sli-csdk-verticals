import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductCapabilityTabFields {
  Label?: TextField;
  Title?: TextField;
  Body?: TextField;
  Image?: ImageField;
  Bullets?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: ProductCapabilityTabFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-capability-tab';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-product-capability-tab ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Label && <Text tag="p" field={fields.Label} className="scx-field scx-field--label" />}
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.Bullets && <Text tag="p" field={fields.Bullets} className="scx-field scx-field--bullets" />}
        {fields.Image && <SitecoreImage field={fields.Image} className="scx-media scx-media--image" />}
        {fields.Link?.value?.href && <SitecoreLink field={fields.Link} className="scx-link scx-link--link" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
