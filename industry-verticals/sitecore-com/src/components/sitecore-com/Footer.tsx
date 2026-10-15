import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface FooterFields {
  ClosingTitle?: TextField;
  ClosingBody?: TextField;
  PrimaryCta?: LinkField;
  SecondaryCta?: LinkField;
  QuickLinks?: TextField;
  LinkColumns?: TextField;
  LegalLinks?: TextField;
  Copyright?: TextField;
}

type Props = ComponentProps & { fields?: FooterFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'footer';


  return (
    <footer id={componentKey} key={componentKey} className={`scx-block scx-footer ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.ClosingTitle && <Text tag="h2" field={fields.ClosingTitle} className="scx-field scx-field--closing-title" />}
        {fields.ClosingBody && <Text tag="p" field={fields.ClosingBody} className="scx-field scx-field--closing-body" />}
        {fields.QuickLinks && <Text tag="p" field={fields.QuickLinks} className="scx-field scx-field--quick-links" />}
        {fields.LinkColumns && <Text tag="p" field={fields.LinkColumns} className="scx-field scx-field--link-columns" />}
        {fields.LegalLinks && <Text tag="p" field={fields.LegalLinks} className="scx-field scx-field--legal-links" />}
        {fields.Copyright && <Text tag="p" field={fields.Copyright} className="scx-field scx-field--copyright" />}
        {fields.PrimaryCta?.value?.href && <SitecoreLink field={fields.PrimaryCta} className="scx-link scx-link--primary-cta" />}
        {fields.SecondaryCta?.value?.href && <SitecoreLink field={fields.SecondaryCta} className="scx-link scx-link--secondary-cta" />}

      </div>
    </footer>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
