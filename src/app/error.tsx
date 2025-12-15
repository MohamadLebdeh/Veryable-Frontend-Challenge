"use client";

import React from "react";
import {
	Box,
	Container,
	Typography,
	Button,
	Stack,
	Paper,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import { COLORS } from "../utils/constants";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	React.useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: COLORS.background,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				px: 2,
			}}>
			<Container maxWidth='sm'>
				<Paper
					elevation={0}
					sx={{
						p: { xs: 4, sm: 6 },
						borderRadius: 4,
						textAlign: "center",
						border: `1px solid ${COLORS.border}`,
						boxShadow:
							"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
					}}>
					{/* Error Icon */}
					<Box
						sx={{
							display: "inline-flex",
							p: 3,
							borderRadius: "50%",
							bgcolor: "#FEE2E2",
							mb: 3,
						}}>
						<ErrorOutlineIcon
							sx={{
								fontSize: 64,
								color: "#DC2626",
							}}
						/>
					</Box>

					{/* Error Title */}
					<Typography
						variant='h4'
						component='h1'
						fontWeight={700}
						sx={{ color: COLORS.textDark, mb: 2 }}>
						Something Went Wrong
					</Typography>

					{/* Error Description */}
					<Typography
						variant='body1'
						color={COLORS.textLight}
						sx={{ mb: 1, lineHeight: 1.6 }}>
						We encountered an unexpected error while processing your request.
						Don&apos;t worry, our team has been notified.
					</Typography>

					{/* Error Message (for development) */}
					{process.env.NODE_ENV === "development" && (
						<Paper
							sx={{
								mt: 3,
								p: 2,
								bgcolor: "#FEF2F2",
								border: "1px solid #FEE2E2",
								borderRadius: 2,
								textAlign: "left",
							}}>
							<Typography
								variant='caption'
								component='pre'
								sx={{
									color: "#991B1B",
									fontFamily: "monospace",
									fontSize: "0.75rem",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									m: 0,
								}}>
								{error.message}
							</Typography>
							{error.digest && (
								<Typography
									variant='caption'
									sx={{
										color: "#991B1B",
										display: "block",
										mt: 1,
										fontSize: "0.7rem",
									}}>
									Error ID: {error.digest}
								</Typography>
							)}
						</Paper>
					)}

					{/* Action Buttons */}
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={2}
						justifyContent='center'
						sx={{ mt: 4 }}>
						<Button
							variant='contained'
							startIcon={<RefreshIcon />}
							onClick={reset}
							sx={{
								bgcolor: COLORS.primary,
								color: "white",
								px: 4,
								py: 1.5,
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 600,
								fontSize: "1rem",
								boxShadow: "0 4px 12px rgba(32, 129, 195, 0.3)",
								"&:hover": {
									bgcolor: "#1D71AF",
									boxShadow: "0 6px 16px rgba(32, 129, 195, 0.4)",
								},
							}}>
							Try Again
						</Button>

						<Button
							variant='outlined'
							startIcon={<HomeIcon />}
							href='/'
							sx={{
								color: COLORS.textDark,
								borderColor: COLORS.border,
								px: 4,
								py: 1.5,
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 600,
								fontSize: "1rem",
								"&:hover": {
									borderColor: COLORS.primary,
									bgcolor: "rgba(32, 129, 195, 0.04)",
								},
							}}>
							Go Home
						</Button>
					</Stack>

					{/* Help Text */}
					<Typography
						variant='body2'
						color={COLORS.textLight}
						sx={{ mt: 4, fontSize: "0.875rem" }}>
						If this problem persists, please contact{" "}
						<Typography
							component='a'
							href='mailto:Support@veryableops.com'
							sx={{
								color: COLORS.primary,
								textDecoration: "none",
								fontWeight: 600,
								"&:hover": {
									textDecoration: "underline",
								},
							}}>
							support@veryableops.com
						</Typography>
					</Typography>
				</Paper>
			</Container>
		</Box>
	);
}
