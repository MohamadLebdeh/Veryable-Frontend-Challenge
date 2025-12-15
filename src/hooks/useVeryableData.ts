import { useState, useEffect, useMemo } from "react";
import {
	API_ENDPOINT,
	SORT_OPTIONS,
	type SortOption,
} from "../utils/constants";
import {
	Op,
	Operator,
	ProcessedOp,
} from "../utils/types";
import { parseShiftDate } from "../utils/dates";

const sortOperators = (
	operators: Operator[],
	sortBy: SortOption
): Operator[] => {
	return [...operators].sort((a, b) => {
	if (sortBy === SORT_OPTIONS.NAME) {
			const nameCompare = `${a.lastName} ${a.firstName}`.localeCompare(
				`${b.lastName} ${b.firstName}`
			);
			if (nameCompare !== 0) return nameCompare;
			return `${a.id}`.localeCompare(`${b.id}`);
		}

		if (sortBy === SORT_OPTIONS.OPS) {
			const diff = b.opsCompleted - a.opsCompleted;
			if (diff !== 0) return diff;
			return `${a.id}`.localeCompare(`${b.id}`);
		}

		if (sortBy === SORT_OPTIONS.RELIABILITY) {
			const diff = b.reliability - a.reliability;
			if (diff !== 0) return diff;
			return `${a.id}`.localeCompare(`${b.id}`);
		}

		return 0;
	});
};

export const useVeryableData = () => {
	const [data, setData] = useState<Op[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController(); // Avoid setState on unmounted component.

		const fetchData = async () => {
			const maxAttempts = 3;
			const backoff = [0, 500, 1000];

			for (let attempt = 0; attempt < maxAttempts; attempt++) {
				try {
					if (attempt > 0) {
						await new Promise((res) => setTimeout(res, backoff[attempt]));
					}
					const response = await fetch(API_ENDPOINT, {
						signal: controller.signal,
					});
					if (!response.ok) {
						throw new Error(response.statusText || "Failed to load ops data");
					}
					const result: Op[] = await response.json();
					setData(result);
					setError(null);
					setLoading(false);
					return;
				} catch (err) {
					if (controller.signal.aborted) {
						return;
					}
					if (attempt === maxAttempts - 1) {
						setError(
							err instanceof Error ? err.message : "Unable to fetch ops data"
						);
					}
				}
			}
			setLoading(false);
		};

		fetchData();

		return () => {
			controller.abort();
		};
	}, []);

	const getProcessedData = useMemo(
		() =>
			(searchTerm: string, sortBy: SortOption): ProcessedOp[] => {
				if (!data.length) return [];

				const normalizedTerm = searchTerm.trim().toLowerCase();
				const shouldFilter = normalizedTerm.length > 0;

				// Single pass over ops; filter ops or operators, then sort resulting operators.
				const filtered = data
					.map((op) => {
						const opMatches =
							op.opTitle.toLowerCase().includes(normalizedTerm) ||
							op.publicId.toLowerCase().includes(normalizedTerm);

						let relevantOperators = op.operators;

						if (shouldFilter && !opMatches) {
							relevantOperators = op.operators.filter((operator) =>
								`${operator.firstName} ${operator.lastName}`
									.toLowerCase()
									.includes(normalizedTerm)
							);
						}

						if (shouldFilter && !opMatches && relevantOperators.length === 0) {
							return null;
						}

						const visibleOperators = sortOperators(relevantOperators, sortBy);
						const isFiltered =
							shouldFilter && visibleOperators.length !== op.operators.length;

						return {
							...op,
							visibleOperators,
							totalOperators: op.operators.length,
							isFiltered,
						};
					})
					.filter(Boolean) as ProcessedOp[];

				// Default sort by start time (earliest first) so AM shifts show before PM.
				return filtered.sort(
					(a: ProcessedOp, b: ProcessedOp) =>
						parseShiftDate(a.startTime).getTime() -
						parseShiftDate(b.startTime).getTime()
				);
			},
		[data]
	);

	return { loading, error, getProcessedData };
};
