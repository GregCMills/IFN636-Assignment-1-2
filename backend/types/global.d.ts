declare global {
  var clerkMock: {
    setAuth: (auth: any) => void;
    setRole: (role: string) => void;
    reset: () => void;
  };
}

export {};
