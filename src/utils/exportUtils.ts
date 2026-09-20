import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { ComputedStudentResult, SchoolSettings, Subject, Student, Teacher } from '../types';

/**
 * Export results to Excel (.xlsx) file
 * Generates two sheets:
 * 1. "លទ្ធផលផ្លូវការ" - The official 7-column format as used at វិទ្យាល័យ ម៉ាឡៃ
 * 2. "ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា" - Detailed score breakdown of each subject
 */
export function exportResultsToExcel(
  results: ComputedStudentResult[],
  subjects: Subject[],
  periodName: string,
  grade: number | string,
  section: string,
  schoolSettings: SchoolSettings
) {
  const teacherName = results[0]?.teacher?.name || 'ពុំទាន់កំណត់';
  const totalCount = results.length;
  const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;

  // Filter active subjects
  const activeSubjectIds = new Set<string>();
  results.forEach(r => {
    Object.keys(r.scores).forEach(sId => activeSubjectIds.add(sId));
  });
  const currentSubjects = subjects.filter(s => activeSubjectIds.has(s.id));

  // --- SHEET 1: លទ្ធផលផ្លូវការ (Official 7-column Ranking Sheet) ---
  const sheet1Header = [
    ['មន្ទីរអប់រំ យុវជន និងកីឡា', '', '', '', '', 'ព្រះរាជាណាចក្រកម្ពុជា'],
    [schoolSettings.districtName || 'ខេត្តបន្ទាយមានជ័យ', '', '', '', '', 'ជាតិ សាសនា ព្រះមហាក្សត្រ'],
    [schoolSettings.schoolName, '', '', '', '', ''],
    [''],
    ['', '', `លទ្ធផលប្រចាំ${periodName} ឆ្នាំសិក្សា ${schoolSettings.academicYear}`],
    ['', '', `បញ្ជីរាយនាមសិស្ស ថ្នាក់ទី${grade}(${section === 'all' ? '' : section})`],
    [''],
    ['ល.រ', 'អត្តលេខ', 'គោត្តនាម-នាម', 'ភេទ', 'មធ្យមភាគ', 'ចំណាត់ថ្នាក់', 'និទ្ទេស'],
  ];

  const sheet1Data = results.map((r, idx) => [
    idx + 1,
    r.student.code,
    r.student.nameKhmer,
    r.student.gender,
    r.average,
    r.rank,
    r.shortMention || r.gradeMention.charAt(r.gradeMention.indexOf(' ') + 1) || 'E',
  ]);

  const sheet1Footer = [
    [''],
    [`បញ្ជីបញ្ឈប់ត្រឹមចំនួន ${totalCount} នាក់ ក្នុងនោះសិស្សស្រីចំនួន ${femaleCount} នាក់`],
    [''],
    ['', '', '', '', `${schoolSettings.location}، ${schoolSettings.issuedDate}`],
    ['បានឃើញ និងឯកភាព', '', '', '', 'គ្រូបន្ទុកថ្នាក់'],
    ['នាយក', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    [schoolSettings.principalName, '', '', '', teacherName],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet([...sheet1Header, ...sheet1Data, ...sheet1Footer]);

  // Column widths for sheet 1
  ws1['!cols'] = [
    { wch: 8 },  // ល.រ
    { wch: 14 }, // អត្តលេខ
    { wch: 28 }, // គោត្តនាម-នាម
    { wch: 10 }, // ភេទ
    { wch: 14 }, // មធ្យមភាគ
    { wch: 14 }, // ចំណាត់ថ្នាក់
    { wch: 12 }, // និទ្ទេស
  ];

  // --- SHEET 2: ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា (Detailed Subject Matrix) ---
  const sheet2Header = [
    [`${schoolSettings.schoolName} - តារាងស្រង់ពិន្ទុលម្អិត`],
    [`ការវាយតម្លៃ៖ ${periodName} | ថ្នាក់ទី៖ ${grade}${section === 'all' ? '' : section} | ឆ្នាំសិក្សា៖ ${schoolSettings.academicYear}`],
    [''],
    [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម-នាម',
      'អក្សរឡាតាំង',
      'ភេទ',
      'ថ្នាក់',
      ...currentSubjects.map(s => `${s.name} (x${s.coefficient})`),
      'ពិន្ទុសរុប',
      'មធ្យមភាគ',
      'ចំណាត់ថ្នាក់',
      'និទ្ទេស',
      'លទ្ធផល',
    ],
  ];

  const sheet2Data = results.map((r, idx) => [
    idx + 1,
    r.student.code,
    r.student.nameKhmer,
    r.student.nameLatin,
    r.student.gender,
    `${r.student.grade}${r.student.section}`,
    ...currentSubjects.map(s => r.scores[s.id] ?? '-'),
    r.totalScore,
    r.average,
    r.rank,
    r.gradeMention,
    r.passed ? 'ជាប់' : 'ធ្លាក់',
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet([...sheet2Header, ...sheet2Data]);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 24 },
    { wch: 20 },
    { wch: 8 },
    { wch: 10 },
    ...currentSubjects.map(() => ({ wch: 16 })),
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws1, 'លទ្ធផលផ្លូវការ');
  XLSX.utils.book_append_sheet(workbook, ws2, 'ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា');

  const fileName = `លទ្ធផល_${schoolSettings.schoolName.replace(/\s+/g, '')}_ថ្នាក់ទី${grade}${section === 'all' ? '' : section}_${periodName.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Helper to render an HTML element into a PDF using html2canvas-pro and jsPDF
 * html2canvas-pro supports modern CSS features and color functions including oklch().
 */
async function generatePdfFromElement(
  container: HTMLElement,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  marginMm: [number, number, number, number] = [8, 8, 8, 8]
): Promise<void> {
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: orientation,
    });

    const [marginTop, marginRight, marginBottom, marginLeft] = marginMm;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const innerWidth = pageWidth - marginLeft - marginRight;
    const innerHeight = pageHeight - marginTop - marginBottom;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Height in canvas pixels that corresponds to one inner PDF page
    const pageSlicePx = Math.floor(canvasWidth * (innerHeight / innerWidth));
    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageSlicePx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage('a4', orientation);
      }

      const sourceY = page * pageSlicePx;
      const sourceHeight = Math.min(pageSlicePx, canvasHeight - sourceY);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasWidth;
      sliceCanvas.height = sourceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');

      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0, sourceY, canvasWidth, sourceHeight,
          0, 0, canvasWidth, sourceHeight
        );

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const renderedHeight = (sourceHeight / canvasWidth) * innerWidth;

        pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, innerWidth, renderedHeight);
      }
    }

    pdf.save(filename);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Export results directly to PDF (.pdf) matching the official document of វិទ្យាល័យ ម៉ាឡៃ
 */
export async function exportResultsToPdf(
  results: ComputedStudentResult[],
  subjects: Subject[],
  periodName: string,
  grade: number | string,
  section: string,
  schoolSettings: SchoolSettings,
  format: 'official' | 'detailed' = 'official'
) {
  const teacherName = results[0]?.teacher?.name || 'ពុំទាន់កំណត់';
  const totalCount = results.length;
  const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;

  const container = document.createElement('div');
  container.style.width = format === 'detailed' ? '280mm' : '190mm';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Kantumruy Pro', 'Siemreap', sans-serif";
  container.style.padding = '8mm 10mm';
  container.style.boxSizing = 'border-box';

  if (format === 'official') {
    // Official 7-column format as used at វិទ្យាល័យ ម៉ាឡៃ
    const rowsHtml = results
      .map((r, idx) => {
        const shortMention = r.shortMention || (r.average >= 85 ? 'A' : r.average >= 75 ? 'B' : r.average >= 65 ? 'C' : r.average >= 55 ? 'D' : r.average >= 50 ? 'E' : 'F');
        return `
          <tr style="height: 24px; text-align: center; font-size: 11px;">
            <td style="border: 1px solid #000; padding: 3px 2px;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 3px 2px; font-family: monospace; font-size: 10px;">${r.student.code}</td>
            <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: 500;">${r.student.nameKhmer}</td>
            <td style="border: 1px solid #000; padding: 3px 2px;">${r.student.gender}</td>
            <td style="border: 1px solid #000; padding: 3px 2px; font-weight: 600;">${r.average.toFixed(2)}</td>
            <td style="border: 1px solid #000; padding: 3px 2px; font-weight: 600;">${r.rank}</td>
            <td style="border: 1px solid #000; padding: 3px 2px; font-weight: 700;">${shortMention}</td>
          </tr>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; font-size: 12px; line-height: 1.4;">
        <!-- Header -->
        <table style="width: 100%; border: none; margin-bottom: 8px;">
          <tr>
            <td style="vertical-align: top; width: 45%; text-align: left;">
              <div style="font-size: 12px; font-weight: 600;">${schoolSettings.departmentName}</div>
              <div style="font-size: 12px; font-weight: 600;">${schoolSettings.districtName}</div>
              <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${schoolSettings.schoolName}</div>
            </td>
            <td style="vertical-align: top; width: 55%; text-align: center;">
              <div style="font-size: 13px; font-weight: 700;">ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div style="font-size: 12px; font-weight: 600;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              <div style="font-size: 10px; margin-top: 2px; letter-spacing: 2px;">3 3 3 🪷 3 3 3</div>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <div style="text-align: center; margin: 12px 0 10px 0;">
          <div style="font-size: 14px; font-weight: 700;">លទ្ធផលប្រចាំ${periodName} ឆ្នាំសិក្សា ${schoolSettings.academicYear}</div>
          <div style="font-size: 13px; font-weight: 600; margin-top: 2px;">បញ្ជីរាយនាមសិស្ស ថ្នាក់ទី${grade}(${section === 'all' ? '' : section})</div>
        </div>

        <!-- 7-Column Official Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; border: 1px solid #000;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: center; font-size: 11px; font-weight: 700; height: 28px;">
              <th style="border: 1px solid #000; width: 38px; padding: 4px 2px;">ល.រ</th>
              <th style="border: 1px solid #000; width: 68px; padding: 4px 2px;">អត្តលេខ</th>
              <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">គោត្តនាម-នាម</th>
              <th style="border: 1px solid #000; width: 44px; padding: 4px 2px;">ភេទ</th>
              <th style="border: 1px solid #000; width: 72px; padding: 4px 2px;">មធ្យមភាគ</th>
              <th style="border: 1px solid #000; width: 76px; padding: 4px 2px;">ចំណាត់ថ្នាក់</th>
              <th style="border: 1px solid #000; width: 56px; padding: 4px 2px;">និទ្ទេស</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Summary text -->
        <div style="margin-top: 10px; font-size: 11px; font-style: italic;">
          បញ្ជីបញ្ឈប់ត្រឹមចំនួន <strong>${totalCount}</strong> នាក់ ក្នុងនោះសិស្សស្រីចំនួន <strong>${femaleCount}</strong> នាក់
        </div>

        <!-- Signatures (Avoid page break) -->
        <div style="page-break-inside: avoid; margin-top: 20px;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 50%; text-align: center; vertical-align: top;">
                <div style="font-size: 11px;">បានឃើញ និងឯកភាព</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">នាយក</div>
                <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា និងត្រា)</div>
                <div style="height: 60px;"></div>
                <div style="font-size: 12px; font-weight: 700;">${schoolSettings.principalName}</div>
              </td>
              <td style="width: 50%; text-align: center; vertical-align: top;">
                <div style="font-size: 11px;">${schoolSettings.location}، ${schoolSettings.issuedDate}</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">គ្រូបន្ទុកថ្នាក់</div>
                <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា)</div>
                <div style="height: 60px;"></div>
                <div style="font-size: 12px; font-weight: 700;">${teacherName}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  } else {
    // Detailed format (Landscape)
    const activeSubjectIds = new Set<string>();
    results.forEach(r => {
      Object.keys(r.scores).forEach(sId => activeSubjectIds.add(sId));
    });
    const currentSubjects = subjects.filter(s => activeSubjectIds.has(s.id));

    const rowsHtml = results
      .map((r, idx) => `
        <tr style="height: 22px; text-align: center; font-size: 10px;">
          <td style="border: 1px solid #000; padding: 2px;">${idx + 1}</td>
          <td style="border: 1px solid #000; padding: 2px; font-family: monospace;">${r.student.code}</td>
          <td style="border: 1px solid #000; padding: 2px 4px; text-align: left; font-weight: 600;">${r.student.nameKhmer}</td>
          <td style="border: 1px solid #000; padding: 2px;">${r.student.gender}</td>
          ${currentSubjects.map(s => `<td style="border: 1px solid #000; padding: 2px;">${r.scores[s.id] ?? '-'}</td>`).join('')}
          <td style="border: 1px solid #000; padding: 2px; font-weight: 700;">${r.totalScore}</td>
          <td style="border: 1px solid #000; padding: 2px; font-weight: 700;">${r.average}</td>
          <td style="border: 1px solid #000; padding: 2px; font-weight: 700; background-color: #fef08a;">${r.rank}</td>
          <td style="border: 1px solid #000; padding: 2px;">${r.gradeMention}</td>
          <td style="border: 1px solid #000; padding: 2px; font-weight: 600;">${r.passed ? 'ជាប់' : 'ធ្លាក់'}</td>
        </tr>
      `)
      .join('');

    container.innerHTML = `
      <div style="width: 100%; font-size: 11px;">
        <table style="width: 100%; border: none; margin-bottom: 8px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <div style="font-size: 11px; font-weight: 600;">${schoolSettings.departmentName} - ${schoolSettings.districtName}</div>
              <div style="font-size: 13px; font-weight: 700;">${schoolSettings.schoolName}</div>
              <div style="font-size: 11px;">គ្រូបន្ទុកថ្នាក់៖ <strong>${teacherName}</strong></div>
            </td>
            <td style="vertical-align: top; width: 50%; text-align: right;">
              <div style="font-size: 12px; font-weight: 700;">ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div style="font-size: 11px; font-weight: 600;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 8px 0;">
          <div style="font-size: 13px; font-weight: 700;">តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់សិស្សប្រចាំ${periodName}</div>
          <div style="font-size: 11px;">ថ្នាក់ទី ${grade}${section === 'all' ? '' : section} | ឆ្នាំសិក្សា ${schoolSettings.academicYear}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
          <thead>
            <tr style="background-color: #e2e8f0; font-size: 10px; font-weight: 700; height: 26px;">
              <th style="border: 1px solid #000; padding: 2px; width: 30px;">ល.រ</th>
              <th style="border: 1px solid #000; padding: 2px; width: 60px;">អត្តលេខ</th>
              <th style="border: 1px solid #000; padding: 2px 4px; text-align: left;">គោត្តនាម-នាម</th>
              <th style="border: 1px solid #000; padding: 2px; width: 35px;">ភេទ</th>
              ${currentSubjects.map(s => `<th style="border: 1px solid #000; padding: 2px; font-size: 9px;">${s.name}</th>`).join('')}
              <th style="border: 1px solid #000; padding: 2px; width: 45px;">សរុប</th>
              <th style="border: 1px solid #000; padding: 2px; width: 45px;">មធ្យម</th>
              <th style="border: 1px solid #000; padding: 2px; width: 40px;">ចំណាត់</th>
              <th style="border: 1px solid #000; padding: 2px; width: 85px;">និទ្ទេស</th>
              <th style="border: 1px solid #000; padding: 2px; width: 45px;">លទ្ធផល</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="page-break-inside: avoid; margin-top: 20px;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 50%; text-align: center; vertical-align: top;">
                <div>បានឃើញ និងឯកភាព</div>
                <div style="font-weight: 700; margin-top: 2px;">នាយក</div>
                <div style="height: 50px;"></div>
                <div style="font-weight: 700;">${schoolSettings.principalName}</div>
              </td>
              <td style="width: 50%; text-align: center; vertical-align: top;">
                <div>${schoolSettings.location}، ${schoolSettings.issuedDate}</div>
                <div style="font-weight: 700; margin-top: 2px;">គ្រូបន្ទុកថ្នាក់</div>
                <div style="height: 50px;"></div>
                <div style="font-weight: 700;">${teacherName}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  const filename = `លទ្ធផល_${schoolSettings.schoolName.replace(/\s+/g, '')}_ថ្នាក់ទី${grade}${section === 'all' ? '' : section}_${periodName.replace(/\s+/g, '_')}.pdf`;
  await generatePdfFromElement(
    container,
    filename,
    format === 'detailed' ? 'landscape' : 'portrait',
    [8, 8, 8, 8]
  );
}

/**
 * Export Individual Student Transcript directly to PDF (.pdf)
 */
export async function exportStudentTranscriptToPdf(
  result: ComputedStudentResult,
  subjects: Subject[],
  schoolSettings: SchoolSettings
) {
  const applicableSubjects = subjects.filter(s =>
    s.applicableGrades.includes(result.student.grade)
  );

  const container = document.createElement('div');
  container.style.width = '190mm';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Kantumruy Pro', 'Siemreap', sans-serif";
  container.style.padding = '10mm 12mm';
  container.style.boxSizing = 'border-box';

  const subjectRows = applicableSubjects
    .map((s, idx) => {
      const score = result.scores[s.id] ?? 0;
      const mention = computeSubjectMention(score);
      return `
        <tr style="text-align: center; font-size: 11px; height: 24px;">
          <td style="border: 1px solid #000; padding: 4px;">${idx + 1}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: 600;">${s.name}</td>
          <td style="border: 1px solid #000; padding: 4px;">${s.maxScore}</td>
          <td style="border: 1px solid #000; padding: 4px;">${s.coefficient}</td>
          <td style="border: 1px solid #000; padding: 4px; font-weight: 700; ${score < 50 ? 'color: #dc2626;' : ''}">${score}</td>
          <td style="border: 1px solid #000; padding: 4px;">${mention}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; font-size: 12px; line-height: 1.4;">
      <table style="width: 100%; border: none; margin-bottom: 12px;">
        <tr>
          <td style="vertical-align: top; width: 50%;">
            <div style="font-size: 12px; font-weight: 600;">${schoolSettings.departmentName}</div>
            <div style="font-size: 12px; font-weight: 600;">${schoolSettings.districtName}</div>
            <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${schoolSettings.schoolName}</div>
          </td>
          <td style="vertical-align: top; width: 50%; text-align: center;">
            <div style="font-size: 13px; font-weight: 700;">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style="font-size: 12px; font-weight: 600;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div style="font-size: 10px; margin-top: 2px; letter-spacing: 2px;">3 3 3 🪷 3 3 3</div>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 14px 0;">
        <div style="font-size: 16px; font-weight: 700; color: #1e3a8a;">ព្រឹត្តិបត្រពិន្ទុ និងលទ្ធផលសិក្សា</div>
        <div style="font-size: 12px; font-weight: 600; margin-top: 2px;">
          ការវាយតម្លៃ៖ ${result.periodName} | ឆ្នាំសិក្សា៖ ${schoolSettings.academicYear}
        </div>
      </div>

      <!-- Student Info -->
      <table style="width: 100%; border: 1px solid #cbd5e1; background-color: #f8fafc; margin-bottom: 14px; font-size: 11px;">
        <tr>
          <td style="padding: 8px 12px; width: 50%; vertical-align: top;">
            <div style="margin: 3px 0;">អត្តលេខសិស្ស៖ <strong>${result.student.code}</strong></div>
            <div style="margin: 3px 0;">គោត្តនាម-នាម៖ <strong style="font-size: 13px; color: #1e3a8a;">${result.student.nameKhmer}</strong></div>
            <div style="margin: 3px 0;">អក្សរឡាតាំង៖ <strong>${result.student.nameLatin}</strong></div>
            <div style="margin: 3px 0;">ភេទ៖ <strong>${result.student.gender}</strong></div>
          </td>
          <td style="padding: 8px 12px; width: 50%; vertical-align: top;">
            <div style="margin: 3px 0;">ថ្ងៃខែឆ្នាំកំណើត៖ <strong>${result.student.dob}</strong></div>
            <div style="margin: 3px 0;">ថ្នាក់ទី៖ <strong style="font-size: 13px;">${result.student.grade}${result.student.section}</strong></div>
            <div style="margin: 3px 0;">គ្រូបន្ទុកថ្នាក់៖ <strong style="color: #047857;">${result.teacher?.name || 'ពុំទាន់កំណត់'}</strong></div>
            <div style="margin: 3px 0;">អាណាព្យាបាល៖ <strong>${result.student.guardianName}</strong> (${result.student.guardianPhone})</div>
          </td>
        </tr>
      </table>

      <!-- Subject Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-size: 11px; font-weight: 700; height: 26px;">
            <th style="border: 1px solid #000; width: 35px; padding: 4px;">ល.រ</th>
            <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">មុខវិជ្ជា</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">ពិន្ទុពេញ</th>
            <th style="border: 1px solid #000; width: 50px; padding: 4px;">មេគុណ</th>
            <th style="border: 1px solid #000; width: 85px; padding: 4px;">ពិន្ទុទទួលបាន</th>
            <th style="border: 1px solid #000; width: 85px; padding: 4px;">ការវាយតម្លៃ</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
          <tr style="background-color: #f1f5f9; font-weight: 700; text-align: center; height: 25px;">
            <td colspan="4" style="border: 1px solid #000; padding: 4px 8px; text-align: right;">ពិន្ទុសរុប៖</td>
            <td style="border: 1px solid #000; padding: 4px; font-size: 12px; color: #1e3a8a;">${result.totalScore}</td>
            <td style="border: 1px solid #000; padding: 4px;"></td>
          </tr>
          <tr style="background-color: #f8fafc; font-weight: 700; text-align: center; height: 25px;">
            <td colspan="4" style="border: 1px solid #000; padding: 4px 8px; text-align: right;">មធ្យមភាគ៖</td>
            <td style="border: 1px solid #000; padding: 4px; font-size: 13px; color: #0284c7;">${result.average}</td>
            <td style="border: 1px solid #000; padding: 4px; font-size: 11px;">${result.gradeMention}</td>
          </tr>
          <tr style="background-color: #fef08a; font-weight: 700; text-align: center; height: 28px;">
            <td colspan="4" style="border: 1px solid #000; padding: 4px 8px; text-align: right;">ចំណាត់ថ្នាក់ក្នុងថ្នាក់៖</td>
            <td colspan="2" style="border: 1px solid #000; padding: 4px; font-size: 13px; color: #854d0e;">
              លេខ ${result.rank} (លទ្ធផល៖ ${result.passed ? 'ជាប់' : 'ធ្លាក់'})
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div style="page-break-inside: avoid; margin-top: 25px;">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-size: 11px;">បានឃើញ និងឯកភាព</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">នាយក</div>
              <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា និងត្រា)</div>
              <div style="height: 55px;"></div>
              <div style="font-size: 12px; font-weight: 700;">${schoolSettings.principalName}</div>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-size: 11px;">${schoolSettings.location}، ${schoolSettings.issuedDate}</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">គ្រូបន្ទុកថ្នាក់</div>
              <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា)</div>
              <div style="height: 55px;"></div>
              <div style="font-size: 12px; font-weight: 700;">${result.teacher?.name || 'គ្រូបន្ទុកថ្នាក់'}</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const filename = `ព្រឹត្តិបត្រពិន្ទុ_${result.student.nameKhmer}_ថ្នាក់ទី${result.student.grade}${result.student.section}_${result.periodName.replace(/\s+/g, '_')}.pdf`;
  await generatePdfFromElement(container, filename, 'portrait', [10, 10, 10, 10]);
}

