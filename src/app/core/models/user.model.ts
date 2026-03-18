export interface RoleType {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}

export interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  placeOfBirth: string;
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
