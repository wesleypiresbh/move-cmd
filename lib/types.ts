export type Role = 'passenger' | 'driver' | 'admin' | 'operator';

export type Car = {
  id: string;
  driverId: string;
  model: string;
  plate: string;
  capacity: number;
  color: string;
};

export type User = {
  id: string;
  name: string;
  role: Role;
  rating: number;
  avatar: string;
  ridesCompleted?: number;
  cpf?: string;
  cnh?: string;
  email?: string;  phone?: string;
  active?: boolean;
};

export type Location = 'Belo Horizonte' | 'Conceição do Mato Dentro' | 'Lagoa Santa';

export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  passengerId: string;
  driverId?: string;
  from: Location;
  to: Location;
  price: number;
  status: RideStatus;
  date: string;
  shared: boolean;
};

export type Message = {
  id: string;
  rideId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
};