/**
 * Export results to Word document (.doc)
 */
export function exportResultsToWord(
  results: ComputedStudentResult[],
  subjects: Subject[],
  periodName: string,
  grade: number | string,
  section: string,
  schoolSettings: SchoolSettings
) {
  const activeSubjectIds = new Set<string>();
  results.forEach(r => {
    Object.keys(r.scores).forEach(sId => activeSubjectIds.add(sId));
  });
  const currentSubjects = subjects.filter(s => activeSubjectIds.has(s.id));
  const teacherName = results[0]?.teacher?.name || 'ពុំទាន់កំណត់';
  const totalCount = results.length;
  const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;

  const rowsHtml = results
    .map(
      (r, index) => `
    <tr style="text-align: center; font-size: 11pt;">
      <td style="border: 1px solid #333; padding: 6px;">${index + 1}</td>
      <td style="border: 1px solid #333; padding: 6px;">${r.student.code}</td>
      <td style="border: 1px solid #333; padding: 6px; text-align: left; font-weight: bold;">${r.student.nameKhmer}</td>
      <td style="border: 1px solid #333; padding: 6px; text-align: left;">${r.student.nameLatin}</td>
      <td style="border: 1px solid #333; padding: 6px;">${r.student.gender}</td>
      <td style="border: 1px solid #333; padding: 6px;">${r.student.grade}${r.student.section}</td>
      ${currentSubjects
        .map(
          s => `
        <td style="border: 1px solid #333; padding: 6px; ${
          (r.scores[s.id] ?? 0) < 50 ? 'color: #c00;' : ''
        }">${r.scores[s.id] ?? '-'}</td>
      `
        )
        .join('')}
      <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">${r.totalScore}</td>
      <td style="border: 1px solid #333; padding: 6px; font-weight: bold; color: #1e3a8a;">${r.average}</td>
      <td style="border: 1px solid #333; padding: 6px; font-weight: bold; background-color: #fef08a;">${r.rank}</td>
      <td style="border: 1px solid #333; padding: 6px;">${r.gradeMention}</td>
      <td style="border: 1px solid #333; padding: 6px; font-weight: bold; color: ${
        r.passed ? '#15803d' : '#b91c1c'
      };">${r.passed ? 'ជាប់' : 'ធ្លាក់'}</td>
    </tr>
  `
    )
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>តារាងលទ្ធផលសិក្សា - ${schoolSettings.schoolName}</title>
      <style>
        body {
          font-family: 'Kantumruy Pro', 'Khmer OS Battambang', 'Segoe UI', Tahoma, sans-serif;
          line-height: 1.5;
          margin: 1.5cm;
          color: #111;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 20px;
        }
        th {
          background-color: #e2e8f0;
          border: 1px solid #333;
          padding: 8px 4px;
          font-size: 11pt;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; vertical-align: top;">
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">${schoolSettings.departmentName}</p>
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.districtName}</p>
            <p style="margin: 0; font-size: 14pt; font-weight: bold; color: #1e3a8a;">${schoolSettings.schoolName}</p>
            <p style="margin: 4px 0 0 0; font-size: 11pt;">គ្រូបន្ទុកថ្នាក់៖ <strong>${teacherName}</strong></p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 13pt; font-weight: bold;">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <p style="margin: 5px 0 0 0; font-size: 10pt; letter-spacing: 3px;">~ ~ ~ 🪷 ~ ~ ~</p>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 25px 0 15px 0;">
        <h2 style="margin: 0; font-size: 16pt; color: #0f172a;">តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់សិស្ស</h2>
        <p style="margin: 5px 0; font-size: 12pt; font-weight: bold; color: #2563eb;">
          ការវាយតម្លៃ៖ ${periodName} | ថ្នាក់ទី៖ ${grade === 'all' ? 'គ្រប់ថ្នាក់' : grade + (section === 'all' ? '' : section)} | ឆ្នាំសិក្សា៖ ${schoolSettings.academicYear}
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ល.រ</th>
            <th>អត្តលេខ</th>
            <th>គោត្តនាម-នាម</th>
            <th>ឈ្មោះឡាតាំង</th>
            <th>ភេទ</th>
            <th>ថ្នាក់</th>
            ${currentSubjects.map(s => `<th>${s.name}</th>`).join('')}
            <th>សរុប</th>
            <th>មធ្យម</th>
            <th>ចំណាត់ថ្នាក់</th>
            <th>និទ្ទេស</th>
            <th>លទ្ធផល</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <p style="font-size: 11pt; font-style: italic; margin-top: 10px;">
        បញ្ជីបញ្ឈប់ត្រឹមចំនួន <strong>${totalCount}</strong> នាក់ ក្នុងនោះសិស្សស្រីចំនួន <strong>${femaleCount}</strong> នាក់
      </p>

      <!-- Signatures -->
      <table style="width: 100%; border: none; margin-top: 35px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">នាយកសាលា</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា និងត្រា)</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${schoolSettings.principalName}</p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.location}، ${schoolSettings.issuedDate}</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">គ្រូបន្ទុកថ្នាក់</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា)</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${teacherName}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `តារាងលទ្ធផល_${schoolSettings.schoolName.replace(/\s+/g, '')}_ថ្នាក់ទី${grade}${section === 'all' ? '' : section}_${periodName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Individual Student Transcript to Word (.doc)
 */
