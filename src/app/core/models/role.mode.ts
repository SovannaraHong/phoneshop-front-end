export interface RoleType {
  id: number;
  name: string;
  permissions: [];
}
export interface roleResponse {
  roles: RoleType[];
  total: number;
  skip: number;
  limit: number;
}
