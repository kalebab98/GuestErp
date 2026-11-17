import { describe, it, expect } from 'vitest';
import { requestService } from '../features/requests/requestService';

describe('Request Management Workflow', () => {
  it('creates a new service ticket with sequential ticket number and initial status', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-01',
      apartmentRef: 'Suite 201',
      guestName: 'Jonathan Harker',
      categoryId: 'cat-maint',
      title: 'Kitchen faucet dripping',
      description: 'The kitchen cold water faucet has a continuous drip.',
    });

    expect(req.id).toBeDefined();
    expect(req.ticketNumber).toMatch(/^GC-\d{8}-\d{4}$/);
    expect(req.status).toBe('new');
    expect(req.assignedDepartment).toBe('maintenance');
    expect(req.statusHistory).toHaveLength(1);
    expect(req.statusHistory![0].toStatus).toBe('new');
  });

  it('assigns staff and updates status to assigned', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-02',
      apartmentRef: 'Suite 202',
      guestName: 'Arthur Holmwood',
      categoryId: 'cat-hk',
      title: 'Extra bath sheets',
      description: 'Need two extra bath sheets.',
    });

    const updated = await requestService.assignRequest({
      requestId: req.id,
      department: 'housekeeping',
      staffId: 'staff-maria',
      staffName: 'Maria Santos',
      assignedBy: 'Duty Manager',
    });

    expect(updated.assignedDepartment).toBe('housekeeping');
    expect(updated.assignedStaffName).toBe('Maria Santos');
    expect(updated.status).toBe('assigned');
  });

  it('progresses to in_progress and resolved with mandatory notes', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-03',
      apartmentRef: 'Suite 203',
      guestName: 'Mina Murray',
      categoryId: 'cat-maint',
      title: 'Safe battery low',
      description: 'Safe beeps when closing.',
    });

    await requestService.updateStatus({
      requestId: req.id,
      newStatus: 'in_progress',
      changedByName: 'Carlos Gomez',
    });

    const resolved = await requestService.updateStatus({
      requestId: req.id,
      newStatus: 'resolved',
      resolutionNotes: 'Replaced 4x AA batteries. Reset master code.',
      changedByName: 'Carlos Gomez',
    });

    expect(resolved.status).toBe('resolved');
    expect(resolved.resolutionNotes).toBe('Replaced 4x AA batteries. Reset master code.');
    expect(resolved.resolvedAt).toBeDefined();
  });

  it('closes ticket when guest confirms satisfied resolution', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-04',
      apartmentRef: 'Suite 204',
      guestName: 'Lucy Westenra',
      categoryId: 'cat-tech',
      title: 'Wi-Fi slow in bedroom',
      description: 'Could not connect laptop.',
    });

    await requestService.updateStatus({
      requestId: req.id,
      newStatus: 'resolved',
      resolutionNotes: 'Connected device to 5GHz AP.',
    });

    const confirmed = await requestService.confirmResolution({
      requestId: req.id,
      satisfied: true,
      guestName: 'Lucy Westenra',
      notesOrReason: 'Working fast now, thank you!',
    });

    expect(confirmed.status).toBe('closed');
    expect(confirmed.guestSatisfaction).toBe('satisfied');
    expect(confirmed.guestConfirmedAt).toBeDefined();
  });

  it('AUTOMATICALLY REOPENS request with urgent priority if guest reports unresolved problem', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-05',
      apartmentRef: 'Suite 205',
      guestName: 'Dr. Seward',
      categoryId: 'cat-maint',
      title: 'Living room AC warm',
      description: 'AC blowing warm air.',
    });

    await requestService.updateStatus({
      requestId: req.id,
      newStatus: 'resolved',
      resolutionNotes: 'Reset thermostat.',
    });

    const reopened = await requestService.confirmResolution({
      requestId: req.id,
      satisfied: false,
      guestName: 'Dr. Seward',
      notesOrReason: 'Technician left but it is still blowing 26C air.',
    });

    expect(reopened.status).toBe('reopened');
    expect(reopened.reopenCount).toBe(1);
    expect(reopened.priority).toBe('urgent');
    expect(reopened.reopenReason).toContain('still blowing 26C air');
  });

  it('segregates internal staff notes from guest communications', async () => {
    const req = await requestService.createRequest({
      reservationRef: 'RES-TEST-06',
      apartmentRef: 'Suite 206',
      guestName: 'Quincey Morris',
      categoryId: 'cat-maint',
      title: 'Lock issue',
      description: 'Keycard reader red light.',
    });

    await requestService.addComment({
      requestId: req.id,
      authorType: 'staff',
      authorName: 'Locksmith',
      content: 'Internal note: Replaced magnetic strike plate.',
      isInternal: true,
    });

    await requestService.addComment({
      requestId: req.id,
      authorType: 'staff',
      authorName: 'Front Desk',
      content: 'Your door lock has been serviced and tested.',
      isInternal: false,
    });

    const fetched = requestService.getRequestById(req.id);
    expect(fetched?.comments).toHaveLength(2);

    const guestVisible = fetched?.comments?.filter(c => !c.isInternal);
    expect(guestVisible).toHaveLength(1);
    expect(guestVisible![0].content).toContain('Your door lock has been serviced');
  });
});
