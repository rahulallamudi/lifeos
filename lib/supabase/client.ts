import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = "https://xyxkdfpdlsnuupebgspj.supabase.co";
const supabaseKey = "sb_publishable_0k69pUHZA4Lcta0aTSwPHg_h8Qx2hk4";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
