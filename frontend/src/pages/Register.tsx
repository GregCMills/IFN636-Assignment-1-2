import { SignUp } from '@clerk/clerk-react';
import { dark } from "@clerk/themes";

const Register = () => (
  <div className="flex justify-center mt-20">
    <SignUp 
      appearance={{
        layout: { unsafe_disableDevelopmentModeWarnings: true },
        baseTheme: dark
      }} 
    />
  </div>
);

export default Register;