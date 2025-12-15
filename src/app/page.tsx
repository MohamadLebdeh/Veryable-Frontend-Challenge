"use client";

import React, { useState, useMemo } from "react";
import {
	Container,
	Typography,
	Stack,
	CircularProgress,
	Box,
	Alert,
	TextField,
	MenuItem,
	Select,
	FormControl,
	Paper,
	InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { ProcessedOp } from "../utils/types";

import { useVeryableData } from "../hooks/useVeryableData";
import { useAttendance } from "../hooks/useAttendance";
import { SORT_OPTIONS, COLORS } from "../utils/constants";
import OpCard from "../components/OpCard";

export default function VeryableDashboard() {
	const { loading, error, getProcessedData } = useVeryableData();
	const { attendance, performAttendanceAction } = useAttendance();
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);

	// Memoize to prevent re-creating the array on every render (e.g., when attendance changes)
	const visibleOps = useMemo<ProcessedOp[]>(() => {
		return getProcessedData(searchTerm, sortBy);
	}, [getProcessedData, searchTerm, sortBy]);

	if (loading)
		return (
			<Box
				display='flex'
				flexDirection='column'
				justifyContent='center'
				alignItems='center'
				minHeight='100vh'
				bgcolor={COLORS.background}
				gap={2}>
				<CircularProgress sx={{ color: COLORS.primary }} size={48} />
				<Typography variant='body1' color={COLORS.textLight} fontWeight={500}>
					Loading operations...
				</Typography>
			</Box>
		);

	if (error)
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='100vh'
				bgcolor={COLORS.background}>
				<Container maxWidth='sm'>
					<Alert
						severity='error'
						sx={{
							borderRadius: 3,
							boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
						}}>
						<Typography variant='h6' fontWeight={600} sx={{ mb: 1 }}>
							Couldn’t reach the ops service
						</Typography>
						<Typography variant='body2' sx={{ mb: 1 }}>
							{error || "Check your connection and try again."}
						</Typography>
					</Alert>
				</Container>
			</Box>
		);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: COLORS.background,
				pb: 10,
				backgroundImage:
					"linear-gradient(180deg, #f8fafc 0%, #f4f6fb 50%, #eef2f6 100%)",
			}}>
			{/* Hero Header */}
			<Box
				sx={{
					bgcolor: "#ffffff",
					pt: 6,
					pb: 5,
					px: 2,
					borderBottom: `1px solid ${COLORS.border}`,
					boxShadow: "0 8px 24px -18px rgba(15, 23, 42, 0.35)",
				}}>
				<Container maxWidth='md'>
					<Typography
						variant='overline'
						color={COLORS.primary}
						fontWeight='bold'
						letterSpacing={1.2}>
						Veryable Ops
					</Typography>
					<Typography
						variant='h3'
						component='h1'
						fontWeight='800'
						sx={{ color: COLORS.textDark, mt: 1, letterSpacing: "-0.01em" }}>
						Daily Command Center
					</Typography>
					<Typography
						variant='body1'
						color={COLORS.textLight}
						sx={{ mt: 2, maxWidth: 520 }}>
						Review today’s shifts, confirm check-ins, and keep operators moving
						without jumping tabs.
					</Typography>
				</Container>
			</Box>

			{/* Floating Controls & Content */}
			<Container maxWidth='md' sx={{ mt: -4 }}>
				{/* The Control Bar */}
				<Paper
					elevation={0}
					sx={{
						p: { xs: 2, sm: 2.5 },
						mb: 4,
						borderRadius: 16,
						bgcolor: "#ffffff",
						border: `1px solid #e5e7eb`,
						boxShadow: "0 10px 30px -24px rgba(15,23,42,0.25)",
					}}>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<TextField
							fullWidth
							placeholder='Search Ops, IDs, or Operators...'
							variant='outlined'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<SearchIcon sx={{ color: COLORS.textLight }} />
									</InputAdornment>
								),
								sx: {
									borderRadius: 2,
									bgcolor: "white",
									color: COLORS.textDark,
									"& .MuiInputBase-input": { color: COLORS.textDark },
									"& fieldset": { border: "1px solid #e2e8f0" },
									"&:hover fieldset": { borderColor: "#cbd5e1" },
								},
							}}
						/>
						<FormControl sx={{ minWidth: 200 }}>
							<Select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								displayEmpty
								IconComponent={SortIcon}
								sx={{
									borderRadius: 2,
									bgcolor: "white",
									"& fieldset": { border: "1px solid #e2e8f0" },
									"&:hover fieldset": { borderColor: "#cbd5e1" },
									color: COLORS.textDark,
									fontWeight: 600,
								}}>
								<MenuItem value={SORT_OPTIONS.NAME}>Sort: Name (A–Z)</MenuItem>
								<MenuItem value={SORT_OPTIONS.OPS}>
									Sort: Ops Completed
								</MenuItem>
								<MenuItem value={SORT_OPTIONS.RELIABILITY}>
									Sort: Reliability
								</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</Paper>

				{/* List */}
				<Stack spacing={3}>
					{visibleOps.length === 0 ? (
						<Box textAlign='center' py={10}>
							<Typography variant='h6' color={COLORS.textLight}>
								Nothing matches your search.
							</Typography>
							<Typography variant='body2' color={COLORS.textLight}>
								Try a different operator name, op title, or ID.
							</Typography>
						</Box>
					) : (
						visibleOps.map((op) => (
							<OpCard
								key={op.opId}
								op={op}
								attendance={attendance}
								onAttendanceAction={performAttendanceAction}
							/>
						))
					)}
				</Stack>
			</Container>
		</Box>
	);
}
