export function serializeTransaction(obj) {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = serialized.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = serialized.amount.toNumber();
  }

  return serialized;
}
