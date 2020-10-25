import nodeMailer, { createTransport, TransportOptions } from 'nodemailer';
import { google } from 'googleapis';
import { ClientID, ClientSecret, RefreshToken, SenderMailID } from './config';
const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(ClientID, ClientSecret, 'https://developers.google.com/oauthplayground');

oAuth2Client.setCredentials({
	refresh_token: RefreshToken
});

const accessToken = oAuth2Client.getAccessToken();

const nodemailerSettings = {
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	service: 'Gmail',
	auth: {
		type: 'OAuth2',
		user: SenderMailID,
		clientId: ClientID,
		clientSecret: ClientSecret,
		refreshToken: RefreshToken,
		accessToken
	}
} as TransportOptions;

export const gmailTransport = createTransport(nodemailerSettings);


// const mailOptions = {
// 	from: 'theelectronicsnerde@gmail.com',
// 	to: 'nehalnimkar@gmail.com',
// 	subject: 'Node.js Email with Secure OAuth using typescript',
// 	generateTextFromHTML: true,
// 	html: '<b>test</b>'
// };

// gmailTransport.sendMail(mailOptions, (error, response) => {
// 	error ? console.log(error) : console.log(response);
// 	gmailTransport.close();
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


export const sendMail = (mailOptions: MailOptions, callback: (err: Error | null, info: SentMessageInfo) => void) => gmailTransport.sendMail(mailOptions, callback);
