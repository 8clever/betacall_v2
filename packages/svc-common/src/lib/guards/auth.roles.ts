import { SetMetadata } from "@nestjs/common";
import { User } from "../entities/user.entity";

export const Roles = (...roles: User.Role[]) => SetMetadata('roles', roles);