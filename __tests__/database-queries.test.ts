import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getTimelineItems,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from '@/lib/database/queries';

describe('Database & Local Dual-Store Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Events CRUD', () => {
    it('creates and retrieves an event with starter seeds', async () => {
      const created = await createEvent({
        title: 'Maya & Kabir Wedding',
        event_type: 'wedding',
        total_budget: 800000,
        guest_count: 200,
        location_city: 'Delhi',
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Maya & Kabir Wedding');

      const all = await getEvents();
      expect(all.length).toBeGreaterThanOrEqual(1);
      expect(all[0].id).toBe(created.id);
    });

    it('updates an existing event', async () => {
      const created = await createEvent({
        title: 'Original Title',
        event_type: 'birthday',
      });

      const updated = await updateEvent(created.id, {
        title: 'Updated Milestone Birthday',
      });

      expect(updated.title).toBe('Updated Milestone Birthday');
    });

    it('deletes an event successfully', async () => {
      const created = await createEvent({
        title: 'To Be Deleted',
        event_type: 'corporate',
      });

      await deleteEvent(created.id);
      const all = await getEvents();
      expect(all.find((e) => e.id === created.id)).toBeUndefined();
    });
  });

  describe('Timeline CRUD', () => {
    it('creates, marks complete, and deletes timeline milestones', async () => {
      const eventId = 'test-event-123';
      const item = await createTimelineItem({
        event_id: eventId,
        title: 'Confirm DJ',
        phase: 'planning_mid',
        priority: 'high',
      });

      expect(item.id).toBeDefined();
      expect(item.is_completed).toBe(false);

      const updated = await updateTimelineItem(item.id, { is_completed: true });
      expect(updated.is_completed).toBe(true);

      const items = await getTimelineItems(eventId);
      expect(items.length).toBeGreaterThanOrEqual(1);

      await deleteTimelineItem(item.id);
      const afterDelete = await getTimelineItems(eventId);
      expect(afterDelete.find((t) => t.id === item.id)).toBeUndefined();
    });
  });

  describe('Budget CRUD', () => {
    it('manages expenses and payment flags', async () => {
      const eventId = 'test-event-budget';
      const item = await createBudgetItem({
        event_id: eventId,
        category: 'Catering & Food',
        item_name: 'Dinner Buffet',
        estimated_cost: 150000,
        actual_cost: 140000,
      });

      expect(item.id).toBeDefined();
      expect(item.is_paid).toBe(false);

      const paid = await updateBudgetItem(item.id, { is_paid: true });
      expect(paid.is_paid).toBe(true);

      await deleteBudgetItem(item.id);
      const after = await getBudgetItems(eventId);
      expect(after.find((b) => b.id === item.id)).toBeUndefined();
    });
  });

  describe('Vendors CRUD', () => {
    it('progresses vendor status through pipeline', async () => {
      const eventId = 'test-event-vendor';
      const vendor = await createVendor({
        event_id: eventId,
        category: 'Photographer',
        vendor_name: 'Lens & Light Studios',
        price_quote: 45000,
      });

      expect(vendor.status).toBe('researching');

      const contracted = await updateVendor(vendor.id, { status: 'contract_signed' });
      expect(contracted.status).toBe('contract_signed');

      await deleteVendor(vendor.id);
      const vendors = await getVendors(eventId);
      expect(vendors.find((v) => v.id === vendor.id)).toBeUndefined();
    });
  });

  describe('Guests CRUD', () => {
    it('tracks guest RSVPs and plus-ones', async () => {
      const eventId = 'test-event-guest';
      const guest = await createGuest({
        event_id: eventId,
        full_name: 'Aarav Patel',
        rsvp_status: 'pending',
        plus_ones: 1,
      });

      expect(guest.rsvp_status).toBe('pending');

      const confirmed = await updateGuest(guest.id, { rsvp_status: 'confirmed' });
      expect(confirmed.rsvp_status).toBe('confirmed');

      const guests = await getGuests(eventId);
      expect(guests.length).toBeGreaterThanOrEqual(1);

      await deleteGuest(guest.id);
      const after = await getGuests(eventId);
      expect(after.find((g) => g.id === guest.id)).toBeUndefined();
    });
  });
});
