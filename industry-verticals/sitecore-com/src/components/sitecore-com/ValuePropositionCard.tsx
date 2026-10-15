import type { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface ValuePropositionCardFields {
  Eyebrow?: TextField;
  Title?: TextField;
  Description?: TextField;
}

type Props = ComponentProps & { fields?: ValuePropositionCardFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'value-proposition-card';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-value-proposition-card ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Eyebrow && <Text tag="p" field={fields.Eyebrow} className="scx-field scx-field--eyebrow" />}
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.Description && <Text tag="p" field={fields.Description} className="scx-field scx-field--description" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
