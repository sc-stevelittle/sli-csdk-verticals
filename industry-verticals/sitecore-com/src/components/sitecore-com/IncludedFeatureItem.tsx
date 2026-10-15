import type { JSX } from 'react';
import { Image as SitecoreImage, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface IncludedFeatureItemFields {
  Title?: TextField;
  Description?: TextField;
  Icon?: ImageField;
}

type Props = ComponentProps & { fields?: IncludedFeatureItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'included-feature-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-included-feature-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Description && <Text tag="p" field={fields.Description} className="scx-field scx-field--description" />}
        {fields.Icon && <SitecoreImage field={fields.Icon} className="scx-media scx-media--icon" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
