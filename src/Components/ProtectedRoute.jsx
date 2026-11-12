import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [access, setAccess] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let generation = 0;
    let timer;

    async function verify() {
      const current = ++generation;
      const update = (value) => {
        if (active && current === generation) setAccess(value);
      };
      try {
        // Verify with Auth; a cached session alone is insufficient.
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          update("signed-out");
          return;
        }
        const staff = await supabase.rpc("is_staff");
        update(staff.error ? "error" : staff.data === true ? "staff" : "denied");
      } catch {
        update("error");
      }
    }

    function scheduleVerification() {
      generation += 1;
      setAccess("checking");
      clearTimeout(timer);
      // Leave the Auth callback before making further Supabase requests.
      timer = setTimeout(verify, 0);
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(scheduleVerification);
    window.addEventListener("focus", scheduleVerification);
    verify();
    return () => {
      active = false;
      generation += 1;
      clearTimeout(timer);
      subscription.subscription.unsubscribe();
      window.removeEventListener("focus", scheduleVerification);
    };
  }, [attempt]);

  if (access === "signed-out") return <Navigate to="/login" replace />;
  if (access === "staff") return children;
  return (
    <div className="min-h-screen bg-[#071017] text-white p-10" role="status">
      {access === "checking" ? "Checking dashboard access…" : (
        <>
          <h1 className="text-2xl font-bold">Dashboard access unavailable</h1>
          <p className="mt-3">
            {access === "denied"
              ? "This account is not authorized as NeoEvo staff. Contact the account owner for access."
              : "We could not verify your staff access. Please try again."}
          </p>
          <button className="mt-4 mr-4 underline" onClick={() => {
            setAccess("checking");
            setAttempt((value) => value + 1);
          }}>Check again</button>
          <button className="underline" onClick={async () => {
            setAccess("checking");
            try {
              const { error } = await supabase.auth.signOut();
              setAccess(error ? "error" : "signed-out");
            } catch { setAccess("error"); }
          }}>Sign out</button>
        </>
      )}
    </div>
  );
}
