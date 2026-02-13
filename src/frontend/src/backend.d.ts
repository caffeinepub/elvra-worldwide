import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AddToCartInput {
    dob: string;
    sampleSelected: string;
    name: string;
    description: string;
    deliveryTime: string;
    email: string;
    gender: Gender;
    brandName: string;
    phone: string;
    price: string;
    product: string;
}
export type Time = bigint;
export interface NotificationRequest {
    sample: string;
    name: string;
    description: string;
    email: string;
    timestamp: Time;
    brandName: string;
    phone: string;
    product: string;
}
export interface SupportRequest {
    name: string;
    email: string;
    message: string;
    timestamp: Time;
}
export interface ExpandedOrder {
    id: bigint;
    dob: string;
    paymentStatus: string;
    sampleSelected: string;
    orderStatus: OrderStatus;
    owner: Principal;
    name: string;
    description: string;
    deliveryTime: string;
    email: string;
    gender: Gender;
    timestamp: Time;
    brandName: string;
    phone: string;
    price: string;
    product: string;
}
export interface Service {
    id: bigint;
    name: string;
    deliveryTime: string;
    priceRange: string;
}
export interface Sample {
    description: string;
    sampleName: string;
    concentration: string;
    price: string;
}
export interface BasicProfile {
    fullName: string;
    email: string;
}
export interface UserProfile {
    dob: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    isVerified: boolean;
    gender: Gender;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSample(sampleName: string, description: string, price: string, concentration: string): Promise<void>;
    addService(name: string, priceRange: string, deliveryTime: string): Promise<bigint>;
    addToCart(input: AddToCartInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteNotificationRequest(id: bigint): Promise<void>;
    getAllNotificationRequests(): Promise<Array<NotificationRequest>>;
    getCallerOrders(): Promise<Array<ExpandedOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerOrders(customerName: string): Promise<Array<ExpandedOrder>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<ExpandedOrder>>;
    getSamples(): Promise<Array<Sample>>;
    getServices(): Promise<Array<Service>>;
    getSupportRequests(): Promise<Array<SupportRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveBasicProfile(basicProfile: BasicProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitSupportRequest(name: string, email: string, message: string): Promise<void>;
    updateOrderPaymentStatus(orderId: bigint, status: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
