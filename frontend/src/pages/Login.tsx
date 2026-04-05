import { SignIn } from '@clerk/clerk-react';
import { dark } from "@clerk/themes";

const Login = () => (
  <div className="flex justify-center mt-20">
    <SignIn 
      appearance={{
        layout: { unsafe_disableDevelopmentModeWarnings: true },
        baseTheme: dark
      }} 
    />
  </div>
);

export default Login;