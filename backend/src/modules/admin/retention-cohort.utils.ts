import { RetentionCohortWeekDto } from './dto/analytics-response.dto';

/** Returns ISO-week Monday 00:00:00 UTC for the given date. */
export function getWeekStart(d: Date): Date {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(d);
  result.setUTCDate(d.getUTCDate() + diff);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function buildWeekStartsList(numWeeks: number): Date[] {
  const now = new Date();
  const weeks: Date[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(getWeekStart(d));
  }
  return weeks;
}

export function buildUserWeekMap(
  rows: { userId: string; weekStart: Date }[],
): Map<string, Set<number>> {
  const map = new Map<string, Set<number>>();
  for (const row of rows) {
    const ts = new Date(row.weekStart).getTime();
    if (!map.has(row.userId)) map.set(row.userId, new Set());
    map.get(row.userId)!.add(ts);
  }
  return map;
}

export function buildCohortMap(
  firstScanRows: { userId: string; firstScan: Date }[],
): Map<number, Set<string>> {
  const map = new Map<number, Set<string>>();
  for (const { userId, firstScan } of firstScanRows) {
    const ws = getWeekStart(new Date(firstScan));
    const ts = ws.getTime();
    if (!map.has(ts)) map.set(ts, new Set());
    map.get(ts)!.add(userId);
  }
  return map;
}

export function buildCohortRows(
  weekStarts: Date[],
  cohortMap: Map<number, Set<string>>,
  userWeekMap: Map<string, Set<number>>,
): RetentionCohortWeekDto[] {
  const cohorts: RetentionCohortWeekDto[] = [];
  for (let wi = 0; wi < weekStarts.length; wi++) {
    const cohortWeek = weekStarts[wi];
    if (!cohortWeek) continue;
    const cohortUsers = cohortMap.get(cohortWeek.getTime());
    if (!cohortUsers || cohortUsers.size === 0) continue;
    const retention = calcRetentionRow(wi, weekStarts, cohortUsers, userWeekMap);
    cohorts.push({ weekStart: cohortWeek.toISOString(), newUsers: cohortUsers.size, retention });
  }
  return cohorts;
}

function calcRetentionRow(
  cohortIndex: number,
  weekStarts: Date[],
  cohortUsers: Set<string>,
  userWeekMap: Map<string, Set<number>>,
): number[] {
  const retention: number[] = [100];
  const remainingWeeks = weekStarts.length - cohortIndex - 1;
  for (let offset = 1; offset <= remainingWeeks; offset++) {
    const targetWeek = weekStarts[cohortIndex + offset];
    if (!targetWeek) break;
    const targetTs = targetWeek.getTime();
    let retained = 0;
    for (const userId of cohortUsers) {
      if (userWeekMap.get(userId)?.has(targetTs)) retained++;
    }
    retention.push(parseFloat(((retained / cohortUsers.size) * 100).toFixed(1)));
  }
  return retention;
}
