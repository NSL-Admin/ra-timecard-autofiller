/*
  * popup.ts
  * --------------
  * Controlls the popup page of the extension.
*/

import { RAWorkRecord } from "./constant";

// when a CSV file is selected, read it and store the records to the local storage
document.querySelector<HTMLInputElement>("#fileInput")!.onchange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files === null) return;
  if (target.files.length === 0) return;
  const file = target.files[0];

  const text = await fetchAsText(file);
  // first line is the header, last line is empty. So we slice them out.
  const records = text.split("\n").slice(1, -1).map((line: string): RAWorkRecord => {
    const [ra_name, date, start_time, end_time, break_time, description] = line.split(",");
    return {
      ra_name,
      date,
      start_time,
      end_time,
      break_time,
      description
    };
  });

  // temporarily store the records to the local storage
  chrome.storage.local.set({ records });
  fillInSelect(records);

}

const fillInSelect = (records: RAWorkRecord[]) => {
  // get a list of unique RA names
  const ra_names = [...new Set(records.map((record) => record.ra_name))];
  const selectTag = document.querySelector<HTMLSelectElement>("#selectRAName")!;
  ra_names.forEach((ra_name, index) => {
    const option = document.createElement("option");
    option.value = index.toString();
    option.textContent = ra_name;
    selectTag.appendChild(option);
  });
}

const fetchAsText = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}