export default function Loading() {
  return (
    <div className="w-svw h-svh flex items-center justify-center">
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-brand-primary-dark text-4xl animate-spin flex items-center justify-center border-t-brand-primary-dark rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-brand-primary text-2xl animate-spin flex items-center justify-center border-t-brand-primary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
