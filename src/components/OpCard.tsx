import React, { useState, useMemo, useEffect } from "react";
import {
	Card,
	Box,
	Typography,
	CardContent,
	Chip,
	Stack,
	Collapse,
	IconButton,
	LinearProgress,
	useMediaQuery,
	useTheme,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Tooltip,
} from "@mui/material";
import { format, isValid as isValidDate } from "date-fns";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import GroupIcon from "@mui/icons-material/Group";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OperatorRow from "./OperatorRow";
import {
	ProcessedOp,
	AttendanceMap,
	Operator,
	AttendanceEntry,
} from "../utils/types";
import { COLORS, ATTENDANCE_STATUS } from "../utils/constants";
import { parseShiftDate } from "../utils/dates";

interface OpCardProps {
	op: ProcessedOp;
	attendance: AttendanceMap;
	onAttendanceAction: (
		opId: string,
		operatorId: string,
		action: "checkin" | "checkout",
		note?: string
	) => void;
}

const OpCard: React.FC<OpCardProps> = ({
	op,
	attendance,
	onAttendanceAction,
}) => {
	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // >1024px
	const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // 600-1024px
	const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px
	const [isExpanded, setIsExpanded] = useState(true);
	const [activeOperator, setActiveOperator] = useState<Operator | null>(null);
	const [nowTick, setNowTick] = useState(() => Date.now());
	const [confirmAction, setConfirmAction] = useState<
		null | "checkout" | "checkin"
	>(null);
	const [noteText, setNoteText] = useState("");
	const collapseId = `op-${op.opId}-content`;

	useEffect(() => {
		const id = setInterval(() => setNowTick(Date.now()), 30_000);
		return () => clearInterval(id);
	}, []);

	const formatDuration = (ms: number) => {
		if (ms <= 0 || Number.isNaN(ms)) return "0 min";
		const totalMinutes = Math.floor(ms / 60000);
		const totalHours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		const parts = [];
		if (totalHours > 0) {
			parts.push(`${totalHours} hr${totalHours === 1 ? "" : "s"}`);
		}
		parts.push(`${minutes} min`);
		return parts.join(" ");
	};

	const computeDurations = (entry?: AttendanceEntry) => {
		if (!entry?.checkInAt) {
			return { workMs: 0 };
		}
		const startMs = new Date(entry.checkInAt).getTime();
		if (Number.isNaN(startMs)) return { workMs: 0 };
		const nowMs = nowTick;
		const endMs = entry.checkOutAt
			? new Date(entry.checkOutAt).getTime()
			: nowMs;
		const validEndMs = Number.isNaN(endMs) ? nowMs : endMs;
		const workMs = Math.max(validEndMs - startMs, 0);
		return { workMs };
	};

	const visibleOperators = op.visibleOperators ?? op.operators;
	const totalAssignedOverall = op.totalOperators ?? op.operators.length;
	const totalNeeded = op.operatorsNeeded;

	const isPresent = (status?: string | null) => status === ATTENDANCE_STATUS.IN;

	const checkedInOverall = useMemo(() => {
		return op.operators.filter((operator: Operator) =>
			isPresent(attendance[`${op.opId}_${operator.id}`]?.status)
		).length;
	}, [op.operators, op.opId, attendance]);

	const progressPercentage =
		totalNeeded > 0 ? Math.min((checkedInOverall / totalNeeded) * 100, 100) : 0;
	const filledQuantity = op.filledQuantity ?? totalAssignedOverall;
	const unfilledCount = Math.max(totalNeeded - filledQuantity, 0);

	const start = parseShiftDate(op.startTime);
	const end = parseShiftDate(op.endTime);

	// Always show the actual date
	const opDateLabel = isValidDate(start) ? format(start, "MMM d, yyyy") : "";
	const shiftStartLabel = isValidDate(start) ? format(start, "h:mm a") : null;
	const shiftEndLabel = isValidDate(end) ? format(end, "h:mm a") : null;

	const handleAction = (action: "checkin" | "checkout", operatorOverride?: Operator) => {
		const targetOperator = operatorOverride ?? activeOperator;
		if (!targetOperator) return;
		onAttendanceAction(
			op.opId,
			targetOperator.id,
			action,
			noteText || undefined
		);
		setActiveOperator(null);
		setConfirmAction(null);
		setNoteText("");
	};

	const handleCloseDialog = () => {
		setActiveOperator(null);
		setConfirmAction(null);
		setNoteText("");
	};

	const handleOperatorAction = (
		operator: Operator,
		action: "checkin" | "checkout"
	) => {
		setActiveOperator(operator);
		setNoteText("");
		setConfirmAction(action);
	};

	const activeAttendanceKey = activeOperator
		? `${op.opId}_${activeOperator.id}`
		: null;
	const activeAttendance = activeAttendanceKey
		? attendance[activeAttendanceKey]
		: undefined;
	const { workMs: activeWorkMs } = computeDurations(activeAttendance);
	return (
		<Card
			elevation={0}
			sx={{
				border: "1px solid",
				borderColor: COLORS.border,
				borderRadius: 4,
				overflow: "hidden",
				bgcolor: COLORS.cardBg,
				boxShadow:
					"0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
				mb: 4,
				position: "relative",
			}}>
			{/* Collapse Icon - Top Right */}
			<IconButton
				onClick={() => setIsExpanded(!isExpanded)}
				aria-expanded={isExpanded}
				aria-label={
					isExpanded ? "Collapse shift details" : "Expand shift details"
				}
				aria-controls={collapseId}
				size='small'
				sx={{
					position: "absolute",
					top: 12,
					right: 12,
					color: COLORS.textLight,
					zIndex: 1,
					"&:hover": {
						bgcolor: "rgba(0,0,0,0.04)",
					},
				}}>
				{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
			</IconButton>
			{/* Header Section */}
			<Box
				sx={{
					p: isMobile ? 2 : isTablet ? 2.5 : 3,
					borderBottom: `1px solid ${COLORS.border}`,
					bgcolor: "#ffffff",
					display: "flex",
					flexDirection: isDesktop ? "row" : "column",
					justifyContent: isDesktop ? "space-between" : "flex-start",
					alignItems: isDesktop ? "center" : "stretch",
					gap: isMobile ? 1.5 : 2,
				}}>
				{/* Left Side - Title & Metadata */}
				<Box sx={{ flex: 1, width: "100%" }}>
					<Typography
						variant='h6'
						fontWeight='700'
						sx={{
							color: COLORS.textDark,
							letterSpacing: "-0.01em",
							fontSize: isMobile ? "1rem" : { xs: "1.1rem", md: "1.25rem" },
							mb: isMobile ? 1 : 1.5,
						}}>
						{op.opTitle}
					</Typography>
					<Stack
						direction='row'
						spacing={isMobile ? 1 : 1.25}
						alignItems='center'
						flexWrap='wrap'
						sx={{ mb: isMobile ? 1 : 1.25, rowGap: 0.75 }}>
						<Chip
							label={`ID: ${op.publicId}`}
							size='small'
							sx={{
								bgcolor: "#eff6ff",
								color: COLORS.primary,
								fontWeight: 700,
								fontSize: "0.7rem",
								borderRadius: 1,
								height: 22,
							}}
						/>

						<Typography
							variant='caption'
							fontWeight='700'
							sx={{ fontSize: "0.75rem", color: COLORS.textDark }}>
							Operators Needed: {totalNeeded}
						</Typography>

						<Box
							display='flex'
							alignItems='center'
							gap={0.5}
							sx={{ color: COLORS.textLight }}>
							<GroupIcon sx={{ fontSize: 16 }} />
							<Typography
								variant='caption'
								fontWeight='700'
								sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
								{checkedInOverall}/{totalNeeded} checked in
							</Typography>
						</Box>

						{unfilledCount > 0 && (
							<Tooltip
								placement='top'
								title={`Missing ${unfilledCount} operator${
									unfilledCount === 1 ? "" : "s"
								} to hit the needed headcount for this shift.`}>
								<Chip
									icon={<InfoOutlinedIcon fontSize='small' />}
									label={`${unfilledCount} UNFILLED`}
									size='small'
									sx={{
										bgcolor: "#fff7ed",
										color: "#9a3412",
										fontWeight: 800,
										fontSize: "0.65rem",
										height: 22,
										border: "1px solid #ffedd5",
										textTransform: "uppercase",
										cursor: "help",
										"& .MuiChip-icon": { color: "#9a3412", ml: 0.25 },
									}}
								/>
							</Tooltip>
						)}
					</Stack>
					{/* Progress Bar */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<LinearProgress
							variant='determinate'
							value={Math.min(progressPercentage, 100)}
							aria-label={`${checkedInOverall} out of ${totalNeeded} needed operators checked in`}
							sx={{
								flex: 1,
								height: 6,
								borderRadius: 4,
								bgcolor: "#e2e8f0",
								"& .MuiLinearProgress-bar": {
									bgcolor:
										progressPercentage >= 100
											? COLORS.success
											: progressPercentage >= 75
											? COLORS.primary
											: COLORS.warning,
									borderRadius: 4,
								},
							}}
						/>
						<Typography
							variant='caption'
							fontWeight='600'
							sx={{
								fontSize: "0.7rem",
								color:
									progressPercentage >= 100 ? COLORS.success : COLORS.textLight,
								minWidth: 35,
								textAlign: "right",
							}}>
							{Math.round(progressPercentage)}%
						</Typography>
					</Box>
				</Box>

				{/* Right Side - Time Badge */}
				<Box
					display='flex'
					alignItems='center'
					gap={isMobile ? 0.75 : isTablet ? 0.9 : 1}
					sx={{
						bgcolor: "#f1f5f9",
						color: "#334155",
						py: isMobile ? 0.75 : isTablet ? 0.9 : 1,
						px: isMobile ? 1.5 : isTablet ? 2 : 2.5,
						borderRadius: 3,
						border: `1px solid ${COLORS.border}`,
						minWidth: isDesktop ? "fit-content" : "100%",
						flexShrink: 0,
						width: isDesktop ? "auto" : "100%",
						justifyContent: "flex-start",
					}}>
					<AccessTimeFilledIcon
						sx={{ fontSize: isMobile ? 14 : 16, color: "#64748b" }}
					/>
					<Typography
						variant='body2'
						fontWeight='600'
						suppressHydrationWarning
						sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}>
						{opDateLabel} • {isValidDate(start) ? format(start, "h:mm a") : "--:--"} -{" "}
						{isValidDate(end) ? format(end, "h:mm a") : "--:--"}
					</Typography>
				</Box>
			</Box>

			{/* Collapsible Rows */}
			<Collapse in={isExpanded} timeout='auto' unmountOnExit id={collapseId}>
				{visibleOperators.length !== totalAssignedOverall && (
					<Box
						sx={{
							px: 3,
							py: 1,
							bgcolor: "#f8fafc",
							borderBottom: `1px solid ${COLORS.border}`,
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}>
						<SearchIcon sx={{ fontSize: 14, color: COLORS.textLight }} />
						<Typography variant='caption' color='text.secondary'>
							Showing {visibleOperators.length} of {totalAssignedOverall}{" "}
							operators
						</Typography>
					</Box>
				)}
				<CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
					{visibleOperators.map((operator: Operator, index: number) => {
						const key = `${op.opId}_${operator.id}`;
						const entry = attendance[key];
						return (
							<OperatorRow
								key={operator.id}
								index={index}
								operator={operator}
								status={entry?.status}
								onToggle={(action) => handleOperatorAction(operator, action)}
								isLast={index === visibleOperators.length - 1}
							/>
						);
					})}
				</CardContent>
			</Collapse>

			<Dialog
				open={Boolean(activeOperator)}
				onClose={handleCloseDialog}
				fullWidth
				maxWidth='xs'>
				<DialogTitle sx={{ fontWeight: 700, color: COLORS.textDark }}>
					{confirmAction === "checkout"
						? `Clock Out at ${format(new Date(nowTick), "h:mma")}`
						: `Clock In at ${format(new Date(nowTick), "h:mma")}`}
				</DialogTitle>
				<Box
					sx={{ borderBottom: `1px solid ${COLORS.border}`, mx: 3, mb: 1 }}
				/>
				<DialogContent
					sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
					{confirmAction === "checkout" && (
						<Typography variant='body2' color={COLORS.textDark}>
							{shiftEndLabel && (
								<>
									Your shift ends at{" "}
									<Typography
										component='span'
										fontWeight={700}
										color={COLORS.textDark}>
										{shiftEndLabel}
									</Typography>
									. <br />
								</>
							)}
							You have been working for{" "}
							<Typography
								component='span'
								fontWeight={700}
								color={COLORS.textDark}>
								{formatDuration(activeWorkMs)}
							</Typography>
							. Clock out now?
						</Typography>
					)}
					{confirmAction === "checkin" && (
						<Typography variant='body2' color={COLORS.textDark}>
							{shiftStartLabel ? (
								<>
									Your shift starts at{" "}
									<Typography
										component='span'
										fontWeight={700}
										color={COLORS.textDark}>
										{shiftStartLabel}
									</Typography>
									.{" "}
								</>
							) : null}
							Clock in now?
						</Typography>
					)}
					<TextField
						fullWidth
						multiline
						rows={2}
						placeholder='Add a note (optional)'
						value={noteText}
						onChange={(e) => setNoteText(e.target.value)}
						variant='outlined'
						sx={{
							mt: 1,
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
								bgcolor: "#f8fafc",
								fontSize: "0.875rem",
							},
						}}
					/>
				</DialogContent>
				<DialogActions
					sx={{
						px: 0,
						pb: 0,
						flexDirection: "column",
						alignItems: "stretch",
					}}>
					<Box
						sx={{
							px: 3,
							pb: 2,
							display: "flex",
							flexDirection: "column",
							gap: 1,
						}}>
						{confirmAction === "checkout" && (
							<Button
								variant='contained'
								color='primary'
								onClick={() => handleAction("checkout")}
								fullWidth
								sx={{ height: 48, borderRadius: 2, fontWeight: 700 }}>
								Clock Out
							</Button>
						)}
						{confirmAction === "checkin" && (
							<Button
								variant='contained'
								color='primary'
								onClick={() => handleAction("checkin")}
								fullWidth
								sx={{
									height: 48,
									borderRadius: 2,
									fontWeight: 700,
									width: "100%",
									px: 0,
								}}>
								Clock In
							</Button>
						)}
						{!confirmAction &&
							(!activeAttendance ||
								activeAttendance.status === ATTENDANCE_STATUS.OUT) && (
								<Button
									variant='contained'
									color='primary'
									onClick={() => {
										setConfirmAction("checkin");
										if (activeOperator === null) return;
										setActiveOperator(activeOperator);
									}}
									fullWidth
									sx={{
										height: 48,
										borderRadius: 2,
										fontWeight: 700,
										width: "100%",
										px: 0,
									}}>
									Clock In
								</Button>
							)}
						<Button
							onClick={handleCloseDialog}
							variant='contained'
							disableElevation
							color='inherit'
							fullWidth
							sx={{
								height: 48,
								borderRadius: 2,
								fontWeight: 700,
								width: "100%",
								px: 0,
								bgcolor: "#f8fafc",
								color: COLORS.textDark,
								border: `1px solid ${COLORS.border}`,
								boxShadow: "none",
							}}>
							Cancel
						</Button>
					</Box>
				</DialogActions>
			</Dialog>
		</Card>
	);
};

export default OpCard;