export function exportStudentTranscriptToWord(
  result: ComputedStudentResult,
  subjects: Subject[],
  schoolSettings: SchoolSettings
) {
  const applicableSubjects = subjects.filter(s =>
    s.applicableGrades.includes(result.student.grade)
  );

  const subjectRows = applicableSubjects
    .map((s, idx) => {
      const score = result.scores[s.id] ?? 0;
      const isLow = score < 50;
      return `
      <tr style="text-align: center; font-size: 11pt;">
        <td style="border: 1px solid #333; padding: 6px;">${idx + 1}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: left; font-weight: bold;">${s.name}</td>
        <td style="border: 1px solid #333; padding: 6px;">${s.maxScore}</td>
        <td style="border: 1px solid #333; padding: 6px;">${s.coefficient}</td>
        <td style="border: 1px solid #333; padding: 6px; font-weight: bold; ${
          isLow ? 'color: #dc2626;' : 'color: #0f172a;'
        }">${score}</td>
        <td style="border: 1px solid #333; padding: 6px;">${computeSubjectMention(score)}</td>
      </tr>
    `;
    })
    .join('');

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>ព្រឹត្តិបត្រពិន្ទុសិស្ស - ${result.student.nameKhmer}</title>
      <style>
        body {
          font-family: 'Kantumruy Pro', 'Khmer OS Battambang', 'Segoe UI', Tahoma, sans-serif;
          line-height: 1.5;
          margin: 1.5cm;
          color: #111;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 25px;
        }
        th {
          background-color: #f1f5f9;
          border: 1px solid #333;
          padding: 8px 4px;
          font-size: 11pt;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <table style="width: 100%; border: none; margin-bottom: 15px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; vertical-align: top;">
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">${schoolSettings.departmentName}</p>
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.districtName}</p>
            <p style="margin: 0; font-size: 13pt; font-weight: bold; color: #1e3a8a;">${schoolSettings.schoolName}</p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 13pt; font-weight: bold;">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <p style="margin: 5px 0 0 0; font-size: 10pt; letter-spacing: 3px;">~ ~ ~ 🪷 ~ ~ ~</p>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 20px 0;">
        <h2 style="margin: 0; font-size: 17pt; color: #1e3a8a;">ព្រឹត្តិបត្រពិន្ទុ និងលទ្ធផលសិក្សា</h2>
        <p style="margin: 4px 0; font-size: 12pt; font-weight: bold;">ការវាយតម្លៃ៖ ${result.periodName} | ឆ្នាំសិក្សា៖ ${schoolSettings.academicYear}</p>
      </div>

      <!-- Student Profile Card -->
      <table style="width: 100%; border: 1px solid #cbd5e1; background-color: #f8fafc; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; border: none; width: 50%;">
            <p style="margin: 4px 0;">អត្តលេខសិស្ស៖ <strong>${result.student.code}</strong></p>
            <p style="margin: 4px 0;">គោត្តនាម-នាម៖ <strong style="font-size: 13pt; color: #1e3a8a;">${result.student.nameKhmer}</strong></p>
            <p style="margin: 4px 0;">អក្សរឡាតាំង៖ <strong>${result.student.nameLatin}</strong></p>
            <p style="margin: 4px 0;">ភេទ៖ <strong>${result.student.gender}</strong></p>
          </td>
          <td style="padding: 10px; border: none; width: 50%;">
            <p style="margin: 4px 0;">ថ្ងៃខែឆ្នាំកំណើត៖ <strong>${result.student.dob}</strong></p>
            <p style="margin: 4px 0;">ថ្នាក់ទី៖ <strong style="font-size: 13pt;">${result.student.grade}${result.student.section}</strong></p>
            <p style="margin: 4px 0;">គ្រូបន្ទុកថ្នាក់៖ <strong style="color: #047857;">${result.teacher?.name || 'ពុំទាន់កំណត់'}</strong></p>
            <p style="margin: 4px 0;">អាណាព្យាបាល៖ <strong>${result.student.guardianName}</strong> (${result.student.guardianPhone})</p>
          </td>
        </tr>
      </table>

      <!-- Subject Table -->
      <table>
        <thead>
          <tr>
            <th>ល.រ</th>
            <th>មុខវិជ្ជា</th>
            <th>ពិន្ទុអតិបរមា</th>
            <th>មេគុណ</th>
            <th>ពិន្ទុទទួលបាន</th>
            <th>ការវាយតម្លៃ</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <td colspan="4" style="border: 1px solid #333; padding: 8px; text-align: right;">ពិន្ទុសរុប៖</td>
            <td style="border: 1px solid #333; padding: 8px; font-size: 12pt; color: #1e3a8a;">${result.totalScore}</td>
            <td style="border: 1px solid #333; padding: 8px;"></td>
          </tr>
          <tr style="background-color: #f8fafc; font-weight: bold; text-align: center;">
            <td colspan="4" style="border: 1px solid #333; padding: 8px; text-align: right;">មធ្យមភាគ៖</td>
            <td style="border: 1px solid #333; padding: 8px; font-size: 13pt; color: #0284c7;">${result.average}</td>
            <td style="border: 1px solid #333; padding: 8px; font-size: 11pt;">${result.gradeMention}</td>
          </tr>
          <tr style="background-color: #fef08a; font-weight: bold; text-align: center;">
            <td colspan="4" style="border: 1px solid #333; padding: 8px; text-align: right;">ចំណាត់ថ្នាក់ក្នុងថ្នាក់៖</td>
            <td colspan="2" style="border: 1px solid #333; padding: 8px; font-size: 14pt; color: #854d0e;">
              លេខ ${result.rank} (លទ្ធផល៖ ${result.passed ? 'ជាប់' : 'ធ្លាក់'})
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <table style="width: 100%; border: none; margin-top: 40px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">នាយកសាលា</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា និងត្រា)</p>
            <div style="height: 65px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${schoolSettings.principalName}</p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.location}، ${schoolSettings.issuedDate}</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">គ្រូបន្ទុកថ្នាក់</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា)</p>
            <div style="height: 65px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${result.teacher?.name || 'គ្រូបន្ទុកថ្នាក់'}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ព្រឹត្តិបត្រពិន្ទុ_${result.student.nameKhmer}_ថ្នាក់${result.student.grade}${result.student.section}_${result.periodName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function computeSubjectMention(score: number): string {
  if (score >= 90) return 'ល្អប្រសើរ';
  if (score >= 80) return 'ល្អណាស់';
  if (score >= 70) return 'ល្អ';
  if (score >= 60) return 'ល្អបង្គួរ';
  if (score >= 50) return 'មធ្យម';
  return 'ខ្សោយ';
}

