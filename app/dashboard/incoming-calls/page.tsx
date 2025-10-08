'use client';

import CallHistoryPage from '@/components/modules/call-history/call-history-page';
import { useUserStore } from '@/stores/useUserStore';

export default function IncomingCallsPageRoute() {
  const getMultiplier = useUserStore((state) => state.getMultiplier);

  return <CallHistoryPage incomingCallsFilter={true} multiplier={getMultiplier()} onBack={undefined} />;
}
