import type { JSX } from 'react';
import { Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface IncludedFeatureGridFields {
  Title?: TextField;
  Intro?: TextField;
}

type Props = ComponentProps & { fields?: IncludedFeatureGridFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'included-feature-grid';

  const placeholderName = `included-features-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-included-feature-grid ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h2" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Intro && <Text tag="p" field={fields.Intro} className="scx-field scx-field--intro" />}
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
