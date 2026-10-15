import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface VisibilityCtaFields {
  Title?: TextField;
  Body?: TextField;
  Cta?: LinkField;
}

type Props = ComponentProps & { fields?: VisibilityCtaFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'visibility-cta';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-visibility-cta ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Body && <Text tag="p" field={fields.Body} className="scx-field scx-field--body" />}
        {fields.Cta?.value?.href && <SitecoreLink field={fields.Cta} className="scx-link scx-link--cta" />}

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
