export default function RouteFallback() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}