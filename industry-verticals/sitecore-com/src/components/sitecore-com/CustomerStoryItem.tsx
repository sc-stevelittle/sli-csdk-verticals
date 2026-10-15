import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryItemFields {
  Title?: TextField;
  Customer?: TextField;
  Image?: ImageField;
  VideoLink?: LinkField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: CustomerStoryItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-customer-story-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Customer && <Text tag="p" field={fields.Customer} className="scx-field scx-field--customer" />}
        {fields.Image && <SitecoreImage field={fields.Image} className="scx-media scx-media--image" />}
        {fields.VideoLink?.value?.href && <SitecoreLink field={fields.VideoLink} className="scx-link scx-link--video-link" />}
        {fields.Link?.value?.href && <SitecoreLink field={fields.Link} className="scx-link scx-link--link" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
