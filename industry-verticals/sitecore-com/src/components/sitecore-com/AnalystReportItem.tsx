import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface AnalystReportItemFields {
  Title?: TextField;
  DownloadLink?: LinkField;
  LinkLabel?: TextField;
}

type Props = ComponentProps & { fields?: AnalystReportItemFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'analyst-report-item';


  return (
    <article id={componentKey} key={componentKey} className={`scx-block scx-analyst-report-item ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Title && <Text tag="h3" field={fields.Title} className="scx-field scx-field--title" />}
        {fields.LinkLabel && <Text tag="p" field={fields.LinkLabel} className="scx-field scx-field--link-label" />}
        {fields.DownloadLink?.value?.href && <SitecoreLink field={fields.DownloadLink} className="scx-link scx-link--download-link" />}

      </div>
    </article>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
