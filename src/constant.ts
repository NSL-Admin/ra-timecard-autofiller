/*
  * constant.ts
  * --------------
  * Constant values that may be used in both popup and background scripts.
*/

export interface RAWorkRecord {
  ra_name: string,
  date: string,
  start_time: string,
  end_time: string,
  break_time: string,
  description: string
}