export default function FormSuccess({
  message,
}: {
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-x-2 text-sm text-emerald-500">
      <p>{message}</p>
    </div>
  );
}
