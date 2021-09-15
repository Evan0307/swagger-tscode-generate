import { Response } from '../../commonType';
import { Order } from '../types/Order';

import request from '@/utils/fetch';


/**
 * Returns pet inventories by statusReturns a map of status codes to quantities
 * Returns a map of status codes to quantities
 */

export const getInventory = function(
  config?: { [key: string]: any }
): Promise<Response<Object>> {  return request(`/store/inventory`, {
    method: 'GET',
    ...config,
  });};

/**
 * Place an order for a pet
 */

export const placeOrder = function(
    /** order placed for purchasing the pet */
  data:  Order,
  config?: { [key: string]: any }
): Promise<Response<Order>> {  return request(`/store/order`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Find purchase order by IDFor valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 */

export const getOrderById = function(
  {
    orderId,
  }: {
    /** ID of pet that needs to be fetched */
    orderId: number;
  },
  config?: { [key: string]: any }
): Promise<Response<Order>> {  return request(`/store/order/${orderId}`, {
    method: 'GET',
    ...config,
  });};

/**
 * Delete purchase order by IDFor valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 * For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 */

export const deleteOrder = function(
  {
    orderId,
  }: {
    /** ID of the order that needs to be deleted */
    orderId: number;
  },
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/store/order/${orderId}`, {
    method: 'DELETE',
    ...config,
  });};