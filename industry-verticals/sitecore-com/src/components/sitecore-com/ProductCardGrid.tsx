import type { JSX } from 'react';
import { Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ProductCardGridFields {
  Title?: TextField;
  ViewAllLink?: LinkField;
}

type Props = ComponentProps & { fields?: ProductCardGridFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'product-card-grid';

  const placeholderName = `cards-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-product-card-grid ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
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
