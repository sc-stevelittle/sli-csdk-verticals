'use client';

import type { JSX } from 'react';
import { useState } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface CookieBannerFields {
  Message?: TextField;
  PrivacyLink?: LinkField;
  SaveLabel?: TextField;
  AcceptLabel?: TextField;
  RejectLabel?: TextField;
  PreferenceToggles?: TextField;
}

type Props = ComponentProps & { fields?: CookieBannerFields };

export const Default = (props: Props): JSX.Element => {
  const { params, fields = {}, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? 'cookie-banner';
  const [dismissed, setDismissed] = useState(false);

  return (
    <section id={componentKey} key={componentKey} className={`scx-block scx-cookie-banner ${params.styles ?? ''}`.trim()}>
      <div className="scx-inner">
        {fields.Message && <Text tag="p" field={fields.Message} className="scx-field scx-field--message" />}
        {fields.SaveLabel && <Text tag="p" field={fields.SaveLabel} className="scx-field scx-field--save-label" />}
        {fields.AcceptLabel && <Text tag="p" field={fields.AcceptLabel} className="scx-field scx-field--accept-label" />}
        {fields.RejectLabel && <Text tag="p" field={fields.RejectLabel} className="scx-field scx-field--reject-label" />}
        {fields.PreferenceToggles && <Text tag="p" field={fields.PreferenceToggles} className="scx-field scx-field--preference-toggles" />}
        {fields.PrivacyLink?.value?.href && <SitecoreLink field={fields.PrivacyLink} className="scx-link scx-link--privacy-link" />}

      {!dismissed && <div className="scx-cookie-actions"><button type="button" onClick={() => setDismissed(true)}>Reject optional</button><button type="button" onClick={() => setDismissed(true)}>Accept all</button></div>}
      </div>
    </section>
  );
};

export const Animated = (props: Props): JSX.Element => (
  <div className="scx-animated"><Default {...props} /></div>
);

export default Default;
