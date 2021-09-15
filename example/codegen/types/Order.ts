export type STATUS = 'placed' | 'approved' | 'delivered';

export interface Order {
  
  id: number;
  
  petId: number;
  
  quantity: number;
  
  shipDate: string;
  /** Order Status */
  status: STATUS;
  
  complete: boolean;
}
  