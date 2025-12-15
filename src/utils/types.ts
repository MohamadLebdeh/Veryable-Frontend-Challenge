export interface Operator {
	id: string;
	firstName: string;
	lastName: string;
	opsCompleted: number;
	reliability: number;
	endorsements: string[];
}

export interface Op {
	opId: string;
	publicId: string;
	opTitle: string;
	opDate?: string;
	startTime: string;
	endTime: string;
	checkInCode?: string;
	checkOutCode?: string;
	checkInExpirationTime?: string;
	checkOutExpirationTime?: string;
	filledQuantity?: number;
	estTotalHours?: number;
	operatorsNeeded: number;
	operators: Operator[];
}

export interface AttendanceEntry {
	status: string | null | undefined;
	checkInAt?: string;
	checkOutAt?: string;
	checkInNote?: string;
	checkOutNote?: string;
}

export type AttendanceMap = Record<string, AttendanceEntry | undefined>;

// ProcessedOp augments the raw API Op with view-specific metadata so UI can
// render filtered operator subsets without losing overall context.
export interface ProcessedOp extends Op {
	// Operators that should be displayed after filtering/sorting.
	visibleOperators: Operator[];
	// Original operator count (before filtering).
	totalOperators: number;
	// Indicates whether the operators list is filtered (for staffing math/labels).
	isFiltered: boolean;
}
