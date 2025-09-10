 const otpTemplate = (otp) => {
// 	` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
//       <h2 style="color: #075e54;">🔐 WhatsApp Web Verification</h2>
      
//       <p>Hi there,</p>
      
//       <p>Your one-time password (OTP) to verify your WhatsApp Web account is:</p>
      
//       <h1 style="background: #e0f7fa; color: #000; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
//         ${otp}
//       </h1>

//       <p><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>

//       <p>If you didn’t request this OTP, please ignore this email.</p>

//       <p style="margin-top: 20px;">Thanks & Regards,<br/>WhatsApp Web Security Team</p>

//       <hr style="margin: 30px 0;" />

//       <small style="color: #777;">This is an automated message. Please do not reply.</small>
//     </div>`
	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
			}
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
			.highlight {
				font-weight: bold;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<a href="https://studynotion-edtech-project.vercel.app">
				<img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo">
			</a>
			<div class="message">OTP Verification Email</div>
			<div class="body">
				<p>Dear User,</p>
				<p>Thank you for registering with Chat-Application. To complete your registration, please use the following OTP (One-Time Password) to verify your account:</p>
				<h2 class="highlight">${otp}</h2>
				<p>This OTP is valid for 5 minutes. If you did not request this verification, please disregard this email. Once your account is verified, you will have access to our platform and its features.</p>
			</div>
			<div class="support">
				If you have any questions or need assistance, please feel free to reach out to us at
				<a href="mailto:info@studynotion.com">info@studynotion.com</a>.
				We are here to help!
			</div>
		</div>
	</body>
	</html>
	`;
};

module.exports = otpTemplate;
