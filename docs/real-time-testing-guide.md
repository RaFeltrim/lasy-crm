# Real-Time Updates Testing Guide

## Overview
This guide provides instructions for testing the real-time synchronization features of the Lasy AI CRM System.

## Real-Time Features

### 1. Kanban Board Updates
When a lead's status changes, all connected clients should see the update in real-time.

### 2. Lead Creation/Deletion
When leads are created or deleted, all connected clients should see the changes immediately.

### 3. Lead Updates
When lead information is modified, all connected clients should see the updated data.

## Testing Setup

### Prerequisites
- Two or more browser windows/tabs
- Same user account logged in across all windows
- Stable internet connection
- Access to browser developer console

### Test Environment
- Development: `http://localhost:3000`
- Staging: [Your staging URL]
- Production: [Your production URL]

## Test Scenarios

### Scenario 1: Kanban Board Synchronization

#### Setup
1. Open two browser windows side by side
2. Log in with the same account in both windows
3. Navigate to the Dashboard (Kanban board) in both windows

#### Test Steps
1. **Window 1**: Drag a lead from "New" to "Contacted"
2. **Window 2**: Verify the lead moves to "Contacted" within 2 seconds
3. **Window 1**: Drag another lead from "Contacted" to "Qualified"
4. **Window 2**: Verify the lead moves to "Qualified" within 2 seconds
5. **Window 2**: Drag a lead from "Qualified" to "Pending"
6. **Window 1**: Verify the lead moves to "Pending" within 2 seconds

#### Expected Results
- ✓ Lead position updates in both windows
- ✓ Stage analytics counters update correctly
- ✓ No visual glitches or flickering
- ✓ Updates occur within 2 seconds

#### Troubleshooting
- Check browser console for WebSocket connection status
- Verify Supabase real-time is enabled
- Check network tab for real-time subscription messages

### Scenario 2: Lead Creation Synchronization

#### Setup
1. Open two browser windows
2. Log in with the same account in both windows
3. Window 1: Navigate to Dashboard
4. Window 2: Navigate to Leads page

#### Test Steps
1. **Window 2**: Click "New Lead" button
2. **Window 2**: Fill in lead details and submit
3. **Window 1**: Verify new lead appears on Kanban board within 2 seconds
4. **Window 2**: Verify lead appears in leads list
5. **Window 1**: Click on the new lead card
6. **Window 1**: Verify lead details are correct

#### Expected Results
- ✓ New lead appears in both windows
- ✓ Lead data is consistent across windows
- ✓ Success toast notification appears
- ✓ Updates occur within 2 seconds

### Scenario 3: Lead Deletion Synchronization

#### Setup
1. Open two browser windows
2. Log in with the same account in both windows
3. Both windows: Navigate to Dashboard

#### Test Steps
1. **Window 1**: Click on a lead card to open details
2. **Window 1**: Click "Delete" button and confirm
3. **Window 2**: Verify lead disappears from Kanban board within 2 seconds
4. **Window 1**: Verify redirect to Dashboard
5. **Window 2**: Verify stage analytics update correctly

#### Expected Results
- ✓ Lead removed from both windows
- ✓ Stage counters update correctly
- ✓ No errors in console
- ✓ Updates occur within 2 seconds

### Scenario 4: Lead Update Synchronization

#### Setup
1. Open two browser windows
2. Log in with the same account in both windows
3. Window 1: Navigate to a lead detail page
4. Window 2: Navigate to Dashboard

#### Test Steps
1. **Window 1**: Click "Edit" button
2. **Window 1**: Change lead name and company
3. **Window 1**: Submit the form
4. **Window 2**: Verify lead card shows updated information within 2 seconds
5. **Window 1**: Verify lead detail page shows updated information
6. **Window 2**: Click on the updated lead
7. **Window 2**: Verify all details are updated

#### Expected Results
- ✓ Lead information updates in both windows
- ✓ Changes are consistent across all views
- ✓ Success toast notification appears
- ✓ Updates occur within 2 seconds

### Scenario 5: Multiple Simultaneous Updates

#### Setup
1. Open three browser windows
2. Log in with the same account in all windows
3. All windows: Navigate to Dashboard

#### Test Steps
1. **Window 1**: Drag lead A from "New" to "Contacted"
2. **Window 2**: Drag lead B from "Contacted" to "Qualified"
3. **Window 3**: Drag lead C from "Qualified" to "Pending"
4. **All Windows**: Verify all three changes appear correctly
5. **All Windows**: Verify stage analytics are correct

#### Expected Results
- ✓ All changes appear in all windows
- ✓ No conflicts or race conditions
- ✓ Stage counters are accurate
- ✓ No duplicate or missing leads

### Scenario 6: Connection Loss and Recovery

#### Setup
1. Open browser window
2. Log in and navigate to Dashboard
3. Open browser DevTools Network tab

#### Test Steps
1. **DevTools**: Throttle network to "Offline"
2. **Browser**: Try to drag a lead (should fail gracefully)
3. **Browser**: Verify error toast appears
4. **DevTools**: Set network back to "Online"
5. **Browser**: Wait for reconnection (check console)
6. **Browser**: Try dragging a lead again
7. **Browser**: Verify update works

#### Expected Results
- ✓ Graceful error handling when offline
- ✓ Automatic reconnection when online
- ✓ User is notified of connection status
- ✓ Operations resume after reconnection

### Scenario 7: Import Synchronization

