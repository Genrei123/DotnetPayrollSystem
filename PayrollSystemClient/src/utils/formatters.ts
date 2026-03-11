export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function toApiDate(dateStr: string): string {
    // Converts a yyyy-MM-dd input value to the format expected by the backend DateOnly
    return dateStr; // backend accepts yyyy-MM-dd directly
}
