import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-lg">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-accent dark:bg-dark-accent h-12 w-12"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-accent dark:bg-dark-accent rounded w-3/4"></div>
        <div className="h-6 bg-accent dark:bg-dark-accent rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonChart: React.FC = () => (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-lg h-96 animate-pulse">
        <div className="h-6 bg-accent dark:bg-dark-accent rounded w-1/3 mb-4"></div>
        <div className="h-full w-full bg-accent dark:bg-dark-accent rounded-md"></div>
    </div>
);

const SkeletonActivity: React.FC = () => (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-lg h-96 animate-pulse">
        <div className="h-6 bg-accent dark:bg-dark-accent rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="rounded-full bg-accent dark:bg-dark-accent h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-accent dark:bg-dark-accent rounded w-full"></div>
                        <div className="h-3 bg-accent dark:bg-dark-accent rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto">
        <div className="animate-pulse">
            <div className="h-8 bg-accent dark:bg-dark-accent rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-accent dark:bg-dark-accent rounded w-1/2 mb-8"></div>
        </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
         {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
            <SkeletonChart />
        </div>
        <div>
            <SkeletonActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;