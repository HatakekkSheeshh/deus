import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CostBudgetView from "@/components/costs/CostBudgetView";
import DocumentLibrary from "@/components/library/DocumentLibrary";
import { initialState } from "@/lib/reducer";

it("shows computed year-one total", () => {
  render(<CostBudgetView costs={initialState.costs} readOnly={false} onChange={() => {}} />);
  expect(screen.getByText(/13,824/)).toBeInTheDocument();
});

it("disables cost inputs in read-only mode", () => {
  render(<CostBudgetView costs={initialState.costs} readOnly onChange={() => {}} />);
  expect(screen.getAllByRole("spinbutton")[0]).toBeDisabled();
});

it("adds dropped supporting files to the library", () => {
  const dispatch = vi.fn();
  const file = new File(["hello"], "motivation.pdf", { type: "application/pdf" });
  vi.stubGlobal("URL", { createObjectURL: () => "blob:motivation" });

  render(<DocumentLibrary files={initialState.libraryFiles} otherFiles={[]} readOnly={false} dispatch={dispatch} />);
  fireEvent.drop(screen.getByLabelText(/other files dropzone/i), {
    dataTransfer: { files: [file] }
  });

  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
    type: "add-library-file",
    file: expect.objectContaining({ category: "other", fileName: "motivation.pdf" })
  }));
  vi.unstubAllGlobals();
});

it("requires confirmation before removing a library file", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  render(<DocumentLibrary files={initialState.libraryFiles} otherFiles={[]} readOnly={false} dispatch={dispatch} />);

  await user.click(screen.getByRole("button", { name: /remove german a1 certificate/i }));
  expect(dispatch).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: /confirm remove german a1 certificate/i }));
  expect(dispatch).toHaveBeenCalledWith({ type: "remove-library-file", id: "german-a1" });
});
