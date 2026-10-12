import React from 'react';

type LegalKind = 'privacy' | 'terms';

const UPDATED = '12 October 2026';

export const LegalPage: React.FC<{ kind: LegalKind }> = ({ kind }) => {
  const title = kind === 'privacy' ? 'Privacy policy' : 'Terms and conditions';

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb]">
      <main className="max-w-2xl mx-auto px-5 py-8">
        <a href="/" className="text-sm text-[#00e599] underline">
          Back to ManePay
        </a>
        <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[#849589]">Last updated {UPDATED}</p>

        {kind === 'privacy' ? <PrivacyBody /> : <TermsBody />}
      </main>
    </div>
  );
};

function PrivacyBody() {
  return (
    <div className="mt-6 space-y-4 text-sm leading-6 text-[#bacbbe]">
      <p>
        ManePay is a prototype for recording a payment on a phone when the network is down. It is not a bank, and it does not move money.
      </p>
      <p>
        The name, phone number, and payment list you enter are stored in this browser or in the Expo app on this phone. They are not sent to a ManePay server, because this build does not have one.
      </p>
      <p>
        If you upload a profile photo, it stays in local storage on this device as a file you chose. The app does not use stock photos or a remote photo service.
      </p>
      <p>
        The hosted website may be served by Vercel. Vercel can keep standard host logs, such as IP address and the page requested. This prototype does not add analytics, advertising, or a customer counter.
      </p>
      <p>
        You can clear the ledger from the profile screen, or by clearing site data in the browser. Uninstalling the Expo app removes the ledger stored by that app.
      </p>
      <p>
        Questions about this prototype can be sent through the project repository at github.com/aadi16101/manepay.
      </p>
    </div>
  );
}

function TermsBody() {
  return (
    <div className="mt-6 space-y-4 text-sm leading-6 text-[#bacbbe]">
      <p>
        ManePay is a demonstration. A payment you record is a note on the device. It is not a transfer, not UPI, and not a charge to a card.
      </p>
      <p>
        The settle action adds the pending amount to demo account DEMO-1042 on this phone. That account is not a bank account.
      </p>
      <p>
        The demo wallet balance is a number on the device so you can try the customer screen. It is not money you can withdraw.
      </p>
      <p>
        The software is provided as a prototype, without a warranty. The authors are not liable for decisions you make from numbers shown in the app.
      </p>
      <p>
        These terms apply to the website and to the Expo Go build of the same prototype.
      </p>
    </div>
  );
}
