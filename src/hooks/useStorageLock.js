import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useStorageLock() {
  const { data: configs = [] } = useQuery({
    queryKey: ['storageConfig'],
    queryFn: () => base44.entities.StorageConfig.list(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    isLocked: configs[0]?.storage_locked === true,
  };
}