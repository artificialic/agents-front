'use client';

import CallHistoryPage from '@/components/modules/call-history/call-history-page';

export default function IncomingCallsPageRoute() {
  return <CallHistoryPage incomingCallsFilter={true} onBack={undefined} />;
}
