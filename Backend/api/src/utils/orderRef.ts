export function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  const array = new Uint8Array(5);
  crypto.getRandomValues(array);
  for (let i = 0; i < 5; i++) {
    ref += chars[array[i] % chars.length];
  }
  return `ORD-${ref}`;
}