
export interface CreateVehiclePayload {
    vehicle_name: string;
    type: "car" | "bike" | "van" | "SUV";
    registration_number: string;
    daily_rent_price: number;
    availability_status?: "available" | "booked";
}


export interface UpdateVehiclePayload {
  vehicle_name?: string;
  type?: "car" | "bike" | "van" | "SUV";
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: "available" | "booked";
}
