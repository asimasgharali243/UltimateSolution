export async function checkout(fetchPayment, signal) {
  const payment = await fetchPayment({ signal });
  return { status: 200, payment };
}
