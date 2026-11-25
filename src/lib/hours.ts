import { site } from "@/content/site";

/** "08:00" as "8am", "17:30" as "5:30pm". Same form as the quote form uses. */
function clock(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "am" : "pm";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${hour}${suffix}`
    : `${hour}:${String(minutes).padStart(2, "0")}${suffix}`;
}

/**
 * The opening hours as they read in a sentence: "8am to 5pm, seven days".
 *
 * Built from site.openingHours, the same source the contact page and the
 * schema use, so body copy that states the hours cannot drift from them.
 */
export function openingHoursPhrase(): string {
  const slot = site.openingHours[0];
  const times = `${clock(slot.opens)} to ${clock(slot.closes)}`;
  const days =
    slot.days.length === 7
      ? "seven days"
      : `${slot.days[0]} to ${slot.days[slot.days.length - 1]}`;
  return `${times}, ${days}`;
}
