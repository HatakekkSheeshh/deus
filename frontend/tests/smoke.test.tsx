import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

it("renders the application title", () => {
  render(<Page />);
  expect(screen.getByText("German Master Application Tracker")).toBeInTheDocument();
});
