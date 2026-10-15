import type { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface MetricStatItemFields {
  Value?: TextField;
  Label?: TextField;
  Customer?: TextField;
  Industry?: TextField;
}

type Props = ComponentProps & { fields?: MetricStatItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'metric-stat-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-metric-stat-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Value && <Text tag="p" field={fields.Value} className="scx-field scx-field--value" />}
        {fields.Label && <Text tag="p" field={fields.Label} className="scx-field scx-field--label" />}
        {fields.Customer && <Text tag="p" field={fields.Customer} className="scx-field scx-field--customer" />}
        {fields.Industry && <Text tag="p" field={fields.Industry} className="scx-field scx-field--industry" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
