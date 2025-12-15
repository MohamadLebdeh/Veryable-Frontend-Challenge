import { parseShiftDate } from "../src/utils/dates";

describe("parseShiftDate", () => {
	it("rebases 1970 placeholder dates to today preserving time", () => {
		const input = "1970-01-01T13:45:00.000Z";
		const parsed = parseShiftDate(input);
		const now = new Date();

		expect(parsed.getFullYear()).toBe(now.getFullYear());
		expect(parsed.getMonth()).toBe(now.getMonth());
		expect(parsed.getDate()).toBe(now.getDate());
		expect(parsed.getHours()).toBe(new Date(input).getHours());
		expect(parsed.getMinutes()).toBe(new Date(input).getMinutes());
	});

	it("returns real dates untouched", () => {
		const input = "2024-12-25T10:30:00.000Z";
		const parsed = parseShiftDate(input);
		const original = new Date(input);

		expect(parsed.toISOString()).toBe(original.toISOString());
	});
});
