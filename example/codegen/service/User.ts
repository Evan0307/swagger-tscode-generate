import { Response } from '../../commonType';
import { User } from '../types/User';

import request from '@/utils/fetch';


/**
 * Creates list of users with given input array
 */

export const createUsersWithListInput = function(
    /** List of user object */
  data:  Array<User>,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user/createWithList`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Get user by user name
 */

export const getUserByName = function(
  {
    username,
  }: {
    /** The name that needs to be fetched. Use user1 for testing.  */
    username: string;
  },
  config?: { [key: string]: any }
): Promise<Response<User>> {  return request(`/user/${username}`, {
    method: 'GET',
    ...config,
  });};

/**
 * Updated userThis can only be done by the logged in user.
 * This can only be done by the logged in user.
 */

export const updateUser = function(
  {
    username,
  }: {
    /** name that need to be updated */
    username: string;
  },
    /** Updated user object */
  data:  User,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user/${username}`, {
    method: 'PUT',
    data,
    ...config,
  });};

/**
 * Delete userThis can only be done by the logged in user.
 * This can only be done by the logged in user.
 */

export const deleteUser = function(
  {
    username,
  }: {
    /** The name that needs to be deleted */
    username: string;
  },
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user/${username}`, {
    method: 'DELETE',
    ...config,
  });};

/**
 * Logs user into the system
 */

export const loginUser = function(
  params: {
    /** The user name for login */
    username: string;
    /** The password for login in clear text */
    password: string;
  },
  config?: { [key: string]: any }
): Promise<Response<string>> {  return request(`/user/login`, {
    method: 'GET',
    params,
    ...config,
  });};

/**
 * Logs out current logged in user session
 */

export const logoutUser = function(
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user/logout`, {
    method: 'GET',
    ...config,
  });};

/**
 * Creates list of users with given input array
 */

export const createUsersWithArrayInput = function(
    /** List of user object */
  data:  Array<User>,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user/createWithArray`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Create userThis can only be done by the logged in user.
 * This can only be done by the logged in user.
 */

export const createUser = function(
    /** Created user object */
  data:  User,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/user`, {
    method: 'POST',
    data,
    ...config,
  });};