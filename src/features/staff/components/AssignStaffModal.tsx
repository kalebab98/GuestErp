import React, { useState } from 'react';
import { Department, GuestRequest } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GuestRequest | null;
  onAssign: (params: {
    requestId: string;
    department: Department;
    staffId?: string;
    staffName?: string;
    notes?: string;
  }) => Promise<void>;
}

const STAFF_MEMBERS: Record<Department, Array<{ id: string; name: string }>> = {
  maintenance: [
    { id: 'carlos-gomez', name: 'Carlos Gomez (Senior Technician)' },
    { id: 'marcus-vance', name: 'Marcus Vance (HVAC & Electrician)' },
    { id: 'andre-silva', name: 'Andre Silva (Plumber)' },
  ],
  housekeeping: [
    { id: 'maria-santos', name: 'Maria Santos (Floor Supervisor)' },
    { id: 'lucia-morales', name: 'Lucia Morales (Room Attendant)' },
    { id: 'jin-park', name: 'Jin Park (Housekeeping Lead)' },
  ],
  reception: [
    { id: 'anna-lin', name: 'Anna Lin (Front Desk Lead)' },
    { id: 'james-wilson', name: 'James Wilson (Guest Relations)' },
    { id: 'reception-desk', name: 'Front Desk Duty Officer' },
  ],
  management: [
    { id: 'elizabeth-taylor', name: 'Elizabeth Taylor (General Manager)' },
    { id: 'david-ross', name: 'David Ross (Operations Director)' },
  ],
};

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  request,
  onAssign,
}) => {
  const [department, setDepartment] = useState<Department>('maintenance');
  const [staffId, setStaffId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (request) {
      setDepartment(request.assignedDepartment);
      setStaffId(request.assignedStaffId || '');
      setNotes('');
    }
  }, [request]);

  if (!request) return null;

  const currentStaffOptions = [
    { value: '', label: '-- Unassigned (Department Queue) --' },
    ...STAFF_MEMBERS[department].map(s => ({ value: s.id, label: s.name })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedStaff = STAFF_MEMBERS[department].find(s => s.id === staffId);

    try {
      await onAssign({
        requestId: request.id,
        department,
        staffId: staffId || undefined,
        staffName: selectedStaff ? selectedStaff.name.split(' (')[0] : undefined,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Ticket"
      description={`Ticket #${request.ticketNumber} - ${request.apartmentRef}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Select
          label="Department"
          value={department}
          onChange={e => {
            const newDept = e.target.value as Department;
            setDepartment(newDept);
            setStaffId('');
          }}
          options={[
            { value: 'maintenance', label: 'Maintenance & Engineering' },
            { value: 'housekeeping', label: 'Housekeeping & Supplies' },
            { value: 'reception', label: 'Reception & Front Desk' },
            { value: 'management', label: 'Executive Management' },
          ]}
        />

        <Select
          label="Assign to Staff Member"
          value={staffId}
          onChange={e => setStaffId(e.target.value)}
          options={currentStaffOptions}
        />

        <Textarea
          label="Dispatch Instructions / Notes"
          placeholder="e.g., Please bring replacement filter, guest requested quiet entry..."
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

