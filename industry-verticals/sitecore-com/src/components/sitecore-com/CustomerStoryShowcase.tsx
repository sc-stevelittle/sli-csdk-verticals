import type { JSX } from 'react';
import { Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CustomerStoryShowcaseFields {
  Eyebrow?: TextField;
  Title?: TextField;
  Intro?: TextField;
  FeaturedStory?: TextField;
  CustomerLogos?: TextField;
  ViewAllLink?: LinkField;
}

type Props = ComponentProps & { fields?: CustomerStoryShowcaseFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'customer-story-showcase';

  const placeholderName = `customer-stories-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-customer-story-showcase ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Intro && <Text tag="p" field={fields.Intro} className="scx-field scx-field--intro" />}
        {fields.FeaturedStory && <Text tag="p" field={fields.FeaturedStory} className="scx-field scx-field--featured-story" />}
        {fields.CustomerLogos && <Text tag="p" field={fields.CustomerLogos} className="scx-field scx-field--customer-logos" />}
        {fields.ViewAllLink?.value?.href && <SitecoreLink field={fields.ViewAllLink} className="scx-link scx-link--view-all-link" />}
        <div className="scx-items ">
          <Placeholder name={placeholderName} rendering={props.rendering} />
        </div>

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
