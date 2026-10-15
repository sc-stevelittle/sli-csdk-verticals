import type { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface FaqItemFields {
  Question?: TextField;
  Answer?: TextField;
}

type Props = ComponentProps & { fields?: FaqItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'faq-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-faq-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Question && <Text tag="p" field={fields.Question} className="scx-field scx-field--question" />}
        {fields.Answer && <Text tag="p" field={fields.Answer} className="scx-field scx-field--answer" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
