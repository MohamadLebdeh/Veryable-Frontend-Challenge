"use client";

import React from "react";
import {
	Typography,
	Box,
	Chip,
	Button,
	Divider,
	Avatar,
	LinearProgress,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ATTENDANCE_STATUS, COLORS } from "../utils/constants";
import { Operator } from "../utils/types";

interface OperatorRowProps {
	operator: Operator;
	status: string | null | undefined;
	onToggle: (action: "checkin" | "checkout") => void;
	isLast: boolean;
	index: number;
}

const OperatorRow: React.FC<OperatorRowProps> = ({
	operator,
	status,
	onToggle,
	isLast,
	index,
}) => {
	const theme = useTheme();
	const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // 600-1024px
	const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px

	const isCheckedIn = status === ATTENDANCE_STATUS.IN;
	const reliabilityScore = Math.round(operator.reliability * 100);
	const reliabilityColor =
		reliabilityScore >= 90
			? COLORS.success
			: reliabilityScore >= 70
			? COLORS.warning
			: COLORS.danger;
	const visibleEndorsements = operator.endorsements;
	const actionLabel = isCheckedIn
		? "Check Out"
		: "Check In";

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05, duration: 0.3 }}>
			<Box sx={{ position: "relative", overflow: "hidden" }}>
				{/* Active Indicator Strip on the left */}
				<Box
					sx={{
						position: "absolute",
						left: 0,
						top: 0,
						bottom: 0,
						width: 4,
						bgcolor: isCheckedIn
							? COLORS.success
							: "transparent",
						transition: "background-color 0.3s ease",
					}}
				/>

				<Box
					sx={{
						display: "flex",
						flexDirection: isMobile ? "column" : "row",
						alignItems: isMobile ? "stretch" : "center",
						px: isMobile ? 2 : isTablet ? 2 : 3,
						py: isMobile ? 2 : isTablet ? 2 : 2.5,
						transition: "all 0.2s ease",
						bgcolor: "white",
						"&:hover": {
							bgcolor: "#f8fafc",
						},
						gap: isMobile ? 2 : 0,
					}}>
					{/* User Profile */}
					<Box
						sx={{
							flex: isMobile
								? "1 1 100%"
								: isTablet
								? "0 0 45%" // Changed from 50% to 45%
								: "0 0 45%",
							display: "flex",
							alignItems: "flex-start",
							gap: isMobile ? 1.5 : 2,
							pr: isMobile ? 0 : isTablet ? 1 : 2,
						}}>
						<Avatar
							sx={{
								bgcolor: isCheckedIn
									? "#eff6ff"
									: "#f1f5f9",
								color: isCheckedIn
									? COLORS.primary
									: "#64748b",
								width: isMobile ? 40 : 44,
								height: isMobile ? 40 : 44,
								fontWeight: "bold",
								fontSize: isMobile ? "0.9rem" : "1rem",
								border: "1px solid",
								borderColor: isCheckedIn
									? "#bfdbfe"
									: "transparent",
							}}>
							{operator.firstName[0]}
							{operator.lastName[0]}
						</Avatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography
								variant={isMobile ? "subtitle2" : "body1"}
								fontWeight='600'
								color={COLORS.textDark}
								sx={{
									fontSize: isMobile
										? "0.875rem"
										: isTablet
										? "0.9rem"
										: "0.95rem",
									mb: 0.75,
								}}>
								{operator.firstName} {operator.lastName}
							</Typography>
							{/* Endorsements - Tablet shows only first with counter */}
							<Box
								sx={{
									display: "flex",
									gap: 0.5,
									flexWrap: "wrap",
									alignItems: "center",
								}}
								role='list'
								aria-label='Endorsements'>
								{visibleEndorsements.map((endorsement: string, i: number) => (
									<Chip
										key={i}
										label={endorsement}
										size='small'
										role='listitem'
										sx={{
											fontSize: "0.65rem",
											height: 20,
											bgcolor: "white",
											border: `1px solid ${COLORS.border}`,
											color: COLORS.secondary,
											borderRadius: 1,
											fontWeight: 500,
											px: 0.5,
										}}
									/>
								))}
							</Box>
						</Box>
					</Box>

					{/* Performance Metrics */}
					<Box
						sx={{
							flex: isMobile ? "1 1 100%" : isTablet ? "0 0 30%" : "0 0 35%",
							px: isMobile ? 0 : isTablet ? 1 : 2,
							order: isMobile ? 3 : 2,
							textAlign: isMobile ? "center" : "left",
						}}>
						<Box
							display='flex'
							justifyContent={isMobile ? "center" : "space-between"}
							alignItems='center'
							gap={isMobile ? 1 : 0}
							mb={0.75}>
							<Typography
								variant='caption'
								color={COLORS.textLight}
								fontWeight='500'
								sx={{ fontSize: "0.7rem" }}
								aria-label='Reliability'>
								Reliability
							</Typography>
							<Typography
								variant='caption'
								fontWeight='700'
								color={reliabilityColor}
								sx={{ fontSize: "0.7rem" }}
								aria-label={`${reliabilityScore} percent reliable`}>
								{reliabilityScore}%
							</Typography>
						</Box>
						<LinearProgress
							variant='determinate'
							value={reliabilityScore}
							aria-label={`Reliability: ${reliabilityScore}%`}
							sx={{
								height: 6,
								borderRadius: 4,
								bgcolor: "#e2e8f0",
								"& .MuiLinearProgress-bar": {
									bgcolor: reliabilityColor,
									borderRadius: 4,
								},
							}}
						/>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{
								mt: 0.75,
								display: "block",
								fontSize: "0.65rem",
								fontWeight: 400,
							}}
							aria-label={`${operator.opsCompleted} operations completed`}>
							{operator.opsCompleted} Ops Completed
						</Typography>
					</Box>

					{/* Action Button */}
					<Box
						sx={{
							flex: isMobile ? "1 1 100%" : isTablet ? "0 0 25%" : "0 0 20%",
							display: "flex",
							justifyContent: isMobile ? "stretch" : "flex-end",
							minWidth: isMobile ? "auto" : 140,
							order: isMobile ? 2 : 3,
						}}>
						{/* Button */}
						<Button
							variant={isCheckedIn ? "outlined" : "contained"}
							onClick={() => {
								onToggle(isCheckedIn ? "checkout" : "checkin");
							}}
							disableElevation
							fullWidth={isMobile}
							startIcon={isCheckedIn ? null : <CheckCircleIcon />}
							aria-label={
								isCheckedIn
									? `Check out ${operator.firstName} ${operator.lastName}`
									: `Check in ${operator.firstName} ${operator.lastName}`
							}
							sx={{
								borderRadius: "8px",
								textTransform: "none",
								fontWeight: 700,
								fontSize: isMobile ? "0.8125rem" : "0.875rem",
								height: isMobile ? 44 : 40,
								minWidth: isMobile ? "100%" : 120,
								transition: "all 0.2s ease",

								...(isCheckedIn && {
									bgcolor: "#fee2e2",
									borderColor: "#fca5a5",
									color: "#b91c1c",
									"&:hover": {
										bgcolor: "#fecdd3",
										borderColor: "#f87171",
										color: "#991b1b",
									},
								}),

								...(!isCheckedIn && {
									bgcolor: COLORS.primary,
									color: "white",
									boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
									"&:hover": {
										bgcolor: COLORS.primaryHover,
										boxShadow: "0 6px 8px -1px rgba(79, 70, 229, 0.3)",
									},
								}),
							}}>
							{actionLabel}
						</Button>
					</Box>
				</Box>
				{!isLast && <Divider sx={{ borderColor: "#f1f5f9" }} />}
			</Box>
		</motion.div>
	);
};

// Remove memo - it prevents re-rendering when attendance status changes
export default OperatorRow;
