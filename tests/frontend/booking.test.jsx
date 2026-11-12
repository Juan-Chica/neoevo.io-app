import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingForm from "../../src/Components/booking/BookingForm";

const api = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn(), from: vi.fn() }));
vi.mock("../../src/lib/supabaseClient", () => ({ supabase: {
  rpc: api.rpc, from: api.from, functions: { invoke: api.invoke },
} }));
const serviceId = "10000000-0000-4000-8000-000000000001";
beforeEach(() => {
  api.rpc.mockReset().mockImplementation(async (name) => ({ error: null, data: name === "get_public_services"
    ? [{ id: serviceId, name: "Consultation" }] : [{ booking_time: "10:00" }] }));
  api.invoke.mockReset().mockResolvedValue({ error: null, data: { booking_id: "test-booking", status: "pending", notification_status: "sent" } });
});
afterEach(cleanup);

async function fill() {
  const user = userEvent.setup();
  render(<BookingForm />);
  await screen.findByRole("option", { name: "Consultation" });
  await user.selectOptions(screen.getByLabelText("Service"), serviceId);
  await user.type(screen.getByLabelText("Your name"), "Test Visitor");
  await user.type(screen.getByLabelText("Email address"), "test@example.invalid");
  const date = new Date();
  date.setDate(date.getDate() + 1);
  fireEvent.change(screen.getByLabelText("Appointment date"), { target: { value: date.toISOString().slice(0, 10) } });
  await user.click(await screen.findByRole("button", { name: "10:00" }));
  return user;
}

it("uses only safe RPCs and controlled booking endpoint", async () => {
  const user = await fill();
  await user.click(screen.getByRole("button", { name: "Book Appointment" }));
  await screen.findByText(/Consultation request received/);
  expect(api.from).not.toHaveBeenCalled();
  expect(api.rpc.mock.calls.map(([name]) => name)).toEqual(["get_public_services", "get_booking_slots"]);
  expect(api.invoke).toHaveBeenCalledWith("create-booking", { body: expect.objectContaining({
    request_id: expect.any(String), service_id: serviceId, customer_email: "test@example.invalid", booking_time: "10:00",
  }) });
  expect(api.invoke.mock.calls[0][1].body).not.toHaveProperty("status");
});

it("reuses the idempotency request ID after an uncertain network outcome", async () => {
  api.invoke.mockResolvedValueOnce({ data: null, error: new Error("Network failed") });
  const user = await fill();
  await user.click(screen.getByRole("button", { name: "Book Appointment" }));
  await screen.findByText(/could not confirm the booking/);
  await user.click(screen.getByRole("button", { name: "Book Appointment" }));
  await screen.findByText(/Consultation request received/);
  expect(api.invoke.mock.calls[0][1].body.request_id).toBe(api.invoke.mock.calls[1][1].body.request_id);
});

it("treats committed booking with delayed mail as success", async () => {
  api.invoke.mockResolvedValue({ data: { booking_id: "test-booking", status: "pending", notification_status: "pending" }, error: null });
  const user = await fill();
  await user.click(screen.getByRole("button", { name: "Book Appointment" }));
  await screen.findByText(/Your request email is pending/);
  expect(screen.getByLabelText("Email address").value).toBe("");
  expect(api.invoke).toHaveBeenCalledOnce();
});

it("refreshes free slots after a conflict and clears the old selection", async () => {
  api.invoke.mockResolvedValue({ data: null, error: { context: { json: async () => ({ error: "booking_conflict" }) } } });
  const user = await fill();
  api.rpc.mockResolvedValue({ data: [{ booking_time: "11:00" }], error: null });
  await user.click(screen.getByRole("button", { name: "Book Appointment" }));
  await screen.findByText(/no longer available/);
  await screen.findByRole("button", { name: "11:00" });
  expect(screen.getByRole("button", { name: "Book Appointment" }).disabled).toBe(true);
  expect(screen.queryByRole("button", { name: "10:00" })).toBeNull();
});

it("does not replace the latest date's slots with a stale response", async () => {
  let resolveOld;
  api.rpc.mockImplementation((name, args) => {
    if (name === "get_public_services") return Promise.resolve({ data: [{ id: serviceId, name: "Consultation" }] });
    if (args.p_date === "2026-10-01") return new Promise((resolve) => { resolveOld = resolve; });
    return Promise.resolve({ data: [{ booking_time: "11:00" }], error: null });
  });
  render(<BookingForm />);
  fireEvent.change(screen.getByLabelText("Appointment date"), { target: { value: "2026-10-01" } });
  await waitFor(() => expect(resolveOld).toBeTypeOf("function"));
  fireEvent.change(screen.getByLabelText("Appointment date"), { target: { value: "2026-10-02" } });
  await screen.findByRole("button", { name: "11:00" });
  await act(async () => resolveOld({ data: [{ booking_time: "10:00" }], error: null }));
  expect(screen.queryByRole("button", { name: "10:00" })).toBeNull();
});

it("fails closed when slots cannot be loaded", async () => {
  api.rpc.mockImplementation(async (name) => name === "get_public_services"
    ? { data: [{ id: serviceId, name: "Consultation" }], error: null }
    : { data: null, error: new Error("unavailable") });
  render(<BookingForm />);
  fireEvent.change(screen.getByLabelText("Appointment date"), { target: { value: "2026-10-01" } });
  await screen.findByText(/Availability could not be loaded/);
  expect(screen.getByRole("button", { name: "Book Appointment" }).disabled).toBe(true);
  expect(api.invoke).not.toHaveBeenCalled();
});
