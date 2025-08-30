/**
 * Utility functions for time calculations and conversions
 */

export interface TimeMetrics {
  averageHours: number;
  medianHours: number;
  minHours: number;
  maxHours: number;
  count: number;
}

export interface TimeBreakdown {
  priority?: string;
  category?: string;
  averageHours: number;
  count: number;
  minHours: number;
  maxHours: number;
}

export interface SLACompliance {
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours?: number;
  target: number;
  compliant: boolean;
}

/**
 * Calculate time difference in hours between two dates
 */
export function calculateTimeDifferenceHours(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return timeDiff / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Calculate time difference in minutes between two dates
 */
export function calculateTimeDifferenceMinutes(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return timeDiff / (1000 * 60); // Convert milliseconds to minutes
}

/**
 * Calculate time difference in days between two dates
 */
export function calculateTimeDifferenceDays(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return timeDiff / (1000 * 60 * 60 * 24); // Convert milliseconds to days
}

/**
 * Calculate comprehensive time metrics from an array of time differences (in milliseconds)
 */
export function calculateTimeMetrics(timeDifferences: number[]): TimeMetrics {
  if (timeDifferences.length === 0) {
    return {
      averageHours: 0,
      medianHours: 0,
      minHours: 0,
      maxHours: 0,
      count: 0,
    };
  }

  const sortedTimes = [...timeDifferences].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedTimes.length / 2);
  const medianTime = sortedTimes.length % 2 === 0
    ? (sortedTimes[medianIndex - 1] + sortedTimes[medianIndex]) / 2
    : sortedTimes[medianIndex];

  return {
    averageHours: timeDifferences.reduce((sum, time) => sum + time, 0) / timeDifferences.length / (1000 * 60 * 60),
    medianHours: medianTime / (1000 * 60 * 60),
    minHours: Math.min(...timeDifferences) / (1000 * 60 * 60),
    maxHours: Math.max(...timeDifferences) / (1000 * 60 * 60),
    count: timeDifferences.length,
  };
}

/**
 * Group time differences by a specific field and calculate metrics for each group
 */
export function calculateTimeBreakdown<T>(
  data: T[],
  timeExtractor: (item: T) => number,
  groupExtractor: (item: T) => string,
): TimeBreakdown[] {
  const groups: Record<string, number[]> = {};

  data.forEach(item => {
    const group = groupExtractor(item);
    const time = timeExtractor(item);
    
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(time);
  });

  return Object.entries(groups).map(([group, times]) => ({
    [groupExtractor.name === 'priority' ? 'priority' : 'category']: group,
    averageHours: times.reduce((sum, time) => sum + time, 0) / times.length / (1000 * 60 * 60),
    count: times.length,
    minHours: Math.min(...times) / (1000 * 60 * 60),
    maxHours: Math.max(...times) / (1000 * 60 * 60),
  }));
}

/**
 * Format time duration in a human-readable format
 */
export function formatTimeDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    }
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  }
}

/**
 * Check if a time duration meets SLA requirements
 */
export function checkSLACompliance(actualHours: number, targetHours: number): boolean {
  return actualHours <= targetHours;
}

/**
 * Calculate SLA compliance rate
 */
export function calculateSLAComplianceRate(compliantCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return (compliantCount / totalCount) * 100;
}

/**
 * Get business hours between two dates (excluding weekends and holidays)
 */
export function calculateBusinessHours(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessHours = 0;

  while (start <= end) {
    const dayOfWeek = start.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessHours += 8; // Assuming 8-hour workday
    }
    start.setDate(start.getDate() + 1);
  }

  return businessHours;
}

/**
 * Convert milliseconds to different time units
 */
export const TimeConversions = {
  toSeconds: (ms: number) => ms / 1000,
  toMinutes: (ms: number) => ms / (1000 * 60),
  toHours: (ms: number) => ms / (1000 * 60 * 60),
  toDays: (ms: number) => ms / (1000 * 60 * 60 * 24),
  toWeeks: (ms: number) => ms / (1000 * 60 * 60 * 24 * 7),
};

/**
 * Get time ago string (e.g., "2 hours ago", "3 days ago")
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = TimeConversions.toHours(diffMs);
  const diffDays = TimeConversions.toDays(diffMs);

  if (diffHours < 1) {
    const minutes = Math.round(TimeConversions.toMinutes(diffMs));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    const hours = Math.round(diffHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    const days = Math.round(diffDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.round(TimeConversions.toWeeks(diffMs));
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else {
    const months = Math.round(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
}
