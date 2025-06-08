declare module 'cloudinary' {
  export const v2: {
    config: (config: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
    }) => void;
    uploader: {
      upload: (image: string) => Promise<{ secure_url: string }>;
    };
  };
} 