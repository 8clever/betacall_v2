import React from "react";
import { UserApi } from "../api/UserApi";
import { useAuth } from "./AuthProvider";

interface IProps {
  children?: React.ReactNode;
	role: UserApi.Role
}

export function Protected (props: IProps) {
  const auth = useAuth();
  
  if (auth.user && auth.user.role === props.role)
    return props.children as JSX.Element;

  if (auth.loaded)
    UserApi.GoToAuth();

  return null; 
}