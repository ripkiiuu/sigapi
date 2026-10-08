const SIGAP_SUPABASE_URL = "https://iuvvwlmbdlxjzrjhpray.supabase.co";
const SIGAP_SUPABASE_KEY =
  "sb_publishable_HVocMHM_1M8OSw1BYuj6Cw__w19Kjds";

window.sigapSupabase = window.supabase.createClient(
  SIGAP_SUPABASE_URL,
  SIGAP_SUPABASE_KEY,
);
