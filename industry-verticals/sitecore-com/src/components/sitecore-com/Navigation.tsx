import type { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface NavigationFields {
  Items?: TextField;
  Labels?: TextField;
  Links?: TextField;
}

type Props = ComponentProps & { fields?: NavigationFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'navigation';


  return (
    <nav id={componentKey} key={componentKey} className={`scx-block scx-navigation ${params.styles ?? ''}`.trim()} aria-label="Primary navigation">
      <div className="scx-inner">
        {fields.Items && <Text tag="p" field={fields.Items} className="scx-field scx-field--items" />}
        {fields.Labels && <Text tag="p" field={fields.Labels} className="scx-field scx-field--labels" />}
        {fields.Links && <Text tag="p" field={fields.Links} className="scx-field scx-field--links" />}

      </div>
    </nav>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
