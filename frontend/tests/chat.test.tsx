import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FloatingChat from "@/components/FloatingChat";

it("opens chat panel from floating bubble", async () => {
  const user = userEvent.setup();
  render(<FloatingChat messages={[]} loading={false} onSend={() => {}} />);
  await user.click(screen.getByRole("button", { name: /open chat/i }));
  expect(screen.getByText(/assistant/i)).toBeInTheDocument();
});

it("shows assistant scope and retries the last failed message", async () => {
  const user = userEvent.setup();
  const onSend = vi.fn();
  render(<FloatingChat messages={[]} loading={false} onSend={onSend} failedMessage="Check my APS risk" />);

  await user.click(screen.getByRole("button", { name: /open chat/i }));

  expect(screen.getByText(/uses only tracker data/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /retry last message/i }));
  expect(onSend).toHaveBeenCalledWith("Check my APS risk");
});
