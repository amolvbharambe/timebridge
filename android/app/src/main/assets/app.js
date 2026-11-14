/**
 * TimeBridge - IST ⇄ CST Converter & Time Interval Calculator
 * Comprehensive time engine with high precision timezone math.
 */

(function () {
  'use strict';

  // =========================================================================
  // Timezone Configurations
  // =========================================================================
  const TZ_CONFIGS = {
    UTC: {
      iana: 'UTC',
      code: 'UTC',
      name: 'Coordinated Universal Time',
      country: 'Global',
      fixedOffsetMinutes: 0
    },
    GMT: {
      iana: 'Europe/London',
      code: 'GMT',
      name: 'Greenwich Mean Time',
      country: 'UK / London'
    },
    IST: {
      iana: 'Asia/Kolkata',
      code: 'IST',
      name: 'Indian Standard Time',
      country: 'India',
      fixedOffsetMinutes: 330 // +5:30
    },
    US_AUTO: {
      iana: 'America/Chicago',
      code: 'CST/CDT',
      name: 'US Central Time (Auto DST)',
      country: 'USA'
    },
    US_EST: {
      iana: 'America/New_York',
      code: 'EST/EDT',
      name: 'US Eastern Time (Auto DST)',
      country: 'USA'
    },
    EST: {
      iana: 'America/New_York',
      code: 'EST/EDT',
      name: 'US Eastern Time',
      country: 'USA'
    },
    US_FIXED_CST: {
      iana: 'Etc/GMT+6', // Fixed UTC-6 (POSIX notation: GMT+6 is UTC-6)
      code: 'CST',
      name: 'Fixed Central Standard Time (UTC-6)',
      country: 'USA'
    },
    CHINA_CST: {
      iana: 'Asia/Shanghai',
      code: 'CST',
      name: 'China Standard Time (UTC+8)',
      country: 'China',
      fixedOffsetMinutes: 480 // +8:00
    }
  };

  // State
  let currentCstVariant = 'US_AUTO'; // 'US_AUTO' | 'US_FIXED_CST' | 'CHINA_CST'
  let conversionDirection = 'IST_TO_CST'; // 'IST_TO_CST' | 'CST_TO_IST'
  let liveTickInterval = null;

  // DOM Elements - Header & Clocks
  const utcLiveTime = document.getElementById('utcLiveTime');
  const utcLiveDate = document.getElementById('utcLiveDate');
  const gmtLiveTime = document.getElementById('gmtLiveTime');
  const gmtLiveDate = document.getElementById('gmtLiveDate');
  const gmtOffsetBadge = document.getElementById('gmtOffsetBadge');
  const istLiveTime = document.getElementById('istLiveTime');
  const istLiveDate = document.getElementById('istLiveDate');
  const cstLiveTime = document.getElementById('cstLiveTime');
  const cstLiveDate = document.getElementById('cstLiveDate');
  const cstLabelCode = document.getElementById('cstLabelCode');
  const cstOffsetBadge = document.getElementById('cstOffsetBadge');
  const estLiveTime = document.getElementById('estLiveTime');
  const estLiveDate = document.getElementById('estLiveDate');
  const estLabelCode = document.getElementById('estLabelCode');
  const estOffsetBadge = document.getElementById('estOffsetBadge');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // DOM Elements - Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // DOM Elements - Converter
  const convDateInput = document.getElementById('convDate');
  const convTimeInput = document.getElementById('convTime');
  const swapDirectionBtn = document.getElementById('swapDirectionBtn');
  const sourceTag = document.getElementById('sourceTag');
  const sourceTitle = document.getElementById('sourceTitle');
  const sourceOffsetBadge = document.getElementById('sourceOffsetBadge');
  const targetTag = document.getElementById('targetTag');
  const targetTitle = document.getElementById('targetTitle');
  const targetOffsetBadge = document.getElementById('targetOffsetBadge');
  const targetTimeResult = document.getElementById('targetTimeResult');
  const targetDateResult = document.getElementById('targetDateResult');
  const dayRelativeBadge = document.getElementById('dayRelativeBadge');
  const dstIndicatorPill = document.getElementById('dstIndicatorPill');
  const offsetSummaryText = document.getElementById('offsetSummaryText');
  const secondaryTzPill = document.getElementById('secondaryTzPill');
  const sourceWorkStatus = document.getElementById('sourceWorkStatus');
  const targetWorkStatus = document.getElementById('targetWorkStatus');
  const copyConvertedBtn = document.getElementById('copyConvertedBtn');
  const copyAlert = document.getElementById('copyAlert');
  const hourScrubber = document.getElementById('hourScrubber');
  const scrubberCurrentDisplay = document.getElementById('scrubberCurrentDisplay');
  const utcTimelineCells = document.getElementById('utcTimelineCells');
  const gmtTimelineCells = document.getElementById('gmtTimelineCells');
  const istTimelineCells = document.getElementById('istTimelineCells');
  const cstTimelineCells = document.getElementById('cstTimelineCells');
  const estTimelineCells = document.getElementById('estTimelineCells');
  const cstTrackCode = document.getElementById('cstTrackCode');
  const cstVariantRadios = document.querySelectorAll('input[name="cstVariant"]');

  // DOM Elements - Calculator
  const calcStartDate = document.getElementById('calcStartDate');
  const calcStartTime = document.getElementById('calcStartTime');
  const calcStartTz = document.getElementById('calcStartTz');
  const calcEndDate = document.getElementById('calcEndDate');
  const calcEndTime = document.getElementById('calcEndTime');
  const calcEndTz = document.getElementById('calcEndTz');
  const btnEndNow = document.getElementById('btnEndNow');
  const copyDurationBtn = document.getElementById('copyDurationBtn');
  const durationCopyAlert = document.getElementById('durationCopyAlert');
  const calcSwapBtn = document.getElementById('calcSwapBtn');
  const liveTickToggle = document.getElementById('liveTickToggle');
  const calcDirectionNote = document.getElementById('calcDirectionNote');
  const calcSignBadge = document.getElementById('calcSignBadge');

  const valDays = document.getElementById('valDays');
  const valHours = document.getElementById('valHours');
  const valMinutes = document.getElementById('valMinutes');
  const valSeconds = document.getElementById('valSeconds');
  const humanReadablePhrase = document.getElementById('humanReadablePhrase');

  const statTotalHours = document.getElementById('statTotalHours');
  const statTotalDays = document.getElementById('statTotalDays');
  const statBusinessDays = document.getElementById('statBusinessDays');
  const statWorkHours = document.getElementById('statWorkHours');
  const statTotalMinutes = document.getElementById('statTotalMinutes');
  const statTotalSeconds = document.getElementById('statTotalSeconds');

  const tblStartIST = document.getElementById('tblStartIST');
  const tblStartCST = document.getElementById('tblStartCST');
  const tblStartEST = document.getElementById('tblStartEST');
  const tblStartUTC = document.getElementById('tblStartUTC');
  const tblEndIST = document.getElementById('tblEndIST');
  const tblEndCST = document.getElementById('tblEndCST');
  const tblEndEST = document.getElementById('tblEndEST');
  const tblEndUTC = document.getElementById('tblEndUTC');

  // DOM Elements - Overlap Matrix
  const matrixTableBody = document.getElementById('matrixTableBody');
  const matrixVariantNotice = document.getElementById('matrixVariantNotice');

  // =========================================================================
  // Timezone Engine & Helpers
  // =========================================================================

  function getIanaTimezone(key) {
    if (key === 'IST') return TZ_CONFIGS.IST.iana;
    if (key === 'CST') return TZ_CONFIGS[currentCstVariant].iana;
    if (key === 'EST') return TZ_CONFIGS.EST.iana;
    if (key === 'UTC') return TZ_CONFIGS.UTC.iana;
    if (key === 'GMT') return TZ_CONFIGS.GMT.iana;
    if (key === 'LOCAL') return Intl.DateTimeFormat().resolvedOptions().timeZone;
    return key;
  }

  /**
   * Converts a given local date string and time string in a specified timezone to a UTC Date object.
   */
  function parseWallClockToUtc(dateStr, timeStr, timeZoneKey) {
    if (!dateStr || !timeStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const timeParts = timeStr.split(':').map(Number);
    const hr = timeParts[0] || 0;
    const min = timeParts[1] || 0;
    const sec = timeParts[2] || 0;

    const tzIana = getIanaTimezone(timeZoneKey);

    if (tzIana === 'UTC') {
      return new Date(Date.UTC(y, m - 1, d, hr, min, sec));
    }

    // Guess UTC
    const guess = new Date(Date.UTC(y, m - 1, d, hr, min, sec));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzIana,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });

    const getWallEpoch = (dateObj) => {
      const parts = formatter.formatToParts(dateObj);
      const map = {};
      for (const p of parts) map[p.type] = p.value;
      let h = parseInt(map.hour, 10);
      if (h === 24) h = 0;
      return Date.UTC(
        parseInt(map.year, 10),
        parseInt(map.month, 10) - 1,
        parseInt(map.day, 10),
        h,
        parseInt(map.minute, 10),
        parseInt(map.second, 10)
      );
    };

    const targetWallEpoch = Date.UTC(y, m - 1, d, hr, min, sec);
    const guessWallEpoch = getWallEpoch(guess);
    const diff1 = targetWallEpoch - guessWallEpoch;
    const step1 = new Date(guess.getTime() + diff1);

    const step1WallEpoch = getWallEpoch(step1);
    const diff2 = targetWallEpoch - step1WallEpoch;
    return new Date(step1.getTime() + diff2);
  }

  /**
   * Formats a UTC date into parts for a specific timezone.
   */
  function getTzParts(utcDate, timeZoneKey) {
    const tzIana = getIanaTimezone(timeZoneKey);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzIana,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(utcDate);
    const map = {};
    for (const p of parts) map[p.type] = p.value;

    // 24-hr hour for business checks
    const h24Formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzIana,
      hour: 'numeric',
      hour12: false
    });
    let hour24 = parseInt(h24Formatter.format(utcDate), 10);
    if (hour24 === 24) hour24 = 0;

    // YYYY-MM-DD
    const isoFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tzIana,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const isoDate = isoFormatter.format(utcDate);

    return {
      year: map.year,
      month: map.month,
      day: map.day,
      weekday: map.weekday,
      hour12: map.hour,
      minute: map.minute,
      second: map.second,
      dayPeriod: map.dayPeriod,
      timeZoneName: map.timeZoneName || '',
      hour24: hour24,
      isoDate: isoDate,
      timeFormatted: `${map.hour}:${map.minute} ${map.dayPeriod}`,
      dateFormatted: `${map.weekday}, ${map.month} ${map.day}, ${map.year}`
    };
  }

  /**
   * Calculates the difference in minutes between IST and CST at a specific UTC date.
   */
  function getOffsetDifference(utcDate) {
    const istIana = TZ_CONFIGS.IST.iana;
    const cstIana = TZ_CONFIGS[currentCstVariant].iana;

    const getOffsetMinutes = (tz) => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'longOffset'
      }).formatToParts(utcDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      if (!tzPart) return 0;
      // Formats like "GMT-06:00" or "GMT+05:30"
      const match = tzPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
      if (!match) return 0;
      const sign = match[1] === '+' ? 1 : -1;
      const h = parseInt(match[2], 10);
      const m = parseInt(match[3] || '0', 10);
      return sign * (h * 60 + m);
    };

    const istOffset = getOffsetMinutes(istIana);
    const cstOffset = getOffsetMinutes(cstIana);
    const diffMinutes = istOffset - cstOffset;

    return {
      istOffset,
      cstOffset,
      diffMinutes,
      diffHoursText: formatDurationHoursMinutes(diffMinutes)
    };
  }

  function formatDurationHoursMinutes(totalMinutes) {
    const isNeg = totalMinutes < 0;
    const abs = Math.abs(totalMinutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    let s = `${h}h`;
    if (m > 0) s += ` ${m}m`;
    return (isNeg ? '-' : '+') + s;
  }

  function getWorkStatus(hour24) {
    if (hour24 >= 9 && hour24 < 18) {
      return {
        cls: 'work',
        text: 'Business Hours (Working)'
      };
    } else if ((hour24 >= 7 && hour24 < 9) || (hour24 >= 18 && hour24 < 22)) {
      return {
        cls: 'early-late',
        text: 'Morning / Evening (Awake, outside standard business hours)'
      };
    } else {
      return {
        cls: 'sleep',
        text: 'Night Hours (Sleeping / Inactive)'
      };
    }
  }

  // =========================================================================
  // Live Clocks
  // =========================================================================

  function updateLiveClocks() {
    const now = new Date();

    // UTC Clock
    if (utcLiveTime && utcLiveDate) {
      const utcParts = getTzParts(now, 'UTC');
      utcLiveTime.textContent = `${utcParts.hour12}:${utcParts.minute}:${utcParts.second} ${utcParts.dayPeriod}`;
      utcLiveDate.textContent = utcParts.dateFormatted;
    }

    // GMT (London) Clock
    if (gmtLiveTime && gmtLiveDate) {
      const gmtParts = getTzParts(now, 'GMT');
      gmtLiveTime.textContent = `${gmtParts.hour12}:${gmtParts.minute}:${gmtParts.second} ${gmtParts.dayPeriod}`;
      gmtLiveDate.textContent = gmtParts.dateFormatted;
      if (gmtOffsetBadge) {
        gmtOffsetBadge.textContent = gmtParts.timeZoneName === 'BST' ? 'UTC+1 (BST)' : 'UTC+0 (GMT)';
      }
    }

    // IST Clock
    const istParts = getTzParts(now, 'IST');
    istLiveTime.textContent = `${istParts.hour12}:${istParts.minute}:${istParts.second} ${istParts.dayPeriod}`;
    istLiveDate.textContent = istParts.dateFormatted;

    // CST Clock
    const cstParts = getTzParts(now, 'CST');
    cstLiveTime.textContent = `${cstParts.hour12}:${cstParts.minute}:${cstParts.second} ${cstParts.dayPeriod}`;
    cstLiveDate.textContent = cstParts.dateFormatted;

    // EST Clock
    if (estLiveTime && estLiveDate) {
      const estParts = getTzParts(now, 'EST');
      estLiveTime.textContent = `${estParts.hour12}:${estParts.minute}:${estParts.second} ${estParts.dayPeriod}`;
      estLiveDate.textContent = estParts.dateFormatted;
      if (estOffsetBadge) {
        estOffsetBadge.textContent = estParts.timeZoneName === 'EDT' ? 'UTC-4 (EDT)' : 'UTC-5 (EST)';
      }
      if (estLabelCode) {
        estLabelCode.textContent = `${estParts.timeZoneName || 'EST'} (US Eastern)`;
      }
    }

    // Update CST header label & offset
    const cstCfg = TZ_CONFIGS[currentCstVariant];
    cstLabelCode.textContent = `${cstParts.timeZoneName || cstCfg.code} (${cstCfg.country})`;
    
    // Calculate live offset
    const diffInfo = getOffsetDifference(now);
    const cstOffsetSign = diffInfo.cstOffset >= 0 ? '+' : '-';
    const cstAbsMin = Math.abs(diffInfo.cstOffset);
    const cstH = Math.floor(cstAbsMin / 60);
    const cstM = cstAbsMin % 60;
    cstOffsetBadge.textContent = `UTC${cstOffsetSign}${cstH}${cstM > 0 ? ':' + (cstM < 10 ? '0' : '') + cstM : ''}`;
  }

  // =========================================================================
  // Tab 1: Converter Logic
  // =========================================================================

  function syncConverterLabels() {
    const isIstSource = conversionDirection === 'IST_TO_CST';
    const cstCfg = TZ_CONFIGS[currentCstVariant];

    if (isIstSource) {
      sourceTag.textContent = 'FROM';
      sourceTitle.textContent = 'Indian Standard Time (IST)';
      sourceOffsetBadge.textContent = 'UTC +05:30';

      targetTag.textContent = 'TO';
      targetTitle.textContent = `${cstCfg.name}`;
      targetOffsetBadge.textContent = cstCfg.code === 'UTC' ? 'UTC+0' : cstCfg.code;
    } else {
      sourceTag.textContent = 'FROM';
      sourceTitle.textContent = `${cstCfg.name}`;
      sourceOffsetBadge.textContent = cstCfg.code === 'UTC' ? 'UTC+0' : cstCfg.code;

      targetTag.textContent = 'TO';
      targetTitle.textContent = 'Indian Standard Time (IST)';
      targetOffsetBadge.textContent = 'UTC +05:30';
    }

    cstTrackCode.textContent = cstCfg.code;
    matrixVariantNotice.textContent = cstCfg.name;
  }

  function runConversion() {
    const dateVal = convDateInput.value;
    const timeVal = convTimeInput.value;
    if (!dateVal || !timeVal) return;

    const isIstSource = conversionDirection === 'IST_TO_CST';
    const sourceTzKey = isIstSource ? 'IST' : 'CST';
    const targetTzKey = isIstSource ? 'CST' : 'IST';

    // Parse source to UTC
    const utcDate = parseWallClockToUtc(dateVal, timeVal, sourceTzKey);
    if (!utcDate) return;

    // Extract target in target timezone
    const targetParts = getTzParts(utcDate, targetTzKey);
    const sourceParts = getTzParts(utcDate, sourceTzKey);

    targetTimeResult.textContent = `${targetParts.hour12}:${targetParts.minute} ${targetParts.dayPeriod}`;
    targetDateResult.textContent = targetParts.dateFormatted;

    // Day relative badge
    const srcDate = sourceParts.isoDate;
    const tgtDate = targetParts.isoDate;

    if (srcDate === tgtDate) {
      dayRelativeBadge.textContent = 'Same Day';
      dayRelativeBadge.className = 'day-rel-badge';
    } else {
      const srcD = new Date(srcDate);
      const tgtD = new Date(tgtDate);
      const dayDiff = Math.round((tgtD - srcD) / (86400000));
      if (dayDiff > 0) {
        dayRelativeBadge.textContent = `+${dayDiff} Day (Next Day)`;
        dayRelativeBadge.className = 'day-rel-badge next';
      } else {
        dayRelativeBadge.textContent = `${dayDiff} Day (Previous Day)`;
        dayRelativeBadge.className = 'day-rel-badge prev';
      }
    }

    // DST / Standard info pill
    if (currentCstVariant === 'UTC') {
      dstIndicatorPill.textContent = 'UTC Standard Time (UTC+0, No DST)';
    } else if (currentCstVariant === 'US_AUTO') {
      const tzName = isIstSource ? targetParts.timeZoneName : sourceParts.timeZoneName;
      if (tzName === 'CDT') {
        dstIndicatorPill.textContent = 'Daylight Saving Time (CDT, UTC-5)';
      } else {
        dstIndicatorPill.textContent = 'Standard Time (CST, UTC-6)';
      }
    } else if (currentCstVariant === 'US_EST') {
      const tzName = isIstSource ? targetParts.timeZoneName : sourceParts.timeZoneName;
      if (tzName === 'EDT') {
        dstIndicatorPill.textContent = 'Daylight Saving Time (EDT, UTC-4)';
      } else {
        dstIndicatorPill.textContent = 'Standard Time (EST, UTC-5)';
      }
    } else if (currentCstVariant === 'US_FIXED_CST') {
      dstIndicatorPill.textContent = 'Fixed Standard Time (UTC-6)';
    } else {
      dstIndicatorPill.textContent = 'China Standard Time (UTC+8, No DST)';
    }

    // Companion US timezone pill
    if (secondaryTzPill) {
      const companionEst = getTzParts(utcDate, 'EST');
      const companionCst = getTzParts(utcDate, 'CST');
      if (currentCstVariant === 'UTC') {
        secondaryTzPill.textContent = `US: Central ${companionCst.timeFormatted} • Eastern ${companionEst.timeFormatted}`;
      } else if (currentCstVariant === 'US_EST') {
        secondaryTzPill.textContent = `US Central (${companionCst.timeZoneName || 'CST'}): ${companionCst.timeFormatted}`;
      } else {
        secondaryTzPill.textContent = `US Eastern (${companionEst.timeZoneName || 'EST'}): ${companionEst.timeFormatted}`;
      }
    }

    // Offset summary sentence
    const diffInfo = getOffsetDifference(utcDate);
    const diffHours = Math.floor(Math.abs(diffInfo.diffMinutes) / 60);
    const diffMins = Math.abs(diffInfo.diffMinutes) % 60;
    const minText = diffMins > 0 ? ` and ${diffMins} minutes` : '';

    if (diffInfo.diffMinutes > 0) {
      offsetSummaryText.textContent = `IST is ${diffHours} hours${minText} ahead of ${TZ_CONFIGS[currentCstVariant].code}`;
    } else if (diffInfo.diffMinutes < 0) {
      offsetSummaryText.textContent = `IST is ${diffHours} hours${minText} behind ${TZ_CONFIGS[currentCstVariant].code}`;
    } else {
      offsetSummaryText.textContent = `Both timezones are currently in sync!`;
    }

    // Business Hours status
    const srcWork = getWorkStatus(sourceParts.hour24);
    sourceWorkStatus.innerHTML = `
      <span class="status-indicator ${srcWork.cls}"></span>
      <span class="status-text"><strong>${sourceParts.timeFormatted} (${sourceParts.timeZoneName}):</strong> ${srcWork.text}</span>
    `;

    const tgtWork = getWorkStatus(targetParts.hour24);
    targetWorkStatus.innerHTML = `
      <span class="status-indicator ${tgtWork.cls}"></span>
      <span class="status-text"><strong>${targetParts.timeFormatted} (${targetParts.timeZoneName}):</strong> ${tgtWork.text}</span>
    `;

    // Highlight scrubber cell
    updateScrubberFromTime(sourceParts.hour24, parseInt(sourceParts.minute, 10));
  }

  function updateScrubberFromTime(h, m) {
    const totalMinutes = h * 60 + m;
    hourScrubber.value = totalMinutes;
    if (scrubberCurrentDisplay) {
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const mm = m < 10 ? '0' + m : m;
      const isIst = conversionDirection === 'IST_TO_CST';
      const tzCode = isIst ? 'IST' : TZ_CONFIGS[currentCstVariant].code;
      scrubberCurrentDisplay.textContent = `${(h12 < 10 ? '0' : '') + h12}:${mm} ${ampm} (${tzCode})`;
    }
    renderTimelineCells(h);
  }

  function renderTimelineCells(highlightHour = null) {
    if (utcTimelineCells) utcTimelineCells.innerHTML = '';
    if (gmtTimelineCells) gmtTimelineCells.innerHTML = '';
    if (istTimelineCells) istTimelineCells.innerHTML = '';
    if (cstTimelineCells) cstTimelineCells.innerHTML = '';
    if (estTimelineCells) estTimelineCells.innerHTML = '';

    const refDate = convDateInput.value || '2026-11-13';

    for (let h = 0; h < 24; h++) {
      const hhStr = (h < 10 ? '0' : '') + h;
      const colUtcDate = parseWallClockToUtc(refDate, `${hhStr}:00`, 'IST');
      if (!colUtcDate) continue;

      const istP = getTzParts(colUtcDate, 'IST');
      const cstP = getTzParts(colUtcDate, 'CST');
      const estP = getTzParts(colUtcDate, 'EST');
      const utcP = getTzParts(colUtcDate, 'UTC');
      const gmtP = getTzParts(colUtcDate, 'GMT');

      const isCurrentActive = highlightHour !== null && (
        conversionDirection === 'IST_TO_CST' ? istP.hour24 === highlightHour : cstP.hour24 === highlightHour
      );

      const isGolden = (
        (istP.hour24 >= 18 && istP.hour24 <= 21 && cstP.hour24 >= 7 && cstP.hour24 <= 11) ||
        (getWorkStatus(istP.hour24).cls === 'work' && getWorkStatus(cstP.hour24).cls === 'work')
      );

      const onColClick = () => {
        const isIst = conversionDirection === 'IST_TO_CST';
        const targetH = isIst ? istP.hour24 : cstP.hour24;
        convTimeInput.value = `${targetH < 10 ? '0' + targetH : targetH}:00`;
        runConversion();
      };

      // Helper to build cell
      const buildCell = (parts, tzKey) => {
        const cell = document.createElement('div');
        cell.className = 'time-cell';
        const h12 = parts.hour12;
        const amPm = parts.dayPeriod === 'AM' ? 'a' : 'p';
        cell.textContent = `${h12}${amPm}`;
        cell.title = `${parts.timeFormatted} (${parts.timeZoneName}) • Click to select`;

        const work = getWorkStatus(parts.hour24);
        if (work.cls === 'work') cell.classList.add('cell-work');
        else if (work.cls === 'sleep') cell.classList.add('cell-sleep');

        if (isGolden) cell.classList.add('cell-golden');
        if (isCurrentActive) cell.classList.add('active-col');

        cell.addEventListener('click', onColClick);
        return cell;
      };

      if (utcTimelineCells) utcTimelineCells.appendChild(buildCell(utcP, 'UTC'));
      if (gmtTimelineCells) gmtTimelineCells.appendChild(buildCell(gmtP, 'GMT'));
      if (istTimelineCells) istTimelineCells.appendChild(buildCell(istP, 'IST'));
      if (cstTimelineCells) cstTimelineCells.appendChild(buildCell(cstP, 'CST'));
      if (estTimelineCells) estTimelineCells.appendChild(buildCell(estP, 'EST'));
    }
  }

  // Preset buttons
  function setConverterTimeToNow() {
    const now = new Date();
    const sourceTzKey = conversionDirection === 'IST_TO_CST' ? 'IST' : 'CST';
    const parts = getTzParts(now, sourceTzKey);
    convDateInput.value = parts.isoDate;
    const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
    convTimeInput.value = `${h}:${parts.minute}`;
    runConversion();
  }

  function adjustConverterHours(offsetHours) {
    const dateVal = convDateInput.value;
    const timeVal = convTimeInput.value;
    if (!dateVal || !timeVal) return;

    const sourceTzKey = conversionDirection === 'IST_TO_CST' ? 'IST' : 'CST';
    const currentUtc = parseWallClockToUtc(dateVal, timeVal, sourceTzKey);
    if (!currentUtc) return;

    const newUtc = new Date(currentUtc.getTime() + offsetHours * 3600000);
    const newParts = getTzParts(newUtc, sourceTzKey);
    convDateInput.value = newParts.isoDate;
    const h = newParts.hour24 < 10 ? '0' + newParts.hour24 : newParts.hour24;
    convTimeInput.value = `${h}:${newParts.minute}`;
    runConversion();
  }

  function adjustConverterMinutes(offsetMinutes) {
    const dateVal = convDateInput.value;
    const timeVal = convTimeInput.value;
    if (!dateVal || !timeVal) return;

    const sourceTzKey = conversionDirection === 'IST_TO_CST' ? 'IST' : 'CST';
    const currentUtc = parseWallClockToUtc(dateVal, timeVal, sourceTzKey);
    if (!currentUtc) return;

    const newUtc = new Date(currentUtc.getTime() + offsetMinutes * 60000);
    const newParts = getTzParts(newUtc, sourceTzKey);
    convDateInput.value = newParts.isoDate;
    const h = newParts.hour24 < 10 ? '0' + newParts.hour24 : newParts.hour24;
    convTimeInput.value = `${h}:${newParts.minute}`;
    runConversion();
  }

  // =========================================================================
  // Tab 2: Time Interval / Duration Calculator
  // =========================================================================

  function calculateInterval() {
    const sDate = calcStartDate.value;
    const sTime = calcStartTime.value;
    const sTz = calcStartTz.value;

    const eDate = calcEndDate.value;
    const eTime = calcEndTime.value;
    const eTz = calcEndTz.value;

    if (!sDate || !sTime || !eDate || !eTime) return;

    const startUtc = parseWallClockToUtc(sDate, sTime, sTz);
    const endUtc = parseWallClockToUtc(eDate, eTime, eTz);

    if (!startUtc || !endUtc) return;

    const msDiff = endUtc.getTime() - startUtc.getTime();
    const isFuture = msDiff >= 0;
    const absMs = Math.abs(msDiff);

    // Direction badge
    if (msDiff === 0) {
      calcSignBadge.textContent = 'Exact Same Instant';
      calcSignBadge.className = 'badge';
      calcDirectionNote.textContent = 'Start and End occur at the exact same moment across timezones.';
    } else if (isFuture) {
      calcSignBadge.textContent = 'Future / Forward Duration';
      calcSignBadge.className = 'badge';
      calcDirectionNote.textContent = 'End date is ahead of Start date.';
    } else {
      calcSignBadge.textContent = 'Past / Reverse Duration';
      calcSignBadge.className = 'badge';
      calcDirectionNote.textContent = 'End date occurred before Start date.';
    }

    // Breakdown components
    const totalSeconds = Math.floor(absMs / 1000);
    const totalMinutes = Math.floor(absMs / (1000 * 60));
    const totalHoursFloat = (absMs / (1000 * 3600));
    const totalDaysFloat = (absMs / (1000 * 86400));

    const days = Math.floor(absMs / (1000 * 86400));
    const remDays = absMs % (1000 * 86400);
    const hours = Math.floor(remDays / (1000 * 3600));
    const remHours = remDays % (1000 * 3600);
    const minutes = Math.floor(remHours / (1000 * 60));
    const seconds = Math.floor((remHours % (1000 * 60)) / 1000);

    // Update Big Duration Banner
    valDays.textContent = days.toLocaleString();
    valHours.textContent = hours;
    valMinutes.textContent = minutes;
    valSeconds.textContent = seconds;

    // Human Readable narrative
    let phraseParts = [];
    if (days > 0) phraseParts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) phraseParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) phraseParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 || phraseParts.length === 0) phraseParts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    const directionVerb = isFuture ? 'elapsed between' : 'difference (in reverse) between';
    humanReadablePhrase.textContent = `${phraseParts.join(', ')} ${directionVerb} the specified points.`;

    // Stat Cards
    statTotalHours.textContent = `${totalHoursFloat.toFixed(2)} hrs`;
    statTotalDays.textContent = `${totalDaysFloat.toFixed(2)} days`;
    statTotalMinutes.textContent = `${totalMinutes.toLocaleString()} mins`;
    statTotalSeconds.textContent = `${totalSeconds.toLocaleString()} secs`;

    // Business Days calculation (Monday through Friday)
    const bizStats = calculateBusinessDays(startUtc, endUtc);
    statBusinessDays.textContent = `${bizStats.workingDays} days`;
    statWorkHours.textContent = `${bizStats.workingDays * 8} hrs`;

    // Update timezone cross-reference table
    const sIST = getTzParts(startUtc, 'IST');
    const sCST = getTzParts(startUtc, 'CST');
    const sEST = getTzParts(startUtc, 'EST');
    const sUTC = getTzParts(startUtc, 'UTC');

    const eIST = getTzParts(endUtc, 'IST');
    const eCST = getTzParts(endUtc, 'CST');
    const eEST = getTzParts(endUtc, 'EST');
    const eUTC = getTzParts(endUtc, 'UTC');

    tblStartIST.textContent = `${sIST.dateFormatted} • ${sIST.timeFormatted}`;
    tblStartCST.textContent = `${sCST.dateFormatted} • ${sCST.timeFormatted} (${sCST.timeZoneName})`;
    if (tblStartEST) tblStartEST.textContent = `${sEST.dateFormatted} • ${sEST.timeFormatted} (${sEST.timeZoneName})`;
    tblStartUTC.textContent = `${sUTC.dateFormatted} • ${sUTC.timeFormatted}`;

    tblEndIST.textContent = `${eIST.dateFormatted} • ${eIST.timeFormatted}`;
    tblEndCST.textContent = `${eCST.dateFormatted} • ${eCST.timeFormatted} (${eCST.timeZoneName})`;
    if (tblEndEST) tblEndEST.textContent = `${eEST.dateFormatted} • ${eEST.timeFormatted} (${eEST.timeZoneName})`;
    tblEndUTC.textContent = `${eUTC.dateFormatted} • ${eUTC.timeFormatted}`;
  }

  function calculateBusinessDays(d1, d2) {
    let start = new Date(d1.getTime());
    let end = new Date(d2.getTime());
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    let workingDays = 0;
    let weekendDays = 0;
    let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const stop = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cur <= stop) {
      const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      } else {
        weekendDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { workingDays, weekendDays };
  }

  function initCalculatorDefaults() {
    const now = new Date();
    const istParts = getTzParts(now, 'IST');
    calcStartDate.value = istParts.isoDate;
    calcStartTime.value = `${(istParts.hour24 < 10 ? '0' : '') + istParts.hour24}:${istParts.minute}:00`;
    calcStartTz.value = 'Asia/Kolkata';

    // End date 24 hours later in CST
    const tomorrow = new Date(now.getTime() + 24 * 3600000);
    const cstParts = getTzParts(tomorrow, 'CST');
    calcEndDate.value = cstParts.isoDate;
    calcEndTime.value = `${(cstParts.hour24 < 10 ? '0' : '') + cstParts.hour24}:${cstParts.minute}:00`;
    calcEndTz.value = 'America/Chicago';

    calculateInterval();
  }

  // =========================================================================
  // Tab 3: 24-Hour Overlap Matrix
  // =========================================================================

  function renderOverlapMatrix() {
    matrixTableBody.innerHTML = '';
    const refDate = convDateInput.value || '2026-11-13';
    const sampleUtc = parseWallClockToUtc(refDate, '12:00', 'IST');
    const diffInfo = getOffsetDifference(sampleUtc);
    const cstCfg = TZ_CONFIGS[currentCstVariant];

    for (let h = 0; h < 24; h++) {
      const istHour12 = h % 12 === 0 ? 12 : h % 12;
      const istAmPm = h < 12 ? 'AM' : 'PM';
      const istTimeStr = `${(istHour12 < 10 ? '0' : '') + istHour12}:00 ${istAmPm}`;

      // CST equivalent
      const cstMinutesTotal = h * 60 - diffInfo.diffMinutes;
      let cstH = Math.floor(cstMinutesTotal / 60);
      let dayOffset = 0;
      if (cstH < 0) {
        dayOffset = -1;
        cstH = ((cstH % 24) + 24) % 24;
      } else if (cstH >= 24) {
        dayOffset = Math.floor(cstH / 24);
        cstH = cstH % 24;
      }

      const cstHour12 = cstH % 12 === 0 ? 12 : cstH % 12;
      const cstAmPm = cstH < 12 ? 'AM' : 'PM';
      const cstTimeStr = `${(cstHour12 < 10 ? '0' : '') + cstHour12}:00 ${cstAmPm}`;

      // EST equivalent
      const colUtcDate = parseWallClockToUtc(refDate, `${(h < 10 ? '0' : '') + h}:00`, 'IST');
      const estP = getTzParts(colUtcDate, 'EST');
      const estTimeStr = `${(estP.hour12 < 10 ? '0' : '') + estP.hour12}:00 ${estP.dayPeriod}`;

      // UTC equivalent
      const utcP = getTzParts(colUtcDate, 'UTC');
      const utcTimeStr = `${(utcP.hour12 < 10 ? '0' : '') + utcP.hour12}:00 ${utcP.dayPeriod}`;

      // Determine meeting suitability
      const istWork = getWorkStatus(h);
      const cstWork = getWorkStatus(cstH);

      let rowClass = '';
      let pillClass = '';
      let suitabilityText = '';
      let statusDesc = '';

      if (istWork.cls === 'work' && cstWork.cls === 'work') {
        rowClass = 'row-overlap';
        pillClass = 'good';
        suitabilityText = 'Core Overlap';
        statusDesc = 'Working hours for both parties!';
      } else if (h >= 18 && h <= 21 && cstH >= 7 && cstH <= 10) {
        rowClass = 'row-golden';
        pillClass = 'golden';
        suitabilityText = 'Golden Handover';
        statusDesc = 'Ideal daily standup & handover window';
      } else if (h >= 8 && h <= 10 && cstH >= 20 && cstH <= 23) {
        pillClass = 'stretch';
        suitabilityText = 'Evening CST Stretch';
        statusDesc = 'Morning IST with evening CST wrap-up';
      } else if (istWork.cls === 'sleep' || cstWork.cls === 'sleep') {
        pillClass = 'sleep';
        suitabilityText = 'Sleeping Hours';
        statusDesc = istWork.cls === 'sleep' ? 'IST Sleeping' : 'CST Sleeping';
      } else {
        pillClass = 'stretch';
        suitabilityText = 'Off-Hours';
        statusDesc = 'Extended day window';
      }

      const dayOffsetLabel = dayOffset === 0 
        ? 'Same Day' 
        : (dayOffset > 0 ? `+${dayOffset} Day` : `${dayOffset} Day (Prev)`);

      const tr = document.createElement('tr');
      if (rowClass) tr.className = rowClass;
      tr.innerHTML = `
        <td><strong>${istTimeStr}</strong></td>
        <td><strong>${cstTimeStr}</strong></td>
        <td><strong style="color: #c084fc;">${estTimeStr}</strong></td>
        <td><strong style="color: #38bdf8;">${utcTimeStr}</strong></td>
        <td><span class="badge">${dayOffsetLabel}</span></td>
        <td><span class="suitability-pill ${pillClass}">${suitabilityText}</span></td>
        <td style="font-family: var(--font-main); color: var(--text-secondary); font-size: 0.84rem;">${statusDesc}</td>
      `;

      matrixTableBody.appendChild(tr);
    }
  }

  // =========================================================================
  // Event Listeners & Wiring
  // =========================================================================

  function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const targetPanel = document.getElementById(btn.dataset.tab);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('theme-light');
      localStorage.setItem('timebridge-theme', isLight ? 'light' : 'dark');
    });

    // CST Variant Radios
    cstVariantRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentCstVariant = e.target.value;
        syncConverterLabels();
        runConversion();
        renderTimelineCells();
        renderOverlapMatrix();
        calculateInterval();
      });
    });

    // Converter Inputs
    convDateInput.addEventListener('input', runConversion);
    convTimeInput.addEventListener('input', runConversion);

    // Swap Direction
    swapDirectionBtn.addEventListener('click', () => {
      conversionDirection = conversionDirection === 'IST_TO_CST' ? 'CST_TO_IST' : 'IST_TO_CST';
      syncConverterLabels();
      runConversion();
    });

    // Quick presets
    document.getElementById('btnSetNow').addEventListener('click', setConverterTimeToNow);
    document.getElementById('btnSub1m').addEventListener('click', () => adjustConverterMinutes(-1));
    document.getElementById('btnAdd1m').addEventListener('click', () => adjustConverterMinutes(1));
    document.getElementById('btnSub1h').addEventListener('click', () => adjustConverterHours(-1));
    document.getElementById('btnAdd1h').addEventListener('click', () => adjustConverterHours(1));
    document.getElementById('btnMorning9').addEventListener('click', () => {
      convTimeInput.value = '09:00';
      runConversion();
    });
    document.getElementById('btnAfternoon2').addEventListener('click', () => {
      convTimeInput.value = '14:00';
      runConversion();
    });
    document.getElementById('btnEvening6').addEventListener('click', () => {
      convTimeInput.value = '18:00';
      runConversion();
    });

    // Scrubber 1-Minute Stepper Buttons
    const scrubSub1m = document.getElementById('btnScrubSub1m');
    const scrubAdd1m = document.getElementById('btnScrubAdd1m');
    const scrubSub5m = document.getElementById('btnScrubSub5m');
    const scrubAdd5m = document.getElementById('btnScrubAdd5m');

    if (scrubSub1m) scrubSub1m.addEventListener('click', () => adjustConverterMinutes(-1));
    if (scrubAdd1m) scrubAdd1m.addEventListener('click', () => adjustConverterMinutes(1));
    if (scrubSub5m) scrubSub5m.addEventListener('click', () => adjustConverterMinutes(-5));
    if (scrubAdd5m) scrubAdd5m.addEventListener('click', () => adjustConverterMinutes(5));

    // Scrubber - 1-minute increment & decrement on input
    hourScrubber.addEventListener('input', (e) => {
      const minutes = parseInt(e.target.value, 10);
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const hh = (h < 10 ? '0' : '') + h;
      const mm = (m < 10 ? '0' : '') + m;
      convTimeInput.value = `${hh}:${mm}`;
      runConversion();
    });

    // Copy to clipboard
    copyConvertedBtn.addEventListener('click', async () => {
      const textToCopy = `${targetTimeResult.textContent} • ${targetDateResult.textContent} (${targetOffsetBadge.textContent})`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyAlert.classList.add('show');
        setTimeout(() => copyAlert.classList.remove('show'), 2500);
      } catch (err) {
        alert(`Copied: ${textToCopy}`);
      }
    });

    // Calculator Inputs
    [calcStartDate, calcStartTime, calcStartTz, calcEndDate, calcEndTime, calcEndTz].forEach(el => {
      el.addEventListener('input', calculateInterval);
      el.addEventListener('change', calculateInterval);
    });

    // Calculator Swap
    calcSwapBtn.addEventListener('click', () => {
      const d1 = calcStartDate.value;
      const t1 = calcStartTime.value;
      const tz1 = calcStartTz.value;

      calcStartDate.value = calcEndDate.value;
      calcStartTime.value = calcEndTime.value;
      calcStartTz.value = calcEndTz.value;

      calcEndDate.value = d1;
      calcEndTime.value = t1;
      calcEndTz.value = tz1;

      calculateInterval();
    });

    // Calculator Presets
    document.getElementById('btnStartNow').addEventListener('click', () => {
      const now = new Date();
      const parts = getTzParts(now, calcStartTz.value);
      calcStartDate.value = parts.isoDate;
      const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
      calcStartTime.value = `${h}:${parts.minute}:${parts.second}`;
      calculateInterval();
    });

    document.getElementById('btnStartToday9').addEventListener('click', () => {
      const now = new Date();
      const parts = getTzParts(now, calcStartTz.value);
      calcStartDate.value = parts.isoDate;
      calcStartTime.value = '09:00:00';
      calculateInterval();
    });

    // End Date "Set to Now" Button
    if (btnEndNow) {
      btnEndNow.addEventListener('click', () => {
        const now = new Date();
        const parts = getTzParts(now, calcEndTz.value);
        calcEndDate.value = parts.isoDate;
        const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
        calcEndTime.value = `${h}:${parts.minute}:${parts.second}`;
        calculateInterval();
      });
    }

    // Copy Duration Button
    if (copyDurationBtn) {
      copyDurationBtn.addEventListener('click', async () => {
        const d = valDays.textContent;
        const h = valHours.textContent;
        const m = valMinutes.textContent;
        const s = valSeconds.textContent;
        const textToCopy = `${d} days, ${h} hours, ${m} minutes, ${s} seconds (${statTotalHours.textContent} total | ${statBusinessDays.textContent} business days)`;
        try {
          await navigator.clipboard.writeText(textToCopy);
          if (durationCopyAlert) {
            durationCopyAlert.classList.add('show');
            setTimeout(() => durationCopyAlert.classList.remove('show'), 2500);
          }
        } catch (err) {
          alert(`Copied: ${textToCopy}`);
        }
      });
    }

    document.getElementById('btnEndPlus1d').addEventListener('click', () => {
      const startUtc = parseWallClockToUtc(calcStartDate.value, calcStartTime.value, calcStartTz.value);
      if (!startUtc) return;
      const endUtc = new Date(startUtc.getTime() + 86400000);
      const parts = getTzParts(endUtc, calcEndTz.value);
      calcEndDate.value = parts.isoDate;
      const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
      calcEndTime.value = `${h}:${parts.minute}:${parts.second}`;
      calculateInterval();
    });

    document.getElementById('btnEndPlus1w').addEventListener('click', () => {
      const startUtc = parseWallClockToUtc(calcStartDate.value, calcStartTime.value, calcStartTz.value);
      if (!startUtc) return;
      const endUtc = new Date(startUtc.getTime() + 7 * 86400000);
      const parts = getTzParts(endUtc, calcEndTz.value);
      calcEndDate.value = parts.isoDate;
      const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
      calcEndTime.value = `${h}:${parts.minute}:${parts.second}`;
      calculateInterval();
    });

    document.getElementById('btnEndPlus1m').addEventListener('click', () => {
      const startUtc = parseWallClockToUtc(calcStartDate.value, calcStartTime.value, calcStartTz.value);
      if (!startUtc) return;
      const endUtc = new Date(startUtc.getTime() + 30 * 86400000);
      const parts = getTzParts(endUtc, calcEndTz.value);
      calcEndDate.value = parts.isoDate;
      const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
      calcEndTime.value = `${h}:${parts.minute}:${parts.second}`;
      calculateInterval();
    });

    // Live Tick Toggle
    liveTickToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        liveTickInterval = setInterval(() => {
          // If live tick is on, advance end date/time to right now
          const now = new Date();
          const parts = getTzParts(now, calcEndTz.value);
          calcEndDate.value = parts.isoDate;
          const h = parts.hour24 < 10 ? '0' + parts.hour24 : parts.hour24;
          calcEndTime.value = `${h}:${parts.minute}:${parts.second}`;
          calculateInterval();
        }, 1000);
      } else {
        if (liveTickInterval) clearInterval(liveTickInterval);
      }
    });
  }

  // =========================================================================
  // App Initialization
  // =========================================================================

  function initApp() {
    // Restore theme preference
    const savedTheme = localStorage.getItem('timebridge-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
    }

    // Initialize Converter Inputs with current IST time
    const now = new Date();
    const istParts = getTzParts(now, 'IST');
    convDateInput.value = istParts.isoDate;
    const h = istParts.hour24 < 10 ? '0' + istParts.hour24 : istParts.hour24;
    convTimeInput.value = `${h}:${istParts.minute}`;

    syncConverterLabels();
    runConversion();
    renderTimelineCells(istParts.hour24);
    renderOverlapMatrix();

    initCalculatorDefaults();
    setupEventListeners();

    // Start live clock updates
    updateLiveClocks();
    setInterval(updateLiveClocks, 1000);
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
