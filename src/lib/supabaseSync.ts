// Live Supabase Synchronization & Storage Layer for GuestCare
// Syncs settings, requests, comments, feedback, and photo uploads with schema `guestcare`

import { supabase, isSupabaseConfigured } from './supabase';
import { GuestRequest, RequestComment, GuestFeedback, PortalSession } from '@/types/guestcare';

const isTestEnv = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';

export function canUseLiveSupabase(): boolean {
  return isSupabaseConfigured && !isTestEnv && typeof window !== 'undefined';
}

// --- Settings / Portal Config Sync (guestcare.settings) ---

export async function fetchAllSettingsFromSupabase(): Promise<Record<string, any> | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error || !data) return null;
    const map: Record<string, any> = {};
    data.forEach((row: { key: string; value: any }) => {
      map[row.key] = row.value;
    });
    return map;
  } catch {
    return null;
  }
}

export async function upsertSettingToSupabase(key: string, value: any, description?: string): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase.from('settings').upsert(
      {
        key,
        value,
        description: description || `GuestCare portal setting: ${key}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch {
    // Graceful fallback if table/network unavailable
  }
}

// --- Categories ID Resolution (maps app category codes to live DB UUIDs) ---

let categoryCodeToUuidCache: Record<string, string> | null = null;

export async function resolveCategoryUuid(categoryCode: string): Promise<string | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    if (!categoryCodeToUuidCache) {
      const { data, error } = await supabase.from('categories').select('id, code');
      if (error || !data) return null;
      categoryCodeToUuidCache = {};
      data.forEach((row: { id: string; code: string }) => {
        categoryCodeToUuidCache![row.code] = row.id;
      });
    }
    return categoryCodeToUuidCache[categoryCode] || Object.values(categoryCodeToUuidCache)[0] || null;
  } catch {
    return null;
  }
}

// --- Requests & Comments Sync (guestcare.requests, guestcare.comments) ---

export async function insertRequestToSupabase(req: GuestRequest, categoryCode: string): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    const categoryUuid = await resolveCategoryUuid(categoryCode);
    if (!categoryUuid) return;

    await supabase.from('requests').insert({
      id: req.id,
      ticket_number: req.ticketNumber,
      reservation_ref: req.reservationRef,
      apartment_ref: req.apartmentRef,
      guest_name: req.guestName,
      category_id: categoryUuid,
      title: req.title,
      description: req.description,
      priority: req.priority,
      status: req.status,
      assigned_department: req.assignedDepartment,
      assigned_staff_name: req.assignedStaffName || null,
      reopen_count: req.reopenCount,
      created_at: req.createdAt,
      updated_at: req.updatedAt,
    });
  } catch {
    // Graceful offline fallback
  }
}

export async function updateRequestInSupabase(req: GuestRequest): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase
      .from('requests')
      .update({
        status: req.status,
        priority: req.priority,
        assigned_department: req.assignedDepartment,
        assigned_staff_name: req.assignedStaffName || null,
        resolution_notes: req.resolutionNotes || null,
        resolved_at: req.resolvedAt || null,
        closed_at: req.closedAt || null,
        guest_confirmed_at: req.guestConfirmedAt || null,
        guest_satisfaction: req.guestSatisfaction || null,
        reopen_count: req.reopenCount,
        reopen_reason: req.reopenReason || null,
        updated_at: req.updatedAt,
      })
      .eq('id', req.id);
  } catch {
    // Graceful offline fallback
  }
}

export async function insertCommentToSupabase(comment: RequestComment): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase.from('comments').insert({
      request_id: comment.requestId,
      author_type: comment.authorType,
      author_name: comment.authorName,
      content: comment.content,
      is_internal: comment.isInternal,
      created_at: comment.createdAt,
    });
  } catch {
    // Graceful offline fallback
  }
}

export async function insertFeedbackToSupabase(fb: GuestFeedback): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase.from('feedback').insert({
      reservation_ref: fb.reservationRef,
      apartment_ref: fb.apartmentRef,
      guest_name: fb.guestName,
      overall_rating: fb.overallRating,
      cleanliness_rating: fb.cleanlinessRating || null,
      staff_rating: fb.staffRating || null,
      comfort_rating: fb.comfortRating || null,
      comments: fb.comments || null,
      is_anonymous: fb.isAnonymous,
      status: fb.status,
      created_at: fb.createdAt,
      updated_at: fb.updatedAt,
    });
  } catch {
    // Graceful offline fallback
  }
}

// --- Live Hydration (Requests, Comments, Status History, Feedback) ---

export async function fetchLiveRequestsFromSupabase(): Promise<GuestRequest[] | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    const [reqRes, cmtRes, histRes, catRes] = await Promise.all([
      supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('comments').select('*').order('created_at', { ascending: true }).limit(500),
      supabase.from('status_history').select('*').order('created_at', { ascending: true }).limit(500),
      supabase.from('categories').select('id, code'),
    ]);

    if (reqRes.error || !reqRes.data) return null;

    const catUuidToCode: Record<string, string> = {};
    (catRes.data || []).forEach((c: any) => {
      catUuidToCode[c.id] = c.code;
    });

    const commentsByReq: Record<string, RequestComment[]> = {};
    (cmtRes.data || []).forEach((c: any) => {
      if (!commentsByReq[c.request_id]) commentsByReq[c.request_id] = [];
      commentsByReq[c.request_id].push({
        id: c.id,
        requestId: c.request_id,
        authorType: c.author_type,
        authorId: c.author_id || undefined,
        authorName: c.author_name,
        content: c.content,
        isInternal: Boolean(c.is_internal),
        createdAt: c.created_at,
      });
    });

    const historyByReq: Record<string, any[]> = {};
    (histRes.data || []).forEach((h: any) => {
      if (!historyByReq[h.request_id]) historyByReq[h.request_id] = [];
      historyByReq[h.request_id].push({
        id: h.id,
        requestId: h.request_id,
        fromStatus: h.from_status || undefined,
        toStatus: h.to_status,
        changedByType: h.changed_by_type,
        changedById: h.changed_by_id || undefined,
        changedByName: h.changed_by_name,
        changeReason: h.change_reason || undefined,
        createdAt: h.created_at,
      });
    });

    return reqRes.data.map((r: any) => ({
      id: r.id,
      ticketNumber: r.ticket_number,
      reservationRef: r.reservation_ref,
      apartmentRef: r.apartment_ref,
      guestName: r.guest_name,
      categoryId: catUuidToCode[r.category_id] || r.category_id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      assignedDepartment: r.assigned_department,
      assignedStaffId: r.assigned_staff_id || undefined,
      assignedStaffName: r.assigned_staff_name || undefined,
      resolutionNotes: r.resolution_notes || undefined,
      resolvedAt: r.resolved_at || undefined,
      closedAt: r.closed_at || undefined,
      guestConfirmedAt: r.guest_confirmed_at || undefined,
      guestSatisfaction: r.guest_satisfaction || undefined,
      reopenCount: r.reopen_count || 0,
      reopenReason: r.reopen_reason || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      comments: commentsByReq[r.id] || [],
      statusHistory: historyByReq[r.id] || [],
    }));
  } catch {
    return null;
  }
}

export async function fetchLiveFeedbackFromSupabase(): Promise<GuestFeedback[] | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error || !data) return null;
    return data.map((f: any) => ({
      id: f.id,
      reservationRef: f.reservation_ref,
      apartmentRef: f.apartment_ref,
      guestName: f.guest_name,
      overallRating: f.overall_rating,
      cleanlinessRating: f.cleanliness_rating || undefined,
      staffRating: f.staff_rating || undefined,
      comfortRating: f.comfort_rating || undefined,
      comments: f.comments || undefined,
      isAnonymous: Boolean(f.is_anonymous),
      status: f.status,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
  } catch {
    return null;
  }
}

// --- Photo Upload to Private Supabase Storage Bucket (guestcare-attachments) ---

export async function uploadAttachmentToSupabase(file: File, folder = 'requests'): Promise<string | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from('guestcare-attachments')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}

// --- Realtime Subscription Helper ---

export function subscribeToGuestCareRealtime(onUpdate: () => void): () => void {
  if (!canUseLiveSupabase()) return () => {};
  try {
    const channel = supabase
      .channel('guestcare-live-sync')
      .on('postgres_changes', { event: '*', schema: 'guestcare', table: 'requests' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'guestcare', table: 'settings' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'guestcare', table: 'comments' }, onUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}


// --- Portal Sessions (Cross-Device QR Code Auth Persistence) ---

export async function insertPortalSessionToSupabase(session: PortalSession): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase.from('portal_sessions').insert({
      id: session.id,
      reservation_ref: session.reservationRef,
      apartment_ref: session.apartmentRef,
      guest_name: session.guestName,
      guest_email: session.guestEmail || null,
      guest_phone: session.guestPhone || null,
      token_hash: session.tokenHash,
      check_in_date: session.checkInDate,
      check_out_date: session.checkOutDate,
      expires_at: session.expiresAt,
      last_active_at: session.lastActiveAt,
      created_at: session.createdAt,
    });
  } catch {
    // Graceful fallback
  }
}

export async function findPortalSessionByHashInSupabase(tokenHash: string): Promise<PortalSession | null> {
  if (!canUseLiveSupabase()) return null;
  try {
    const { data, error } = await supabase
      .from('portal_sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      reservationRef: data.reservation_ref,
      apartmentRef: data.apartment_ref,
      guestName: data.guest_name,
      guestEmail: data.guest_email || undefined,
      guestPhone: data.guest_phone || undefined,
      tokenHash: data.token_hash,
      checkInDate: data.check_in_date,
      checkOutDate: data.check_out_date,
      expiresAt: data.expires_at,
      revokedAt: data.revoked_at || undefined,
      revocationReason: data.revocation_reason || undefined,
      lastActiveAt: data.last_active_at,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function updatePortalSessionLastActiveInSupabase(sessionId: string): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase
      .from('portal_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', sessionId);
  } catch {
    // Ignore
  }
}

export async function revokePortalSessionInSupabase(sessionId: string, reason: string): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase
      .from('portal_sessions')
      .update({
        revoked_at: new Date().toISOString(),
        revocation_reason: reason,
      })
      .eq('id', sessionId);
  } catch {
    // Ignore
  }
}

export async function revokeReservationSessionsInSupabase(reservationRef: string, reason: string): Promise<void> {
  if (!canUseLiveSupabase()) return;
  try {
    await supabase
      .from('portal_sessions')
      .update({
        revoked_at: new Date().toISOString(),
        revocation_reason: reason,
      })
      .eq('reservation_ref', reservationRef)
      .is('revoked_at', null);
  } catch {
    // Ignore
  }
}
