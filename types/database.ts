// types/database.ts
export interface User {
    id: string;
    email: string;
    name: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Post {
    id: string;
    title: string;
    content: string;
    author_id: string;
    published: boolean;
    created_at: Date;
  }
  
  // Types pour les réponses API
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }