import { useState, useCallback, useEffect } from "react";
import { formatISO, format } from "date-fns";
import { STORAGE_KEY, ATTENDANCE_STATUS } from "../utils/constants";
import { AttendanceMap, AttendanceEntry } from "../utils/types";

const getStorageKeyForToday = () =>
	`${STORAGE_KEY}_${format(new Date(), "yyyy-MM-dd")}`;

const cleanOldKeys = () => {
	if (typeof window === "undefined") return;
	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith(STORAGE_KEY) && key !== getStorageKeyForToday()) {
			localStorage.removeItem(key);
		}
	});
};

// Hydrate once from localStorage; avoids an extra render after mount.
const getInitialAttendance = (): AttendanceMap => {
	if (typeof window === "undefined") return {};

	const storageKey = getStorageKeyForToday();

	try {
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed === "object") {
				return parsed;
			}
		}
	} catch (error) {
		console.error("Failed to hydrate attendance from storage", error);
	}

	return {};
};

export const useAttendance = () => {
	const [attendance, setAttendance] =
		useState<AttendanceMap>(getInitialAttendance);

	const persistState = (nextState: AttendanceMap) => {
		try {
			if (typeof window !== "undefined") {
				localStorage.setItem(getStorageKeyForToday(), JSON.stringify(nextState));
			}
		} catch (error) {
			console.error("Could not persist attendance", error);
		}
	};

	const performAttendanceAction = useCallback(
		(opId: string, operatorId: string, action: "checkin" | "checkout", note?: string) => {
			setAttendance((prev) => {
				const key = `${opId}_${operatorId}`;
				const currentEntry: AttendanceEntry = prev[key] || { status: ATTENDANCE_STATUS.OUT };
				const now = formatISO(new Date());

				let nextEntry: AttendanceEntry = { ...currentEntry };

				switch (action) {
					case "checkin":
						nextEntry = {
							...currentEntry,
							status: ATTENDANCE_STATUS.IN,
							checkInAt: now,
							checkOutAt: undefined,
							checkInNote: note,
						};
						break;
					case "checkout":
						nextEntry = {
							...currentEntry,
							status: ATTENDANCE_STATUS.OUT,
							checkOutAt: now,
							checkOutNote: note,
						};
						break;
					default:
						return prev;
				}

				const newState: AttendanceMap = { ...prev, [key]: nextEntry };
				persistState(newState);
				return newState;
			});
		},
		[]
	);

	// Keep tabs in sync and avoid stale data when the date changes in another tab.
	useEffect(() => {
		if (typeof window === "undefined") return;

		cleanOldKeys();

		const handleStorage = (event: StorageEvent) => {
			if (event.key === getStorageKeyForToday()) {
				try {
					const parsed = event.newValue ? JSON.parse(event.newValue) : {};
					setAttendance(parsed);
				} catch (error) {
					console.error("Failed to sync attendance from another tab", error);
				}
			}
		};

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	return { attendance, performAttendanceAction };
};
