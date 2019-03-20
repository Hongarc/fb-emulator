import { EventEmitter } from 'events';

import Browser, { Form } from './utils/Browser';
import addBookmark from './propApi/addBookmark';
import markAsRead from './propApi/markAsRead';
import send from './propApi/send';

export { Form };
export interface ApiOption {
  rev: string;
  dtsg: string;
}
export type Arg = string | Form;
export type apiFunction = (this: Api, ...args: Arg[]) => Form;

const getTtstamp = (dtsg: string): string => {
  let ttstamp = '2';
  for (let i = 0; i < dtsg.length; i++) {
    ttstamp += dtsg.charCodeAt(i);
  }
  return ttstamp;
};

const parseJson = (body: string): Form => {
  const arr = body.replace('for (;;);', '').split(/}\r?\n *{/);
  if (arr.length > 1) {
    arr[0] += '}';
  }
  const obj = JSON.parse(arr[0]);
  // TODO update dtsg, cookie
  return obj;
};

export default class Api extends EventEmitter {
  addBookmark = addBookmark;

  markAsRead = markAsRead;

  send = send;

  browser: Browser;

  req: number;

  id: string;

  rev: string;

  dtsg: string;

  constructor(browser: Browser, opt: ApiOption) {
    super();
    this.browser = browser;
    this.req = 0;
    this.id = browser.getCookie('c_user').value;
    this.rev = opt.rev;
    this.dtsg = opt.dtsg;
  }

  mergeform(form: Form): Form {
    return Object.assign(form, {
      __user: this.id,
      __req: (++this.req).toString(36),
      __rev: this.rev,
      __a: 1,
      fb_dtsg: this.dtsg, // eslint-disable-line @typescript-eslint/camelcase
      jazoest: getTtstamp(this.dtsg),
    });
  }

  async get(url: string, qs: Form = {}): Promise<Form> {
    const res = await this.browser.get(url, this.mergeform(qs));
    return parseJson(res.body);
  }

  async post(url: string, form: Form = {}): Promise<Form> {
    const res = await this.browser.post(url, this.mergeform(form));
    return parseJson(res.body);
  }

  async formData(url: string, form: Form = {}, qs: Form = {}): Promise<Form> {
    const res = await this.browser.formData(url, this.mergeform(form), this.mergeform(qs));
    return parseJson(res.body);
  }

  static genOTI() {
    return 4194304 * Date.now();
  }
}

// TODO load function of api
