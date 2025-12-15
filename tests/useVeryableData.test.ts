import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useVeryableData } from "../src/hooks/useVeryableData";
import { SORT_OPTIONS } from "../src/utils/constants";
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

describe("useVeryableData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		global.fetch = originalFetch;
	});

	it("sorts ops by start time ascending", async () => {
		mockFetch();
		const { result } = renderHook(() => useVeryableData());

		await waitFor(() => expect(result.current.loading).toBe(false));

		const ops = result.current.getProcessedData("", SORT_OPTIONS.NAME);
		expect(ops[0].opId).toBe("1001000"); // 10:00 AM
		expect(ops[1].opId).toBe("1000923"); // 1:00 PM
		expect(ops[2].opId).toBe("1000885"); // 9:00 PM
	});

	it("filters by operator name when op title/id do not match", async () => {
		mockFetch();
		const { result } = renderHook(() => useVeryableData());

		await waitFor(() => expect(result.current.loading).toBe(false));
		const filtered = result.current.getProcessedData("Sarah Johnson", SORT_OPTIONS.NAME);
		expect(filtered).toHaveLength(1);
		expect(filtered[0].publicId).toBe("26-124");
		expect(filtered[0].visibleOperators).toHaveLength(1);
		expect(filtered[0].visibleOperators[0].firstName).toBe("Sarah");
	});

	it("sorts operators with stable tie-breakers", async () => {
		mockFetch();
		const { result } = renderHook(() => useVeryableData());

		await waitFor(() => expect(result.current.loading).toBe(false));
		const [tieOp] = result.current.getProcessedData("Tie Break Test", SORT_OPTIONS.NAME);
		expect(tieOp.visibleOperators.map((o) => o.id)).toEqual(["1", "2"]);
	});
});
