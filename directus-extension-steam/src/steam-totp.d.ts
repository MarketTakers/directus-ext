declare module 'steam-totp' {
  export function generateAuthCode(secret: string): string;
  export function getTimeOffset(callback: (error: Error | null, offset: number, latency: number) => void): void;
  export function time(): number;
  // Add other functions you use from steam-totp
}