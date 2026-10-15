import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface HeroBannerFields {
  Eyebrow?: TextField;
  Title?: TextField;
  Body?: TextField;
  PrimaryLink?: LinkField;
  SecondaryLink?: LinkField;
  BackgroundStyle?: TextField;
}

type Props = ComponentProps & { fields?: HeroBannerFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'hero-banner';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-hero-banner ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h1" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.BackgroundStyle && <Text tag="p" field={fields.BackgroundStyle} className="scx-field scx-field--background-style" />}
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
