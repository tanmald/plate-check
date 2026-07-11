// The canonical implementation lives with the edge functions so the Deno
// runtime can import it (Supabase functions can only import from _shared/,
// while Vite happily resolves files outside src/). Edit that file, not this one.
export * from "../../supabase/functions/_shared/health-scoring";
