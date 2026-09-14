import { ExpenseRecord, SimplifiedDebt, Roommate } from '../types';

/**
 * Calculates net balances and generates minimum transactions to settle all debts
 */
export function calculateNetDebts(
  expenses: ExpenseRecord[],
  roommates: Roommate[]
): {
  balances: Record<string, number>;
  simplifiedDebts: SimplifiedDebt[];
  totalOwedToUser: (userId: string) => number;
  totalUserOwes: (userId: string) => number;
} {
  const balances: Record<string, number> = {};

  // Initialize all roommate balances to 0
  roommates.forEach((r) => {
    balances[r.id] = 0;
  });

  // Calculate net balances based on unsettled splits
  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      // If not settled yet and split participant is not the payer
      if (!split.isPaid && split.roommateId !== expense.payerId) {
        // Payer is owed this amount (+)
        balances[expense.payerId] = (balances[expense.payerId] || 0) + split.amount;
        // Participant owes this amount (-)
        balances[split.roommateId] = (balances[split.roommateId] || 0) - split.amount;
      }
    });
  });

  // Minimum transaction generation
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id, amount: -rounded });
    }
  });

  // Sort descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: SimplifiedDebt[] = [];
  let cIdx = 0;
  let dIdx = 0;

  const credCopies = creditors.map((c) => ({ ...c }));
  const debCopies = debtors.map((d) => ({ ...d }));

  while (cIdx < credCopies.length && dIdx < debCopies.length) {
    const cred = credCopies[cIdx];
    const deb = debCopies[dIdx];

    const settledAmount = Math.min(cred.amount, deb.amount);
    if (settledAmount > 0.01) {
      simplifiedDebts.push({
        fromId: deb.id,
        toId: cred.id,
        amount: Math.round(settledAmount * 100) / 100,
      });
    }

    cred.amount -= settledAmount;
    deb.amount -= settledAmount;

    if (cred.amount <= 0.01) {
      cIdx++;
    }
    if (deb.amount <= 0.01) {
      dIdx++;
    }
  }

  const totalOwedToUser = (userId: string) => {
    return simplifiedDebts
      .filter((d) => d.toId === userId)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const totalUserOwes = (userId: string) => {
    return simplifiedDebts
      .filter((d) => d.fromId === userId)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  return {
    balances,
    simplifiedDebts,
    totalOwedToUser,
    totalUserOwes,
  };
}
