// Rule-Based Guest Experience Health Engine
// Transparent, deterministic health scoring without black-box AI

import { GuestHealthRecord, GuestHealthStatus, GuestRequest, GuestFeedback } from '@/types/guestcare';

export interface HealthCalculationInput {
  reservationRef: string;
  apartmentRef: string;
  guestName: string;
  requests: GuestRequest[];
  feedback?: GuestFeedback[];
}

export class GuestHealthEngine {
  /**
   * Deterministically calculates the Guest Health status and score
   */
  static calculate(input: HealthCalculationInput): GuestHealthRecord {
    let score = 100;
    const reasons: string[] = [];

    const activeRequests = input.requests.filter(
      r => !['closed', 'cancelled'].includes(r.status)
    );

    const urgentOpen = activeRequests.filter(r => r.priority === 'urgent');
    const highOpen = activeRequests.filter(r => r.priority === 'high');
    const mediumOpen = activeRequests.filter(r => r.priority === 'medium');
    const reopenedList = input.requests.filter(r => r.reopenCount > 0 || r.status === 'reopened');
    const unsatisfiedList = input.requests.filter(r => r.guestSatisfaction === 'unsatisfied');
    const successfullyResolved = input.requests.filter(
      r => ['resolved', 'closed'].includes(r.status) && r.guestSatisfaction !== 'unsatisfied'
    );

    // Rule 1: Urgent open requests (-35 per request)
    if (urgentOpen.length > 0) {
      score -= urgentOpen.length * 35;
      reasons.push(`${urgentOpen.length} unresolved urgent ticket(s) requires immediate attention`);
    }

    // Rule 2: High priority open requests (-20 per request)
    if (highOpen.length > 0) {
      score -= highOpen.length * 20;
      reasons.push(`${highOpen.length} high priority request(s) open`);
    }

    // Rule 3: Reopened requests (-25 per request)
    if (reopenedList.length > 0) {
      score -= reopenedList.length * 25;
      reasons.push(`${reopenedList.length} request(s) was marked unresolved and reopened by guest`);
    }

    // Rule 4: Guest expressed dissatisfaction (-30 per instance)
    if (unsatisfiedList.length > 0) {
      score -= unsatisfiedList.length * 30;
      reasons.push(`${unsatisfiedList.length} resolution rejected with dissatisfaction`);
    }

    // Rule 5: Medium open requests (-10 per request)
    if (mediumOpen.length > 0) {
      score -= mediumOpen.length * 10;
      reasons.push(`${mediumOpen.length} standard pending service request(s)`);
    }

    // Rule 6: Low rating feedback (ratings <= 2 deduct -35, rating 3 deducts -15)
    if (input.feedback && input.feedback.length > 0) {
      input.feedback.forEach(f => {
        if (f.overallRating <= 2) {
          score -= 35;
          reasons.push(`Negative private feedback submitted (${f.overallRating}/5 stars)`);
        } else if (f.overallRating === 3) {
          score -= 15;
          reasons.push(`Neutral feedback submitted (${f.overallRating}/5 stars)`);
        } else if (f.overallRating >= 4) {
          score += 5;
          reasons.push(`Positive feedback received (${f.overallRating}/5 stars)`);
        }
      });
    }

    // Rule 7: Positive resolution recovery (+10 if issues were resolved and no urgent/high remaining)
    if (successfullyResolved.length > 0 && urgentOpen.length === 0 && highOpen.length === 0) {
      score += successfullyResolved.length * 10;
      reasons.push(`${successfullyResolved.length} issue(s) confirmed successfully resolved`);
    }

    // Normalize score 0 - 100
    score = Math.max(0, Math.min(100, score));

    // Determine status bucket
    let status: GuestHealthStatus = 'good';
    if (score >= 80) {
      // If the guest had prior issues that were resolved, they are "improving"
      if (successfullyResolved.length > 0 && (urgentOpen.length + highOpen.length === 0)) {
        status = 'improving';
      } else {
        status = 'good';
      }
    } else if (score >= 55) {
      status = 'at_risk';
    } else {
      status = 'critical';
    }

    if (reasons.length === 0) {
      reasons.push('No reported issues; stay operating under nominal guest satisfaction parameters');
    }

    return {
      id: `health-${input.reservationRef}`,
      reservationRef: input.reservationRef,
      apartmentRef: input.apartmentRef,
      guestName: input.guestName,
      status,
      score,
      reasons,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

