import nodeMailer, { createTransport } from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

import { ClientID, ClientSecret, RefreshToken } from './config';
const oAuth2 = google.auth.OAuth2;

const oAuth2Client = new oAuth2(ClientID, ClientSecret, 'https://developers.google.com/oauthplayground');
oAuth2Client.setCredentials({
	refresh_token: RefreshToken
});

const accessToken = oAuth2Client.getAccessToken();

const smtpTransport = createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: 'theelectronicsnerd@gmail.com',
		clientId: ClientID,
		clientSecret: ClientSecret,
		refreshToken: RefreshToken,
		accessToken
	}
});

// const mailOptions = {
// 	from: 'theelectronicsnerde@gmail.com',
// 	to: 'nehalnimkar@gmail.com',
// 	subject: 'Node.js Email with Secure OAuth using typescript',
// 	generateTextFromHTML: true,
// 	html: '<b>test</b>'
// };

// smtpTransport.sendMail(mailOptions, (error, response) => {
// 	error ? console.log(error) : console.log(response);
// 	smtpTransport.close();
// });

export interface MailOptions{
	from: string;
	to: string;
	subject: string;
	html: string;
}

interface SentMessageInfo{
	accepted: string[];
	rejected: string[];
	envelopeTime: number;
	messageTime: number;
	messageSize: number;
	response: string;
	envelope: {
		from: string;
		to: string[];
	};
	messageId: string;
}


export const sendMail = (mailOptions: MailOptions, callback: (err: Error | null, info: SentMessageInfo) => void) => smtpTransport.sendMail(mailOptions, callback);
