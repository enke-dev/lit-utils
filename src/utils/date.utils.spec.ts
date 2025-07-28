import { expect } from '@open-wc/testing';

import { getWeekNumber, shortDate } from './date.utils.js';

describe('date.utils', () => {
  describe('shortDate', () => {
    it('formats a date to "YYYY-MM-DD"', () => {
      const date = new Date('2023-01-01');
      const formattedDate = shortDate(date);
      expect(formattedDate).to.equal('2023-01-01');
    });

    it('handles invalid dates gracefully', () => {
      const date = new Date('invalid-date');
      const formattedDate = shortDate(date);
      expect(formattedDate).to.be.undefined;
    });
  });

  describe('getWeekNumber', () => {
    it('returns the correct week number for a given date', () => {
      const date = new Date('2023-01-01'); // This is a Sunday
      const weekNumber = getWeekNumber(date);
      expect(weekNumber).to.equal(52); // 2023-01-01 is in the last week of 2022
    });

    it('handles leap years correctly', () => {
      const date = new Date('2020-02-29'); // Leap day
      const weekNumber = getWeekNumber(date);
      expect(weekNumber).to.equal(9); // 2020-02-29 is in the 9th week of 2020
    });
  });
});
