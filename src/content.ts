/*
  * content.ts
  * --------------
  * Receives message from the background script and injects HTML and CSS to the page,
  * then reads a CSV file and fill the timecard.
*/

import { RAWorkRecord } from "./constant";
// @ts-ignore (because below is not a module but a syntax for Vite)
import html from './insertedcomponent.html?raw'  // content of html file is loaded to `html` variable as a string
// @ts-ignore (because below is not a module but a syntax for Vite)
import css from './bootstrap.min.css?raw'

chrome.runtime.onMessage.addListener((message: { message: string }) => {
  if (message.message !== "extension_icon_clicked") return;

  // the whole page is inside an iframe, so we need to get the iframe's document
  const outerIFrameDocument = document.querySelector<HTMLIFrameElement>('html > frameset > frame:nth-child(1)')!.contentDocument!;

  // see if the CSS and HTML are already injected
  if (outerIFrameDocument.querySelector<HTMLStyleElement>("#fileInput") !== null) return;

  // inject CSS first ( for bootstrap )
  const styleTag = outerIFrameDocument.createElement("style");
  styleTag.textContent = css;
  outerIFrameDocument.head.appendChild(styleTag);

  // then inject HTML
  const timecardTable = outerIFrameDocument.querySelector<HTMLTableElement>("#pms_SeiInputArray");
  if (timecardTable === null) return;
  timecardTable.insertAdjacentHTML("beforebegin", html);

  // this is too ugly, but here `records` is used as a global variable to be used in multiple handlers
  let records = [] as RAWorkRecord[];

  // when the file is selected, read the file and populate the select tag
  outerIFrameDocument.querySelector<HTMLInputElement>("#fileInput")!.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files === null) return;
    if (target.files.length === 0) return;
    const file = target.files[0];

    const text = await fetchAsText(file);
    records = text
      .split("\n")
      .slice(1)  // first line is the header
      .filter((line: string) => line !== "")  // maybe there's an empty line at the end of the file
      .map((line: string): RAWorkRecord => {
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

    // get a list of unique RA names and set them to the select tag
    const ra_names = [...new Set(records.map((record) => record.ra_name))];
    const selectTag = outerIFrameDocument.querySelector<HTMLSelectElement>("#selectRAName")!;
    ra_names.forEach((ra_name, index) => {
      const option = outerIFrameDocument.createElement("option");
      option.value = index.toString();
      option.textContent = ra_name;
      selectTag.appendChild(option);
    });
  }

  outerIFrameDocument.querySelector<HTMLButtonElement>("#fillButton")!.onclick = async () => {
    const selectTag = outerIFrameDocument.querySelector<HTMLSelectElement>("#selectRAName")!;
    const selectedRAName = selectTag.options[selectTag.selectedIndex]?.text
    if (selectedRAName === undefined) return;

    // filter the records by the selected RA name
    const filteredRecords = records.filter((record) => record.ra_name === selectedRAName);

    let errors = [] as string[];
    const selectorForStartTime = "td:nth-child(4) > input[type=text]";
    const selectorForEndTime = "td:nth-child(5) > input[type=text]";
    const selectorForBreakTime = "td:nth-child(7) > input[type=text]";
    const selectorForDescription = "td:nth-child(12) > input[type=text]";

    // fill in the timecard
    let lastProcessedDate = 0;
    for (let record of filteredRecords) {
      if (lastProcessedDate == parseInt(record.date)) {
        errors.push(`${record.date}日に複数の勤務が見つかりました。CSVファイルを参照して手動で入力してください。`);
        continue;
      }

      const rowIdForThisDate = `#pms_SeiInputArray_tr_${parseInt(record.date) - 1}`
      const tableRow = outerIFrameDocument.querySelector<HTMLTableRowElement>(rowIdForThisDate)
      if (tableRow === null) {
        errors.push(`${record.date}日に対応する行が見つかりませんでした。`);
        continue;
      }

      // fill in each input tag
      // 1. start time
      const startTimeInputTag = tableRow.querySelector<HTMLInputElement>(selectorForStartTime)!;
      await fillInputTag(startTimeInputTag, record.start_time, 10);
      // 2. endtime
      const endTimeInputTag = tableRow.querySelector<HTMLInputElement>(selectorForEndTime)!;
      await fillInputTag(endTimeInputTag, record.end_time, 10);
      // 3. breaktime
      const breakTimeInputTag = tableRow.querySelector<HTMLInputElement>(selectorForBreakTime)!;
      await fillInputTag(breakTimeInputTag, record.break_time, 10);
      // 4. description ( no need to focus and blur )
      const descriptionInputTag = tableRow.querySelector<HTMLInputElement>(selectorForDescription)!;
      await fillInputTag(descriptionInputTag, record.description, 0);

      lastProcessedDate = parseInt(record.date);
    }

    // show the errors if any
    if (errors.length > 0) {
      const errorMsgField = outerIFrameDocument.querySelector<HTMLDivElement>("#errorMessageField")!;
      errors.forEach((errorMsg: string) => {
        const errorMsgElement = outerIFrameDocument.createElement("p");
        errorMsgElement.textContent = errorMsg;
        errorMsgField.appendChild(errorMsgElement);
      });
      errorMsgField.hidden = false;  // make the error message field visible
    }
  }


  const fetchAsText = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  const fillInputTag = async (inputTag: HTMLInputElement, value: string, pauseTime: number) => {
    // since there is a Javascript event handler that fires when the input field is focused or blurred,
    // we need to focus the input field first, then set the value, then blur the input field.
    inputTag.focus();
    await sleep(pauseTime);  // wait for the script for focus event to be completed
    inputTag.value = value;
    inputTag.blur();
    await sleep(pauseTime);  // wait for the script for blur event to be completed
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})