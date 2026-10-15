import type { JSX } from 'react';
import { Image as SitecoreImage, Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface HeaderFields {
  Logo?: ImageField;
  SearchAction?: LinkField;
  LocaleSelector?: TextField;
  AppLauncher?: TextField;
  DemoLink?: LinkField;
}

type Props = ComponentProps & { fields?: HeaderFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'header';

  const placeholderName = `site-navigation-${props.params.DynamicPlaceholderId ?? ''}`;

  return (
    <div id={componentKey} key={componentKey} className={`scx-block scx-header ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.LocaleSelector && <Text tag="p" field={fields.LocaleSelector} className="scx-field scx-field--locale-selector" />}
        {fields.AppLauncher && <Text tag="p" field={fields.AppLauncher} className="scx-field scx-field--app-launcher" />}
        {fields.Logo && <SitecoreImage field={fields.Logo} className="scx-media scx-media--logo" />}
        {fields.SearchAction?.value?.href && <SitecoreLink field={fields.SearchAction} className="scx-link scx-link--search-action" />}
        {fields.DemoLink?.value?.href && <SitecoreLink field={fields.DemoLink} className="scx-link scx-link--demo-link" />}
        <div className="scx-items ">
          <Placeholder name={placeholderName} rendering={props.rendering} />
        </div>

      </div>
    </div>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
