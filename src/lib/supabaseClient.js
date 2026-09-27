import { createClient } from "@supabase/supabase-js";
import { readPublicConfig } from "./publicConfig";

const { url, key } = readPublicConfig(import.meta.env);
export const supabase = createClient(url, key);
