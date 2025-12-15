import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import VeryableDashboard from "../src/app/page";
import { opsFixture } from "./fixtures/ops";

const originalFetch = global.fetch;

const mockFetch = (data = opsFixture, ok = true) => {
	global.fetch = vi.fn(() =>
		Promise.resolve({
			ok,
			json: () => Promise.resolve(data),
			statusText: ok ? "OK" : "Error",
		} as Response)
	) as unknown as typeof fetch;
};

describe("VeryableDashboard page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		global.fetch = originalFetch;
	});

	it("renders ops and supports search", async () => {
		mockFetch();
		render(<VeryableDashboard />);

		await waitFor(() => expect(screen.getByText(/Ops Manager/i)).toBeInTheDocument());
		expect(screen.getByText(/Production Operator PM Shift/i)).toBeInTheDocument();

		const search = screen.getByPlaceholderText(/Search Ops/i);
		await userEvent.type(search, "Warehouse Associate");

		await waitFor(() =>
			expect(screen.queryByText(/Production Operator PM Shift/i)).not.toBeInTheDocument()
		);
		expect(screen.getByText(/Warehouse Associate AM Shift/i)).toBeInTheDocument();
	});

	it("shows error state when fetch fails", async () => {
		mockFetch([], false);
		render(<VeryableDashboard />);

		await waitFor(() => expect(screen.getByText(/Error Loading Data/i)).toBeInTheDocument());
	});
});
