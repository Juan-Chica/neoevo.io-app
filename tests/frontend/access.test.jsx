import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../src/Components/ProtectedRoute";

const api = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), signOut: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("../../src/lib/supabaseClient", () => ({ supabase: {
  auth: { getUser: api.getUser, signOut: api.signOut, onAuthStateChange: api.subscribe }, rpc: api.rpc,
} }));

let authChanged;
beforeEach(() => {
  api.getUser.mockReset().mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
  api.rpc.mockReset().mockResolvedValue({ data: true, error: null });
  api.subscribe.mockImplementation((callback) => {
    authChanged = callback;
    return { data: { subscription: { unsubscribe: api.unsubscribe } } };
  });
});
afterEach(cleanup);
function show() {
  return render(<MemoryRouter initialEntries={["/dashboard"]}><Routes>
    <Route path="/dashboard" element={<ProtectedRoute><div>Private dashboard</div></ProtectedRoute>} />
    <Route path="/login" element={<div>Login screen</div>} />
  </Routes></MemoryRouter>);
}

describe("dashboard staff gate", () => {
  it("renders only after a verified user and true staff response", async () => {
    show();
    expect(screen.queryByText("Private dashboard")).toBeNull();
    expect(await screen.findByText("Private dashboard")).toBeTruthy();
    expect(api.getUser).toHaveBeenCalled();
    expect(api.rpc).toHaveBeenCalledWith("is_staff");
  });
  it("redirects anonymous or invalid sessions without fetching dashboard data", async () => {
    api.getUser.mockResolvedValue({ data: { user: null }, error: null });
    show();
    expect(await screen.findByText("Login screen")).toBeTruthy();
    expect(api.rpc).not.toHaveBeenCalled();
  });
  it("denies authenticated nonstaff", async () => {
    api.rpc.mockResolvedValue({ data: false, error: null });
    show();
    expect(await screen.findByText(/not authorized as NeoEvo staff/)).toBeTruthy();
    expect(screen.queryByText("Private dashboard")).toBeNull();
  });
  it("fails closed when membership lookup fails", async () => {
    api.rpc.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    show();
    expect(await screen.findByText(/could not verify/)).toBeTruthy();
    expect(screen.queryByText("Private dashboard")).toBeNull();
  });
  it("hides data immediately on an auth change and rejects stale verification", async () => {
    let finishStaff;
    api.rpc.mockImplementationOnce(() => new Promise((resolve) => { finishStaff = resolve; }));
    show();
    await waitFor(() => expect(api.rpc).toHaveBeenCalledOnce());
    api.getUser.mockResolvedValue({ data: { user: null }, error: null });
    act(() => authChanged("SIGNED_OUT", null));
    await act(async () => finishStaff({ data: true, error: null }));
    expect(await screen.findByText("Login screen")).toBeTruthy();
    expect(screen.queryByText("Private dashboard")).toBeNull();
  });
  it("rechecks membership on focus and handles revocation", async () => {
    show();
    await screen.findByText("Private dashboard");
    api.rpc.mockResolvedValue({ data: false, error: null });
    act(() => window.dispatchEvent(new Event("focus")));
    expect(screen.queryByText("Private dashboard")).toBeNull();
    expect(await screen.findByText(/not authorized as NeoEvo staff/)).toBeTruthy();
  });
});
