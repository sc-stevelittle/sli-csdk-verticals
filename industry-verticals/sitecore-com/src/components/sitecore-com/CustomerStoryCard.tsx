import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryCardFields {
  Image?: ImageField;
  Industry?: TextField;
  Title?: TextField;
  Description?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: CustomerStoryCardFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-card';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-customer-story-card ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Industry && <Text tag="p" field={fields.Industry} className="scx-field scx-field--industry" />}
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Description && <Text tag="p" field={fields.Description} className="scx-field scx-field--description" />}
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
