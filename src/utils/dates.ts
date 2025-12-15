import { isValid, parseISO, set } from "date-fns";

// Normalize API-provided timestamps. The API returns 1970 placeholders; when
// encountered, we rebase them to today's date while preserving the time so
// sorting and validation stay consistent with what is shown in the UI.
export const parseShiftDate = (dateString: string) => {
	const parsed = parseISO(dateString);

	if (!isValid(parsed)) {
		return parsed;
	}

	if (parsed.getFullYear() === 1970) {
		const today = new Date();
		return set(today, {
			hours: parsed.getHours(),
			minutes: parsed.getMinutes(),
			seconds: parsed.getSeconds(),
			milliseconds: parsed.getMilliseconds(),
		});
	}

	return parsed;
};
