import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryListingCardFields {
  Image?: ImageField;
  Type?: TextField;
  Title?: TextField;
  Description?: TextField;
  Tags?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: CustomerStoryListingCardFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-listing-card';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-customer-story-listing-card ${params.styles ?? ''}`.trim()} data-customer-story-card>
      <div className="scx-inner">
        {fields.Type && <Text tag="p" field={fields.Type} className="scx-field scx-field--type" />}
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Description && <Text tag="p" field={fields.Description} className="scx-field scx-field--description" />}
        {fields.Tags && <Text tag="p" field={fields.Tags} className="scx-field scx-field--tags" />}
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
