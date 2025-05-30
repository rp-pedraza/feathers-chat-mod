export interface StoredErrorInterface {
  id: number;
  domain: string;
  message: string;
}

export default class StoredError implements StoredErrorInterface {
  id: number;
  domain: string;
  message: string;

  static generateId: (suggestedId: number) => number = (() => {
    let counter: number = 0;
    return (suggestedId: number) => (counter = suggestedId > counter ? suggestedId : counter + 1);
  })();

  constructor(message: string, domain: string, suggestedId?: number) {
    this.id = StoredError.generateId(suggestedId ?? 0);
    this.domain = domain;
    this.message = message;
  }
}
