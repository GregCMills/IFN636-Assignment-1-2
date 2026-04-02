export interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string;
  }
  
  export interface User {
    token: string;
    name?: string;
    email?: string;
  }