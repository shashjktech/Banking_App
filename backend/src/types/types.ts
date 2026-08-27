
export type RegisterUserPayload = {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export type loginPayload = {
    email: string;
    password: string;
}

export type TokenPayLoad = {
    userId: string
}
export type StaffPayload = {
    staffId: string,
    role: 'ADMIN' | 'OPERATOR';
}

export interface StaffLoginDTO {
  identifier: string; // Accepts either email or username
  password: string;
}