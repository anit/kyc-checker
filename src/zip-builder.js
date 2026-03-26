'use strict';

export class ZipBuilder {
  static async build(steps, answers) {
    const zip = new window.JSZip();

    const answersData = {};

    steps.forEach((step, i) => {
      const answer = answers[i];
      if (answer === undefined) return;

      if (step.type === 'photo') {
        answersData[i] = { label: step.label, type: step.type, file: `photo_step_${i}.jpg` };
      } else if (step.type === 'upload') {
        const file = answer;
        answersData[i] = { label: step.label, type: step.type, file: `file_step_${i}_${file.name}` };
      } else {
        answersData[i] = { label: step.label, type: step.type, value: answer };
      }
    });

    zip.file('answers.json', JSON.stringify(answersData, null, 2));

    steps.forEach((step, i) => {
      const answer = answers[i];
      if (answer === undefined) return;

      if (step.type === 'photo' && answer.dataUrl) {
        const b64 = answer.dataUrl.replace(/^data:image\/\w+;base64,/, '');
        zip.file(`photo_step_${i}.jpg`, b64, { base64: true });
      } else if (step.type === 'upload' && answer instanceof File) {
        zip.file(`file_step_${i}_${answer.name}`, answer);
      }
    });

    return zip.generateAsync({ type: 'blob' });
  }
}
