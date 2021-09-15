import { Category } from './Category';
import { Tag } from './Tag';
export type STATUS = 'available' | 'pending' | 'sold';

export interface Pet {
  
  id: number;
  
  category: Category;
  
  name: string;
  
  photoUrls: Array<string>;
  
  tags: Array<Tag>;
  /** pet status in the store */
  status: STATUS;
}
  