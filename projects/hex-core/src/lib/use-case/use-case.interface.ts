export interface UseCase<R> {
  execute(...args: any[]): R;
}
