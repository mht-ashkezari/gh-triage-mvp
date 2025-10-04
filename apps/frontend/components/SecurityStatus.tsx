export function SecurityStatus({ hits }: { hits: number }) {
    const color = hits === 0 ? "text-green-600" : "text-red-600";
    return (
        <div role="status" aria-live="polite" className={`font-medium ${color}`}>
            {hits === 0 ? "✓ No PII Detected" : `${hits} PII hits found`}
        </div>
    );
}