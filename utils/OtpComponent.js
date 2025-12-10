const OtpMailSender = (
    dataUser,
    otp,
    sender
) => {
    return {
        from: sender,
        to: dataUser.email,
        subject: "Kode OTP Login Sistem",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta
			name="Smart Kos
            "
			content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"
		/>
		<title>Smart Kos</title>

		<style type="text/css">
			body {
				width: 100%;
				background-color: #f0f3f8;
				margin: 0;
				padding: 0;
				-webkit-font-smoothing: antialiased;
			}

			p,
			h1,
			h2,
			h3,
			h4 {
				margin-top: 0;
				margin-bottom: 0;
				padding-top: 0;
				padding-bottom: 0;
			}

			span.preheader {
				display: none;
				font-size: 1px;
			}

			html {
				width: 100%;
			}

			table {
				font-size: 12px;
				border: 0;
			}

			.menu-space {
				padding-right: 25px;
			}

			a,
			a:hover {
				text-decoration: none;
				color: #fff;
			}

			@media only screen and (max-width: 640px) {
				body {
					width: auto !important;
				}
				table[class="main"] {
					width: 440px !important;
				}
				table[class="two-left"] {
					width: 420px !important;
					margin: 0px auto;
				}
				table[class="full"] {
					width: 100% !important;
					margin: 0px auto;
				}
				table[class="alaine"] {
					text-align: center;
				}
				table[class="menu-space"] {
					padding-right: 0px;
				}
				table[class="banner"] {
					width: 438px !important;
				}
				table[class="menu"] {
					width: 438px !important;
					margin: 0px auto;
					border-bottom: #e1e0e2 solid 1px;
				}
				table[class="date"] {
					width: 438px !important;
					margin: 0px auto;
					text-align: center;
				}
				table[class="two-left-inner"] {
					width: 400px !important;
					margin: 0px auto;
				}
				table[class="menu-icon"] {
					display: block;
				}
				table[class="two-left-menu"] {
					text-align: center;
				}
			}

			@media only screen and (max-width: 479px) {
				body {
					width: auto !important;
				}
				table[class="main"] {
					width: 310px !important;
				}
				table[class="two-left"] {
					width: 300px !important;
					margin: 0px auto;
				}
				table[class="full"] {
					width: 100% !important;
					margin: 0px auto;
				}
				table[class="alaine"] {
					text-align: center;
				}
				table[class="menu-space"] {
					padding-right: 0px;
				}
				table[class="banner"] {
					width: 308px !important;
				}
				table[class="menu"] {
					width: 308px !important;
					margin: 0px auto;
					border-bottom: #e1e0e2 solid 1px;
				}
				table[class="date"] {
					width: 308px !important;
					margin: 0px auto;
					text-align: center;
				}
				table[class="two-left-inner"] {
					width: 280px !important;
					margin: 0px auto;
				}
				table[class="menu-icon"] {
					display: none;
				}
				table[class="two-left-menu"] {
					width: 310px !important;
					margin: 0px auto;
				}
			}
		</style>
	</head>

	<body
		yahoo="fix"
		leftmargin="0"
		topmargin="0"
		marginwidth="0"
		marginheight="0"
	>
		<!--Main Table Start-->

		<table
			width="100%"
			border="0"
			align="center"
			cellpadding="0"
			cellspacing="0"
			bgcolor="#f0f3f8"
		>
			<tr>
				<td align="center" valign="top">
					<table
						width="100%"
						border="0"
						align="center"
						cellpadding="0"
						cellspacing="0"
					>
						<tr>
							<td align="center" valign="top">
								<table
									width="500"
									border="0"
									align="center"
									cellpadding="0"
									cellspacing="0"
									class="two-left-inner"
								>
									<tr>
										<td
											height="60"
											align="center"
											valign="top"
											style="
												font-size: 60px;
												line-height: 60px;
											"
										>
											&nbsp;
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>

					<table
						width="100%"
						border="0"
						align="center"
						cellpadding="0"
						cellspacing="0"
					>
						<tr>
							<td align="center" valign="top">
								<table
									width="500"
									border="0"
									align="center"
									cellpadding="0"
									cellspacing="0"
									class="two-left-inner"
								>
									<tr>
										<td
											align="center"
											valign="top"
											style="background: #fff"
										>
											<table
												width="260"
												border="0"
												align="center"
												cellpadding="0"
												cellspacing="0"
											>
												<tr>
													<td
														height="75"
														align="center"
														valign="top"
														style="
															font-size: 75px;
															line-height: 75px;
														"
													>
														&nbsp;
													</td>
												</tr>
												<tr>
													<td
														height="40"
														align="center"
														valign="top"
														style="
															font-size: 40px;
															line-height: 40px;
														"
													>
														&nbsp;
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
													>
														<table
															width="85"
															border="0"
															align="center"
															cellpadding="0"
															cellspacing="0"
														>
															<tr>
																<td
																	height="85"
																	align="center"
																	valign="middle"
																	style="
																		background: #8dc63f;
																		-moz-border-radius: 85px;
																		border-radius: 85px;
																	"
																>
																	<img
																		src="images/tick.png"
																		width="31"
																		height="29"
																		alt=""
																	/>
																</td>
															</tr>
														</table>
													</td>
												</tr>
												<tr>
													<td
														height="40"
														align="center"
														valign="top"
														style="
															font-size: 40px;
															line-height: 40px;
														"
													>
														&nbsp;
													</td>
												</tr>
												<tr>
													<!-- Nanti name disini -->
													<td
														align="center"
														valign="top"
														style="
															font-family: 'Open Sans',
																sans-serif,
																Verdana;
															font-size: 22px;
															color: #4b4b4c;
															line-height: 30px;
															font-weight: normal;
														"
													>
														Hello! <br />
														${dataUser.name}
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
													>
														&nbsp;
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
														style="
															font-family: 'Open Sans',
																sans-serif,
																Verdana;
															font-size: 30px;
															color: #4b4b4c;
															line-height: 30px;
															font-weight: bold;
														"
													>
														Welcome to Smart
														Property
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
													>
														&nbsp;
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
														style="
															font-family: 'Open Sans',
																sans-serif,
																Verdana;
															font-size: 13px;
															color: #71746f;
															line-height: 22px;
															font-weight: normal;
														"
													>
														Below is your otp code
													</td>
												</tr>
												<tr>
													<td
														align="center"
														valign="top"
													>
														<table
															width="180"
															border="0"
															align="center"
															cellpadding="0"
															cellspacing="0"
														>
															<tr>
																<td
																	height="30"
																	align="center"
																	valign="top"
																>
																	&nbsp;
																</td>
															</tr>
															<tr>
																<td
																	height="60"
																	align="center"
																	valign="middle"
																	style="
																		background: #8dc63f;
																		-moz-border-radius: 40px;
																		border-radius: 40px;
																		font-family: 'Open Sans',
																			Verdana,
																			Arial;
																		font-size: 14px;
																		font-weight: bold;
																		text-transform: uppercase;
																		color: #fff;
																	"
																>
																	<a
																		href="#"
																		style="
																			text-decoration: none;
																			color: #fff;
																		"
																		>${otp}
																	</a>
																</td>
															</tr>
														</table>
													</td>
												</tr>
												<tr>
													<td
														height="30"
														align="center"
														valign="top"
														style="
															font-size: 30px;
															line-height: 30px;
														"
													>
														&nbsp;
													</td>
												</tr>

												<tr>
													<td
														height="75"
														align="center"
														valign="top"
														style="
															font-size: 75px;
															line-height: 75px;
														"
													>
														&nbsp;
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>
`,
    };
};

module.exports = { OtpMailSender };
