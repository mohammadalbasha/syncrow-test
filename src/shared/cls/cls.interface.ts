export interface ClsStore extends Record<string | symbol, any> {
  req: {
    params?: {
      id?: string | number;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

