import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface TopBarFields {
  Announcement?: TextField;
  Link?: LinkField;
}

type Props = ComponentProps & { fields?: TopBarFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'top-bar';


  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-top-bar ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Announcement && <Text tag="p" field={fields.Announcement} className="scx-field scx-field--announcement" />}
        {fields.Link?.value?.href && <SitecoreLink field={fields.Link} className="scx-link scx-link--link" />}

      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
