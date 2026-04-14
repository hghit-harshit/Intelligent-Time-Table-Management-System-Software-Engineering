export interface ApiError {
  message: string;
}

export interface ApiSuccess<T> {
  data: T;
}
