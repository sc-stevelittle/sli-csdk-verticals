import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface AiSearchFeatureBlockFields {
  Title?: TextField;
  Body?: TextField;
  Image?: ImageField;
  VideoLink?: LinkField;
  Cta?: LinkField;
}

type Props = ComponentProps & { fields?: AiSearchFeatureBlockFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'ai-search-feature-block';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-ai-search-feature-block ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.Image && <SitecoreImage field={fields.Image} className="scx-media scx-media--image" />}
        {fields.VideoLink?.value?.href && <SitecoreLink field={fields.VideoLink} className="scx-link scx-link--video-link" />}
        {fields.Cta?.value?.href && <SitecoreLink field={fields.Cta} className="scx-link scx-link--cta" />}

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
