import { Response } from '../../commonType';
import { ApiResponse } from '../types/ApiResponse';
import { Pet } from '../types/Pet';

import request from '@/utils/fetch';


/**
 * uploads an image
 */

export const uploadFile = function(
  {
    petId,
  }: {
    /** ID of pet to update */
    petId: number;
  },
  data?: {
    /** Additional data to pass to server */
    additionalMetadata?: string;
    /** file to upload */
    file?: File;
  },
  config?: { [key: string]: any }
): Promise<Response<ApiResponse>> {  return request(`/pet/${petId}/uploadImage`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Add a new pet to the store
 */

export const addPet = function(
    /** Pet object that needs to be added to the store */
  data:  Pet,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/pet`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Update an existing pet
 */

export const updatePet = function(
    /** Pet object that needs to be added to the store */
  data:  Pet,
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/pet`, {
    method: 'PUT',
    data,
    ...config,
  });};

/**
 * Finds Pets by statusMultiple status values can be provided with comma separated strings
 * Multiple status values can be provided with comma separated strings
 */

export const findPetsByStatus = function(
  params: {
    /** Status values that need to be considered for filter */
    status: Array<string>;
  },
  config?: { [key: string]: any }
): Promise<Response<Array<Pet>>> {  return request(`/pet/findByStatus`, {
    method: 'GET',
    params,
    ...config,
  });};

/**
 * @deprecated
 * Finds Pets by tagsMultiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 */

export const findPetsByTags = function(
  params: {
    /** Tags to filter by */
    tags: Array<string>;
  },
  config?: { [key: string]: any }
): Promise<Response<Array<Pet>>> {  return request(`/pet/findByTags`, {
    method: 'GET',
    params,
    ...config,
  });};

/**
 * Find pet by IDReturns a single pet
 * Returns a single pet
 */

export const getPetById = function(
  {
    petId,
  }: {
    /** ID of pet to return */
    petId: number;
  },
  config?: { [key: string]: any }
): Promise<Response<Pet>> {  return request(`/pet/${petId}`, {
    method: 'GET',
    ...config,
  });};

/**
 * Updates a pet in the store with form data
 */

export const updatePetWithForm = function(
  {
    petId,
  }: {
    /** ID of pet that needs to be updated */
    petId: number;
  },
  data?: {
    /** Updated name of the pet */
    name?: string;
    /** Updated status of the pet */
    status?: string;
  },
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/pet/${petId}`, {
    method: 'POST',
    data,
    ...config,
  });};

/**
 * Deletes a pet
 */

export const deletePet = function(
  {
    petId,
  }: {
    /** Pet id to delete */
    petId: number;
  },
  headers?: { [key: string]: any },
  config?: { [key: string]: any }
): Promise<Response<undefined | null>> {  return request(`/pet/${petId}`, {
    method: 'DELETE',
    headers,
    ...config,
  });};