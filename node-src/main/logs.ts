import { createLogger, format, transports } from 'winston';
import winston from 'winston';
import { format as logformFormat } from 'logform';
const { combine, timestamp, label, prettyPrint, printf, json, cli, padLevels } = format;
const LEVEL = Symbol.for('level');

export interface MakeShiftLogForm {
  label?: string;
  level?: string;
  message?: string;
  [key: string]: any;
}

const padLevelsFormat = logformFormat.padLevels();

export function makeshiftCliFormat(label: string) {
  return printf((blob) => {
    // console.log('blob', blob);
    // console.log(JSON.stringify(blob))
    const { timestamp, level, message, ...rest } = blob;
    const ts = timestamp ? timestamp + ' ' : '';
    const lbl = label ? `[${label}] ` : ' ';
    const lvl = level ? `${level}: ` : ' ';
    const msg = message ? message : JSON.stringify(rest);
    // const paddedMsg = padLevelsFormat.transform({
    //   [LEVEL]: level,
    //   message: msg
    // });
    return `${ts}${lbl}${lvl}${msg}`;
  })
}
