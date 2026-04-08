import { PostHog } from 'posthog-node';

const posthog = new PostHog(
  import.meta.env.VITE_POSTHOG_API_KEY as string,
  {
    host: import.meta.env.VITE_POSTHOG_HOST as string,
    enableExceptionAutocapture: true,
  }
);

export default posthog;
