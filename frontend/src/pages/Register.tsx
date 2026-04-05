import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const Register = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface-deep p-4">

    <div className="bg-surface-raised border border-border-default rounded-2xl shadow-2xl w-full max-w-[480px] p-8">

      <img
        src="/rental_manager_logo_full.png"
        alt="Rental Manager"
        className="w-full h-auto mb-4"
      />

      <SignUp
        appearance={{
          baseTheme: dark,
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          },
          elements: {
            rootBox:  '!w-full !min-w-0',
            cardBox:  '!w-full !min-w-0 !shadow-none !overflow-visible',
            card:     '!bg-transparent !shadow-none !border-none !p-0 !m-0 !w-full !min-w-0',
            header:         '!hidden',
            headerTitle:    '!hidden',
            headerSubtitle: '!hidden',

            formFieldLabel: 'text-text-label font-medium mb-1',
            formFieldInput: '!bg-[#374151] !border-[#4b5563] text-white h-11 px-4 rounded-lg',

            formButtonPrimary:
              '!bg-[#4f46e5] hover:!bg-[#6366f1] text-white font-bold text-base h-11 transition-colors mt-2 normal-case',

            socialButtonsBlockButton:     '!bg-[#374151] !border-[#4b5563] hover:!bg-[#4b5563] transition-colors',
            socialButtonsBlockButtonText: 'text-text-secondary font-medium',

            footerActionText: 'text-text-muted',
            footerActionLink: '!text-[#818cf8] hover:!text-[#a5b4fc] font-semibold',

            dividerLine: '!bg-[#374151]',
            dividerText: 'text-text-subtle',
          },
        }}
      />
    </div>

  </div>
);

export default Register;
