import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface AwardLogoItemFields {
  Image?: ImageField;
  AltText?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: AwardLogoItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'award-logo-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-award-logo-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.AltText && <Text tag="p" field={fields.AltText} className="scx-field scx-field--alt-text" />}
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