/**
 * Export Student Directory List to Word document (.doc)
 */
export function exportStudentsToWord(
  students: Student[],
  grade: number | 'all',
  section: string,
  schoolSettings: SchoolSettings,
  teacher?: Teacher
) {
  const totalCount = students.length;
  const femaleCount = students.filter(s => s.gender === 'ស្រី').length;
  const teacherName = teacher?.name || 'ពុំទាន់កំណត់';

  const rowsHtml = students
    .map(
      (s, index) => `
    <tr style="text-align: center; font-size: 10.5pt;">
      <td style="border: 1px solid #333; padding: 6px 4px;">${index + 1}</td>
      <td style="border: 1px solid #333; padding: 6px 4px; font-family: monospace;">${s.code}</td>
      <td style="border: 1px solid #333; padding: 6px 8px; text-align: left; font-weight: bold;">${s.nameKhmer}</td>
      <td style="border: 1px solid #333; padding: 6px 8px; text-align: left;">${s.nameLatin}</td>
      <td style="border: 1px solid #333; padding: 6px 4px;">${s.gender}</td>
      <td style="border: 1px solid #333; padding: 6px 4px;">${s.dob}</td>
      <td style="border: 1px solid #333; padding: 6px 4px;">${s.grade}${s.section}</td>
      <td style="border: 1px solid #333; padding: 6px 6px; text-align: left;">${s.guardianName || '-'}</td>
      <td style="border: 1px solid #333; padding: 6px 4px; font-family: monospace;">${s.guardianPhone || '-'}</td>
      <td style="border: 1px solid #333; padding: 6px 6px; text-align: left;">${s.address || '-'}</td>
      <td style="border: 1px solid #333; padding: 6px 4px;">${s.status}</td>
    </tr>
  `
    )
    .join('');

  const gradeTitle =
    grade === 'all'
      ? 'គ្រប់កម្រិតថ្នាក់ (៧-១២)'
      : `ថ្នាក់ទី ${grade}${section === 'all' ? '' : section}`;

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>បញ្ជីរាយនាមសិស្ស - ${schoolSettings.schoolName}</title>
      <style>
        body {
          font-family: 'Kantumruy Pro', 'Khmer OS Battambang', 'Segoe UI', Tahoma, sans-serif;
          line-height: 1.5;
          margin: 1.2cm;
          color: #111;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 20px;
        }
        th {
          background-color: #f1f5f9;
          border: 1px solid #333;
          padding: 8px 4px;
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <table style="width: 100%; border: none; margin-bottom: 15px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; vertical-align: top;">
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">${schoolSettings.departmentName}</p>
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.districtName}</p>
            <p style="margin: 0; font-size: 13pt; font-weight: bold; color: #1e3a8a;">${schoolSettings.schoolName}</p>
            ${teacher ? `<p style="margin: 4px 0 0 0; font-size: 10.5pt;">គ្រូបន្ទុកថ្នាក់៖ <strong>${teacherName}</strong></p>` : ''}
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 13pt; font-weight: bold;">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <p style="margin: 5px 0 0 0; font-size: 10pt; letter-spacing: 3px;">~ ~ ~ 🪷 ~ ~ ~</p>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 20px 0 15px 0;">
        <h2 style="margin: 0; font-size: 15pt; color: #0f172a;">បញ្ជីរាយនាមសិស្សានុសិស្ស</h2>
        <p style="margin: 5px 0; font-size: 11.5pt; font-weight: bold; color: #2563eb;">
          ${gradeTitle} | ឆ្នាំសិក្សា៖ ${schoolSettings.academicYear}
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 35px;">ល.រ</th>
            <th style="width: 70px;">អត្តលេខ</th>
            <th>គោត្តនាម-នាម</th>
            <th>ឈ្មោះឡាតាំង</th>
            <th style="width: 45px;">ភេទ</th>
            <th style="width: 80px;">ថ្ងៃខែឆ្នាំកំណើត</th>
            <th style="width: 45px;">ថ្នាក់</th>
            <th>អាណាព្យាបាល</th>
            <th style="width: 85px;">លេខទូរស័ព្ទ</th>
            <th>អាសយដ្ឋាន</th>
            <th style="width: 65px;">ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <p style="font-size: 11pt; font-style: italic; margin-top: 10px;">
        បញ្ជីបញ្ឈប់ត្រឹមចំនួន <strong>${totalCount}</strong> នាក់ ក្នុងនោះសិស្សស្រីចំនួន <strong>${femaleCount}</strong> នាក់
      </p>

      <!-- Signatures -->
      <table style="width: 100%; border: none; margin-top: 35px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">នាយកសាលា</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា និងត្រា)</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${schoolSettings.principalName}</p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0; font-size: 11pt;">${schoolSettings.location}، ${schoolSettings.issuedDate}</p>
            <p style="margin: 2px 0 0 0; font-size: 12pt; font-weight: bold;">អ្នករៀបចំបញ្ជី</p>
            <p style="margin: 5px 0; font-size: 10pt; color: #64748b;">(ហត្ថលេខា)</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #0f172a;">${teacherName}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const gradeStr = grade === 'all' ? 'គ្រប់ថ្នាក់' : `ថ្នាក់ទី${grade}${section === 'all' ? '' : section}`;
  link.download = `បញ្ជីរាយនាមសិស្ស_${schoolSettings.schoolName.replace(/\s+/g, '')}_${gradeStr}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Student Directory List directly to PDF (.pdf)
 */
export async function exportStudentsToPdf(
  students: Student[],
  grade: number | 'all',
  section: string,
  schoolSettings: SchoolSettings,
  teacher?: Teacher
) {
  const totalCount = students.length;
  const femaleCount = students.filter(s => s.gender === 'ស្រី').length;
  const teacherName = teacher?.name || 'ពុំទាន់កំណត់';

  const container = document.createElement('div');
  container.style.width = '280mm'; // Landscape orientation
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Kantumruy Pro', 'Siemreap', sans-serif";
  container.style.padding = '10mm 12mm';
  container.style.boxSizing = 'border-box';

  const rowsHtml = students
    .map(
      (s, idx) => `
      <tr style="height: 24px; text-align: center; font-size: 10px;">
        <td style="border: 1px solid #000; padding: 3px 2px;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 3px 2px; font-family: monospace; font-size: 9.5px;">${s.code}</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: 600;">${s.nameKhmer}</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-size: 9.5px;">${s.nameLatin}</td>
        <td style="border: 1px solid #000; padding: 3px 2px;">${s.gender}</td>
        <td style="border: 1px solid #000; padding: 3px 2px;">${s.dob}</td>
        <td style="border: 1px solid #000; padding: 3px 2px; font-weight: 600;">${s.grade}${s.section}</td>
        <td style="border: 1px solid #000; padding: 3px 4px; text-align: left;">${s.guardianName || '-'}</td>
        <td style="border: 1px solid #000; padding: 3px 2px; font-family: monospace; font-size: 9px;">${s.guardianPhone || '-'}</td>
        <td style="border: 1px solid #000; padding: 3px 4px; text-align: left; font-size: 9px;">${s.address || '-'}</td>
        <td style="border: 1px solid #000; padding: 3px 2px;">${s.status}</td>
      </tr>
    `
    )
    .join('');

  const gradeTitle =
    grade === 'all'
      ? 'គ្រប់កម្រិតថ្នាក់ (៧-១២)'
      : `ថ្នាក់ទី ${grade}${section === 'all' ? '' : section}`;

  container.innerHTML = `
    <div style="width: 100%; font-size: 11px; line-height: 1.4;">
      <!-- Header -->
      <table style="width: 100%; border: none; margin-bottom: 8px;">
        <tr>
          <td style="vertical-align: top; width: 45%; text-align: left;">
            <div style="font-size: 12px; font-weight: 600;">${schoolSettings.departmentName}</div>
            <div style="font-size: 11px; font-weight: 600;">${schoolSettings.districtName}</div>
            <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${schoolSettings.schoolName}</div>
            ${teacher ? `<div style="font-size: 11px; margin-top: 2px;">គ្រូបន្ទុកថ្នាក់៖ <strong>${teacherName}</strong></div>` : ''}
          </td>
          <td style="vertical-align: top; width: 55%; text-align: center;">
            <div style="font-size: 13px; font-weight: 700;">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style="font-size: 12px; font-weight: 600;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div style="font-size: 10px; margin-top: 2px; letter-spacing: 2px;">3 3 3 🪷 3 3 3</div>
          </td>
        </tr>
      </table>

      <!-- Title -->
      <div style="text-align: center; margin: 12px 0 10px 0;">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">បញ្ជីរាយនាមសិស្សានុសិស្ស</div>
        <div style="font-size: 12px; font-weight: 600; margin-top: 2px; color: #1e3a8a;">
          ${gradeTitle} | ឆ្នាំសិក្សា ${schoolSettings.academicYear}
        </div>
      </div>

      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 6px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-size: 10px; font-weight: 700; height: 26px;">
            <th style="border: 1px solid #000; width: 32px; padding: 4px 2px;">ល.រ</th>
            <th style="border: 1px solid #000; width: 64px; padding: 4px 2px;">អត្តលេខ</th>
            <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">គោត្តនាម-នាម</th>
            <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">ឈ្មោះឡាតាំង</th>
            <th style="border: 1px solid #000; width: 36px; padding: 4px 2px;">ភេទ</th>
            <th style="border: 1px solid #000; width: 72px; padding: 4px 2px;">ថ្ងៃខែឆ្នាំកំណើត</th>
            <th style="border: 1px solid #000; width: 44px; padding: 4px 2px;">ថ្នាក់</th>
            <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">អាណាព្យាបាល</th>
            <th style="border: 1px solid #000; width: 85px; padding: 4px 2px;">លេខទូរស័ព្ទ</th>
            <th style="border: 1px solid #000; padding: 4px 6px; text-align: left;">អាសយដ្ឋាន</th>
            <th style="border: 1px solid #000; width: 60px; padding: 4px 2px;">ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Summary text -->
      <div style="margin-top: 10px; font-size: 11px; font-style: italic;">
        បញ្ជីបញ្ឈប់ត្រឹមចំនួន <strong>${totalCount}</strong> នាក់ ក្នុងនោះសិស្សស្រីចំនួន <strong>${femaleCount}</strong> នាក់
      </div>

      <!-- Signatures -->
      <div style="page-break-inside: avoid; margin-top: 24px;">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-size: 11px;">បានឃើញ និងឯកភាព</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">នាយកសាលា</div>
              <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា និងត្រា)</div>
              <div style="height: 55px;"></div>
              <div style="font-size: 12px; font-weight: 700;">${schoolSettings.principalName}</div>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-size: 11px;">${schoolSettings.location}، ${schoolSettings.issuedDate}</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">អ្នករៀបចំបញ្ជី</div>
              <div style="font-size: 10px; color: #555; margin-top: 2px;">(ហត្ថលេខា)</div>
              <div style="height: 55px;"></div>
              <div style="font-size: 12px; font-weight: 700;">${teacherName}</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const gradeStr = grade === 'all' ? 'គ្រប់ថ្នាក់' : `ថ្នាក់ទី${grade}${section === 'all' ? '' : section}`;
  const filename = `បញ្ជីរាយនាមសិស្ស_${schoolSettings.schoolName.replace(/\s+/g, '')}_${gradeStr}.pdf`;
  await generatePdfFromElement(container, filename, 'landscape', [8, 8, 8, 8]);
}
