import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface EventCardFields {
  Image?: ImageField;
  Date?: TextField;
  Title?: TextField;
  Description?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: EventCardFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'event-card';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-event-card ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Date && <Text tag="p" field={fields.Date} className="scx-field scx-field--date" />}
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
