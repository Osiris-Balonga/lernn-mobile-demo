import { apiClient } from "@/lib/api-client"
import type { AuthUser, LoginResponse, UserProfile } from "./types"

export interface LoginInput {
  email: string
  password: string
  rememberMe: boolean
}

export interface CardLoginInput {
  token: string
}

export interface CardCodeLoginInput {
  code: string
}

export function login(input: LoginInput) {
  return apiClient.post<LoginResponse>("/auth/login", input)
}

export function cardLogin(input: CardLoginInput) {
  return apiClient.post<{ data: AuthUser }>("/auth/card-login", input)
}

export function cardCodeLogin(input: CardCodeLoginInput) {
  return apiClient.post<{ data: AuthUser }>("/auth/card-code-login", input)
}

export function logout() {
  return apiClient.post<{ data: { message: string } }>("/auth/logout")
}

export function fetchMe() {
  return apiClient
    .get<{ data: AuthUser }>("/auth/me")
    .then((response) => response.data)
}

export function fetchProfiles(type?: "management" | "personal") {
  return apiClient
    .get<{ data: UserProfile[] }>("/auth/me/profiles", {
      params: type ? { type } : undefined,
    })
    .then((response) => response.data)
}
