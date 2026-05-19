export function roundMoney2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export type PrepaymentSplit = {
  prepaidToMe: number;
  prepaidToOwner: number;
};

export type PrepaymentTotals = PrepaymentSplit & {
  paidAmount: number;
  ownerDueAtCheckin: number;
  myDueAtCheckin: number;
  remainingToPay: number;
};

/** Розрахунок передоплати та залишку при заїзді (суми в гривнях). */
export function calcPrepaymentTotals(params: {
  clientTotal: number;
  ownerTotalPrice: number;
  ourProfit: number;
  prepaidToMe: number;
  prepaidToOwner: number;
}): PrepaymentTotals {
  const prepaidToMe = roundMoney2(Math.max(0, params.prepaidToMe));
  const prepaidToOwner = roundMoney2(Math.max(0, params.prepaidToOwner));
  const paidAmount = roundMoney2(prepaidToMe + prepaidToOwner);

  return {
    prepaidToMe,
    prepaidToOwner,
    paidAmount,
    ownerDueAtCheckin: roundMoney2(
      Math.max(0, params.ownerTotalPrice - prepaidToOwner),
    ),
    myDueAtCheckin: roundMoney2(Math.max(0, params.ourProfit - prepaidToMe)),
    remainingToPay: roundMoney2(Math.max(0, params.clientTotal - paidAmount)),
  };
}
