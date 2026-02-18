export interface CreateBookingPayload {
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price?: number;
    status?: "active" | "cancelled" | "returned";
}


export interface BookingResponse {
    id: number;
    customer_id?: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: string;
    vehicle: Record<string, any>;
}