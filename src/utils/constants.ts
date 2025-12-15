export const API_ENDPOINT = "https://frontend-challenge.veryableops.com/";
export const STORAGE_KEY = "veryable_attendance_v1";

// Color palette
export const COLORS = {
	background: "#f8fafc", // Slate-50
	primary: "#4f46e5", // Indigo-600
	primaryHover: "#4338ca",
	secondary: "#64748b", // Slate-500
	success: "#10b981", // Emerald-500
	warning: "#f59e0b", // Amber-500
	danger: "#ef4444", // Red-500
	textDark: "#1e293b", // Slate-800
	textLight: "#94a3b8", // Slate-400
	cardBg: "#ffffff",
	border: "#e2e8f0", // Slate-200
};

export const SORT_OPTIONS = {
	NAME: "lastName",
	OPS: "opsCompleted",
	RELIABILITY: "reliability",
};

export const ATTENDANCE_STATUS = {
	IN: "Checked In",
	OUT: "Checked Out",
};

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
export type AttendanceStatus =
	(typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];
