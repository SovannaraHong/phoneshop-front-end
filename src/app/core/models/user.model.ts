export interface RoleType {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}
export interface PaginationDTO {
  empty: boolean;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPage: number;
}

export interface PageDTO<T> {
  list: T[];
  paginationDTO: PaginationDTO;
}
export interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  placeOfBirth: string;
  password: string;
  status: string;
  phoneNumber: string;
  roles: RoleType[];
  imagePath: string;
}
export interface UserResponse {
  users: UserType[];
  total: number;
  skip: number;
  limit: number;
}

export interface LoginType {
  username: string;
  password: string;
}
export interface LoginResponse {
  status: number;
  message: string;
  data: {
    userId: number;
    username: string;
    roles: string[];
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}