#### Setup
1. Open two browser windows
2. Log in with the same account in both windows
3. Window 1: Navigate to Dashboard
4. Window 2: Navigate to Leads page

#### Test Steps
1. **Window 2**: Click "Import" button
2. **Window 2**: Upload CSV file with 10 leads
3. **Window 2**: Wait for import to complete
4. **Window 1**: Verify new leads appear on Kanban board within 2 seconds
5. **Window 2**: Verify leads appear in leads list
6. **Both Windows**: Verify stage analytics update correctly

#### Expected Results
- ✓ All imported leads appear in both windows
- ✓ Leads are distributed correctly by status
- ✓ Stage counters update accurately
- ✓ Updates occur within 2 seconds

### Scenario 8: Interaction Timeline Synchronization

#### Setup
1. Open two browser windows
2. Log in with the same account in both windows
3. Both windows: Navigate to the same lead detail page

#### Test Steps
1. **Window 1**: Click "Add Interaction" button
2. **Window 1**: Fill in interaction details and submit
3. **Window 2**: Verify new interaction appears in timeline within 2 seconds
4. **Window 2**: Click "Add Interaction" button
5. **Window 2**: Fill in interaction details and submit
6. **Window 1**: Verify new interaction appears in timeline within 2 seconds

#### Expected Results
- ✓ Interactions appear in both windows
- ✓ Timeline order is correct (newest first)
- ✓ Interaction details are accurate
- ✓ Updates occur within 2 seconds

## Performance Testing

### Latency Measurement
1. Open browser DevTools Console
2. Monitor real-time update logs
3. Measure time between action and update
4. Target: < 2 seconds for all updates

### Load Testing
1. Open 5+ browser windows
2. Perform simultaneous updates
3. Verify all windows receive updates
4. Check for performance degradation

### Network Conditions
Test under various network conditions:
- Fast 3G (750ms latency)
- Slow 3G (2000ms latency)
- Offline → Online transition
- Intermittent connectivity

## Debugging Real-Time Issues

### Check WebSocket Connection
```javascript
// In browser console
console.log('Checking Supabase real-time connection...');
// Look for subscription status logs
```

### Monitor Real-Time Events
```javascript
// In browser console
// Check for real-time update logs
// Should see: "Real-time update received: ..."
```

### Verify Supabase Configuration
1. Check `.env.local` for correct Supabase URL and keys
2. Verify Supabase project has real-time enabled
3. Check Supabase dashboard for real-time connections

### Common Issues

#### Issue: Updates not appearing
**Possible Causes:**
- Real-time subscription not active
- Network connectivity issues
- Supabase real-time not enabled
- RLS policies blocking updates

**Solutions:**
- Check browser console for errors
- Verify WebSocket connection
- Check Supabase dashboard
- Review RLS policies

#### Issue: Delayed updates (> 2 seconds)
**Possible Causes:**
- Network latency
- Server load
- Too many subscriptions

**Solutions:**
- Test network speed
- Check server resources
- Optimize subscription queries

#### Issue: Duplicate updates
**Possible Causes:**
- Multiple subscriptions to same channel
- React component re-rendering issues

**Solutions:**
- Ensure proper cleanup in useEffect
- Check for duplicate channel subscriptions
- Verify component mounting behavior

## Automated Testing

### E2E Test Example
```typescript
// e2e/real-time.spec.ts
test('real-time kanban updates', async ({ page, context }) => {
  // Open two pages
  const page1 = page;
  const page2 = await context.newPage();
  
  // Login both pages
  await page1.goto('/login');
  await page1.fill('[name="email"]', 'test@example.com');
  await page1.fill('[name="password"]', 'password');
  await page1.click('button[type="submit"]');
  
  await page2.goto('/login');
  await page2.fill('[name="email"]', 'test@example.com');
  await page2.fill('[name="password"]', 'password');
  await page2.click('button[type="submit"]');
  
  // Navigate to dashboard
  await page1.goto('/dashboard');
  await page2.goto('/dashboard');
  
  // Drag lead in page1
  await page1.dragAndDrop('[data-lead-id="123"]', '[data-stage="contacted"]');
  
  // Verify update in page2
  await page2.waitForSelector('[data-stage="contacted"] [data-lead-id="123"]', {
    timeout: 3000
  });
  
  expect(await page2.locator('[data-stage="contacted"] [data-lead-id="123"]').count()).toBe(1);
});
```

## Monitoring and Logging

### Client-Side Logging
- Real-time connection status
- Update events received
- Latency measurements
- Error events

### Server-Side Logging
- WebSocket connections
- Broadcast events
- Database changes
- Performance metrics

## Best Practices

### For Developers
1. Always clean up subscriptions in useEffect
2. Handle connection errors gracefully
3. Implement exponential backoff for reconnection
4. Log real-time events for debugging
5. Test with multiple clients

### For Testers
1. Test with multiple browser windows
2. Test under various network conditions
3. Verify updates across all views
4. Check for race conditions
5. Monitor browser console for errors

## Success Criteria

A successful real-time implementation should:
- ✓ Update all connected clients within 2 seconds
- ✓ Handle connection loss gracefully
- ✓ Reconnect automatically
- ✓ Maintain data consistency
- ✓ Provide user feedback on connection status
- ✓ Work across all supported browsers
- ✓ Scale to multiple simultaneous users

## Resources

- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [WebSocket Testing Tools](https://www.websocket.org/echo.html)
- [Network Throttling in Chrome DevTools](https://developer.chrome.com/docs/devtools/network/)
