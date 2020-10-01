export interface User {
    _id?: string;
    name?: string;
    email?: string;
    userName?: string;
    password?: string;
    phone?: string;
    age?: number;
    dairy?: string;
    createdAt?: Date;
    role?: Role;
    address?: {
        pincode: number;
        line1: string;
        line2: string;
        villTown: string;
        taluka: string;
        district: string;
        state: string;
        country: string;
    };
    location?: {
        x: string;
        y: string;
    };
    mailPreference?: object;
}

// TODO: update enums at /src/models/user.model.ts, else app will break
export enum MailPreference{
    PAYMENT = 'payment',
    DELIVERY = 'delivery',
    UPDATES = 'updates'
}
export const MailPreferenceArray: MailPreference[] = [MailPreference.PAYMENT, MailPreference.DELIVERY, MailPreference.UPDATES];
export enum Role{
    Farmer = 0,
    Manager = 1
}