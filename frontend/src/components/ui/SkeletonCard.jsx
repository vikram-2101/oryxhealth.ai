export const SkeletonCard = () => {
  return (
    <div className="card-premium p-6 space-y-4">
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-5/6"></div>
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-8 w-20"></div>
        <div className="skeleton h-8 w-20"></div>
      </div>
    </div>
  );
};
