import { SignIn } from '@clerk/clerk-react';
import { dark } from "@clerk/themes";

const Login = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#111315] p-4">

    {/* This is the one card */}
    <div className="bg-[#1A1D21] rounded-2xl shadow-2xl w-full max-w-[420px] p-8">

      {/* Logo */}
      <img
        src="/rental_manager_logo_full.png"
        alt="Rental Manager"
        className="w-full h-auto mb-4"
      />

      {/* Clerk — card is invisible, our div above is the card */}
      <SignIn
        appearance={{
          baseTheme: dark,
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          },
          elements: {
            rootBox: "!w-full !min-w-0",
            cardBox: "!w-full !min-w-0 !shadow-none !overflow-visible",
            card: "!bg-transparent !shadow-none !border-none !p-0 !m-0 !w-full !min-w-0",
            header: "!hidden",
            headerTitle: "!hidden",
            headerSubtitle: "!hidden",

            formFieldLabel: "text-slate-400 font-medium mb-1",
            formFieldInput: "!bg-[#2A3036] !border-slate-700 text-white h-11 px-4 rounded-lg",

            formButtonPrimary: "!bg-[#5D4FF3] hover:!bg-[#4B3EE3] text-white font-bold text-base h-11 transition-all mt-2 normal-case",

            socialButtonsBlockButton: "!bg-[#2A3036] !border-slate-700 hover:!bg-[#323941] transition-colors",
            socialButtonsBlockButtonText: "text-slate-200 font-medium",

            footerActionText: "text-slate-400",
            footerActionLink: "!text-[#5D4FF3] hover:!text-indigo-400 font-semibold",

            dividerLine: "!bg-slate-700",
            dividerText: "text-slate-500",
          },
        }}
      />
    </div>

  </div>
);

export default Login;
