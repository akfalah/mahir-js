import { prisma } from '../applications/database';

import { JwtPayload } from '../models/auth.model';

import { addDays, toDay } from '../utils/date';

export class LearningStreakService {
  static calculateLearningStreak(days: Set<string>, today: string) {
    // Not submitted yet today? The streak is still alive until the day ends
    let cursor = days.has(today) ? today : addDays(today, -1);
    let currentStreak = 0;

    while (days.has(cursor)) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    }

    const activeDates = Array.from({ length: 7 }, (_, i) =>
      addDays(today, -i),
    ).filter((day) => days.has(day));

    return { currentStreak, today, activeDates };
  }

  static async getLearningStreak(user: JwtPayload, now = new Date()) {
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      select: { createdAt: true },
    });

    const days = new Set(submissions.map((s) => toDay(s.createdAt)));

    return LearningStreakService.calculateLearningStreak(days, toDay(now));
  }
}
