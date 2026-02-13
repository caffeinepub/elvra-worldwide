import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ExpandedOrder {
    id: bigint;
    dob: string;
    paymentStatus: PaymentStatus;
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
    priceUSD: bigint;
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
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
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
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
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
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ConfirmationEmailRequest {
    confirmationMessageTemplate: string;
    orderId: bigint;
    timestamp: Time;
    customerEmail: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
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
export enum PaymentStatus {
    verified = "verified",
    pending = "pending",
    paidSubmitted = "paidSubmitted",
    confirmed = "confirmed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSample(sampleName: string, description: string, price: string, concentration: string): Promise<void>;
    addService(name: string, priceUSD: bigint, deliveryTime: string): Promise<bigint>;
    addToCart(input: AddToCartInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteNotificationRequest(id: bigint): Promise<void>;
    getAllConfirmationEmailRequests(): Promise<Array<ConfirmationEmailRequest>>;
    getAllNotificationRequests(): Promise<Array<NotificationRequest>>;
    getCallerOrders(): Promise<Array<ExpandedOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConfirmationMessageTemplate(): Promise<string>;
    getCustomerOrders(customerName: string): Promise<Array<ExpandedOrder>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<ExpandedOrder>>;
    getSamples(): Promise<Array<Sample>>;
    getServices(): Promise<Array<Service>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSupportRequests(): Promise<Array<SupportRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveBasicProfile(basicProfile: BasicProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitConfirmationEmailRequest(orderId: bigint, customerEmail: string, confirmationMessageTemplate: string): Promise<void>;
    submitSupportRequest(name: string, email: string, message: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderPaymentStatus(orderId: bigint, status: PaymentStatus): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    verifyPaymentAndConfirmOrder(orderId: bigint): Promise<void>;
}
